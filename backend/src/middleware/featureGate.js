/**
 * Feature Gate Middleware
 * Controls access to features based on subscription plan
 * @version 1.0.0
 */

const { Subscription } = require('../models');

// Plan feature access configuration
const PLAN_FEATURES = {
  free: {
    resumeBuilder: true,
    atsAnalysis: true,
    portfolioBuilder: true,
    interviewPrep: true,
    coverLetter: true,
    aiChat: true,
    premiumTemplates: false,
    advancedAnalytics: false,
    prioritySupport: false,
    teamFeatures: false,
    apiAccess: false
  },
  pro: {
    resumeBuilder: true,
    atsAnalysis: true,
    portfolioBuilder: true,
    interviewPrep: true,
    coverLetter: true,
    aiChat: true,
    premiumTemplates: true,
    advancedAnalytics: true,
    prioritySupport: false,
    teamFeatures: false,
    apiAccess: false
  },
  enterprise: {
    resumeBuilder: true,
    atsAnalysis: true,
    portfolioBuilder: true,
    interviewPrep: true,
    coverLetter: true,
    aiChat: true,
    premiumTemplates: true,
    advancedAnalytics: true,
    prioritySupport: true,
    teamFeatures: true,
    apiAccess: true
  }
};

/**
 * Check if user has access to a specific feature
 * @param {string} feature - Feature name to check
 * @returns {Function} Express middleware
 */
const requireFeature = (feature) => {
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

      // Get user's subscription
      let subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        // Create free subscription if none exists
        subscription = await Subscription.create({
          userId,
          plan: 'free',
          status: 'active'
        });
      }

      // Check subscription status
      if (!['active', 'trial'].includes(subscription.status)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_INACTIVE',
            message: 'Your subscription is not active'
          }
        });
      }

      // Check feature access
      const planFeatures = PLAN_FEATURES[subscription.plan] || PLAN_FEATURES.free;
      
      if (!planFeatures[feature]) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_NOT_AVAILABLE',
            message: `This feature requires a higher plan`,
            feature,
            currentPlan: subscription.plan,
            requiredPlans: getPlansWithFeature(feature)
          },
          upgradeRequired: true
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Feature gate error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'FEATURE_CHECK_FAILED',
          message: 'Failed to verify feature access'
        }
      });
    }
  };
};

/**
 * Check if user has a specific plan or higher
 * @param {string|string[]} requiredPlans - Required plan(s)
 * @returns {Function} Express middleware
 */
const requirePlan = (requiredPlans) => {
  const plans = Array.isArray(requiredPlans) ? requiredPlans : [requiredPlans];
  
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

      if (!plans.includes(subscription.plan)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PLAN_REQUIRED',
            message: `This feature requires ${plans.join(' or ')} plan`,
            currentPlan: subscription.plan,
            requiredPlans: plans
          },
          upgradeRequired: true
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Plan check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'PLAN_CHECK_FAILED',
          message: 'Failed to verify plan'
        }
      });
    }
  };
};

/**
 * Get list of plans that have access to a feature
 * @param {string} feature - Feature name
 * @returns {string[]} List of plan names
 */
function getPlansWithFeature(feature) {
  return Object.entries(PLAN_FEATURES)
    .filter(([_, features]) => features[feature])
    .map(([plan]) => plan);
}

/**
 * Check if a plan has access to a feature
 * @param {string} plan - Plan name
 * @param {string} feature - Feature name
 * @returns {boolean} Whether plan has feature access
 */
function planHasFeature(plan, feature) {
  const planFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.free;
  return !!planFeatures[feature];
}

/**
 * Get all features for a plan
 * @param {string} plan - Plan name
 * @returns {Object} Feature access map
 */
function getPlanFeatures(plan) {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.free;
}

module.exports = {
  requireFeature,
  requirePlan,
  getPlansWithFeature,
  planHasFeature,
  getPlanFeatures,
  PLAN_FEATURES
};
