const mongoose = require('mongoose');

const skillProgressSchema = new mongoose.Schema({
  skillId: {
    type: String,
    required: [true, 'Skill ID is required'],
    index: true
  },
  skillName: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true
  },
  progressPercentage: {
    type: Number,
    min: [0, 'Progress percentage cannot be negative'],
    max: [100, 'Progress percentage cannot exceed 100'],
    default: 0
  },
  completedResources: [{
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: {
      type: Number, // in minutes
      min: [0, 'Time spent cannot be negative']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedTimeRemaining: {
    type: Number, // in hours
    min: [0, 'Estimated time remaining cannot be negative']
  }
});

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  learningPathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: [true, 'Learning path ID is required'],
    index: true
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true
  },
  pathTitle: {
    type: String,
    required: [true, 'Path title is required'],
    trim: true
  },
  skillProgress: [skillProgressSchema],
  overallProgress: {
    type: Number,
    min: [0, 'Overall progress cannot be negative'],
    max: [100, 'Overall progress cannot exceed 100'],
    default: 0
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused'],
    default: 'not-started',
    index: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  streak: {
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date,
      default: null
    }
  },
  goals: {
    targetCompletionDate: {
      type: Date
    },
    dailyTimeGoal: {
      type: Number, // in minutes
      default: 60
    },
    weeklyTimeGoal: {
      type: Number, // in minutes
      default: 420 // 7 hours
    }
  },
  achievements: [{
    type: {
      type: String,
      enum: ['skill-completed', 'streak-milestone', 'time-milestone', 'path-completed'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  reminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily'
    },
    lastSent: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
userProgressSchema.index({ userId: 1, learningPathId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ company: 1, status: 1 });
userProgressSchema.index({ lastActivityAt: -1 });

// Virtual for calculating days since last activity
userProgressSchema.virtual('daysSinceLastActivity').get(function() {
  if (!this.lastActivityAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastActivityAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for calculating completion rate
userProgressSchema.virtual('completionRate').get(function() {
  if (this.skillProgress.length === 0) return 0;
  const completedSkills = this.skillProgress.filter(skill => skill.progressPercentage === 100).length;
  return Math.round((completedSkills / this.skillProgress.length) * 100);
});

// Method to update overall progress
userProgressSchema.methods.updateOverallProgress = function() {
  if (this.skillProgress.length === 0) {
    this.overallProgress = 0;
    return;
  }
  
  const totalProgress = this.skillProgress.reduce((sum, skill) => sum + skill.progressPercentage, 0);
  this.overallProgress = Math.round(totalProgress / this.skillProgress.length);
  
  // Update status based on progress
  if (this.overallProgress === 100) {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.overallProgress > 0) {
    this.status = 'in-progress';
  }
};

// Method to update skill progress
userProgressSchema.methods.updateSkillProgress = function(skillId, progressPercentage, resourceId = null, timeSpent = 0) {
  let skillProgress = this.skillProgress.find(sp => sp.skillId === skillId);
  
  if (!skillProgress) {
    // Create new skill progress entry
    skillProgress = {
      skillId,
      skillName: skillId, // This should be updated with actual skill name
      progressPercentage: 0,
      completedResources: [],
      lastAccessed: new Date(),
      startedAt: new Date()
    };
    this.skillProgress.push(skillProgress);
  }
  
  // Update progress
  skillProgress.progressPercentage = Math.max(skillProgress.progressPercentage, progressPercentage);
  skillProgress.lastAccessed = new Date();
  
  // Add completed resource if provided
  if (resourceId && !skillProgress.completedResources.some(cr => cr.resourceId.equals(resourceId))) {
    skillProgress.completedResources.push({
      resourceId,
      completedAt: new Date(),
      timeSpent
    });
  }
  
  // Mark skill as completed if 100%
  if (skillProgress.progressPercentage === 100 && !skillProgress.completedAt) {
    skillProgress.completedAt = new Date();
    this.addAchievement('skill-completed', `Completed ${skillProgress.skillName}`, `You have successfully completed the ${skillProgress.skillName} skill!`);
  }
  
  // Update overall progress and activity tracking
  this.updateOverallProgress();
  this.updateActivity(timeSpent);
  
  return this.save();
};

// Method to update activity and streak
userProgressSchema.methods.updateActivity = function(timeSpent = 0) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  this.lastActivityAt = now;
  this.totalTimeSpent += timeSpent;
  
  // Update streak
  if (this.streak.lastActivityDate) {
    const lastActivityDate = new Date(this.streak.lastActivityDate.getFullYear(), this.streak.lastActivityDate.getMonth(), this.streak.lastActivityDate.getDate());
    const daysDiff = Math.floor((today - lastActivityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      // Consecutive day
      this.streak.currentStreak += 1;
      this.streak.longestStreak = Math.max(this.streak.longestStreak, this.streak.currentStreak);
    } else if (daysDiff > 1) {
      // Streak broken
      this.streak.currentStreak = 1;
    }
    // If daysDiff === 0, it's the same day, don't change streak
  } else {
    // First activity
    this.streak.currentStreak = 1;
    this.streak.longestStreak = 1;
  }
  
  this.streak.lastActivityDate = today;
  
  // Check for streak achievements
  if (this.streak.currentStreak === 7) {
    this.addAchievement('streak-milestone', '7-Day Streak', 'You have maintained a 7-day learning streak!');
  } else if (this.streak.currentStreak === 30) {
    this.addAchievement('streak-milestone', '30-Day Streak', 'Amazing! You have maintained a 30-day learning streak!');
  }
};

// Method to add achievement
userProgressSchema.methods.addAchievement = function(type, title, description, metadata = {}) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(a => a.type === type && a.title === title);
  if (existingAchievement) return;
  
  this.achievements.push({
    type,
    title,
    description,
    metadata,
    earnedAt: new Date()
  });
};

// Method to get progress summary
userProgressSchema.methods.getProgressSummary = function() {
  const completedSkills = this.skillProgress.filter(skill => skill.progressPercentage === 100).length;
  const inProgressSkills = this.skillProgress.filter(skill => skill.progressPercentage > 0 && skill.progressPercentage < 100).length;
  
  return {
    overallProgress: this.overallProgress,
    completedSkills,
    inProgressSkills,
    totalSkills: this.skillProgress.length,
    totalTimeSpent: this.totalTimeSpent,
    currentStreak: this.streak.currentStreak,
    longestStreak: this.streak.longestStreak,
    achievements: this.achievements.length,
    status: this.status,
    daysSinceLastActivity: this.daysSinceLastActivity
  };
};

// Static method to get user statistics
userProgressSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalPaths: { $sum: 1 },
        completedPaths: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
        averageProgress: { $avg: '$overallProgress' },
        totalAchievements: { $sum: { $size: '$achievements' } },
        longestStreak: { $max: '$streak.longestStreak' }
      }
    }
  ]);
};

// Static method to find users needing reminders
userProgressSchema.statics.findUsersNeedingReminders = function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return this.find({
    'reminders.enabled': true,
    lastActivityAt: { $lt: sevenDaysAgo },
    status: { $in: ['in-progress', 'not-started'] }
  }).populate('userId', 'name email');
};

module.exports = mongoose.model('UserProgress', userProgressSchema);