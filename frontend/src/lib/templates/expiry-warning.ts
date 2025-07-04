import { EmailTemplateData } from './email-types';
import {
  getBaseEmailStyles,
  getEmailFooter,
  getSecurityNotice,
  generateActionButton,
} from './email-base';

export const generateExpiryWarningEmail = (data: EmailTemplateData): string => {
  const styles = getBaseEmailStyles();
  const footer = getEmailFooter();
  const securityNotice = getSecurityNotice();
  const isExpired = data.urgency_level === 'EXPIRED';
  const actionButton = generateActionButton(
    data.action_url ?? '',
    'warning',
    isExpired ? 'View Will' : 'Extend Will',
  );

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject}</title>
      ${styles}
    </head>
    <body>
      <div class="container">
        <div class="header warning">
          <h1><span class="emoji">${isExpired ? '🚨' : '⏰'}</span> ${
    data.subject
  }</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${data.to_name},</h2>
          
          <div class="notification-box warning ${isExpired ? 'urgent' : ''}">
            <h3><span class="emoji">${isExpired ? '🚨' : '⏰'}</span> ${
    isExpired
      ? 'Your Will Has Expired - Action Required'
      : 'Your Will Is Expiring Soon'
  }</h3>
            <p>${data.message}</p>
            
            <div class="details">
              <h4>⏳ Expiry Details:</h4>
              <p><strong>Will ID:</strong> ${data.will_id}</p>
              ${
                data.expiry_date
                  ? `<p><strong>Expiry Date:</strong> ${data.expiry_date}</p>`
                  : ''
              }
              ${
                data.time_remaining
                  ? `<p><strong>Time Remaining:</strong> ${data.time_remaining}</p>`
                  : ''
              }
              ${
                data.beneficiary_name
                  ? `
                <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                <p><strong>Beneficiary:</strong> ${data.beneficiary_name}</p>
                <p><strong>Address:</strong> ${data.beneficiary_address}</p>
                <p><strong>Inheritance:</strong> ${data.percentage}% of your assets</p>
              `
                  : ''
              }
            </div>
            
            ${
              isExpired
                ? '<p><strong>⚠️ Your will has expired and is now claimable by the beneficiary.</strong></p>'
                : '<p><strong>💡 Please take action if you need to extend or modify your will.</strong></p>'
            }
          </div>
          
          ${actionButton}
          ${securityNotice}
        </div>
        
        ${footer}
      </div>
    </body>
    </html>
  `;
};
