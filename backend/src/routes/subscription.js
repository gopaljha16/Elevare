const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePlan } = require('../middleware/featureGate');
const razorpayService = require('../services/razorpayService');
const subscriptionService = require('../services/subscriptionService');
const { Subscription, Payment } = require('../models');

/**
 * Subscription Management Routes
 */

// Create Razorpay order for subscription
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { plan, billingCycle, discountCode } = req.body;
    const userId = req.user._id || req.user.id;

    console.log('📦 Create order request:', { plan, billingCycle, userId: userId.toString() });

    // Validate input
    if (!plan || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: 'Plan and billing cycle are required'
      });
    }

    // Validate plan
    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Only pro and enterprise plans can be purchased.'
      });
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Must be monthly or annual.'
      });
    }

    // Get or create subscription
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        plan: 'free',
        status: 'active'
      });
      console.log('📝 Created new subscription for user:', userId.toString());
    }

    // Create order
    const orderData = {
      userId,
      plan,
      billingCycle,
      subscriptionId: subscription._id,
      discountCode,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    console.log('💳 Creating Razorpay order...');
    const order = await razorpayService.createOrder(orderData);
    console.log('✅ Order created successfully:', order.orderId);

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create order';
    let statusCode = 500;

    if (error.message.includes('not configured')) {
      errorMessage = 'Payment service is temporarily unavailable. Please try again later.';
      statusCode = 503;
    } else if (error.message.includes('Invalid plan')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('billing cycle')) {
      errorMessage = error.message;
      statusCode = 400;
    }

    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify payment and activate subscription
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    // Verify payment
    const verification = await razorpayService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Activate subscription
    const subscription = await subscriptionService.activateSubscription(verification.payment._id);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated',
      data: {
        subscription,
        payment: verification.payment
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current subscription
router.get('/current', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    let subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        plan: 'free',
        status: 'active'
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { reason } = req.body;

    const subscription = await subscriptionService.cancelSubscription(userId, reason);

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Upgrade subscription
router.post('/upgrade', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { plan, billingCycle } = req.body;

    if (!plan || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: 'Plan and billing cycle are required'
      });
    }

    const result = await subscriptionService.upgradeSubscription(userId, plan, billingCycle);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get usage statistics
router.get('/usage', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const usage = {
      plan: subscription.plan,
      status: subscription.status,
      aiCredits: subscription.aiCredits,
      usageLimits: subscription.usageLimits,
      creditUsagePercentage: subscription.creditUsagePercentage,
      daysRemaining: subscription.daysRemaining
    };

    return res.status(200).json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Get usage error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get billing history
router.get('/billing-history', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Payment.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get billing history error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Start trial
router.post('/start-trial', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const subscription = await subscriptionService.startTrial(userId);

    return res.status(200).json({
      success: true,
      message: 'Trial started successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Start trial error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel trial
router.post('/cancel-trial', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const subscription = await subscriptionService.cancelTrial(userId);

    return res.status(200).json({
      success: true,
      message: 'Trial cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Cancel trial error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get referral code
router.get('/referral-code', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (!subscription.referralCode) {
      subscription.generateReferralCode();
      await subscription.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        referralCode: subscription.referralCode,
        referralCount: subscription.referralCount,
        referralCredits: subscription.referralCredits
      }
    });
  } catch (error) {
    console.error('Get referral code error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
