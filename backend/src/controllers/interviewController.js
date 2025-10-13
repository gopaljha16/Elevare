const Question = require('../models/Question');
const InterviewSession = require('../models/InterviewSession');
const UserAnalytics = require('../models/UserAnalytics');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

// start a new interview session
const startInterviewSession = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { sessionType, company, role, difficulty = 'medium', questionCount = 10, useAI = true } = req.body;

  if (!sessionType) {
    throw new AppError('Session type is required', 400);
  }

  let questions = [];
  let aiGenerated = false;

  // Try to use AI for question generation if enabled
  if (useAI && company && role) {
    try {
      const aiService = require('../services/aiService');
      const aiQuestions = await aiService.generateInterviewQuestions({
        company: sanitizeInput(company),
        role: sanitizeInput(role),
        difficulty,
        questionType: sessionType,
        count: Math.min(parseInt(questionCount), 8) // Limit AI questions to reduce cost
      });

      if (aiQuestions && aiQuestions.questions && aiQuestions.questions.length > 0) {
        // Create temporary question objects for the session
        questions = aiQuestions.questions.map((q, index) => ({
          _id: `ai_${Date.now()}_${index}`,
          content: q.content,
          type: q.type || sessionType,
          difficulty: q.difficulty || difficulty,
          suggestedAnswer: q.suggestedAnswer,
          hints: q.hints || [],
          category: q.category || 'ai-generated',
          isAIGenerated: true
        }));
        aiGenerated = true;
      }
    } catch (aiError) {
      console.error('AI question generation failed, falling back to database:', aiError);
    }
  }

  // Fallback to database questions if AI failed or not requested
  if (questions.length === 0) {
    const questionFilter = {
      isActive: true,
      difficulty: difficulty === 'mixed' ? { $in: ['easy', 'medium', 'hard'] } : difficulty
    };

    if (sessionType !== 'mixed') {
      questionFilter.type = sessionType;
    }

    if (company) {
      questionFilter.$or = [
        { company: new RegExp(sanitizeInput(company), 'i') },
        { company: { $exists: false } }
      ];
    }

    if (role) {
      questionFilter.$or = [
        ...(questionFilter.$or || []),
        { role: new RegExp(sanitizeInput(role), 'i') },
        { role: { $exists: false } }
      ];
    }

    const dbQuestions = await Question.getRandomQuestions(questionFilter, parseInt(questionCount));
    questions = dbQuestions.map(q => ({ ...q.toObject(), isAIGenerated: false }));
  }

  if (questions.length === 0) {
    throw new AppError('No questions found matching the criteria', 404);
  }

  // Create interview session
  const session = new InterviewSession({
    userId,
    sessionType: sanitizeInput(sessionType),
    company: company ? sanitizeInput(company) : undefined,
    role: role ? sanitizeInput(role) : undefined,
    difficulty,
    questions: questions.map(q => q._id),
    status: 'in-progress',
    metadata: {
      aiGenerated,
      questionData: questions // Store AI questions temporarily
    }
  });

  await session.save();

  // Update analytics
  try {
    let analytics = await UserAnalytics.findOne({ userId });
    if (analytics) {
      await analytics.trackAction('interview_started', {
        sessionId: session._id,
        sessionType,
        company,
        role,
        questionCount: questions.length,
        aiGenerated
      });
      await analytics.addRecentActivity('interview_started', `Started ${aiGenerated ? 'AI-powered' : 'standard'} ${sessionType} interview`, 'interview');
    }
  } catch (analyticsError) {
    console.error('Analytics update error:', analyticsError);
  }

  // Return session with first question
  const firstQuestion = questions[0];

  res.status(201).json({
    success: true,
    message: 'Interview session started successfully',
    data: {
      session: {
        id: session._id,
        sessionType: session.sessionType,
        company: session.company,
        role: session.role,
        difficulty: session.difficulty,
        totalQuestions: questions.length,
        currentQuestion: 1,
        status: session.status,
        startedAt: session.startedAt,
        aiGenerated
      },
      currentQuestion: {
        _id: firstQuestion._id,
        content: firstQuestion.content,
        type: firstQuestion.type,
        difficulty: firstQuestion.difficulty,
        category: firstQuestion.category,
        hints: firstQuestion.hints || [],
        isAIGenerated: firstQuestion.isAIGenerated
      }
    }
  });
});

