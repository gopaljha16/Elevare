const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    required: true,
    default: 'free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'trial'],
    required: true,
    default: 'active',
    index: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annual'],
    default: 'monthly'
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    index: true
  },
  nextBillingDate: {
    type: Date
  },
  autoRenew: {
    type: Boolean,
    default: true
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  // Trial information
  isTrial: {
    type: Boolean,
    default: false
  },
  trialStartDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  },
  trialUsed: {
    type: Boolean,
    default: false
  },
  // AI Credits tracking
  aiCredits: {
    total: {
      type: Number,
      default: 5 // Free tier default
    },
    used: {
      type: Number,
      default: 0
    },
    remaining: {
      type: Number,
      default: 5
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  // Usage limits
  usageLimits: {
    resumesCreated: {
      type: Number,
      default: 0
    },
    resumesLimit: {
      type: Number,
      default: 2 // Free tier default
    },
    aiAnalysesPerformed: {
      type: Number,
      default: 0
    },
    interviewPrepSessions: {
      type: Number,
      default: 0
    },
    portfoliosGenerated: {
      type: Number,
      default: 0
    }
  },
  // Payment information
  razorpaySubscriptionId: {
    type: String,
    sparse: true
  },
  razorpayCustomerId: {
    type: String
  },
  paymentMethod: {
    type: String
  },
  lastPaymentDate: {
    type: Date
  },
  lastPaymentAmount: {
    type: Number
  },
  // Referral information
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCredits: {
    type: Number,
    default: 0
  },
  referralCount: {
    type: Number,
    default: 0
  },
  // Metadata
  metadata: {
    upgradeHistory: [{
      fromPlan: String,
      toPlan: String,
      date: Date,
      reason: String
    }],
    renewalAttempts: {
      type: Number,
      default: 0
    },
    lastRenewalAttempt: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ expiryDate: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ referralCode: 1 });
subscriptionSchema.index({ 'metadata.upgradeHistory.date': -1 });

// Virtual for days remaining
subscriptionSchema.virtual('daysRemaining').get(function() {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diff = this.expiryDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual for is expired
subscriptionSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for credit usage percentage
subscriptionSchema.virtual('creditUsagePercentage').get(function() {
  if (this.aiCredits.total === 0) return 0;
  return Math.round((this.aiCredits.used / this.aiCredits.total) * 100);
});

// Method to deduct AI credits
subscriptionSchema.methods.deductCredits = async function(amount) {
  if (this.plan === 'enterprise') {
    // Enterprise has unlimited credits
    return { success: true, remaining: Infinity };
  }

  if (this.aiCredits.remaining < amount) {
    return { 
      success: false, 
      remaining: this.aiCredits.remaining,
      message: 'Insufficient AI credits'
    };
  }

  this.aiCredits.used += amount;
  this.aiCredits.remaining = this.aiCredits.total - this.aiCredits.used;
  
  await this.save();
  
  return { 
    success: true, 
    remaining: this.aiCredits.remaining,
    usagePercentage: this.creditUsagePercentage
  };
};

// Method to reset monthly credits
subscriptionSchema.methods.resetMonthlyCredits = async function() {
  const creditsMap = {
    free: 5,
    pro: 100,
    enterprise: -1 // Unlimited
  };

  const totalCredits = creditsMap[this.plan] || 5;
  
  this.aiCredits.total = totalCredits;
  this.aiCredits.used = 0;
  this.aiCredits.remaining = totalCredits;
  this.aiCredits.lastResetDate = new Date();
  
  // Reset monthly usage counters
  this.usageLimits.aiAnalysesPerformed = 0;
  this.usageLimits.interviewPrepSessions = 0;
  this.usageLimits.portfoliosGenerated = 0;
  
  await this.save();
  
  return this;
};

// Method to check if user can create resume
subscriptionSchema.methods.canCreateResume = function() {
  if (this.plan !== 'free') return true;
  return this.usageLimits.resumesCreated < this.usageLimits.resumesLimit;
};

// Method to increment resume count
subscriptionSchema.methods.incrementResumeCount = async function() {
  this.usageLimits.resumesCreated += 1;
  await this.save();
  return this;
};

// Method to upgrade subscription
subscriptionSchema.methods.upgradePlan = async function(newPlan, billingCycle, amount) {
  const oldPlan = this.plan;
  
  this.metadata.upgradeHistory.push({
    fromPlan: oldPlan,
    toPlan: newPlan,
    date: new Date(),
    reason: 'user_upgrade'
  });

  this.plan = newPlan;
  this.billingCycle = billingCycle;
  this.amount = amount;
  this.status = 'active';
  
  // Update credit limits based on new plan
  const creditsMap = {
    free: 5,
    pro: 100,
    enterprise: -1
  };
  
  const resumeLimitsMap = {
    free: 2,
    pro: -1, // Unlimited
    enterprise: -1
  };

  this.aiCredits.total = creditsMap[newPlan];
  this.aiCredits.remaining = creditsMap[newPlan] - this.aiCredits.used;
  this.usageLimits.resumesLimit = resumeLimitsMap[newPlan];
  
  // Set expiry date
  const now = new Date();
  if (billingCycle === 'monthly') {
    this.expiryDate = new Date(now.setMonth(now.getMonth() + 1));
  } else {
    this.expiryDate = new Date(now.setFullYear(now.getFullYear() + 1));
  }
  
  this.nextBillingDate = this.expiryDate;
  
  await this.save();
  return this;
};

// Method to cancel subscription
subscriptionSchema.methods.cancelSubscription = async function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.autoRenew = false;
  
  await this.save();
  return this;
};

// Method to generate referral code
subscriptionSchema.methods.generateReferralCode = function() {
  const crypto = require('crypto');
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  this.referralCode = `REF${code}`;
  return this.referralCode;
};

// Static method to find subscriptions expiring soon
subscriptionSchema.statics.findExpiringSoon = function(days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: 'active',
    expiryDate: {
      $gte: now,
      $lte: futureDate
    },
    autoRenew: true
  });
};

// Static method to find expired subscriptions
subscriptionSchema.statics.findExpired = function() {
  return this.find({
    status: 'active',
    expiryDate: { $lt: new Date() }
  });
};

// Static method to get subscription stats
subscriptionSchema.statics.getSubscriptionStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' },
        activeCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
          }
        }
      }
    }
  ]);

  return stats;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
