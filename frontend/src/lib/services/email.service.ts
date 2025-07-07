import emailjs from '@emailjs/browser';
import {
  EmailTemplates,
  EmailTemplateData,
} from '../templates/email-templates';

export interface InheritanceEmailData {
  ownerEmail: string;
  ownerName: string;
  beneficiaryEmail: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  percentage: number;
  willId: string;
  claimUrl: string;
  message?: string;
}

export interface EmailData {
  beneficiaryEmail: string;
  beneficiaryName: string;
  ownerAddress: string;
  percentage: number;
  willId: string;
  amount?: string;
  claimUrl?: string;
}

export interface ExpiryEmailData {
  ownerEmail: string;
  ownerName: string;
  willId: string;
  expiryDate: string;
  timeRemaining: string;
  beneficiaryName: string;
  beneficiaryAddress: string;
  percentage: number;
  urgencyLevel: 'EXPIRING_SOON' | 'EXPIRED';
}

export class EmailService {
  private readonly serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  private readonly publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

  // Initialize EmailJS (call this once in your app)
  init() {
    if (typeof window !== 'undefined' && this.publicKey) {
      emailjs.init(this.publicKey);
    }
  }

  /**
   * Send notification email using custom HTML template
   */
  async sendGeneralNotification(data: {
    to_email: string;
    to_name: string;
    subject: string;
    notification_type:
      | 'INHERITANCE_CREATED'
      | 'CLAIM_NOTIFICATION'
      | 'EXPIRY_WARNING'
      | 'TEST';
    will_id: string;
    message: string;
    action_url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }): Promise<boolean> {
    try {
      // Generate custom HTML template
      const templateData: EmailTemplateData = {
        to_name: data.to_name,
        subject: data.subject,
        notification_type: data.notification_type,
        will_id: data.will_id,
        message: data.message,
        action_url:
          data.action_url ?? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/my-wills`,
        beneficiary_name: data.beneficiary_name,
        beneficiary_address: data.beneficiary_address,
        percentage: data.percentage,
        amount: data.amount,
        expiry_date: data.expiry_date,
        time_remaining: data.time_remaining,
        urgency_level: data.urgency_level,
      };

      const htmlContent = EmailTemplates.generateEmailHTML(templateData);

      const templateParams = {
        email: data.to_email,
        html_content: htmlContent,
      };

      console.log('Sending custom HTML email...', {
        to: data.to_email,
        subject: data.subject,
        type: data.notification_type,
      });

      const result = await emailjs.send(
        this.serviceId,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERAL!,
        templateParams,
      );

      console.log('✅ Custom HTML email sent successfully:', result.text);
      return true;
    } catch (error) {
      console.error('❌ Failed to send custom HTML email:', error);
      return false;
    }
  }

  /**
   * Send claim notification to beneficiary when inheritance is claimed
   */
  async sendClaimNotification(data: EmailData): Promise<boolean> {
    return this.sendGeneralNotification({
      to_email: data.beneficiaryEmail,
      to_name: data.beneficiaryName,
      subject: '✅ Inheritance Successfully Claimed',
      notification_type: 'CLAIM_NOTIFICATION',
      will_id: data.willId,
      message: `Your inheritance of ${
        data.amount ?? '0'
      } FLOW has been successfully claimed from will ${
        data.willId
      }. The funds have been transferred to your wallet.`,
      action_url:
        data.claimUrl ?? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/claim-will`,
      amount: data.amount ?? '0',
      percentage: data.percentage,
    });
  }

  /**
   * Send expiry notification to beneficiary when will expires
   */
  async sendExpiryNotification(data: EmailData): Promise<boolean> {
    return this.sendGeneralNotification({
      to_email: data.beneficiaryEmail,
      to_name: data.beneficiaryName,
      subject: '⏰ Inheritance Available for Claim',
      notification_type: 'CLAIM_NOTIFICATION',
      will_id: data.willId,
      message: `Your inheritance from will ${data.willId} is now available for claim! Don't delay - claim your inheritance now.`,
      action_url:
        data.claimUrl ?? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/claim-will`,
      percentage: data.percentage,
    });
  }

  /**
   * Send expiry warning notification to will owner when inheritance is about to expire
   */
  async sendExpiryWarningNotification(data: ExpiryEmailData): Promise<boolean> {
    const subject =
      data.urgencyLevel === 'EXPIRED'
        ? '🚨 Your Inheritance Will Has Expired - Action Required'
        : '⏰ Your Inheritance Will Is Expiring Soon';

    const message =
      data.urgencyLevel === 'EXPIRED'
        ? `Your inheritance will ${data.willId} has expired! Beneficiary ${data.beneficiaryName} can now claim ${data.percentage}% of your assets. Please be aware of this change.`
        : `Your inheritance will ${data.willId} is expiring in ${data.timeRemaining}. After expiry on ${data.expiryDate}, beneficiary ${data.beneficiaryName} will be able to claim ${data.percentage}% of your assets.`;

    return this.sendGeneralNotification({
      to_email: data.ownerEmail,
      to_name: data.ownerName,
      subject: subject,
      notification_type: 'EXPIRY_WARNING',
      will_id: data.willId,
      message: message,
      action_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/my-wills`,
      expiry_date: data.expiryDate,
      time_remaining: data.timeRemaining,
      beneficiary_name: data.beneficiaryName,
      beneficiary_address: data.beneficiaryAddress,
      percentage: data.percentage,
      urgency_level: data.urgencyLevel,
    });
  }

  /**
   * Send inheritance notification to will owner when will is created
   */
  async sendInheritanceNotification(
    data: InheritanceEmailData,
  ): Promise<boolean> {
    return this.sendGeneralNotification({
      to_email: data.ownerEmail,
      to_name: data.ownerName,
      subject: '✅ Will Created Successfully',
      notification_type: 'INHERITANCE_CREATED',
      will_id: data.willId,
      message:
        data.message ??
        `Your inheritance will has been successfully created. ${data.beneficiaryName} (${data.beneficiaryAddress}) will inherit ${data.percentage}% of your assets after the specified inactivity period. Both you and the beneficiary have been notified.`,
      action_url: data.claimUrl,
      beneficiary_email: data.beneficiaryEmail,
      beneficiary_name: data.beneficiaryName,
      beneficiary_address: data.beneficiaryAddress,
      percentage: data.percentage,
    });
  }

  /**
   * Test email functionality
   */
  async sendTestEmail(testEmail: string): Promise<boolean> {
    return this.sendGeneralNotification({
      to_email: testEmail,
      to_name: 'Test User',
      subject: '🧪 LastTx Email Test',
      notification_type: 'TEST',
      will_id: 'test-will-123',
      message:
        'This is a test email from LastTx inheritance system. If you received this, email service is working correctly!',
      action_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/my-wills`,
    });
  }

  /**
   * Validate email service configuration
   */
  isConfigured(): boolean {
    return !!(
      this.serviceId &&
      this.publicKey &&
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERAL
    );
  }

  /**
   * Get configuration status for debugging
   */
  getConfigStatus() {
    return {
      serviceId: !!this.serviceId,
      publicKey: !!this.publicKey,
      templateInheritance:
        !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_INHERITANCE,
      templateClaim: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_CLAIM,
      templateExpiry: !!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_EXPIRY,
      frontendUrl: !!process.env.NEXT_PUBLIC_FRONTEND_URL,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
