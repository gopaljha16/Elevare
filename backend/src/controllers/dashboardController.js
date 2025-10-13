const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');
const UserProgress = require('../models/UserProgress');
const UserAnalytics = require('../models/UserAnalytics');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// get comprehensive dashboard data
const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // Get or create user analytics
  let analytics = await UserAnalytics.findOne({ userId });
  if (!analytics) {
    analytics = new UserAnalytics({ userId });
    await analytics.save();
  }

  // Get resume statistics
  const resumes = await Resume.find({ userId, isActive: true });
  const resumeStats = {
    totalResumes: resumes.length,
    activeResumes: resumes.length,
    averageATSScore: resumes.length > 0 ?
      Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length) : 0,
    highestATSScore: resumes.length > 0 ?
      Math.max(...resumes.map(r => r.atsScore || 0)) : 0,
    recentResumes: resumes
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 3)
      .map(r => ({
        id: r._id,
        title: r.title,
        atsScore: r.atsScore,
        updatedAt: r.updatedAt
      }))
  };

  // Get interview statistics
  const interviewSessions = await InterviewSession.find({ userId, status: 'completed' });
  const interviewStats = {
    totalSessions: interviewSessions.length,
    completedSessions: interviewSessions.length,
    averageScore: interviewSessions.length > 0 ?
      Math.round(interviewSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) / interviewSessions.length) : 0,
    averageConfidence: interviewSessions.length > 0 ?
      Math.round(interviewSessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / interviewSessions.length) : 0,
    recentSessions: interviewSessions
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 3)
      .map(s => ({
        id: s._id,
        sessionType: s.sessionType,
        company: s.company,
        overallScore: s.overallScore,
        completedAt: s.completedAt
      }))
  };

  // Get learning statistics
  const learningProgress = await UserProgress.find({ userId });
  const learningStats = {
    totalPaths: learningProgress.length,
    activePaths: learningProgress.filter(p => p.status === 'in-progress').length,
    completedPaths: learningProgress.filter(p => p.status === 'completed').length,
    averageProgress: learningProgress.length > 0 ?
      Math.round(learningProgress.reduce((sum, p) => sum + p.overallProgress, 0) / learningProgress.length) : 0,
    currentStreak: learningProgress.length > 0 ?
      Math.max(...learningProgress.map(p => p.streak.currentStreak)) : 0,
    recentActivity: learningProgress
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt)
      .slice(0, 3)
      .map(p => ({
        pathTitle: p.pathTitle,
        company: p.company,
        overallProgress: p.overallProgress,
        lastActivity: p.lastActivityAt
      }))
  };

  // Calculate career readiness score
  let careerReadinessScore = 0;

  // Resume component (40%)
  if (resumeStats.totalResumes > 0) {
    careerReadinessScore += 10;
    if (resumeStats.averageATSScore >= 80) careerReadinessScore += 20;
    else if (resumeStats.averageATSScore >= 60) careerReadinessScore += 15;
    else if (resumeStats.averageATSScore >= 40) careerReadinessScore += 10;

    if (resumeStats.totalResumes >= 2) careerReadinessScore += 10;
  }

  // Interview component (30%)
  if (interviewStats.completedSessions > 0) {
    careerReadinessScore += 10;
    if (interviewStats.averageScore >= 80) careerReadinessScore += 15;
    else if (interviewStats.averageScore >= 60) careerReadinessScore += 10;
    else if (interviewStats.averageScore >= 40) careerReadinessScore += 5;

    if (interviewStats.completedSessions >= 5) careerReadinessScore += 5;
  }

  // Learning component (30%)
  if (learningStats.activePaths > 0) {
    careerReadinessScore += 10;
    if (learningStats.averageProgress >= 80) careerReadinessScore += 15;
    else if (learningStats.averageProgress >= 50) careerReadinessScore += 10;
    else if (learningStats.averageProgress >= 25) careerReadinessScore += 5;

    if (learningStats.currentStreak >= 7) careerReadinessScore += 5;
  }

  // Get recent activity across all areas
  const recentActivity = [
    ...resumeStats.recentResumes.map(r => ({
      type: 'resume',
      title: `Updated resume: ${r.title}`,
      timestamp: r.updatedAt,
      metadata: { atsScore: r.atsScore }
    })),
    ...interviewStats.recentSessions.map(s => ({
      type: 'interview',
      title: `Completed ${s.sessionType} interview`,
      timestamp: s.completedAt,
      metadata: { score: s.overallScore, company: s.company }
    })),
    ...learningStats.recentActivity.map(l => ({
      type: 'learning',
      title: `Progress in ${l.pathTitle}`,
      timestamp: l.lastActivity,
      metadata: { progress: l.overallProgress, company: l.company }
    }))
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

  // Update analytics with current data
  await analytics.updateResumeStats(resumeStats);
  await analytics.updateInterviewStats(interviewStats);
  await analytics.updateLearningStats(learningStats);

  res.json({
    success: true,
    data: {
      careerReadinessScore: Math.min(careerReadinessScore, 100),
      resumeStats,
      interviewStats,
      learningStats,
      recentActivity,
      summary: {
        totalResumes: resumeStats.totalResumes,
        completedInterviews: interviewStats.completedSessions,
        activeLearningPaths: learningStats.activePaths,
        currentStreak: learningStats.currentStreak
      }
    }
  });
});

