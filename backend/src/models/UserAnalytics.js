const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Action type is required'],
    enum: [
      'resume_created', 'resume_updated', 'resume_optimized', 'resume_downloaded',
      'interview_started', 'interview_completed', 'question_answered',
      'skill_progress_updated', 'learning_resource_accessed', 'learning_path_started',
      'login', 'logout', 'profile_updated', 'achievement_earned'
    ],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sessionId: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v);
      },
      message: 'Please enter a valid IP address'
    }
  },
  userAgent: {
    type: String,
    trim: true
  }
});

const resumeStatsSchema = new mongoose.Schema({
  totalResumes: {
    type: Number,
    default: 0,
    min: [0, 'Total resumes cannot be negative']
  },
  activeResumes: {
    type: Number,
    default: 0,
    min: [0, 'Active resumes cannot be negative']
  },
  averageATSScore: {
    type: Number,
    min: [0, 'Average ATS score cannot be negative'],
    max: [100, 'Average ATS score cannot exceed 100'],
    default: null
  },
  highestATSScore: {
    type: Number,
    min: [0, 'Highest ATS score cannot be negative'],
    max: [100, 'Highest ATS score cannot exceed 100'],
    default: null
  },
  lastOptimized: {
    type: Date,
    default: null
  },
  totalOptimizations: {
    type: Number,
    default: 0,
    min: [0, 'Total optimizations cannot be negative']
  },
  totalDownloads: {
    type: Number,
    default: 0,
    min: [0, 'Total downloads cannot be negative']
  },
  templateUsage: {
    type: Map,
    of: Number,
    default: new Map()
  }
});

const interviewStatsSchema = new mongoose.Schema({
  totalSessions: {
    type: Number,
    default: 0,
    min: [0, 'Total sessions cannot be negative']
  },
  completedSessions: {
    type: Number,
    default: 0,
    min: [0, 'Completed sessions cannot be negative']
  },
  averageScore: {
    type: Number,
    min: [0, 'Average score cannot be negative'],
    max: [100, 'Average score cannot exceed 100'],
    default: null
  },
  averageConfidence: {
    type: Number,
    min: [0, 'Average confidence cannot be negative'],
    max: [100, 'Average confidence cannot exceed 100'],
    default: null
  },
  improvementTrend: {
    type: Number,
    default: 0
  },
  totalQuestionsAnswered: {
    type: Number,
    default: 0,
    min: [0, 'Total questions answered cannot be negative']
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: [0, 'Correct answers cannot be negative']
  },
  totalTimeSpent: {
    type: Number, // in seconds
    default: 0,
    min: [0, 'Total time spent cannot be negative']
  },
  sessionsByType: {
    type: Map,
    of: Number,
    default: new Map()
  },
  lastSessionDate: {
    type: Date,
    default: null
  }
});

const learningStatsSchema = new mongoose.Schema({
  totalPaths: {
    type: Number,
    default: 0,
    min: [0, 'Total paths cannot be negative']
  },
  activePaths: {
    type: Number,
    default: 0,
    min: [0, 'Active paths cannot be negative']
  },
  completedPaths: {
    type: Number,
    default: 0,
    min: [0, 'Completed paths cannot be negative']
  },
  skillsInProgress: {
    type: Number,
    default: 0,
    min: [0, 'Skills in progress cannot be negative']
  },
  completedSkills: {
    type: Number,
    default: 0,
    min: [0, 'Completed skills cannot be negative']
  },
  totalHoursSpent: {
    type: Number,
    default: 0,
    min: [0, 'Total hours spent cannot be negative']
  },
  currentStreak: {
    type: Number,
    default: 0,
    min: [0, 'Current streak cannot be negative']
  },
  longestStreak: {
    type: Number,
    default: 0,
    min: [0, 'Longest streak cannot be negative']
  },
  resourcesCompleted: {
    type: Number,
    default: 0,
    min: [0, 'Resources completed cannot be negative']
  },
  averageProgress: {
    type: Number,
    min: [0, 'Average progress cannot be negative'],
    max: [100, 'Average progress cannot exceed 100'],
    default: 0
  },
  companiesFocused: [{
    company: String,
    pathsCount: Number,
    totalProgress: Number
  }],
  lastActivityDate: {
    type: Date,
    default: null
  }
});

const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    index: true
  },
  actions: [actionSchema],
  resumeStats: {
    type: resumeStatsSchema,
    default: () => ({})
  },
  interviewStats: {
    type: interviewStatsSchema,
    default: () => ({})
  },
  learningStats: {
    type: learningStatsSchema,
    default: () => ({})
  },
  dashboardData: {
    careerReadinessScore: {
      type: Number,
      min: [0, 'Career readiness score cannot be negative'],
      max: [100, 'Career readiness score cannot exceed 100'],
      default: 0
    },
    weeklyGoals: {
      resumeOptimizations: { type: Number, default: 1 },
      interviewSessions: { type: Number, default: 3 },
      learningHours: { type: Number, default: 5 }
    },
    weeklyProgress: {
      resumeOptimizations: { type: Number, default: 0 },
      interviewSessions: { type: Number, default: 0 },
      learningHours: { type: Number, default: 0 }
    },
    achievements: [{
      type: String,
      title: String,
      description: String,
      earnedAt: Date,
      category: {
        type: String,
        enum: ['resume', 'interview', 'learning', 'general']
      }
    }],
    recentActivity: [{
      type: String,
      description: String,
      timestamp: Date,
      category: String
    }]
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    achievementNotifications: {
      type: Boolean,
      default: true
    },
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'never'],
      default: 'weekly'
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
userAnalyticsSchema.index({ 'actions.type': 1, 'actions.timestamp': -1 });
userAnalyticsSchema.index({ lastUpdated: -1 });

