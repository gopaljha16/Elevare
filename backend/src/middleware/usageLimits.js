/**
 * Usage Limits Middleware
 * Enforces AI usage limits based on subscription plan
 * @version 1.0.0
 */

const { Subscription, UsageTracking } = require('../models');
const { CREDIT_COSTS } = require('../services/aiServiceV2');

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    aiCreditsPerMonth: 5,
    resumesLimit: 2,
    atsAnalysesPerMonth: 3,
    coverLettersPerMonth: 2,
    interviewQuestionsPerMonth: 5,
    portfoliosLimit: 1
  },
  pro: {
    aiCreditsPerMonth: 100,
    resumesLimit: -1, // Unlimited
    atsAnalysesPerMonth: 50,
    coverLettersPerMonth: 30,
    interviewQuestionsPerMonth: -1,
    portfoliosLimit: 5
  },
  enterprise: {
    aiCreditsPerMonth: -1, // Unlimited
    resumesLimit: -1,
    atsAnalysesPerMonth: -1,
    coverLettersPerMonth: -1,
    interviewQuestionsPerMonth: -1,
    portfoliosLimit: -1
  }
};

// Feature to credit cost mapping
const FEATURE_CREDIT_COSTS = {
  ats_analysis: 2,
  resume_analysis: 2,
  cover_letter_generation: 2,
  interview_prep: 1,
  portfolio_generation: 3,
  resume_optimization: 3,
  ai_chat: 1,
  skill_gap_analysis: 1
};

/**
 * Check if user has sufficient credits for an operation
 */
const checkCredits = (creditsNeeded = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required'
          }
        });
      }

      // Get or create subscription
      let subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        subscription = await Subscription.create({
          userId,
          plan: 'free',
          status: 'active',
          aiCredits: {
            total: PLAN_LIMITS.free.aiCreditsPerMonth,
            used: 0,
            remaining: PLAN_LIMITS.free.aiCreditsPerMonth
          }
        });
      }

      // Enterprise has unlimited credits
      if (subscription.plan === 'enterprise') {
        req.subscription = subscription;
        req.creditsToDeduct = creditsNeeded;
        return next();
      }

      // Check subscription status
      if (!['active', 'trial'].includes(subscription.status)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_INACTIVE',
            message: 'Your subscription is not active',
            currentStatus: subscription.status
          },
          upgradeRequired: true
        });
      }

      // Check if credits need to be reset (monthly reset)
      const lastReset = new Date(subscription.aiCredits.lastResetDate);
      const now = new Date();
      const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
      
      if (daysSinceReset >= 30) {
        await subscription.resetMonthlyCredits();
      }

      // Check credit availability
      if (subscription.aiCredits.remaining < creditsNeeded) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Insufficient AI credits',
            creditsNeeded,
            creditsRemaining: subscription.aiCredits.remaining,
            creditsTotal: subscription.aiCredits.total,
            resetDate: getNextResetDate(subscription.aiCredits.lastResetDate)
          },
          upgradeRequired: true,
          upgradeOptions: getUpgradeOptions(subscription.plan)
        });
      }

      req.subscription = subscription;
      req.creditsToDeduct = creditsNeeded;
      next();
    } catch (error) {
      console.error('Credit check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'CREDIT_CHECK_FAILED',
          message: 'Failed to verify credits'
        }
      });
    }
  };
};

/**
 * Check feature-specific usage limits
 */
const checkFeatureLimit = (featureType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required'
          }
        });
      }

      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NO_SUBSCRIPTION',
            message: 'No subscription found'
          }
        });
      }

      const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;
      const limitKey = getFeatureLimitKey(featureType);
      const limit = limits[limitKey];

      // -1 means unlimited
      if (limit === -1) {
        req.subscription = subscription;
        return next();
      }

      // Check current month usage
      const usageCheck = await UsageTracking.checkLimits(userId, featureType, limit);

      if (usageCheck.exceeded) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_LIMIT_EXCEEDED',
            message: `Monthly limit reached for ${featureType.replace(/_/g, ' ')}`,
            currentUsage: usageCheck.current,
            limit: usageCheck.limit,
            remaining: usageCheck.remaining,
            resetDate: getNextMonthStart()
          },
          upgradeRequired: true,
          upgradeOptions: getUpgradeOptions(subscription.plan)
        });
      }

      req.subscription = subscription;
      req.featureUsage = usageCheck;
      next();
    } catch (error) {
      console.error('Feature limit check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'LIMIT_CHECK_FAILED',
          message: 'Failed to verify usage limits'
        }
      });
    }
  };
};