// get weekly progress data
const getWeeklyProgress = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { weeks = 4 } = req.query;

  const weeksAgo = new Date();
  weeksAgo.setDate(weeksAgo.getDate() - (parseInt(weeks) * 7));

  // Get resume activity
  const resumeActivity = await Resume.aggregate([
    {
      $match: {
        userId: userId,
        updatedAt: { $gte: weeksAgo }
      }
    },
    {
      $group: {
        _id: {
          week: { $week: '$updatedAt' },
          year: { $year: '$updatedAt' }
        },
        count: { $sum: 1 },
        avgATSScore: { $avg: '$atsScore' }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  // Get interview activity
  const interviewActivity = await InterviewSession.aggregate([
    {
      $match: {
        userId: userId,
        completedAt: { $gte: weeksAgo },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          week: { $week: '$completedAt' },
          year: { $year: '$completedAt' }
        },
        count: { $sum: 1 },
        avgScore: { $avg: '$overallScore' }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  // Get learning activity
  const learningActivity = await UserProgress.aggregate([
    {
      $match: {
        userId: userId,
        lastActivityAt: { $gte: weeksAgo }
      }
    },
    {
      $group: {
        _id: {
          week: { $week: '$lastActivityAt' },
          year: { $year: '$lastActivityAt' }
        },
        avgProgress: { $avg: '$overallProgress' },
        totalTimeSpent: { $sum: '$totalTimeSpent' }
      }
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      resumeActivity,
      interviewActivity,
      learningActivity
    }
  });
});

// get achievement data
const getAchievements = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const analytics = await UserAnalytics.findOne({ userId });
  const userProgress = await UserProgress.find({ userId });

  const achievements = [];

  // Collect achievements from analytics
  if (analytics && analytics.dashboardData.achievements) {
    achievements.push(...analytics.dashboardData.achievements);
  }

  // Collect achievements from learning progress
  userProgress.forEach(progress => {
    if (progress.achievements) {
      achievements.push(...progress.achievements.map(achievement => ({
        ...achievement,
        category: 'learning',
        source: progress.pathTitle
      })));
    }
  });

  // Sort achievements by date
  achievements.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));

  res.json({
    success: true,
    data: {
      achievements: achievements.slice(0, 20), // Limit to recent 20
      totalAchievements: achievements.length,
      categories: {
        resume: achievements.filter(a => a.category === 'resume').length,
        interview: achievements.filter(a => a.category === 'interview').length,
        learning: achievements.filter(a => a.category === 'learning').length,
        general: achievements.filter(a => a.category === 'general').length
      }
    }
  });
});

// get goal tracking data
const getGoals = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const analytics = await UserAnalytics.findOne({ userId });

  const defaultGoals = {
    weeklyGoals: {
      resumeOptimizations: 1,
      interviewSessions: 3,
      learningHours: 5
    },
    weeklyProgress: {
      resumeOptimizations: 0,
      interviewSessions: 0,
      learningHours: 0
    }
  };

  const goals = analytics?.dashboardData || defaultGoals;

  // Calculate current week progress
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  // Get this week's resume optimizations
  const weeklyResumeOptimizations = await Resume.countDocuments({
    userId,
    lastOptimized: { $gte: weekStart }
  });

  // Get this week's interview sessions
  const weeklyInterviewSessions = await InterviewSession.countDocuments({
    userId,
    completedAt: { $gte: weekStart },
    status: 'completed'
  });

  // Get this week's learning hours
  const weeklyLearningProgress = await UserProgress.aggregate([
    {
      $match: {
        userId: userId,
        lastActivityAt: { $gte: weekStart }
      }
    },
    {
      $group: {
        _id: null,
        totalMinutes: { $sum: '$totalTimeSpent' }
      }
    }
  ]);

  const weeklyLearningHours = weeklyLearningProgress.length > 0 ?
    Math.round(weeklyLearningProgress[0].totalMinutes / 60) : 0;

  const currentProgress = {
    resumeOptimizations: weeklyResumeOptimizations,
    interviewSessions: weeklyInterviewSessions,
    learningHours: weeklyLearningHours
  };

  res.json({
    success: true,
    data: {
      weeklyGoals: goals.weeklyGoals,
      currentProgress,
      progressPercentage: {
        resumeOptimizations: Math.min((currentProgress.resumeOptimizations / goals.weeklyGoals.resumeOptimizations) * 100, 100),
        interviewSessions: Math.min((currentProgress.interviewSessions / goals.weeklyGoals.interviewSessions) * 100, 100),
        learningHours: Math.min((currentProgress.learningHours / goals.weeklyGoals.learningHours) * 100, 100)
      }
    }
  });
});

module.exports = {
  getDashboardData,
  getWeeklyProgress,
  getAchievements,
  getGoals
};