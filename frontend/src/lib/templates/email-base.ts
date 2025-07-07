// Base styles untuk semua email templates
export const getBaseEmailStyles = (): string => {
  return `
    <style>
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        color: #333; 
        background: #f4f4f4; 
        margin: 0; 
        padding: 0; 
      }
      .container { 
        max-width: 600px; 
        margin: 0 auto; 
        background: white; 
        border-radius: 10px; 
        box-shadow: 0 0 20px rgba(0,0,0,0.1); 
        overflow: hidden; 
      }
      .header { 
        color: white; 
        padding: 30px 20px; 
        text-align: center; 
      }
      .header.success { 
        background: linear-gradient(135deg, #28a745, #20c997); 
      }
      .header.warning { 
        background: linear-gradient(135deg, #ffc107, #fd7e14); 
      }
      .header.info { 
        background: linear-gradient(135deg, #0066cc, #0056b3); 
      }
      .header.test { 
        background: linear-gradient(135deg, #6f42c1, #5a32a3); 
      }
      .content { 
        padding: 30px; 
      }
      .notification-box { 
        padding: 20px; 
        border-radius: 8px; 
        margin: 20px 0; 
        border-left: 4px solid; 
      }
      .notification-box.success { 
        background: #d4edda; 
        border-color: #28a745; 
      }
      .notification-box.warning { 
        background: #fff3cd; 
        border-color: #ffc107; 
      }
      .notification-box.info { 
        background: #d1ecf1; 
        border-color: #0066cc; 
      }
      .notification-box.test { 
        background: #e2e3f1; 
        border-color: #6f42c1; 
      }
      .details { 
        background: #f8f9fa; 
        padding: 20px; 
        border-radius: 8px; 
        margin: 20px 0; 
      }
      .button { 
        display: inline-block; 
        background: #0066cc; 
        color: white; 
        padding: 15px 30px; 
        text-decoration: none; 
        border-radius: 8px; 
        font-weight: bold; 
        margin: 20px 0; 
        transition: background 0.3s; 
      }
      .button:hover { 
        background: #0056b3; 
      }
      .button.warning { 
        background: #ffc107; 
        color: #000; 
      }
      .button.warning:hover { 
        background: #e0a800; 
      }
      .button.success { 
        background: #28a745; 
      }
      .button.success:hover { 
        background: #1e7e34; 
      }
      .footer { 
        background: #f8f9fa; 
        padding: 20px; 
        text-align: center; 
        color: #666; 
        font-size: 12px; 
      }
      .emoji { 
        font-size: 1.2em; 
      }
      .urgent { 
        animation: pulse 2s infinite; 
      }
      @keyframes pulse { 
        0% { transform: scale(1); } 
        50% { transform: scale(1.05); } 
        100% { transform: scale(1); } 
      }
      
      /* Responsive Design */
      @media only screen and (max-width: 600px) {
        .container {
          border-radius: 0;
          margin: 0;
        }
        .content {
          padding: 20px;
        }
        .header {
          padding: 20px;
        }
        .button {
          display: block;
          text-align: center;
          margin: 15px 0;
        }
      }
    </style>
  `;
};

// Common footer untuk semua email
export const getEmailFooter = (): string => {
  return `
    <div class="footer">
      <p><strong>LastTx</strong> - Decentralized Inheritance System</p>
      <p>Built on Flow Blockchain | Secure • Transparent • Decentralized</p>
      <p style="margin-top: 15px;">
        <small>This is an automated email. Please do not reply to this message.</small>
      </p>
    </div>
  `;
};

// Common security notice
export const getSecurityNotice = (): string => {
  return `
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0066cc;">
      <h4><span class="emoji">🔒</span> Security Notice:</h4>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>This email was sent from LastTx inheritance system</li>
        <li>Never share your private keys or seed phrases</li>
        <li>Always verify transactions on the Flow blockchain</li>
        <li>If you didn't expect this email, please ignore it</li>
      </ul>
    </div>
  `;
};

// Helper untuk generate button
export const generateActionButton = (
  actionUrl: string,
  buttonClass: string,
  buttonText: string,
): string => {
  if (!actionUrl) return '';

  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${actionUrl}" class="button ${buttonClass}">${buttonText}</a>
    </div>
  `;
};
