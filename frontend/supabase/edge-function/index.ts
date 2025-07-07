// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createClient } from "jsr:@supabase/supabase-js@2";
// const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// Deno.serve(async (req) => {
//   try {
//     // Only allow POST requests
//     if (req.method !== "POST") {
//       return new Response("Method not allowed", {
//         status: 405,
//       });
//     }
//     // Parse the request body
//     const body = await req.json();
//     // Validate required fields
//     if (!body.id) {
//       return new Response(
//         JSON.stringify({
//           error: "Missing required field: id",
//         }),
//         {
//           status: 400,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }
//     // Initialize Supabase client
//     const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
//     // Search for will information in database
//     const { data: will, error: willError } = await supabase
//       .from("wills")
//       .select("*")
//       .eq("smart_contract_id", body.id)
//       .eq("status", "active")
//       .single();
//     if (willError || !will) {
//       return new Response(
//         JSON.stringify({
//           error: "Will not found or already executed",
//           details: willError?.message,
//         }),
//         {
//           status: 404,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }
//     // Create beautiful HTML email template
//     const htmlContent = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Digital Inheritance Notification</title>
//   <style>
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body {
//       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//       background-color: #f8f9fa;
//       padding: 20px;
//       line-height: 1.6;
//     }
//     .container {
//       max-width: 600px;
//       margin: 0 auto;
//       background: #ffffff;
//       border-radius: 12px;
//       box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
//       overflow: hidden;
//     }
//     .header {
//       background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
//       padding: 40px 40px 30px;
//       text-align: center;
//       border-bottom: 3px solid #22c55e;
//     }
//     .header h1 {
//       color: #1f2937;
//       font-size: 28px;
//       font-weight: 700;
//       margin-bottom: 8px;
//       letter-spacing: -0.5px;
//     }
//     .header p {
//       color: #6b7280;
//       font-size: 16px;
//       margin: 0;
//     }
//     .content {
//       padding: 40px;
//       background: #ffffff;
//     }
//     .greeting {
//       font-size: 18px;
//       color: #1f2937;
//       margin-bottom: 20px;
//       font-weight: 500;
//     }
//     .intro-text {
//       font-size: 16px;
//       color: #4b5563;
//       margin-bottom: 30px;
//       line-height: 1.7;
//     }
//     .details-section {
//       background: #f9fafb;
//       border: 1px solid #e5e7eb;
//       border-radius: 8px;
//       padding: 24px;
//       margin: 24px 0;
//     }
//     .details-section h3 {
//       color: #1f2937;
//       margin-bottom: 16px;
//       font-size: 18px;
//       font-weight: 600;
//     }
//     .details-grid {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 16px;
//     }
//     .detail-item {
//       background: #ffffff;
//       padding: 16px;
//       border-radius: 6px;
//       border: 1px solid #e5e7eb;
//     }
//     .detail-label {
//       font-weight: 600;
//       color: #22c55e;
//       font-size: 12px;
//       margin-bottom: 4px;
//       text-transform: uppercase;
//       letter-spacing: 0.5px;
//     }
//     .detail-value {
//       color: #1f2937;
//       font-size: 15px;
//       font-weight: 500;
//       word-break: break-word;
//     }
//     .message-section {
//       background: #fefce8;
//       border: 1px solid #eab308;
//       border-left: 4px solid #eab308;
//       padding: 20px;
//       border-radius: 6px;
//       margin: 24px 0;
//     }
//     .message-section h4 {
//       color: #a16207;
//       margin-bottom: 12px;
//       font-size: 16px;
//       font-weight: 600;
//     }
//     .message-text {
//       color: #1f2937;
//       font-style: italic;
//       font-size: 15px;
//       line-height: 1.6;
//     }
//     .button-section {
//       text-align: center;
//       margin: 32px 0;
//     }
//     .claim-button {
//       display: inline-block;
//       background: #22c55e;
//       color: #ffffff !important;
//       padding: 14px 32px;
//       text-decoration: none;
//       border-radius: 6px;
//       font-weight: 600;
//       font-size: 16px;
//       transition: background-color 0.2s;
//     }
//     .claim-button:hover {
//       background: #16a34a;
//     }
//     .steps-section {
//       background: #f0f9ff;
//       border: 1px solid #0ea5e9;
//       border-left: 4px solid #0ea5e9;
//       padding: 20px;
//       border-radius: 6px;
//       margin: 24px 0;
//     }
//     .steps-section h4 {
//       color: #0369a1;
//       margin-bottom: 12px;
//       font-size: 16px;
//       font-weight: 600;
//     }
//     .steps-section ol {
//       color: #374151;
//       font-size: 14px;
//       line-height: 1.6;
//       padding-left: 18px;
//     }
//     .steps-section li {
//       margin-bottom: 6px;
//     }
//     .contract-code {
//       background: #f3f4f6;
//       padding: 4px 8px;
//       border-radius: 4px;
//       font-family: 'Monaco', 'Consolas', monospace;
//       font-size: 12px;
//       color: #1f2937;
//       border: 1px solid #d1d5db;
//     }
//     .footer-note {
//       margin-top: 32px;
//       padding: 16px;
//       background: #f9fafb;
//       border-radius: 6px;
//       border: 1px solid #e5e7eb;
//       font-size: 13px;
//       color: #6b7280;
//       text-align: center;
//       line-height: 1.5;
//     }
//     .footer {
//       background: #f9fafb;
//       padding: 24px 40px;
//       text-align: center;
//       border-top: 1px solid #e5e7eb;
//     }
//     .footer p {
//       color: #6b7280;
//       font-size: 13px;
//       margin: 4px 0;
//     }
//     .footer .brand {
//       color: #22c55e;
//       font-weight: 600;
//     }
//     @media (max-width: 600px) {
//       .container { margin: 10px; }
//       .header, .content { padding: 24px 20px; }
//       .details-grid { grid-template-columns: 1fr; }
//       .claim-button { padding: 12px 24px; font-size: 15px; }
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <h1>Digital Inheritance Notification</h1>
//       <p>You have been named as a beneficiary</p>
//     </div>

//     <div class="content">
//       <div class="greeting">Dear ${will.recipient_name},</div>

//       <div class="intro-text">
//         You have been named as a beneficiary in a digital inheritance will.
//         ${
//           will.owner_name ? `${will.owner_name}` : "Someone"
//         } has designated you to receive a portion of their digital assets.
//       </div>

//       <div class="details-section">
//         <h3>Inheritance Details</h3>
//         <div class="details-grid">
//           <div class="detail-item">
//             <div class="detail-label">From</div>
//             <div class="detail-value">${will.owner_name || "Anonymous"}</div>
//           </div>
//           <div class="detail-item">
//             <div class="detail-label">Allocation</div>
//             <div class="detail-value">${will.percentage_of_money}%</div>
//           </div>
//           <div class="detail-item">
//             <div class="detail-label">Contract ID</div>
//             <div class="detail-value" style="font-family: Monaco, Consolas, monospace; font-size: 13px;">${
//               will.smart_contract_id
//             }</div>
//           </div>
//           <div class="detail-item">
//             <div class="detail-label">Recipient</div>
//             <div class="detail-value">${will.recipient_email}</div>
//           </div>
//         </div>
//       </div>

//       ${
//         will.message
//           ? `
//       <div class="message-section">
//         <h4>Personal Message</h4>
//         <div class="message-text">${will.message}</div>
//       </div>
//       `
//           : ""
//       }

//       <div class="button-section">
//         <a href="http://localhost:3000/claim-will/${will.owner_address}/${
//       will.will_id
//     }" class="claim-button">
//           Claim Your Inheritance
//         </a>
//       </div>

//       <div class="steps-section">
//         <h4>How to Claim</h4>
//         <ol>
//           <li>Click the "Claim Your Inheritance" button above</li>
//           <li>Connect your digital wallet</li>
//           <li>Use Contract ID: <span class="contract-code">${
//             will.smart_contract_id
//           }</span></li>
//           <li>Follow the on-screen instructions to complete the claim</li>
//         </ol>
//       </div>

//       <div class="footer-note">
//         This inheritance was automatically triggered by the LastTx platform when the specified conditions were met.
//         If you have any questions, please contact our support team.
//       </div>
//     </div>

//     <div class="footer">
//       <p>This message was sent by the <span class="brand">LastTx</span> inheritance platform</p>
//       <p>Secure • Automated • Blockchain-powered</p>
//     </div>
//   </div>
// </body>
// </html>
// `;
//     // Prepare SendGrid request payload
//     const sendgridPayload = {
//       personalizations: [
//         {
//           to: [
//             {
//               email: will.recipient_email,
//               name: will.recipient_name,
//             },
//           ],
//         },
//       ],
//       from: {
//         email: "m.azzam.azis@gmail.com",
//         name: "LastTx Inheritance Platform",
//       },
//       subject: `Flow Wallet Inheritance from ${will.owner_name || "someone"}!`,
//       content: [
//         {
//           type: "text/html",
//           value: htmlContent,
//         },
//       ],
//     };
//     // Send email via SendGrid API
//     const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${SENDGRID_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(sendgridPayload),
//     });
//     // Handle SendGrid API response
//     if (response.ok) {
//       // Update will status to executed
//       await supabase
//         .from("wills")
//         .update({
//           status: "executed",
//           executed_at: new Date().toISOString(),
//         })
//         .eq("smart_contract_id", body.id);
//       return new Response(
//         JSON.stringify({
//           success: true,
//           message: "Inheritance email sent successfully",
//           recipientEmail: will.recipient_email,
//           contractId: will.smart_contract_id,
//         }),
//         {
//           status: 200,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     } else {
//       const errorText = await response.text();
//       // Update will status to failed
//       await supabase
//         .from("wills")
//         .update({
//           status: "failed",
//           executed_at: new Date().toISOString(),
//         })
//         .eq("smart_contract_id", body.id);
//       return new Response(
//         JSON.stringify({
//           success: false,
//           error: `Failed to send email: ${errorText}`,
//           details: errorText,
//         }),
//         {
//           status: 500,
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//     }
//   } catch (error) {
//     return new Response(
//       JSON.stringify({
//         success: false,
//         error: error.message,
//       }),
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   }
// });
