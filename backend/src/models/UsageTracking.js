const mongoose = require('mongoose');

const usageTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  // Feature usage tracking
  featureType: {
    type: String,
    enum: [
      'resume_analysis',
      'cover_letter_generation',
      'interview_prep',
      'portfolio_generation',
      'resume_creation',
      'ats_analysis',
      'ai_chat',
      'template_access',
      'pdf_download',
      'resume_edit'
    ],
    required: true,
    index: true
  },
  // Credits consumed
  creditsUsed: {
    type: Number,
    default: 0
  },
  // Timestamp
  usedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Resource details
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'resourceType'
  },
  resourceType: {
    type: String,
    enum: ['Resume', 'Portfolio', 'InterviewSession', 'ChatHistory']
  },
  // Usage metadata
  metadata: {
    duration: Number, // in seconds
    success: {
      type: Boolean,
      default: true
    },
    errorMessage: String,
    ipAddress: String,
    userAgent: String,
    platform: {
      type: String,
      enum: ['web', 'mobile', 'api']
    },
    // Additional context
    context: {
      templateUsed: String,
      analysisType: String,
      wordCount: Number,
      fileSize: Number
    }
  },
  // Monthly tracking period
  month: {
    type: Number,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
usageTrackingSchema.index({ userId: 1, featureType: 1, usedAt: -1 });
usageTrackingSchema.index({ userId: 1, year: 1, month: 1 });
usageTrackingSchema.index({ subscriptionId: 1, usedAt: -1 });
usageTrackingSchema.index({ featureType: 1, usedAt: -1 });

// Pre-save middleware to set month and year
usageTrackingSchema.pre('save', function(next) {
  const date = this.usedAt || new Date();
  this.month = date.getMonth() + 1;
  this.year = date.getFullYear();
  next();
});

// Static method to track feature usage
usageTrackingSchema.statics.trackUsage = async function(data) {
  const usage = new this({
    userId: data.userId,
    subscriptionId: data.subscriptionId,
    featureType: data.featureType,
    creditsUsed: data.creditsUsed || 0,
    resourceId: data.resourceId,
    resourceType: data.resourceType,
    metadata: data.metadata || {}
  });
  
  await usage.save();
  return usage;
};

// Static method to get user usage for current month
usageTrackingSchema.statics.getCurrentMonthUsage = async function(userId) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const usage = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        year: year,
        month: month
      }
    },
    {
      $group: {
        _id: '$featureType',
        count: { $sum: 1 },
        totalCredits: { $sum: '$creditsUsed' }
      }
    }
  ]);
  
  return usage;
};

// Static method to get usage statistics
usageTrackingSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId)
  };
  
  if (startDate && endDate) {
    matchStage.usedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$featureType',
        count: { $sum: 1 },
        totalCredits: { $sum: '$creditsUsed' },
        successRate: {
          $avg: {
            $cond: ['$metadata.success', 1, 0]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

// Static method to get daily usage trend
usageTrackingSchema.statics.getDailyTrend = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const trend = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        usedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$usedAt' } },
          featureType: '$featureType'
        },
        count: { $sum: 1 },
        credits: { $sum: '$creditsUsed' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
  
  return trend;
};

// Static method to get feature popularity
usageTrackingSchema.statics.getFeaturePopularity = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.usedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const popularity = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$featureType',
        totalUsage: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' },
        totalCredits: { $sum: '$creditsUsed' },
        averageCreditsPerUse: { $avg: '$creditsUsed' }
      }
    },
    {
      $project: {
        featureType: '$_id',
        totalUsage: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        totalCredits: 1,
        averageCreditsPerUse: 1
      }
    },
    { $sort: { totalUsage: -1 } }
  ]);
  
  return popularity;
};

// Static method to get usage by plan
usageTrackingSchema.statics.getUsageByPlan = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.usedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  const usage = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'subscriptions',
        localField: 'subscriptionId',
        foreignField: '_id',
        as: 'subscription'
      }
    },
    { $unwind: '$subscription' },
    {
      $group: {
        _id: {
          plan: '$subscription.plan',
          featureType: '$featureType'
        },
        count: { $sum: 1 },
        totalCredits: { $sum: '$creditsUsed' }
      }
    },
    { $sort: { '_id.plan': 1, count: -1 } }
  ]);
  
  return usage;
};

// Static method to get monthly summary for user
usageTrackingSchema.statics.getMonthlySummary = async function(userId, year, month) {
  const summary = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        year: year,
        month: month
      }
    },
    {
      $group: {
        _id: null,
        totalUsage: { $sum: 1 },
        totalCredits: { $sum: '$creditsUsed' },
        features: {
          $push: {
            type: '$featureType',
            count: 1,
            credits: '$creditsUsed'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalUsage: 1,
        totalCredits: 1,
        featureBreakdown: {
          $reduce: {
            input: '$features',
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                [{
                  type: '$$this.type',
                  count: '$$this.count',
                  credits: '$$this.credits'
                }]
              ]
            }
          }
        }
      }
    }
  ]);
  
  return summary[0] || {
    totalUsage: 0,
    totalCredits: 0,
    featureBreakdown: []
  };
};

// Static method to check if user exceeded limits
usageTrackingSchema.statics.checkLimits = async function(userId, featureType, limit) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  const count = await this.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    featureType: featureType,
    year: year,
    month: month
  });
  
  return {
    current: count,
    limit: limit,
    exceeded: count >= limit,
    remaining: Math.max(0, limit - count)
  };
};

const UsageTracking = mongoose.model('UsageTracking', usageTrackingSchema);

module.exports = UsageTracking;
