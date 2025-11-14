/**
 * Email Notification Service
 * Handles all subscription-related emails
 */

class EmailService {
  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(user, payment, invoice) {
    try {
      console.log(`Sending payment confirmation to ${user.email}`);
      
      // Email template
      const subject = 'Payment Confirmation - JobSphere';
      const html = this.getPaymentConfirmationTemplate(user, payment, invoice);

      // Send email (implement with your email service)
      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  }

  /**
   * Send subscription activation email
   */
  async sendSubscriptionActivation(user, subscription) {
    try {
      console.log(`Sending subscription activation to ${user.email}`);
      
      const subject = `Welcome to ${subscription.plan.toUpperCase()} Plan - JobSphere`;
      const html = this.getSubscriptionActivationTemplate(user, subscription);

      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending subscription activation:', error);
      throw error;
    }
  }

  /**
   * Send renewal reminder email
   */
  async sendRenewalReminder(user, subscription, daysRemaining) {
    try {
      console.log(`Sending renewal reminder to ${user.email} (${daysRemaining} days)`);
      
      const subject = `Subscription Renewal Reminder - ${daysRemaining} days left`;
      const html = this.getRenewalReminderTemplate(user, subscription, daysRemaining);

      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending renewal reminder:', error);
      throw error;
    }
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailure(user, payment) {
    try {
      console.log(`Sending payment failure notification to ${user.email}`);
      
      const subject = 'Payment Failed - Action Required';
      const html = this.getPaymentFailureTemplate(user, payment);

      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending payment failure:', error);
      throw error;
    }
  }

  /**
   * Send subscription cancellation email
   */
  async sendCancellationConfirmation(user, subscription) {
    try {
      console.log(`Sending cancellation confirmation to ${user.email}`);
      
      const subject = 'Subscription Cancelled - JobSphere';
      const html = this.getCancellationTemplate(user, subscription);

      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending cancellation confirmation:', error);
      throw error;
    }
  }

  /**
   * Send credits usage warning
   */
  async sendCreditsWarning(user, subscription) {
    try {
      console.log(`Sending credits warning to ${user.email}`);
      
      const subject = 'AI Credits Running Low - JobSphere';
      const html = this.getCreditsWarningTemplate(user, subscription);

      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending credits warning:', error);
      throw error;
    }
  }

  /**
   * Send trial reminder
   */
  async sendTrialReminder(user, subscription, daysRemaining) {
    try {
      console.log(`Sending trial reminder to ${user.email} (${daysRemaining} days)`);
      
      const subject = `Trial Ending Soon - ${daysRemaining} days left`;
      const html = this.getTrialReminderTemplate(user, subscription, daysRemaining);

      await this.sendEmail(user.email, subject, html);

      return { success: true };
    } catch (error) {
      console.error('Error sending trial reminder:', error);
      throw error;
    }
  }

  /**
   * Send email (implement with your email service)
   */
  async sendEmail(to, subject, html) {
    // TODO: Implement with SendGrid, AWS SES, or other email service
    console.log(`Email would be sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    
    // For now, just log
    return { success: true };
  }

  /**
   * Email Templates
   */

  getPaymentConfirmationTemplate(user, payment, invoice) {
    return `
      <h2>Payment Confirmation</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>Thank you for your payment! Your transaction has been completed successfully.</p>
      <h3>Payment Details:</h3>
      <ul>
        <li>Amount: ₹${(payment.amount / 100).toFixed(2)}</li>
        <li>Plan: ${payment.plan.toUpperCase()}</li>
        <li>Billing Cycle: ${payment.billingCycle}</li>
        <li>Invoice Number: ${invoice?.invoiceNumber || 'N/A'}</li>
      </ul>
      <p>Your subscription is now active!</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }

  getSubscriptionActivationTemplate(user, subscription) {
    return `
      <h2>Welcome to ${subscription.plan.toUpperCase()} Plan!</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>Your subscription has been activated successfully.</p>
      <h3>Plan Details:</h3>
      <ul>
        <li>Plan: ${subscription.plan.toUpperCase()}</li>
        <li>AI Credits: ${subscription.aiCredits.total}</li>
        <li>Expiry Date: ${subscription.expiryDate?.toLocaleDateString() || 'N/A'}</li>
      </ul>
      <p>Start exploring all the premium features now!</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }

  getRenewalReminderTemplate(user, subscription, daysRemaining) {
    return `
      <h2>Subscription Renewal Reminder</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>Your subscription will expire in ${daysRemaining} days.</p>
      <p>Plan: ${subscription.plan.toUpperCase()}</p>
      <p>Expiry Date: ${subscription.expiryDate?.toLocaleDateString()}</p>
      <p>Your subscription will automatically renew if auto-renewal is enabled.</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }

  getPaymentFailureTemplate(user, payment) {
    return `
      <h2>Payment Failed</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>We were unable to process your payment.</p>
      <p>Amount: ₹${(payment.amount / 100).toFixed(2)}</p>
      <p>Please update your payment method and try again.</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }

  getCancellationTemplate(user, subscription) {
    return `
      <h2>Subscription Cancelled</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>Your subscription has been cancelled as requested.</p>
      <p>Your access will continue until: ${subscription.expiryDate?.toLocaleDateString()}</p>
      <p>We're sorry to see you go. You can reactivate anytime!</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }

  getCreditsWarningTemplate(user, subscription) {
    return `
      <h2>AI Credits Running Low</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>You've used ${subscription.creditUsagePercentage}% of your AI credits.</p>
      <p>Remaining: ${subscription.aiCredits.remaining} / ${subscription.aiCredits.total}</p>
      <p>Consider upgrading to get more credits!</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }

  getTrialReminderTemplate(user, subscription, daysRemaining) {
    return `
      <h2>Trial Ending Soon</h2>
      <p>Hi ${user.name || user.email},</p>
      <p>Your free trial will end in ${daysRemaining} days.</p>
      <p>Upgrade now to continue enjoying premium features!</p>
      <p>Best regards,<br>JobSphere Team</p>
    `;
  }
}

module.exports = new EmailService();