/**
 * Deduct credits after successful operation
 */
const deductCreditsAfterSuccess = async (req, featureType) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const subscription = req.subscription;
    const creditsToDeduct = req.creditsToDeduct || FEATURE_CREDIT_COSTS[featureType] || 1;

    if (!subscription || subscription.plan === 'enterprise') {
      return { success: true, unlimited: true };
    }

    // Deduct credits
    const result = await subscription.deductCredits(creditsToDeduct);

    // Track usage
    await UsageTracking.trackUsage({
      userId,
      subscriptionId: subscription._id,
      featureType,
      creditsUsed: creditsToDeduct,
      metadata: {
        success: true,
        platform: 'web'
      }
    });

    return result;
  } catch (error) {
    console.error('Credit deduction error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track failed operation (no credit deduction)
 */
const trackFailedOperation = async (req, featureType, errorMessage) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const subscription = req.subscription;

    if (!userId || !subscription) return;

    await UsageTracking.trackUsage({
      userId,
      subscriptionId: subscription._id,
      featureType,
      creditsUsed: 0,
      metadata: {
        success: false,
        errorMessage,
        platform: 'web'
      }
    });
  } catch (error) {
    console.error('Failed operation tracking error:', error);
  }
};

/**
 * Get user's current usage summary
 */
const getUserUsageSummary = async (userId) => {
  try {
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return null;
    }

    const currentMonthUsage = await UsageTracking.getCurrentMonthUsage(userId);
    const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;

    return {
      plan: subscription.plan,
      status: subscription.status,
      credits: {
        total: subscription.aiCredits.total,
        used: subscription.aiCredits.used,
        remaining: subscription.aiCredits.remaining,
        resetDate: getNextResetDate(subscription.aiCredits.lastResetDate)
      },
      featureUsage: currentMonthUsage.reduce((acc, usage) => {
        acc[usage._id] = {
          used: usage.count,
          limit: limits[getFeatureLimitKey(usage._id)] || 0,
          creditsConsumed: usage.totalCredits
        };
        return acc;
      }, {}),
      limits,
      daysUntilReset: getDaysUntilReset(subscription.aiCredits.lastResetDate)
    };
  } catch (error) {
    console.error('Usage summary error:', error);
    return null;
  }
};

// Helper functions
function getFeatureLimitKey(featureType) {
  const mapping = {
    'ats_analysis': 'atsAnalysesPerMonth',
    'resume_analysis': 'atsAnalysesPerMonth',
    'cover_letter_generation': 'coverLettersPerMonth',
    'interview_prep': 'interviewQuestionsPerMonth',
    'portfolio_generation': 'portfoliosLimit',
    'resume_creation': 'resumesLimit'
  };
  return mapping[featureType] || 'aiCreditsPerMonth';
}

function getNextResetDate(lastResetDate) {
  const reset = new Date(lastResetDate);
  reset.setDate(reset.getDate() + 30);
  return reset.toISOString();
}

function getNextMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

function getDaysUntilReset(lastResetDate) {
  const reset = new Date(lastResetDate);
  reset.setDate(reset.getDate() + 30);
  const now = new Date();
  return Math.max(0, Math.ceil((reset - now) / (1000 * 60 * 60 * 24)));
}

function getUpgradeOptions(currentPlan) {
  if (currentPlan === 'free') {
    return [
      {
        plan: 'pro',
        name: 'Pro Plan',
        monthlyPrice: 499,
        annualPrice: 4999,
        benefits: ['100 AI credits/month', 'Unlimited resumes', '50 ATS analyses/month']
      },
      {
        plan: 'enterprise',
        name: 'Enterprise Plan',
        monthlyPrice: 1999,
        annualPrice: 19999,
        benefits: ['Unlimited AI credits', 'Priority support', 'Team features']
      }
    ];
  } else if (currentPlan === 'pro') {
    return [
      {
        plan: 'enterprise',
        name: 'Enterprise Plan',
        monthlyPrice: 1999,
        annualPrice: 19999,
        benefits: ['Unlimited AI credits', 'Priority support', 'Team features']
      }
    ];
  }
  return [];
}

module.exports = {
  checkCredits,
  checkFeatureLimit,
  deductCreditsAfterSuccess,
  trackFailedOperation,
  getUserUsageSummary,
  PLAN_LIMITS,
  FEATURE_CREDIT_COSTS
};
