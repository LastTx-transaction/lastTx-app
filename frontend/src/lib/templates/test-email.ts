import { EmailTemplateData } from './email-types';
import {
  getBaseEmailStyles,
  getEmailFooter,
  getSecurityNotice,
  generateActionButton,
} from './email-base';

export const generateTestEmail = (data: EmailTemplateData): string => {
  const styles = getBaseEmailStyles();
  const footer = getEmailFooter();
  const securityNotice = getSecurityNotice();
  const actionButton = generateActionButton(
    data.action_url ?? '',
    'info',
    'Visit Dashboard',
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
          <h1><span class="emoji">🧪</span> ${data.subject}</h1>
        </div>
        
        <div class="content">
          <h2>Hi ${data.to_name},</h2>
          
          <div class="notification-box info">
            <h3><span class="emoji">🧪</span> Test Email from LastTx</h3>
            <p>${data.message}</p>
            
            <div class="details">
              <h4>📋 Test Details:</h4>
              <p><strong>Type:</strong> ${data.notification_type}</p>
              <p><strong>Will ID:</strong> ${data.will_id}</p>
            </div>
            
            <p><strong>✅ If you received this email, the email service is working correctly!</strong></p>
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
