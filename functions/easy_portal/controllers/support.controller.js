// const createTicket = async (req, res) => {
//   try {
//     const { catalyst } = res.locals;
//     const { userId, fullname, email, message, subject } = req.body;

//     // Get user organization if available
//     let orgid = "N/A";
//     if (userId) {
//       try {
//         const zcql = catalyst.zcql();
//         const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}'`;
//         const userDetails = await zcql.executeZCQLQuery(userQuery);
//         if (userDetails && userDetails.length > 0) {
//           orgid = userDetails[0].usermanagement.orgid || "N/A";
//         }
//       } catch (err) {
//         console.log("Error fetching user details:", err);
//       }
//     }

//     const emailSubject =
//       subject || `New Support Ticket from ${fullname || "Unknown User"}`;
//     const emailContent = `
//   <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Support Ticket</title>
//       </head>
//       <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f6f6;">
//         <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
//           <div style="background-color: #4285F4; color: white; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
//             <h2 style="margin: 0;">New Support Ticket</h2>
//           </div>

//           <div style="padding: 20px;">
//             <p><strong>Full Name:</strong> ${fullname || "Not Provided"}</p>
//             <p><strong>Email:</strong> ${email || "Not Provided"}</p>
//             <p><strong>User ID:</strong> ${userId || "Guest"}</p>
//             <p><strong>Organization ID:</strong> ${orgid}</p>

//             <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
//               <p><strong>Subject:</strong> ${subject || "No Subject"}</p>
//               <p><strong>Message:</strong></p>
//               <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4285F4; margin-top: 10px;">
//                 ${message || "No message provided."}
//               </div>
//             </div>

//             <p style="margin-top: 20px; font-size: 12px; color: #777; text-align: center;">
//               Submitted on
//             </p>
//           </div>

//           <div style="background-color: #f6f6f6; padding: 15px; text-align: center; font-size: 12px; color: #777; border-radius: 0 0 5px 5px;">
//             &copy; ${new Date().getFullYear()} EasyToCheck. All rights reserved.
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     const emailService = catalyst.email();

//     const mailOptions = {
//       from_email: "portal@easytocheck.com",
//       to_email: ["portal@easytocheck.com"],
//       subject: emailSubject,
//       content: emailContent,
//       html_mode: true,
//       // DO NOT include content_type here!
//     };

//     await emailService.sendMail(mailOptions);

//     res.status(200).json({
//       success: true,
//       message: "Ticket created and email sent successfully!",
//     });
//   } catch (error) {
//     console.error("Error in createTicket:", error);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong!",
//       error: error.toString(),
//     });
//   }
// };

