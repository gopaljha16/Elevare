const { 
  getRazorpayInstance, 
  verifyPaymentSignature,
  getPlanAmount,
  RAZORPAY_CONFIG 
} = require('../config/razorpay');
const { Subscription, Payment, Invoice } = require('../models');

/**
 * Razorpay Service
 * Handles all Razorpay payment operations
 */

class RazorpayService {
  constructor() {
    this.razorpay = null;
    this.initializeRazorpay();
  }

  initializeRazorpay() {
    try {
      this.razorpay = getRazorpayInstance();
      if (this.razorpay) {
        console.log('✅ RazorpayService: Razorpay instance initialized');
      } else {
        console.warn('⚠️ RazorpayService: Razorpay not configured - payment features disabled');
      }
    } catch (error) {
      console.error('❌ RazorpayService: Failed to initialize Razorpay:', error.message);
      this.razorpay = null;
    }
  }

  /**
   * Create a Razorpay order for subscription payment
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      // Try to initialize if not already done
      if (!this.razorpay) {
        this.initializeRazorpay();
      }

      if (!this.razorpay) {
        console.error('Razorpay not configured. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
        throw new Error('Payment service is not configured. Please contact support.');
      }

      const { userId, plan, billingCycle, subscriptionId, discountCode } = orderData;

      // Validate plan and billing cycle
      if (!plan || !billingCycle) {
        throw new Error('Plan and billing cycle are required');
      }

      if (!['pro', 'enterprise'].includes(plan)) {
        throw new Error('Cannot create order for free plan');
      }

      if (!['monthly', 'annual'].includes(billingCycle)) {
        throw new Error('Invalid billing cycle. Must be monthly or annual');
      }

      // Calculate base amount
      const baseAmount = getPlanAmount(plan, billingCycle);

      if (baseAmount === 0) {
        throw new Error('Cannot create order for free plan');
      }

      // Calculate discount for annual billing (20% discount already in config)
      let discountAmount = 0;
      let discountPercentage = 0;
      let finalAmount = baseAmount;

      if (billingCycle === 'annual') {
        // Calculate what the monthly equivalent would be
        const monthlyAmount = getPlanAmount(plan, 'monthly');
        const annualWithoutDiscount = monthlyAmount * 12;
        discountAmount = annualWithoutDiscount - baseAmount;
        discountPercentage = 20;
        finalAmount = baseAmount;
      }

      // Apply additional discount code if provided
      if (discountCode) {
        const discountResult = this.applyDiscount({
          amount: finalAmount,
          discountCode,
          billingCycle
        });
        
        // Only apply additional discount if it's better than annual discount
        if (discountResult.discountAmount > discountAmount) {
          discountAmount = discountResult.discountAmount;
          discountPercentage = discountResult.discountPercentage;
          finalAmount = discountResult.finalAmount;
        }
      }

      // Generate unique order ID with proper formatting
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderReceipt = `ORD-${plan.toUpperCase()}-${billingCycle.toUpperCase()}-${timestamp}-${randomSuffix}`;

      // Create order options
      const options = {
        amount: finalAmount, // Amount in paise
        currency: RAZORPAY_CONFIG.currency,
        receipt: orderReceipt,
        notes: {
          userId: userId.toString(),
          plan: plan,
          billingCycle: billingCycle,
          subscriptionId: subscriptionId?.toString() || '',
          baseAmount: baseAmount.toString(),
          discountAmount: discountAmount.toString(),
          discountPercentage: discountPercentage.toString(),
          discountCode: discountCode || ''
        }
      };

      // Create order in Razorpay
      const order = await this.razorpay.orders.create(options);

      // Create payment record in database
      const payment = await Payment.create({
        userId,
        subscriptionId,
        razorpayOrderId: order.id,
        amount: finalAmount,
        currency: RAZORPAY_CONFIG.currency,
        status: 'created',
        plan,
        billingCycle,
        discountApplied: discountAmount > 0,
        discountAmount: discountAmount,
        discountCode: discountCode || (billingCycle === 'annual' ? 'ANNUAL20' : ''),
        metadata: {
          ipAddress: orderData.ipAddress,
          userAgent: orderData.userAgent,
          baseAmount: baseAmount,
          orderReceipt: orderReceipt
        }
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id,
        key: process.env.RAZORPAY_KEY_ID,
        receipt: orderReceipt,
        planDetails: {
          plan,
          billingCycle,
          baseAmount,
          discountAmount,
          discountPercentage,
          finalAmount
        }
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature and capture payment
   * @param {Object} paymentData - Payment verification data
   * @returns {Promise<Object>} Verification result
   */
  async verifyPayment(paymentData) {
    try {
      const { 
        razorpayOrderId, 
        razorpayPaymentId, 
        razorpaySignature 
      } = paymentData;

      // Step 1: Validate input parameters
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new Error('Missing required payment verification parameters');
      }

      // Step 2: Find payment record in database
      const payment = await Payment.findOne({ razorpayOrderId });

      if (!payment) {
        throw new Error('Payment record not found for the given order ID');
      }

      // Step 3: Idempotency check - prevent duplicate processing
      if (payment.status === 'captured' || payment.status === 'authorized') {
        console.log(`Payment already processed: ${razorpayOrderId}`);
        return {
          success: true,
          payment,
          message: 'Payment already processed',
          isDuplicate: true
        };
      }

      // Step 4: Verify Razorpay signature using HMAC SHA256
      const isSignatureValid = verifyPaymentSignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isSignatureValid) {
        // Log security alert for failed signature verification
        console.error('SECURITY ALERT: Invalid payment signature', {
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          timestamp: new Date().toISOString()
        });

        // Mark payment as failed
        await payment.markAsFailed({
          code: 'SIGNATURE_VERIFICATION_FAILED',
          description: 'Payment signature verification failed',
          source: 'razorpay',
          step: 'verification',
          reason: 'Invalid signature'
        });

        throw new Error('Payment signature verification failed. This payment may be fraudulent.');
      }

