const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Razorpay Configuration
 * Handles payment gateway initialization and configuration
 */

// Validate required environment variables
const validateRazorpayConfig = () => {
  const requiredVars = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing Razorpay configuration: ${missing.join(', ')}`);
    console.warn('⚠️  Payment features will be disabled');
    return false;
  }
  
  return true;
};

// Initialize Razorpay instance
let razorpayInstance = null;

const initializeRazorpay = () => {
  try {
    if (!validateRazorpayConfig()) {
      return null;
    }

    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    console.log('✅ Razorpay initialized successfully');
    return razorpayInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Razorpay:', error.message);
    return null;
  }
};

// Get Razorpay instance (lazy initialization)
const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    razorpayInstance = initializeRazorpay();
  }
  return razorpayInstance;
};

// Verify Razorpay webhook signature
const verifyWebhookSignature = (webhookBody, webhookSignature, webhookSecret) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(webhookBody))
      .digest('hex');

    return expectedSignature === webhookSignature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

// Verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Razorpay configuration constants
const RAZORPAY_CONFIG = {
  currency: 'INR',
  plans: {
    free: {
      name: 'Free Plan',
      amount: 0,
      features: ['5 AI credits/month', '2 resumes', 'Basic templates']
    },
    pro: {
      name: 'Pro Plan',
      monthly: {
        amount: 49900, // Amount in paise (₹499)
        period: 'monthly',
        interval: 1
      },
      annual: {
        amount: 499900, // Amount in paise (₹4,999) - 20% discount
        period: 'yearly',
        interval: 1
      },
      features: [
        '100 AI credits/month',
        'Unlimited resumes',
        'Premium templates',
        'Advanced analytics',
        'Email support'
      ]
    },
    enterprise: {
      name: 'Enterprise Plan',
      monthly: {
        amount: 199900, // Amount in paise (₹1,999)
        period: 'monthly',
        interval: 1
      },
      annual: {
        amount: 1999900, // Amount in paise (₹19,999) - 20% discount
        period: 'yearly',
        interval: 1
      },
      features: [
        'Unlimited AI credits',
        'All Pro features',
        'Priority support',
        'Live chat',
        'Team collaboration'
      ]
    }
  },
  // Payment method preferences
  paymentMethods: {
    card: true,
    netbanking: true,
    wallet: true,
    upi: true,
    emi: false
  },
  // Checkout options
  checkoutOptions: {
    theme: {
      color: '#EC4899' // Pink color matching your brand
    },
    modal: {
      backdropclose: false,
      escape: false,
      handleback: false
    }
  }
};

// Helper function to get plan amount
const getPlanAmount = (plan, billingCycle) => {
  if (plan === 'free') return 0;
  
  const planConfig = RAZORPAY_CONFIG.plans[plan];
  if (!planConfig) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const cycleConfig = planConfig[billingCycle];
  if (!cycleConfig) {
    throw new Error(`Invalid billing cycle: ${billingCycle}`);
  }

  return cycleConfig.amount;
};

// Helper function to format amount for display (paise to rupees)
const formatAmount = (amountInPaise) => {
  return (amountInPaise / 100).toFixed(2);
};

// Helper function to convert rupees to paise
const convertToPaise = (amountInRupees) => {
  return Math.round(amountInRupees * 100);
};

// Check if Razorpay is configured
const isRazorpayConfigured = () => {
  return validateRazorpayConfig();
};

module.exports = {
  initializeRazorpay,
  getRazorpayInstance,
  verifyWebhookSignature,
  verifyPaymentSignature,
  RAZORPAY_CONFIG,
  getPlanAmount,
  formatAmount,
  convertToPaise,
  isRazorpayConfigured
};
