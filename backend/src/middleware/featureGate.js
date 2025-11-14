const { Subscription } = require('../models');

/**
 * Feature Gate Middleware
 * Controls access to features based on subscription plan
 */

// Plan hierarchy
const PLAN_HIERARCHY = {
  free: 0,
  pro: 1,
  enterprise: 2
};

/**
 * Check if user has required plan
 */
const requirePlan = (requiredPlan) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found',
          upgradeRequired: true,
          requiredPlan
        });
      }

      // Check if subscription is active or trial
      if (!['active', 'trial'].includes(subscription.status)) {
        return res.status(403).json({
          success: false,
          message: 'Subscription is not active',
          upgradeRequired: true,
          currentPlan: subscription.plan,
          requiredPlan
        });
      }

      // Check plan hierarchy
      const userPlanLevel = PLAN_HIERARCHY[subscription.plan] || 0;
      const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan] || 0;

      if (userPlanLevel < requiredPlanLevel) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredPlan} plan`,
          upgradeRequired: true,
          currentPlan: subscription.plan,
          requiredPlan
        });
      }

      // Attach subscription to request
      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Feature gate error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking subscription'
      });
    }
  };
};

/**
 * Check AI credits availability
 */
const requireCredits = (creditsNeeded) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found'
        });
      }

      // Enterprise has unlimited credits
      if (subscription.plan === 'enterprise') {
        req.subscription = subscription;
        return next();
      }

      // Check if user has enough credits
      if (subscription.aiCredits.remaining < creditsNeeded) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient AI credits',
          creditsNeeded,
          creditsRemaining: subscription.aiCredits.remaining,
          upgradeRequired: true
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Credits check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking credits'
      });
    }
  };
};

/**
 * Deduct AI credits after successful operation
 */
const deductCredits = async (userId, amount, feature) => {
  try {
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const result = await subscription.deductCredits(amount);
    
    // Log usage
    console.log(`Credits deducted: ${amount} for ${feature}, remaining: ${result.remaining}`);
    
    return result;
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
};

/**
 * Check resume creation limit
 */
const checkResumeLimit = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found'
      });
    }

    // Check if user can create resume
    if (!subscription.canCreateResume()) {
      return res.status(403).json({
        success: false,
        message: 'Resume creation limit reached',
        limit: subscription.usageLimits.resumesLimit,
        current: subscription.usageLimits.resumesCreated,
        upgradeRequired: true
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Resume limit check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking resume limit'
    });
  }
};

/**
 * Check template access
 */
const checkTemplateAccess = (templateType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        return res.status(403).json({
          success: false,
          message: 'No subscription found'
        });
      }

      // Premium templates require paid plan
      if (templateType === 'premium' && subscription.plan === 'free') {
        return res.status(403).json({
          success: false,
          message: 'Premium templates require Pro or Enterprise plan',
          upgradeRequired: true,
          requiredPlan: 'pro'
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Template access check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking template access'
      });
    }
  };
};

module.exports = {
  requirePlan,
  requireCredits,
  deductCredits,
  checkResumeLimit,
  checkTemplateAccess
};