      // Step 5: Fetch payment details from Razorpay to validate amount
      let razorpayPayment;
      try {
        razorpayPayment = await this.razorpay.payments.fetch(razorpayPaymentId);
      } catch (fetchError) {
        console.error('Error fetching payment from Razorpay:', fetchError);
        throw new Error('Failed to fetch payment details from Razorpay');
      }

      // Step 6: Validate payment amount matches expected amount
      const expectedAmount = payment.amount;
      const actualAmount = razorpayPayment.amount;

      if (actualAmount !== expectedAmount) {
        console.error('SECURITY ALERT: Payment amount mismatch', {
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          expectedAmount,
          actualAmount,
          timestamp: new Date().toISOString()
        });

        await payment.markAsFailed({
          code: 'AMOUNT_MISMATCH',
          description: `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`,
          source: 'razorpay',
          step: 'validation',
          reason: 'Amount validation failed'
        });

        throw new Error('Payment amount does not match expected amount');
      }

      // Step 7: Validate order ID matches
      if (razorpayPayment.order_id !== razorpayOrderId) {
        console.error('SECURITY ALERT: Order ID mismatch', {
          expectedOrderId: razorpayOrderId,
          actualOrderId: razorpayPayment.order_id,
          paymentId: razorpayPaymentId,
          timestamp: new Date().toISOString()
        });

        await payment.markAsFailed({
          code: 'ORDER_ID_MISMATCH',
          description: 'Order ID mismatch in payment verification',
          source: 'razorpay',
          step: 'validation',
          reason: 'Order ID validation failed'
        });

        throw new Error('Payment order ID does not match');
      }

      // Step 8: Validate payment status from Razorpay
      if (razorpayPayment.status !== 'captured' && razorpayPayment.status !== 'authorized') {
        throw new Error(`Payment status is ${razorpayPayment.status}, expected captured or authorized`);
      }

      // Step 9: Update payment record as captured
      await payment.markAsCaptured(razorpayPaymentId, razorpaySignature);

      // Step 10: Update payment method
      payment.paymentMethod = razorpayPayment.method || 'other';
      await payment.save();

      console.log('Payment verified successfully:', {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        amount: actualAmount,
        method: razorpayPayment.method,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        payment,
        razorpayPayment,
        message: 'Payment verified and captured successfully',
        isDuplicate: false
      };
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      // Re-throw with more context
      if (error.message.includes('signature') || 
          error.message.includes('amount') || 
          error.message.includes('order ID')) {
        throw error; // These are validation errors, throw as-is
      }
      
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Validate payment data before processing
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.razorpayOrderId) {
      errors.push('Order ID is required');
    }

    if (!paymentData.razorpayPaymentId) {
      errors.push('Payment ID is required');
    }

    if (!paymentData.razorpaySignature) {
      errors.push('Payment signature is required');
    }

    // Validate format of IDs
    if (paymentData.razorpayOrderId && !paymentData.razorpayOrderId.startsWith('order_')) {
      errors.push('Invalid order ID format');
    }