// get current question in session
const getCurrentQuestion = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.userId;

  const session = await InterviewSession.findOne({ 
    _id: sessionId, 
    userId, 
    status: 'in-progress' 
  }).populate('questions');

  if (!session) {
    throw new AppError('Interview session not found or already completed', 404);
  }

  const currentQuestionIndex = session.answers.length;
  
  if (currentQuestionIndex >= session.questions.length) {
    throw new AppError('All questions have been answered', 400);
  }

  const currentQuestion = session.questions[currentQuestionIndex];

  res.json({
    success: true,
    data: {
      sessionInfo: {
        id: session._id,
        currentQuestion: currentQuestionIndex + 1,
        totalQuestions: session.questions.length,
        timeElapsed: Math.floor((new Date() - session.startedAt) / 1000)
      },
      question: currentQuestion.getForDisplay()
    }
  });
});

// submit answer to current question
const submitAnswer = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { answer, timeSpent, useAI = true } = req.body;
  const userId = req.userId;

  if (!answer) {
    throw new AppError('Answer is required', 400);
  }

  const session = await InterviewSession.findOne({ 
    _id: sessionId, 
    userId, 
    status: 'in-progress' 
  });

  if (!session) {
    throw new AppError('Interview session not found or already completed', 404);
  }

  const currentQuestionIndex = session.answers.length;
  
  if (currentQuestionIndex >= session.questions.length) {
    throw new AppError('All questions have been answered', 400);
  }

  // Get current question (from AI data or database)
  let currentQuestion;
  if (session.metadata && session.metadata.questionData) {
    currentQuestion = session.metadata.questionData[currentQuestionIndex];
  } else {
    currentQuestion = await Question.findById(session.questions[currentQuestionIndex]);
  }

  if (!currentQuestion) {
    throw new AppError('Question not found', 404);
  }

  let isCorrect = false;
  let score = 0;
  let feedback = 'Thank you for your answer';
  let aiEvaluation = null;

  // Use AI evaluation for open-ended questions
  if (useAI && (currentQuestion.type === 'behavioral' || currentQuestion.type === 'technical' || currentQuestion.type === 'coding')) {
    try {
      const aiService = require('../services/aiService');
      aiEvaluation = await aiService.evaluateInterviewAnswer(
        currentQuestion.content,
        sanitizeInput(answer),
        currentQuestion.type
      );

      if (aiEvaluation) {
        score = aiEvaluation.score || 70;
        feedback = aiEvaluation.feedback || feedback;
        isCorrect = score >= 70; // Consider 70+ as correct
        
        // Time bonus for good answers
        if (score >= 80 && timeSpent && timeSpent < 120) {
          score = Math.min(score + 10, 100);
        }
      }
    } catch (aiError) {
      console.error('AI evaluation failed, using fallback:', aiError);
      // Fallback to basic evaluation
      score = 70; // Default score
      isCorrect = true;
    }
  } else {
    // For multiple choice or when AI is disabled
    if (currentQuestion.checkAnswer) {
      isCorrect = currentQuestion.checkAnswer(sanitizeInput(answer));
    } else {
      // Simple keyword matching for non-multiple choice
      isCorrect = true; // Default to true for participation
    }
    
    if (isCorrect) {
      score = 100;
      if (timeSpent && timeSpent < 60) score += 10;
      else if (timeSpent && timeSpent < 120) score += 5;
    }
    
    feedback = currentQuestion.explanation || currentQuestion.suggestedAnswer || feedback;
  }

  // Add answer to session
  const answerData = {
    questionId: currentQuestion._id,
    userAnswer: sanitizeInput(answer),
    isCorrect,
    timeSpent: timeSpent || 0,
    score: Math.min(score, 100),
    feedback,
    aiEvaluation: aiEvaluation ? {
      strengths: aiEvaluation.strengths || [],
      improvements: aiEvaluation.improvements || [],
      suggestions: aiEvaluation.suggestions || []
    } : null
  };

  session.answers.push(answerData);
  await session.save();

  // Check if session is complete
  const isSessionComplete = session.answers.length >= session.questions.length;
  let nextQuestion = null;

  if (isSessionComplete) {
    await session.completeSession();
    
    // Update analytics
    try {
      let analytics = await UserAnalytics.findOne({ userId });
      if (analytics) {
        await analytics.trackAction('interview_completed', {
          sessionId: session._id,
          finalScore: session.overallScore,
          confidenceScore: session.confidenceScore,
          aiUsed: !!aiEvaluation
        });
        
        // Update interview stats
        const userSessions = await InterviewSession.find({ userId, status: 'completed' });
        const interviewStats = {
          totalSessions: userSessions.length,
          completedSessions: userSessions.length,
          averageScore: userSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / userSessions.length,
          averageConfidence: userSessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / userSessions.length,
          lastSessionDate: session.completedAt
        };
        
        await analytics.updateInterviewStats(interviewStats);
        await analytics.addRecentActivity('interview_completed', `Completed AI-enhanced ${session.sessionType} interview`, 'interview');
      }
    } catch (analyticsError) {
      console.error('Analytics update error:', analyticsError);
    }
  } else {
    // Get next question
    const nextQuestionIndex = session.answers.length;
    if (session.metadata && session.metadata.questionData) {
      const nextQ = session.metadata.questionData[nextQuestionIndex];
      nextQuestion = {
        _id: nextQ._id,
        content: nextQ.content,
        type: nextQ.type,
        difficulty: nextQ.difficulty,
        category: nextQ.category,
        hints: nextQ.hints || [],
        isAIGenerated: nextQ.isAIGenerated
      };
    } else {
      const nextQ = await Question.findById(session.questions[nextQuestionIndex]);
      nextQuestion = nextQ ? nextQ.getForDisplay() : null;
    }
  }

  res.json({
    success: true,
    message: isSessionComplete ? 'Interview session completed' : 'Answer submitted successfully',
    data: {
      isCorrect,
      score: answerData.score,
      feedback,
      aiEvaluation: answerData.aiEvaluation,
      sessionComplete: isSessionComplete,
      sessionSummary: isSessionComplete ? {
        totalQuestions: session.questions.length,
        correctAnswers: session.answers.filter(a => a.isCorrect).length,
        overallScore: session.overallScore,
        confidenceScore: session.confidenceScore,
        totalTimeSpent: session.totalTimeSpent,
        aiEnhanced: session.metadata?.aiGenerated || false
      } : null,
      nextQuestion
    }
  });
});

