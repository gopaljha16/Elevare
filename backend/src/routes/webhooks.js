const express = require('express');
const router = express.Router();
const { verifyWebhookSignature } = require('../config/razorpay');
const { Payment, Subscription } = require('../models');
const subscriptionService = require('../services/subscriptionService');

/**
 * Razorpay Webhook Handler
 * Processes payment events from Razorpay with enhanced security and logging
 */

// Webhook logging helper
function logWebhook(event, status, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    status,
    ...details
  };
  console.log('WEBHOOK LOG:', JSON.stringify(logEntry));
  // In production, this should write to a dedicated webhook log file or database
}

// Signature verification middleware
const verifyWebhookSignatureMiddleware = (req, res, next) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = req.body;

    if (!webhookSignature) {
      logWebhook('signature_verification', 'failed', {
        reason: 'Missing signature header'
      });
      return res.status(400).json({
        success: false,
        message: 'Missing webhook signature'
      });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(
      webhookBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      logWebhook('signature_verification', 'failed', {
        reason: 'Invalid signature',
        headers: req.headers['x-razorpay-signature']
      });
      
      // Log security alert
      console.error('SECURITY ALERT: Invalid webhook signature', {
        ip: req.ip,
        timestamp: new Date().toISOString(),
        event: webhookBody.event
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    logWebhook('signature_verification', 'success', {
      event: webhookBody.event
    });

    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    logWebhook('signature_verification', 'error', {
      error: error.message
    });
    return res.status(500).json({
      success: false,
      message: 'Signature verification failed'
    });
  }
};

// Main webhook handler with timeout protection
router.post('/razorpay', verifyWebhookSignatureMiddleware, async (req, res) => {
  const startTime = Date.now();
  const webhookBody = req.body;
  const event = webhookBody.event;
  const webhookId = webhookBody.payload?.payment?.entity?.id || webhookBody.payload?.order?.entity?.id || 'unknown';

  try {
    logWebhook(event, 'received', {
      webhookId,
      timestamp: new Date().toISOString()
    });

    // Extract payload based on event type
    const payload = webhookBody.payload.payment?.entity || 
                   webhookBody.payload.order?.entity || 
                   webhookBody.payload.subscription?.entity;

    if (!payload) {
      logWebhook(event, 'error', {
        reason: 'Missing payload',
        webhookId
      });
      return res.status(200).json({
        success: false,
        message: 'Missing payload'
      });
    }

    // Process webhook asynchronously to ensure response within 5 seconds
    // We acknowledge receipt immediately and process in background
    setImmediate(async () => {
      try {
        await processWebhookEvent(event, payload, webhookId);
      } catch (error) {
        console.error('Background webhook processing error:', error);
        logWebhook(event, 'processing_error', {
          webhookId,
          error: error.message
        });
      }
    });

    const processingTime = Date.now() - startTime;
    
    logWebhook(event, 'acknowledged', {
      webhookId,
      processingTime: `${processingTime}ms`
    });

    // Always return 200 within 5 seconds to prevent Razorpay retries
    return res.status(200).json({
      success: true,
      message: 'Webhook received and queued for processing'
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    console.error('Webhook handler error:', error);
    logWebhook(event, 'error', {
      webhookId,
      error: error.message,
      processingTime: `${processingTime}ms`
    });

    // Still return 200 to prevent retries
    return res.status(200).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * Process webhook event (called asynchronously)
 */
async function processWebhookEvent(event, payload, webhookId) {
  try {
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload, webhookId);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload, webhookId);
        break;

      case 'payment.authorized':
        await handlePaymentAuthorized(payload, webhookId);
        break;

      case 'order.paid':
        await handleOrderPaid(payload, webhookId);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload, webhookId);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload, webhookId);
        break;

      case 'subscription.completed':
        await handleSubscriptionCompleted(payload, webhookId);
        break;

      default:
        logWebhook(event, 'unhandled', { webhookId });
        console.log(`Unhandled webhook event: ${event}`);
    }

    logWebhook(event, 'processed', { webhookId });
  } catch (error) {
    console.error(`Error processing webhook event ${event}:`, error);
    logWebhook(event, 'processing_failed', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle payment captured event
 * Implements idempotency to prevent duplicate processing
 */
async function handlePaymentCaptured(payload, webhookId) {
  try {
    const { id: paymentId, order_id: orderId, method, amount } = payload;

    logWebhook('payment.captured', 'processing', {
      webhookId,
      paymentId,
      orderId
    });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      console.error(`Payment not found for order: ${orderId}`);
      logWebhook('payment.captured', 'error', {
        webhookId,
        reason: 'Payment record not found',
        orderId
      });
      return;
    }

    // Idempotency check - prevent duplicate processing
    if (payment.status === 'captured' || payment.status === 'authorized') {
      console.log(`Payment already processed: ${paymentId}, status: ${payment.status}`);
      logWebhook('payment.captured', 'duplicate', {
        webhookId,
        paymentId,
        currentStatus: payment.status
      });
      return;
    }

    // Validate amount matches expected amount
    if (payment.amount !== amount) {
      console.error('SECURITY ALERT: Payment amount mismatch in webhook', {
        expectedAmount: payment.amount,
        receivedAmount: amount,
        orderId,
        paymentId
      });
      logWebhook('payment.captured', 'amount_mismatch', {
        webhookId,
        expectedAmount: payment.amount,
        receivedAmount: amount
      });
      return;
    }

    // Update payment status
    payment.status = 'captured';
    payment.razorpayPaymentId = paymentId;
    payment.paymentMethod = method || 'unknown';
    payment.capturedAt = new Date();
    payment.metadata.webhookReceived = true;
    payment.metadata.webhookReceivedAt = new Date();
    await payment.save();

    // Activate subscription
    try {
      await subscriptionService.activateSubscription(payment._id);
      logWebhook('payment.captured', 'subscription_activated', {
        webhookId,
        paymentId,
        subscriptionId: payment.subscriptionId
      });
    } catch (activationError) {
      console.error('Subscription activation failed:', activationError);
      logWebhook('payment.captured', 'activation_failed', {
        webhookId,
        paymentId,
        error: activationError.message
      });
      throw activationError;
    }

    console.log(`Payment captured and subscription activated: ${paymentId}`);
    logWebhook('payment.captured', 'success', {
      webhookId,
      paymentId,
      orderId
    });
  } catch (error) {
    console.error('Error handling payment captured:', error);
    logWebhook('payment.captured', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(payload, webhookId) {
  try {
    const { 
      id: paymentId, 
      order_id: orderId, 
      error_code, 
      error_description,
      error_source,
      error_step,
      error_reason
    } = payload;

    logWebhook('payment.failed', 'processing', {
      webhookId,
      paymentId,
      orderId,
      errorCode: error_code
    });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      console.error(`Payment not found for order: ${orderId}`);
      logWebhook('payment.failed', 'error', {
        webhookId,
        reason: 'Payment record not found',
        orderId
      });
      return;
    }

    // Idempotency check
    if (payment.status === 'failed') {
      console.log(`Payment already marked as failed: ${paymentId}`);
      logWebhook('payment.failed', 'duplicate', {
        webhookId,
        paymentId
      });
      return;
    }

    // Update payment status with detailed error information
    await payment.markAsFailed({
      code: error_code,
      description: error_description,
      source: error_source || 'razorpay',
      step: error_step || 'payment',
      reason: error_reason || 'Payment failed'
    });

    console.log(`Payment failed: ${paymentId}, reason: ${error_description}`);
    logWebhook('payment.failed', 'success', {
      webhookId,
      paymentId,
      errorCode: error_code
    });

    // TODO: Send payment failure notification email to user
  } catch (error) {
    console.error('Error handling payment failed:', error);
    logWebhook('payment.failed', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle payment authorized event
 */
async function handlePaymentAuthorized(payload, webhookId) {
  try {
    const { id: paymentId, order_id: orderId, method, amount } = payload;

    logWebhook('payment.authorized', 'processing', {
      webhookId,
      paymentId,
      orderId
    });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      console.error(`Payment not found for order: ${orderId}`);
      logWebhook('payment.authorized', 'error', {
        webhookId,
        reason: 'Payment record not found',
        orderId
      });
      return;
    }

    // Idempotency check
    if (payment.status === 'authorized' || payment.status === 'captured') {
      console.log(`Payment already processed: ${paymentId}, status: ${payment.status}`);
      logWebhook('payment.authorized', 'duplicate', {
        webhookId,
        paymentId,
        currentStatus: payment.status
      });
      return;
    }

    // Validate amount
    if (payment.amount !== amount) {
      console.error('SECURITY ALERT: Payment amount mismatch in webhook', {
        expectedAmount: payment.amount,
        receivedAmount: amount,
        orderId,
        paymentId
      });
      logWebhook('payment.authorized', 'amount_mismatch', {
        webhookId,
        expectedAmount: payment.amount,
        receivedAmount: amount
      });
      return;
    }

    payment.status = 'authorized';
    payment.razorpayPaymentId = paymentId;
    payment.paymentMethod = method || 'unknown';
    payment.metadata.webhookReceived = true;
    payment.metadata.webhookReceivedAt = new Date();
    await payment.save();

    console.log(`Payment authorized: ${paymentId}`);
    logWebhook('payment.authorized', 'success', {
      webhookId,
      paymentId,
      orderId
    });
  } catch (error) {
    console.error('Error handling payment authorized:', error);
    logWebhook('payment.authorized', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle order paid event
 */
async function handleOrderPaid(payload, webhookId) {
  try {
    const { id: orderId, amount_paid, amount } = payload;

    logWebhook('order.paid', 'processing', {
      webhookId,
      orderId
    });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });

    if (!payment) {
      console.error(`Payment not found for order: ${orderId}`);
      logWebhook('order.paid', 'error', {
        webhookId,
        reason: 'Payment record not found',
        orderId
      });
      return;
    }

    // Validate amount
    if (amount_paid !== amount) {
      console.error('Order amount mismatch', {
        expectedAmount: amount,
        paidAmount: amount_paid,
        orderId
      });
      logWebhook('order.paid', 'amount_mismatch', {
        webhookId,
        expectedAmount: amount,
        paidAmount: amount_paid
      });
    }

    console.log(`Order paid: ${orderId}, amount: ${amount_paid}`);
    logWebhook('order.paid', 'success', {
      webhookId,
      orderId,
      amount: amount_paid
    });
  } catch (error) {
    console.error('Error handling order paid:', error);
    logWebhook('order.paid', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle subscription charged event (for recurring payments)
 */
async function handleSubscriptionCharged(payload, webhookId) {
  try {
    const { id: subscriptionId, payment_id: paymentId, status } = payload;

    logWebhook('subscription.charged', 'processing', {
      webhookId,
      subscriptionId,
      paymentId
    });

    // Find subscription by Razorpay subscription ID
    const subscription = await Subscription.findOne({ razorpaySubscriptionId: subscriptionId });

    if (!subscription) {
      console.error(`Subscription not found: ${subscriptionId}`);
      logWebhook('subscription.charged', 'error', {
        webhookId,
        reason: 'Subscription not found',
        subscriptionId
      });
      return;
    }

    if (status === 'active') {
      // Update subscription renewal date
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Add 30 days
      subscription.status = 'active';
      await subscription.save();

      console.log(`Subscription renewed: ${subscriptionId}`);
      logWebhook('subscription.charged', 'success', {
        webhookId,
        subscriptionId,
        newExpiryDate: subscription.currentPeriodEnd
      });

      // TODO: Send renewal confirmation email
    }
  } catch (error) {
    console.error('Error handling subscription charged:', error);
    logWebhook('subscription.charged', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle subscription cancelled event
 */
async function handleSubscriptionCancelled(payload, webhookId) {
  try {
    const { id: subscriptionId } = payload;

    logWebhook('subscription.cancelled', 'processing', {
      webhookId,
      subscriptionId
    });

    const subscription = await Subscription.findOne({ razorpaySubscriptionId: subscriptionId });

    if (!subscription) {
      console.error(`Subscription not found: ${subscriptionId}`);
      logWebhook('subscription.cancelled', 'error', {
        webhookId,
        reason: 'Subscription not found',
        subscriptionId
      });
      return;
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    console.log(`Subscription cancelled: ${subscriptionId}`);
    logWebhook('subscription.cancelled', 'success', {
      webhookId,
      subscriptionId
    });

    // TODO: Send cancellation confirmation email
  } catch (error) {
    console.error('Error handling subscription cancelled:', error);
    logWebhook('subscription.cancelled', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Handle subscription completed event
 */
async function handleSubscriptionCompleted(payload, webhookId) {
  try {
    const { id: subscriptionId } = payload;

    logWebhook('subscription.completed', 'processing', {
      webhookId,
      subscriptionId
    });

    const subscription = await Subscription.findOne({ razorpaySubscriptionId: subscriptionId });

    if (!subscription) {
      console.error(`Subscription not found: ${subscriptionId}`);
      logWebhook('subscription.completed', 'error', {
        webhookId,
        reason: 'Subscription not found',
        subscriptionId
      });
      return;
    }

    subscription.status = 'expired';
    await subscription.save();

    console.log(`Subscription completed: ${subscriptionId}`);
    logWebhook('subscription.completed', 'success', {
      webhookId,
      subscriptionId
    });
  } catch (error) {
    console.error('Error handling subscription completed:', error);
    logWebhook('subscription.completed', 'error', {
      webhookId,
      error: error.message
    });
    throw error;
  }
}

module.exports = router;
