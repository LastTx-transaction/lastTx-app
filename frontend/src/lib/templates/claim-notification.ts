import { EmailTemplateData } from './email-types';
import {
  getBaseEmailStyles,
  getEmailFooter,
  getSecurityNotice,
  generateActionButton,
} from './email-base';

export const generateClaimNotificationEmail = (
  data: EmailTemplateData,
): string => {
  const styles = getBaseEmailStyles();
  const footer = getEmailFooter();
  const securityNotice = getSecurityNotice();
  const actionButton = generateActionButton(
    data.action_url ?? '',
    '',
    'Claim Now',
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
        <div class="header info">
          <h1><span class="emoji">💰</span> ${data.subject}</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${data.to_name},</h2>
          
          <div class="notification-box info">
            <h3><span class="emoji">💰</span> Great news! Your inheritance is ready to claim</h3>
            <p>${data.message}</p>
            
            <div class="details">
              <h4>💎 Claim Details:</h4>
              <p><strong>Will ID:</strong> ${data.will_id}</p>
              ${
                data.amount
                  ? `<p><strong>Amount Available:</strong> ${data.amount} FLOW</p>`
                  : ''
              }
              ${
                data.percentage
                  ? `<p><strong>Your Share:</strong> ${data.percentage}%</p>`
                  : ''
              }
            </div>
            
            <p><strong>🔗 Click the button below to claim your inheritance.</strong></p>
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
