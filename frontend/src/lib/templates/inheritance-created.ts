import { EmailTemplateData } from './email-types';
import {
  getBaseEmailStyles,
  getEmailFooter,
  getSecurityNotice,
  generateActionButton,
} from './email-base';

export const generateInheritanceCreatedEmail = (
  data: EmailTemplateData,
): string => {
  const styles = getBaseEmailStyles();
  const footer = getEmailFooter();
  const securityNotice = getSecurityNotice();
  const actionButton = generateActionButton(
    data.action_url ?? '',
    'success',
    'View My Wills',
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
        <div class="header success">
          <h1><span class="emoji">✅</span> ${data.subject}</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${data.to_name},</h2>
          
          <div class="notification-box success">
            <h3><span class="emoji">🎉</span> Your inheritance will has been created successfully!</h3>
            <p>${data.message}</p>
            
            <div class="details">
              <h4>📋 Will Details:</h4>
              <p><strong>Will ID:</strong> ${data.will_id}</p>
              ${
                data.beneficiary_name
                  ? `<p><strong>Beneficiary:</strong> ${data.beneficiary_name}</p>`
                  : ''
              }
              ${
                data.beneficiary_address
                  ? `<p><strong>Address:</strong> ${data.beneficiary_address}</p>`
                  : ''
              }
              ${
                data.percentage
                  ? `<p><strong>Inheritance:</strong> ${data.percentage}% of your assets</p>`
                  : ''
              }
            </div>
            
            <p><strong>✉️ Both you and your beneficiary have been notified by email.</strong></p>
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
