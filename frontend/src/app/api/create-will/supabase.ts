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
//     const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
//       <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>You've Received an Inheritance</title>
//         <style>
//           body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
//           .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
//           .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
//           .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
//           .gift-icon { font-size: 48px; margin-bottom: 10px; }
//           .content { padding: 40px 30px; }
//           .highlight-box { background-color: #f1f5f9; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 4px; }
//           .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
//           .detail-item { background-color: #f8fafc; padding: 15px; border-radius: 8px; }
//           .detail-label { font-weight: 600; color: #475569; font-size: 14px; margin-bottom: 5px; }
//           .detail-value { color: #1e293b; font-size: 16px; }
//           .claim-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
//           .claim-button:hover { transform: translateY(-2px); }
//           .message-box { background-color: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
//           .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; color: #64748b; font-size: 14px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <div class="gift-icon">🎁</div>
//             <h1>You've Received an Inheritance!</h1>
//             <p style="margin: 10px 0 0 0; opacity: 0.9;">A digital inheritance has been transferred to you</p>
//           </div>

//           <div class="content">
//             <p>Dear <strong>${will.recipient_name}</strong>,</p>

//             <p>You have been named as a beneficiary in a digital inheritance will. ${
//               will.owner_name
//                 ? `<strong>${will.owner_name}</strong>`
//                 : "Someone"
//             } has left you a portion of their digital assets.</p>

//             <div class="highlight-box">
//               <h3 style="margin-top: 0; color: #1e293b;">📋 Inheritance Details</h3>
//               <div class="details-grid">
//                 <div class="detail-item">
//                   <div class="detail-label">From</div>
//                   <div class="detail-value">${
//                     will.owner_name || "Anonymous"
//                   }</div>
//                 </div>
//                 <div class="detail-item">
//                   <div class="detail-label">Percentage</div>
//                   <div class="detail-value">${will.percentage_of_money}%</div>
//                 </div>
//                 <div class="detail-item">
//                   <div class="detail-label">Contract ID</div>
//                   <div class="detail-value" style="font-family: monospace; font-size: 14px;">${
//                     will.smart_contract_id
//                   }</div>
//                 </div>
//                 <div class="detail-item">
//                   <div class="detail-label">Your Email</div>
//                   <div class="detail-value">${will.recipient_email}</div>
//                 </div>
//               </div>
//             </div>

//             ${
//               will.message
//                 ? `
//             <div class="message-box">
//               <h4 style="margin-top: 0; color: #92400e;">💌 Personal Message</h4>
//               <p style="margin-bottom: 0; font-style: italic; color: #1f2937;">"${will.message}"</p>
//             </div>
//             `
//                 : ""
//             }

//             <div style="text-align: center; margin: 30px 0;">
//               <a href="http://localhost:3000/claim-will" class="claim-button">
//                 🔗 Claim Your Inheritance
//               </a>
//             </div>

//             <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; border-left: 4px solid #0284c7;">
//               <h4 style="margin-top: 0; color: #0c4a6e;">🛡️ Next Steps</h4>
//               <ol style="margin-bottom: 0; color: #374151;">
//                 <li>Click the "Claim Your Inheritance" button above</li>
//                 <li>Connect your digital wallet</li>
//                 <li>Use the Contract ID: <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${
//                   will.smart_contract_id
//                 }</code></li>
//                 <li>Follow the instructions to claim your assets</li>
//               </ol>
//             </div>

//             <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
//               This inheritance was automatically triggered by the LastTx platform when the specified conditions were met.
//               If you have any questions, please contact our support team.
//             </p>
//           </div>

//           <div class="footer">
//             <p style="margin: 0;">This message was sent by the <strong>LastTx</strong> inheritance platform</p>
//             <p style="margin: 5px 0 0 0;">Secure • Automated • Blockchain-powered</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

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
//       subject: `🎁 You've received an inheritance from ${
//         will.owner_name || "someone"
//       }!`,
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