// get interview session details
const getInterviewSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.userId;

  const session = await InterviewSession.findOne({ _id: sessionId, userId })
    .populate('questions', 'content type difficulty category');

  if (!session) {
    throw new AppError('Interview session not found', 404);
  }

  res.json({
    success: true,
    data: {
      session: {
        id: session._id,
        sessionType: session.sessionType,
        company: session.company,
        role: session.role,
        difficulty: session.difficulty,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        totalQuestions: session.questions.length,
        answeredQuestions: session.answers.length,
        overallScore: session.overallScore,
        confidenceScore: session.confidenceScore,
        totalTimeSpent: session.totalTimeSpent,
        feedback: session.feedback,
        progressPercentage: session.progressPercentage
      }
    }
  });
});

// get user's interview sessions
const getUserInterviewSessions = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { page = 1, limit = 10, status, sessionType } = req.query;

  const query = { userId };
  
  if (status) {
    query.status = status;
  }
  
  if (sessionType) {
    query.sessionType = sessionType;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  };

  const sessions = await InterviewSession.find(query)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit)
    .select('sessionType company role difficulty status startedAt completedAt overallScore confidenceScore totalTimeSpent')
    .exec();

  const total = await InterviewSession.countDocuments(query);

  res.json({
    success: true,
    data: {
      sessions,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(total / options.limit),
        totalSessions: total,
        hasNext: options.page < Math.ceil(total / options.limit),
        hasPrev: options.page > 1
      }
    }
  });
});

// get interview statistics
const getInterviewStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const stats = await InterviewSession.getUserStats(userId);
  
  if (!stats || stats.length === 0) {
    return res.json({
      success: true,
      data: {
        totalSessions: 0,
        averageScore: 0,
        averageConfidence: 0,
        totalTimeSpent: 0,
        sessionsByType: {},
        recentSessions: []
      }
    });
  }

  const userStats = stats[0];
  
  // Get recent sessions for trend analysis
  const recentSessions = await InterviewSession.find({ 
    userId, 
    status: 'completed' 
  })
    .sort({ completedAt: -1 })
    .limit(5)
    .select('sessionType overallScore confidenceScore completedAt');

  res.json({
    success: true,
    data: {
      ...userStats,
      recentSessions,
      improvementTrend: recentSessions.length >= 2 ? 
        recentSessions[0].overallScore - recentSessions[recentSessions.length - 1].overallScore : 0
    }
  });
});

// get available question categories and types
const getQuestionMetadata = asyncHandler(async (req, res) => {
  const types = await Question.distinct('type', { isActive: true });
  const categories = await Question.distinct('category', { isActive: true });
  const companies = await Question.distinct('company', { isActive: true, company: { $ne: null } });
  const roles = await Question.distinct('role', { isActive: true, role: { $ne: null } });

  res.json({
    success: true,
    data: {
      types,
      categories: categories.filter(c => c), // Remove null values
      companies: companies.filter(c => c).slice(0, 20), // Limit to top 20
      roles: roles.filter(r => r).slice(0, 20), // Limit to top 20
      difficulties: ['easy', 'medium', 'hard', 'mixed']
    }
  });
});

module.exports = {
  startInterviewSession,
  getCurrentQuestion,
  submitAnswer,
  getInterviewSession,
  getUserInterviewSessions,
  getInterviewStats,
  getQuestionMetadata
};