    if (paymentData.razorpayPaymentId && !paymentData.razorpayPaymentId.startsWith('pay_')) {
      errors.push('Invalid payment ID format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if payment has already been processed (idempotency check)
   * @param {String} razorpayOrderId - Razorpay order ID
   * @returns {Promise<Object>} Idempotency check result
   */
  async checkPaymentIdempotency(razorpayOrderId) {
    try {
      const payment = await Payment.findOne({ razorpayOrderId });

      if (!payment) {
        return {
          exists: false,
          isProcessed: false,
          payment: null
        };
      }

      const isProcessed = payment.status === 'captured' || payment.status === 'authorized';

      return {
        exists: true,
        isProcessed,
        payment,
        status: payment.status
      };
    } catch (error) {
      console.error('Error checking payment idempotency:', error);
      throw new Error(`Idempotency check failed: ${error.message}`);
    }
  }

  /**
   * Verify payment amount matches expected amount
   * @param {Number} expectedAmount - Expected amount in paise
   * @param {Number} actualAmount - Actual amount from Razorpay
   * @returns {Boolean} Whether amounts match
   */
  verifyPaymentAmount(expectedAmount, actualAmount) {
    return expectedAmount === actualAmount;
  }

  /**
   * Fetch payment details from Razorpay
   * @param {String} paymentId - Razorpay payment ID
   * @returns {Promise<Object>} Payment details
   */
  async fetchPayment(paymentId) {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay is not configured');
      }

      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Fetch order details from Razorpay
   * @param {String} orderId - Razorpay order ID
   * @returns {Promise<Object>} Order details
   */
  async fetchOrder(orderId) {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay is not configured');
      }

      const order = await this.razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  /**
   * Process refund for a payment
   * @param {Object} refundData - Refund details
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(refundData) {
    try {
      if (!this.razorpay) {
        throw new Error('Razorpay is not configured');
      }

      const { paymentId, amount, reason } = refundData;

      // Find payment record
      const payment = await Payment.findOne({ razorpayPaymentId: paymentId });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.status === 'refunded') {
        throw new Error('Payment already refunded');
      }

      // Create refund in Razorpay
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount || payment.amount,
        notes: {
          reason: reason || 'Customer request'
        }
      });

      // Update payment record
      await payment.processRefund(refund.amount, reason, refund.id);

      // Update invoice if exists
      if (payment.invoiceId) {
        const invoice = await Invoice.findById(payment.invoiceId);
        if (invoice) {
          await invoice.processRefund();
        }
      }

      return {
        success: true,
        refund,
        payment
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Get all payments for a user
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of payments
   */
  async getUserPayments(userId, options = {}) {
    try {
      const payments = await Payment.findByUser(userId, options);
      return payments;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  }

  /**
   * Calculate prorated amount for plan upgrade
   * @param {Object} upgradeData - Upgrade details
   * @returns {Number} Prorated amount in paise
   */
  calculateProratedAmount(upgradeData) {
    try {
      const { 
        currentPlan, 
        newPlan, 
        currentBillingCycle, 
        newBillingCycle,
        daysRemaining,
        totalDays
      } = upgradeData;

      // Get current and new plan amounts
      const currentAmount = getPlanAmount(currentPlan, currentBillingCycle);
      const newAmount = getPlanAmount(newPlan, newBillingCycle);

      // Calculate unused amount from current plan
      const unusedAmount = (currentAmount * daysRemaining) / totalDays;

      // Calculate prorated amount (new plan - unused credit)
      const proratedAmount = Math.max(0, newAmount - unusedAmount);

      return Math.round(proratedAmount);
    } catch (error) {
      console.error('Error calculating prorated amount:', error);
      throw new Error(`Proration calculation failed: ${error.message}`);
    }
  }

  /**
   * Apply discount code to order
   * @param {Object} discountData - Discount details
   * @returns {Object} Discount result
   */
  applyDiscount(discountData) {
    try {
      const { amount, discountCode, billingCycle } = discountData;

      let discountAmount = 0;
      let discountPercentage = 0;

      // Annual billing discount (20%)
      if (billingCycle === 'annual') {
        discountPercentage = 20;
        discountAmount = Math.round(amount * 0.20);
      }

      // Custom discount codes can be added here
      // Example: LAUNCH50 for 50% off
      if (discountCode === 'LAUNCH50') {
        discountPercentage = 50;
        discountAmount = Math.round(amount * 0.50);
      }

      const finalAmount = amount - discountAmount;

      return {
        originalAmount: amount,
        discountAmount,
        discountPercentage,
        finalAmount,
        discountCode
      };
    } catch (error) {
      console.error('Error applying discount:', error);
      throw new Error(`Discount application failed: ${error.message}`);
    }
  }

  /**
   * Get payment statistics
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStats(startDate, endDate) {
    try {
      const revenue = await Payment.calculateRevenue(startDate, endDate);
      const statsByPlan = await Payment.getStatsByPlan(startDate, endDate);
      const failureAnalysis = await Payment.getFailureAnalysis(startDate, endDate);

      return {
        revenue,
        statsByPlan,
        failureAnalysis
      };
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new RazorpayService();
