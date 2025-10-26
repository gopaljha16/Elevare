const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  userAnswer: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: null
  },
  feedback: {
    type: String,
    trim: true
  },
  timeSpent: {
    type: Number, // in seconds
    min: [0, 'Time spent cannot be negative']
  },
  hints: [{
    hintText: String,
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  score: {
    type: Number,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  }
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  sessionType: {
    type: String,
    required: [true, 'Session type is required'],
    enum: ['technical', 'behavioral', 'system-design', 'mixed', 'company-specific'],
    index: true
  },
  company: {
    type: String,
    trim: true,
    index: true
  },
  role: {
    type: String,
    trim: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'medium'
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  answers: [answerSchema],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
    index: true
  },
  confidenceScore: {
    type: Number,
    min: [0, 'Confidence score cannot be negative'],
    max: [100, 'Confidence score cannot exceed 100'],
    default: null
  },
  overallScore: {
    type: Number,
    min: [0, 'Overall score cannot be negative'],
    max: [100, 'Overall score cannot exceed 100'],
    default: null
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  feedback: {
    strengths: [String],
    improvements: [String],
    recommendations: [String]
  },
  settings: {
    timeLimit: {
      type: Number, // in minutes
      default: 60
    },
    hintsEnabled: {
      type: Boolean,
      default: true
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
interviewSessionSchema.index({ userId: 1, createdAt: -1 });
interviewSessionSchema.index({ userId: 1, status: 1 });
interviewSessionSchema.index({ company: 1, role: 1 });
interviewSessionSchema.index({ sessionType: 1, difficulty: 1 });

// Virtual for calculating progress percentage
interviewSessionSchema.virtual('progressPercentage').get(function() {
  if (this.questions.length === 0) return 0;
  return Math.round((this.answers.length / this.questions.length) * 100);
});

// Virtual for calculating average time per question
interviewSessionSchema.virtual('averageTimePerQuestion').get(function() {
  if (this.answers.length === 0) return 0;
  const totalTime = this.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
  return Math.round(totalTime / this.answers.length);
});

// Method to calculate confidence score
interviewSessionSchema.methods.calculateConfidenceScore = function() {
  if (this.answers.length === 0) return 0;
  
  let totalScore = 0;
  let weightedScore = 0;
  
  this.answers.forEach(answer => {
    const timeBonus = answer.timeSpent < 300 ? 10 : 0; // Bonus for quick answers
    const hintPenalty = answer.hints.length * 5; // Penalty for using hints
    const baseScore = answer.isCorrect ? 100 : 0;
    
    const finalScore = Math.max(0, baseScore + timeBonus - hintPenalty);
    totalScore += finalScore;
    weightedScore += 100; // Maximum possible score
  });
  
  return Math.round((totalScore / weightedScore) * 100);
};

// Method to calculate overall score
interviewSessionSchema.methods.calculateOverallScore = function() {
  if (this.answers.length === 0) return 0;
  
  const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
  const totalAnswers = this.answers.length;
  
  return Math.round((correctAnswers / totalAnswers) * 100);
};

// Method to generate feedback
interviewSessionSchema.methods.generateFeedback = function() {
  const feedback = {
    strengths: [],
    improvements: [],
    recommendations: []
  };
  
  const correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
  const totalAnswers = this.answers.length;
  const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
  
  // Analyze performance
  if (accuracy >= 80) {
    feedback.strengths.push('Excellent accuracy in answering questions');
  } else if (accuracy >= 60) {
    feedback.strengths.push('Good understanding of concepts');
  } else {
    feedback.improvements.push('Focus on improving accuracy');
  }
  
  // Analyze time management
  const avgTime = this.averageTimePerQuestion;
  if (avgTime < 120) { // Less than 2 minutes per question
    feedback.strengths.push('Efficient time management');
  } else if (avgTime > 300) { // More than 5 minutes per question
    feedback.improvements.push('Work on time management skills');
  }
  
  // Generate recommendations
  if (accuracy < 70) {
    feedback.recommendations.push('Review fundamental concepts before next session');
  }
  
  if (this.answers.some(answer => answer.hints.length > 0)) {
    feedback.recommendations.push('Try to solve problems without hints to build confidence');
  }
  
  return feedback;
};

// Method to complete session
interviewSessionSchema.methods.completeSession = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.confidenceScore = this.calculateConfidenceScore();
  this.overallScore = this.calculateOverallScore();
  this.feedback = this.generateFeedback();
  this.totalTimeSpent = this.answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);
  
  return this.save();
};

// Static method to get user statistics
interviewSessionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        averageConfidence: { $avg: '$confidenceScore' },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        sessionsByType: {
          $push: {
            type: '$sessionType',
            score: '$overallScore',
            date: '$completedAt'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);