const createTicket = async (req, res) => {
  try {
    const { catalyst } = res.locals;
    const { userId, fullname, email, message, mobile, subject } = req.body;

    // Get user organization if available
    let orgid = "N/A";
    if (userId) {
      const zcql = catalyst.zcql();
      const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}'`;
      const userDetails = await zcql.executeZCQLQuery(userQuery);
      if (userDetails && userDetails.length > 0) {
        orgid = userDetails[0].usermanagement.orgid || "N/A";
      }
      const emailSubject =
        subject || `${fullname || "Unknown User"} wants connect with you`;
      const emailContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Confirmation</title>
  <!--[if mso]>
  <style type="text/css">
    table, td {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
    img {-ms-interpolation-mode: bicubic;}
    p, a, li, td, blockquote {mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
  <style>
    /* Reset styles */
    body, html {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      line-height: 1.5;
    }
    * {
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    div[style*="margin: 16px 0"] { 
      margin: 0 !important; 
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      max-width: 100%;
    }
    /* iOS blue links */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 0 !important;
      }
      .content {
        padding: 20px !important;
      }
      .header {
        padding: 20px !important;
      }
      .logo {
        max-width: 160px !important;
        height: auto !important;
      }
      .card {
        padding: 15px !important;
      }
      .ticket-badge {
        margin-bottom: 15px !important;
      }
      .user-info-container {
        padding: 15px !important;
      }
      .message-container {
        padding: 15px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      h2 {
        font-size: 18px !important;
      }
      .footer {
        padding: 20px 15px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f9fc;">
  <!-- Email wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
    <tr>
      <td align="center" style="padding: 30px 0;">
        <!-- Email container -->
        <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td class="header" style="background: linear-gradient(135deg, #2e5bff 0%, #4285F4 100%); padding: 35px 40px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.15);">Support Ticket Confirmation</h1>
                  </td>
                </tr>
                <tr>
                  
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom: 25px;">
                    <p style="margin: 0; color: #5f6368; font-size: 16px;">Thank you for reaching out to our support team. We have received your inquiry and will respond as soon as possible.</p>
                  </td>
                </tr>
              </table>
              
              <!-- User Info Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="user-info-container" style="background: linear-gradient(to right, #f8faff, #f0f4ff); border-radius: 8px; padding: 24px; border-left: 4px solid #4285F4; margin-bottom: 30px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td>
                          <h2 style="margin: 0 0 20px; font-size: 20px; color: #1a73e8; font-weight: 600;">User Information</h2>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="40%" style="padding: 8px 0; color: #5f6368;">Full Name:</td>
                              <td style="padding: 8px 0; font-weight: 600; color: #202124;">${
                                fullname || "Not Provided"
                              }</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #5f6368;">Email Address:</td>
                              <td style="padding: 8px 0; font-weight: 600; color: #202124;">${
                                email || "Not Provided"
                              }</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #5f6368;">User ID:</td>
                              <td style="padding: 8px 0; font-weight: 600; color: #202124;">${
                                userId || "Guest"
                              }</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #5f6368;">Organization ID:</td>
                              <td style="padding: 8px 0; font-weight: 600; color: #202124;">${
                                orgid || "Not Available"
                              }</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Ticket Details Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 10px;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 20px; font-size: 20px; color: #1a73e8; font-weight: 600; border-bottom: 1px solid #e8eaed; padding-bottom: 12px;">Ticket Details</h2>
                  </td>
                </tr>
                
                <!-- Subject -->
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-weight: 600; font-size: 16px; color: #202124;">Subject:</p>
                        </td>
                      </tr>
                      <tr>
                        <td class="card" style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                          <p style="margin: 0; color: #3c4043; font-size: 15px;">${
                            subject || "No Subject"
                          }</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Message -->
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-weight: 600; font-size: 16px; color: #202124;">Message:</p>
                        </td>
                      </tr>
                      <tr>
                        <td class="message-container" style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                          <p style="margin: 0; color: #3c4043; font-size: 15px; line-height: 1.6;">
                            ${message || "No message provided."}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Next steps info -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 35px;">
                <tr>
                  <td style="background-color: #e8f0fe; border-radius: 8px; padding: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="40" style="vertical-align: top;">
                          <img src="https://img.icons8.com/fluency/48/000000/information.png" width="24" height="24" style="vertical-align: top;">
                        </td>
                        <td style="padding-left: 15px;">
                          <p style="margin: 0; color: #1a73e8; font-weight: 600; font-size: 15px;">What happens next?</p>
                          <p style="margin: 8px 0 0; color: #3c4043; font-size: 14px;">Our support team will review your inquiry and respond via email. You can reply to that email to continue the conversation.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer" style="background: linear-gradient(to right, #f2f6ff, #e6effd); padding: 25px 40px; text-align: center; border-top: 1px solid #e6e9ef;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="#" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/4285F4/facebook-new.png" width="24" height="24" alt="Facebook" style="border: 0;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/4285F4/twitter.png" width="24" height="24" alt="Twitter" style="border: 0;">
                          </a>
                          <a href="#" style="display: inline-block; margin: 0 8px; text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/4285F4/linkedin.png" width="24" height="24" alt="LinkedIn" style="border: 0;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; color: #5f6368; font-size: 14px; font-weight: 500;">
                      &copy; 2025 EasyToCheck. All rights reserved.
                    </p>
                    <p style="margin: 10px 0 0; color: #80868b; font-size: 13px;">
                      This is an automated message. Please do not reply directly to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

      const emailService = catalyst.email();

      const mailOptions = {
        from_email: "portal@easytocheck.com",
        to_email: "kushal@easytocheck.com",
        subject: emailSubject,
        content: emailContent,
        html_mode: true,
        // DO NOT include content_type here!
      };

      const emailResponse = await emailService.sendMail(mailOptions);
      //   console.log(emailResponse);
    } else {
      const emailSubject =
        subject || `${fullname || "Unknown User"} wants connect with you`;
      const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f9fc; color: #333333;">
      <div style="max-width: 650px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2e5bff 0%, #4285F4 100%); padding: 25px; text-align: center;">
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 40px;">
          <!-- User Information Section -->
          <div style="background-color: #f8faff; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #4285F4;">
            <h2 style="margin: 0 0 15px; font-size: 18px; color: #1a73e8;">User Information</h2>
            <table width="100%" style="border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; width: 40%; color: #666;">Full Name:</td>
                <td style="padding: 8px 0; font-weight: 600;">${
                  fullname || "Not Provided"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Email Address:</td>
                <td style="padding: 8px 0; font-weight: 600;">${
                  email || "Not Provided"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">User ID:</td>
                <td style="padding: 8px 0; font-weight: 600;">${
                  mobile || "Not Provided"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">User ID:</td>
                <td style="padding: 8px 0; font-weight: 600;">${
                  userId || "Guest"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Organization ID:</td>
                <td style="padding: 8px 0; font-weight: 600;">${orgid}</td>
              </tr>
            </table>
          </div>
          
          <!-- Ticket Details Section -->
          <div style="margin-top: 30px;">
            <h2 style="margin: 0 0 15px; font-size: 18px; color: #1a73e8; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Ticket Details</h2>
            
            <div style="margin-bottom: 20px;">
              <p style="font-weight: 600; margin: 0 0 5px; font-size: 16px;">Subject:</p>
              <p style="margin: 0; background-color: #f5f7fa; padding: 10px 15px; border-radius: 4px;">${
                subject || "No Subject"
              }</p>
            </div>
            
            <div>
              <p style="font-weight: 600; margin: 0 0 5px; font-size: 16px;">Message:</p>
              <div style="background-color: #f5f7fa; padding: 15px; border-radius: 4px; line-height: 1.6;">
                ${message || "No message provided."}
              </div>
            </div>
          </div>
          
  
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f2f6ff; padding: 20px; text-align: center; border-top: 1px solid #e6e9ef;">
          
          <p style="margin: 0; color: #717d99; font-size: 13px;">
            &copy; EasyToCheck. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
        `;

      const emailService = catalyst.email();

      const mailOptions = {
        from_email: "portal@easytocheck.com",
        to_email: "kushal@easytocheck.com",
        subject: emailSubject,
        content: emailContent,
        html_mode: true,
        // DO NOT include content_type here!
      };

      const emailResponse = await emailService.sendMail(mailOptions);
    }

    res.status(200).json({
      success: true,
      message: "Ticket created and email sent successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error: error.toString(),
    });
  }
};

module.exports = { createTicket };
