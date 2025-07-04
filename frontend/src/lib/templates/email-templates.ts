// Main email templates controller
import { EmailTemplateData } from './email-types';
import { generateInheritanceCreatedEmail } from './inheritance-created';
import { generateClaimNotificationEmail } from './claim-notification';
import { generateExpiryWarningEmail } from './expiry-warning';
import { generateTestEmail } from './test-email';

export type { EmailTemplateData } from './email-types';

export class EmailTemplates {
  /**
   * Generate dynamic HTML template based on notification type
   */
  static generateEmailHTML(data: EmailTemplateData): string {
    switch (data.notification_type) {
      case 'INHERITANCE_CREATED':
        return generateInheritanceCreatedEmail(data);
      case 'CLAIM_NOTIFICATION':
        return generateClaimNotificationEmail(data);
      case 'EXPIRY_WARNING':
        return generateExpiryWarningEmail(data);
      case 'TEST':
        return generateTestEmail(data);
      default:
        return generateTestEmail(data);
    }
  }
}