// Virtual for calculating career readiness score
userAnalyticsSchema.virtual('calculatedCareerReadiness').get(function() {
  let score = 0;
  
  // Resume component (40 points)
  if (this.resumeStats.totalResumes > 0) {
    score += 10;
    if (this.resumeStats.averageATSScore >= 80) score += 20;
    else if (this.resumeStats.averageATSScore >= 60) score += 15;
    else if (this.resumeStats.averageATSScore >= 40) score += 10;
    
    if (this.resumeStats.totalOptimizations > 0) score += 10;
  }
  
  // Interview component (30 points)
  if (this.interviewStats.completedSessions > 0) {
    score += 10;
    if (this.interviewStats.averageScore >= 80) score += 15;
    else if (this.interviewStats.averageScore >= 60) score += 10;
    else if (this.interviewStats.averageScore >= 40) score += 5;
    
    if (this.interviewStats.completedSessions >= 5) score += 5;
  }
  
  // Learning component (30 points)
  if (this.learningStats.activePaths > 0) {
    score += 10;
    if (this.learningStats.averageProgress >= 80) score += 15;
    else if (this.learningStats.averageProgress >= 50) score += 10;
    else if (this.learningStats.averageProgress >= 25) score += 5;
    
    if (this.learningStats.currentStreak >= 7) score += 5;
  }
  
  return Math.min(score, 100);
});

// Method to track user action
userAnalyticsSchema.methods.trackAction = function(type, metadata = {}, sessionId = null, ipAddress = null, userAgent = null) {
  this.actions.push({
    type,
    metadata,
    sessionId,
    ipAddress,
    userAgent,
    timestamp: new Date()
  });
  
  // Keep only last 1000 actions to prevent document from growing too large
  if (this.actions.length > 1000) {
    this.actions = this.actions.slice(-1000);
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update resume stats
userAnalyticsSchema.methods.updateResumeStats = function(resumeData) {
  if (!this.resumeStats) this.resumeStats = {};
  
  this.resumeStats.totalResumes = resumeData.totalResumes || this.resumeStats.totalResumes;
  this.resumeStats.activeResumes = resumeData.activeResumes || this.resumeStats.activeResumes;
  this.resumeStats.averageATSScore = resumeData.averageATSScore || this.resumeStats.averageATSScore;
  this.resumeStats.highestATSScore = resumeData.highestATSScore || this.resumeStats.highestATSScore;
  
  if (resumeData.lastOptimized) this.resumeStats.lastOptimized = resumeData.lastOptimized;
  if (resumeData.totalOptimizations !== undefined) this.resumeStats.totalOptimizations = resumeData.totalOptimizations;
  if (resumeData.totalDownloads !== undefined) this.resumeStats.totalDownloads = resumeData.totalDownloads;
  
  this.dashboardData.careerReadinessScore = this.calculatedCareerReadiness;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to update interview stats
userAnalyticsSchema.methods.updateInterviewStats = function(interviewData) {
  if (!this.interviewStats) this.interviewStats = {};
  
  Object.keys(interviewData).forEach(key => {
    if (interviewData[key] !== undefined) {
      this.interviewStats[key] = interviewData[key];
    }
  });
  
  this.dashboardData.careerReadinessScore = this.calculatedCareerReadiness;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to update learning stats
userAnalyticsSchema.methods.updateLearningStats = function(learningData) {
  if (!this.learningStats) this.learningStats = {};
  
  Object.keys(learningData).forEach(key => {
    if (learningData[key] !== undefined) {
      this.learningStats[key] = learningData[key];
    }
  });
  
  this.dashboardData.careerReadinessScore = this.calculatedCareerReadiness;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to add achievement
userAnalyticsSchema.methods.addAchievement = function(type, title, description, category = 'general') {
  if (!this.dashboardData.achievements) this.dashboardData.achievements = [];
  
  // Check if achievement already exists
  const existingAchievement = this.dashboardData.achievements.find(a => a.title === title);
  if (existingAchievement) return;
  
  this.dashboardData.achievements.push({
    type,
    title,
    description,
    category,
    earnedAt: new Date()
  });
  
  // Track achievement action
  this.trackAction('achievement_earned', { title, category });
  
  return this.save();
};

// Method to add recent activity
userAnalyticsSchema.methods.addRecentActivity = function(type, description, category = 'general') {
  if (!this.dashboardData.recentActivity) this.dashboardData.recentActivity = [];
  
  this.dashboardData.recentActivity.unshift({
    type,
    description,
    category,
    timestamp: new Date()
  });
  
  // Keep only last 20 activities
  if (this.dashboardData.recentActivity.length > 20) {
    this.dashboardData.recentActivity = this.dashboardData.recentActivity.slice(0, 20);
  }
  
  return this.save();
};

// Method to get dashboard data
userAnalyticsSchema.methods.getDashboardData = function() {
  return {
    careerReadinessScore: this.calculatedCareerReadiness,
    resumeStats: this.resumeStats,
    interviewStats: this.interviewStats,
    learningStats: this.learningStats,
    weeklyGoals: this.dashboardData.weeklyGoals,
    weeklyProgress: this.dashboardData.weeklyProgress,
    achievements: this.dashboardData.achievements || [],
    recentActivity: this.dashboardData.recentActivity || []
  };
};

// Static method to get platform analytics
userAnalyticsSchema.statics.getPlatformAnalytics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalResumes: { $sum: '$resumeStats.totalResumes' },
        totalInterviewSessions: { $sum: '$interviewStats.totalSessions' },
        totalLearningPaths: { $sum: '$learningStats.totalPaths' },
        averageCareerReadiness: { $avg: '$dashboardData.careerReadinessScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('UserAnalytics', userAnalyticsSchema);