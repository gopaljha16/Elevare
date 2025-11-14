const { Subscription, Payment, User } = require('../models');
const { getPlanAmount } = require('../config/razorpay');
const razorpayService = require('./razorpayService');

/**
 * Subscription Management Service
 * Handles subscription lifecycle operations
 */

class SubscriptionService {
  /**
   * Activate subscription after successful payment
   */
  async activateSubscription(paymentId) {
    try {
      const payment = await Payment.findById(paymentId).populate('subscriptionId');
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'captured') {
        throw new Error('Payment not captured');
      }

      const subscription = await Subscription.findById(payment.subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Calculate expiry date
      const startDate = new Date();
      let expiryDate = new Date();
      
      if (payment.billingCycle === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Update subscription
      await subscription.upgradePlan(payment.plan, payment.billingCycle, payment.amount);
      subscription.status = 'active';
      subscription.startDate = startDate;
      subscription.expiryDate = expiryDate;
      subscription.nextBillingDate = expiryDate;
      subscription.lastPaymentDate = new Date();
      subscription.lastPaymentAmount = payment.amount;
      
      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId, reason) {
    try {
      const subscription = await Subscription.findOne({ userId, status: 'active' });
      
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      await subscription.cancelSubscription(reason);
      
      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(userId, newPlan, billingCycle) {
    try {
      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const amount = getPlanAmount(newPlan, billingCycle);
      
      // Calculate prorated amount if upgrading mid-cycle
      let finalAmount = amount;
      if (subscription.status === 'active' && subscription.expiryDate) {
        const now = new Date();
        const daysRemaining = Math.ceil((subscription.expiryDate - now) / (1000 * 60 * 60 * 24));
        const totalDays = billingCycle === 'monthly' ? 30 : 365;
        
        finalAmount = razorpayService.calculateProratedAmount({
          currentPlan: subscription.plan,
          newPlan,
          currentBillingCycle: subscription.billingCycle,
          newBillingCycle: billingCycle,
          daysRemaining,
          totalDays
        });
      }

      return { subscription, amount: finalAmount };
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  /**
   * Check subscriptions expiring soon
   */
  async checkExpiringSubscriptions(days = 7) {
    try {
      const subscriptions = await Subscription.findExpiringSoon(days);
      return subscriptions;
    } catch (error) {
      console.error('Error checking expiring subscriptions:', error);
      throw error;
    }
  }

  /**
   * Process expired subscriptions
   */
  async processExpiredSubscriptions() {
    try {
      const expired = await Subscription.findExpired();
      
      for (const subscription of expired) {
        subscription.status = 'expired';
        await subscription.save();
      }

      return expired.length;
    } catch (error) {
      console.error('Error processing expired subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get user subscription details
   */
  async getUserSubscription(userId) {
    try {
      const subscription = await Subscription.findOne({ userId });
      return subscription;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
  }

  /**
   * Start trial subscription
   */
  async startTrial(userId) {
    try {
      const subscription = await Subscription.findOne({ userId });
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.trialUsed) {
        throw new Error('Trial already used');
      }

      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      subscription.isTrial = true;
      subscription.trialStartDate = trialStartDate;
      subscription.trialEndDate = trialEndDate;
      subscription.trialUsed = true;
      subscription.status = 'trial';
      subscription.plan = 'pro';
      subscription.aiCredits.total = 100;
      subscription.aiCredits.remaining = 100;
      
      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }

  /**
   * Cancel trial
   */
  async cancelTrial(userId) {
    try {
      const subscription = await Subscription.findOne({ userId, status: 'trial' });
      
      if (!subscription) {
        throw new Error('No active trial found');
      }

      subscription.status = 'active';
      subscription.plan = 'free';
      subscription.isTrial = false;
      subscription.aiCredits.total = 5;
      subscription.aiCredits.remaining = 5;
      
      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Error cancelling trial:', error);
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
