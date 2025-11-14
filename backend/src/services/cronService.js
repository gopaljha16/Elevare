const cron = require('node-cron');
const { Subscription } = require('../models');
const subscriptionService = require('./subscriptionService');
const emailService = require('./emailService');

/**
 * Cron Jobs for Subscription Management
 */

class CronService {
  /**
   * Initialize all cron jobs
   */
  init() {
    console.log('Initializing cron jobs...');

    // Check expiring subscriptions daily at 00:00 IST
    this.scheduleExpiryCheck();

    // Reset AI credits monthly on 1st at 00:00 IST
    this.scheduleCreditsReset();

    // Send renewal reminders
    this.scheduleRenewalReminders();

    // Process expired subscriptions
    this.scheduleExpiredCheck();

    console.log('Cron jobs initialized successfully');
  }

  /**
   * Check expiring subscriptions daily
   */
  scheduleExpiryCheck() {
    // Run daily at 00:00 IST (18:30 UTC)
    cron.schedule('30 18 * * *', async () => {
      try {
        console.log('Running expiry check...');
        const expiring = await subscriptionService.checkExpiringSubscriptions(7);
        console.log(`Found ${expiring.length} subscriptions expiring soon`);
      } catch (error) {
        console.error('Error in expiry check:', error);
      }
    });
  }

  /**
   * Reset AI credits monthly
   */
  scheduleCreditsReset() {
    // Run on 1st of every month at 00:00 IST (18:30 UTC on previous day)
    cron.schedule('30 18 1 * *', async () => {
      try {
        console.log('Running monthly credits reset...');
        
        const subscriptions = await Subscription.find({
          status: { $in: ['active', 'trial'] }
        });

        for (const subscription of subscriptions) {
          await subscription.resetMonthlyCredits();
        }

        console.log(`Reset credits for ${subscriptions.length} subscriptions`);
      } catch (error) {
        console.error('Error in credits reset:', error);
      }
    });
  }

  /**
   * Send renewal reminders
   */
  scheduleRenewalReminders() {
    // Run daily at 09:00 IST (03:30 UTC)
    cron.schedule('30 3 * * *', async () => {
      try {
        console.log('Sending renewal reminders...');

        // 7 days reminder
        const expiring7 = await subscriptionService.checkExpiringSubscriptions(7);
        for (const sub of expiring7) {
          const user = await sub.populate('userId');
          await emailService.sendRenewalReminder(user.userId, sub, 7);
        }

        // 3 days reminder
        const expiring3 = await subscriptionService.checkExpiringSubscriptions(3);
        for (const sub of expiring3) {
          const user = await sub.populate('userId');
          await emailService.sendRenewalReminder(user.userId, sub, 3);
        }

        // 1 day reminder
        const expiring1 = await subscriptionService.checkExpiringSubscriptions(1);
        for (const sub of expiring1) {
          const user = await sub.populate('userId');
          await emailService.sendRenewalReminder(user.userId, sub, 1);
        }

        console.log('Renewal reminders sent');
      } catch (error) {
        console.error('Error sending renewal reminders:', error);
      }
    });
  }

  /**
   * Process expired subscriptions
   */
  scheduleExpiredCheck() {
    // Run daily at 01:00 IST (19:30 UTC)
    cron.schedule('30 19 * * *', async () => {
      try {
        console.log('Processing expired subscriptions...');
        const count = await subscriptionService.processExpiredSubscriptions();
        console.log(`Processed ${count} expired subscriptions`);
      } catch (error) {
        console.error('Error processing expired subscriptions:', error);
      }
    });
  }

  /**
   * Check trial expirations
   */
  scheduleTrialCheck() {
    // Run daily at 10:00 IST (04:30 UTC)
    cron.schedule('30 4 * * *', async () => {
      try {
        console.log('Checking trial subscriptions...');
        
        const trials = await Subscription.find({
          status: 'trial',
          trialEndDate: { $lte: new Date() }
        });

        for (const trial of trials) {
          await subscriptionService.cancelTrial(trial.userId);
        }

        console.log(`Processed ${trials.length} expired trials`);
      } catch (error) {
        console.error('Error checking trials:', error);
      }
    });
  }

  /**
   * Send usage warnings
   */
  scheduleUsageWarnings() {
    // Run daily at 20:00 IST (14:30 UTC)
    cron.schedule('30 14 * * *', async () => {
      try {
        console.log('Checking usage warnings...');
        
        const subscriptions = await Subscription.find({
          status: { $in: ['active', 'trial'] },
          plan: { $ne: 'enterprise' }
        });

        for (const sub of subscriptions) {
          if (sub.creditUsagePercentage >= 80) {
            const user = await sub.populate('userId');
            await emailService.sendCreditsWarning(user.userId, sub);
          }
        }

        console.log('Usage warnings sent');
      } catch (error) {
        console.error('Error sending usage warnings:', error);
      }
    });
  }
}

module.exports = new CronService();
