const nodemailer = require("nodemailer");
var moment = require("moment");


async function mailer(
    email,
    fromName,
    app_name,
    message,
    subject,
    title,
    app_logo,
    expert_name,
    expert_email
    // otp
    // subject
) {


    // Assuming you have defined these variables somewhere
    const mailHost = "mail.youngdecade.org";
    const mailPort = "465";
    const mailUsername = "support@youngdecade.org";
    const mailPassword = "1*)ZuWi$McmY";
    const mailSMTPSecure = "ssl";
    const mailFrom = "support@youngdecade.org";

    // Create a SMTP transporter
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === "ssl",
        auth: {
            user: mailUsername,
            pass: mailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Message object
    let mailOptions = {
        from: "support@youngdecade.org",
        to: email, // list of receivers
        subject: subject, // Subject line
        html: `<!DOCTYPE html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>Welcome to 'Xpertnow App'</title>
        </head>
    
        <body style="margin: 0; padding: 0; background-color:#ECEFF1; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table  cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
            <tr>
                <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                    <table cellpadding="0" cellspacing="0" class="full-wid">
            
                    </table>
    
                <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#ffffff; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="" width="20%" >
                            <h2>${title}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>  
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Hello <b> ${fromName} </b> , </p>
                            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${message} </p>
                            <br>
                            <br>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                          Thanks & Regards,                    
                            </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; ">
                          ${expert_name}
                            </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; ">
                          ${expert_email}
                            </p>
                        </td>
                    </tr>
                    <tr>                
                        <td  style="background: #19CCCC;  padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                            <tr>
                                <td>     
                                    <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                        &#169; ${moment().year()}  ${app_name} |  All right Reserved
                                        </p>
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                            This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 
                                                                If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 
                                                                If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 
                                                                If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        
                </table>
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
    </html>`,
    };

    // Send mail with defined transport object
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        var data = {
            status: "yes",
            // otp: otp,
        };
        return data;
    } catch (error) {
        console.error("Error occurred while sending email:", error.message);
        return "no";
    }
}

async function purchaseSubscription(
    email,
    fromName,
    app_name,
    message,
    subject,
    title,
    app_logo

) {


    // Assuming you have defined these variables somewhere
    const mailHost = "mail.youngdecade.org";
    const mailPort = "465";
    const mailUsername = "support@youngdecade.org";
    const mailPassword = "1*)ZuWi$McmY";
    const mailSMTPSecure = "ssl";
    const mailFrom = "support@youngdecade.org";

    // Create a SMTP transporter
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === "ssl",
        auth: {
            user: mailUsername,
            pass: mailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Message object
    let mailOptions = {
        from: "support@youngdecade.org",
        to: email,
        subject: title,
        html: `<!DOCTYPE html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>Welcome to 'MUSA APP '</title>
        </head>
    
        <body style="margin: 0;	padding: 0; background-color:#ECEFF1; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif;	padding-top:70px; padding-bottom:70px;">
            <table  cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
            <tr>
                <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                    <table cellpadding="0" cellspacing="0" class="full-wid">
            
                    </table>
    
                <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="" width="20%" >
                            <h2>${subject}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>	
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${fromName} </b> , </p>
                            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${message} </p>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                            Best Regards,                  	
                            </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                          ${app_name} 
                            </p>
                        </td>
                    </tr>
                    <tr>              	
                        <td  style="background: #14CA5D;  padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                            <tr>
                                <td>	 
                                    <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                        &#169; ${moment().year()}  ${app_name} |  All right Reserved
                                        </p>
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                            This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 
                                                                If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 
                                                                If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 
                                                                If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.
                                        </p>



                                        
                                    </div>
                                </td>
                            </tr>
                        
                </table>
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
    </html>`,
    };

    // Send mail with defined transport object
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        var data = {
            status: "yes",

        };
        return data;
    } catch (error) {
        console.error("Error occurred while sending email:", error.message);
        return "no";
    }
}

async function contectusMailer(
    admin_name,
    user_type_name,
    email,
    fromName,
    app_name,
    message,
    title,
    useremail,
    app_logo
) {
    const mailHost = "mail.youngdecade.org";
    const mailPort = "465";
    const mailUsername = "support@youngdecade.org";
    const mailPassword = "1*)ZuWi$McmY";
    const mailSMTPSecure = "ssl";
    const mailFrom = "support@youngdecade.org";

    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === "ssl",
        auth: {
            user: mailUsername,
            pass: mailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    let mailOptions = {
        from: `"${fromName}" <${mailFrom}>`,
        to: email,
        subject: title,
        html: `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${app_name}</title>
    </head>
    <body style="margin: 0; padding: 0; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
        <table cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
        <tr>
            <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                <table cellpadding="0" cellspacing="0" class="full-wid">
                </table>
                <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
                <tr>
                <td>
                    <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                                <img src=${app_logo} alt="" width="20%" >
                                <h2>Contact to ${user_type_name}</h2>
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${admin_name}, </b></p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> <b>  ${fromName}  </b> Want to contact with you..!! </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> <b> Email : </b> ${useremail} ,</p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">  <b> Message : </b> ${message}. </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${app_name}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background-color:#5DC89A; padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${moment().year()} ${app_name} |  All right Reserved
                                            </p>
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                                This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 
                                                If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 
                                                If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 
                                                If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                                </table>
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
    </html>`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return "yes";
    } catch (error) {
        console.error("Error occurred while sending email:", error.message);
        return "no";
    }
}


// Nodemailer transporter
var mailSMTPSecure = "ssl";

var transporter = nodemailer.createTransport({
    host: "mail.youngdecade.org",
    port: 465, // Port number should be an integer
    secure: mailSMTPSecure === "ssl", // true for 465, false for other ports
    auth: {
        user: "support@youngdecade.org",
        pass: "1*)ZuWi$McmY",
    },
    tls: {
        rejectUnauthorized: false, // for testing purposes only, to avoid certificate validation errors
    },
});

// Function to send email
async function sendMail(email, subject, mailBody) {
    const mailOptions = {
        from: "support@youngdecade.org",
        to: email,
        subject: subject,
        html: mailBody,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, message: "Email sent successfully", info };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send email",
            error: error.message,
        };
    }
}


// forget password

var mailSMTPSecure = "ssl";
var transporter = nodemailer.createTransport({
    host: "mail.youngdecade.org",
    port: 465, // Port number should be an integer
    secure: mailSMTPSecure === "ssl", // true for 465, false for other ports
    auth: {
        user: "support@youngdecade.org",
        pass: "1*)ZuWi$McmY",
    },
    tls: {
        rejectUnauthorized: false, // for testing purposes only, to avoid certificate validation errors
    },
});

// Function to send email
async function ForgetPasswordMail(email, subject, mailBody) {
    const mailOptions = {
        from: "support@meribhiapp.com",
        to: email,
        subject: subject,
        html: mailBody,
    };

    try {
        // Use transporter to send email
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            message: "Forget password email sent successfully.",
            info,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send forget password email.",
            error: error.message,
        };
    }
}

function mailBodyForgetPassword(postData) {
    const year = new Date().getFullYear();

    const mailBody = `<!DOCTYPE html>

  <head>

      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

      <title>Welcome to ${postData.app_name}</title>

  </head>



  <body style="margin: 0; padding: 0; background-color:#ECEFF1; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">

      <table  cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">

      <tr>

          <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">

              <table cellpadding="0" cellspacing="0" class="full-wid">

      

              </table>



          <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">

      <tr>

      <td>

          <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">

              <tr>

                  <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">

                      <img src="${postData.app_logo}" alt="" width="20%" >

                      <h2>${postData.subject}</h2>

                  </td>

              </tr>

              <tr><td></td></tr>  

              <tr>

                  <td class="content" style="padding:40px 40px;">

                      <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${postData.fromName} </b> , </p>

                      

                      <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${postData.message} <b> ${postData.otp} </b> </p>

      

                      <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">

                      Regards,                    

                      </p>

                      <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">

                    ${postData.app_name}

                      </p>

                  </td>

              </tr>

              <tr>                

                  <td  style="background-color:#009640; padding-bottom:60px;">

                      <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">

                      <tr>

                          <td>     

                              <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">

                                  <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">

                                  &#169; ${moment().year()}  ${postData.app_name} |  All right Reserved

                                  </p>

                                  <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">

                                  <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">

                                      This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 

                                                          If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 

                                                          If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 

                                                          If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.

                                  </p>

                              </div>

                          </td>

                      </tr>

                  

          </table>

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

</html>`;

    return mailBody;
}



async function mailerInvite(
    email,
    fromName,
    app_name,
    message,
    subject,
    title,
    app_logo,
    // otp
    // subject
) {


    // Assuming you have defined these variables somewhere
    const mailHost = "mail.youngdecade.org";
    const mailPort = "465";
    const mailUsername = "support@youngdecade.org";
    const mailPassword = "1*)ZuWi$McmY";
    const mailSMTPSecure = "ssl";
    const mailFrom = "support@youngdecade.org";

    // Create a SMTP transporter
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === "ssl",
        auth: {
            user: mailUsername,
            pass: mailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Message object
    let mailOptions = {
        from: "support@youngdecade.org",
        to: email, // list of receivers
        subject: subject, // Subject line
        html: `<!DOCTYPE html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>Welcome to 'MUSA APP '</title>
        </head>
    
        <body style="margin: 0; padding: 0; background-color:#ECEFF1; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table  cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
            <tr>
                <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                    <table cellpadding="0" cellspacing="0" class="full-wid">
            
                    </table>
    
                <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#ffffff; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="" width="20%" >
                            <h2>${title}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>  
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                    
                    
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Hi, ${message} </p>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                            Regards,                    
                            </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                          ${app_name}
                            </p>
                        </td>
                    </tr>
                    <tr>                
                        <td  style="background: #F38203;  padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                            <tr>
                                <td>     
                                    <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                        &#169; ${moment().year()}  ${app_name} |  All right Reserved
                                        </p>
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                            This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 
                                                                If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 
                                                                If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 
                                                                If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        
                </table>
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
    </html>`,
    };

    // Send mail with defined transport object
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        var data = {
            status: "yes",
            // otp: otp,
        };
        return data;
    } catch (error) {
        console.error("Error occurred while sending email:", error.message);
        return "no";
    }
}



// job complete mail
async function JobcompleteMailer(
    email,
    fromName,
    app_name,
    message,
    subject,
    title,
    app_logo,
  
    // otp
    // subject
) {


    // Assuming you have defined these variables somewhere
    const mailHost = "mail.youngdecade.org";
    const mailPort = "465";
    const mailUsername = "support@youngdecade.org";
    const mailPassword = "1*)ZuWi$McmY";
    const mailSMTPSecure = "ssl";
    const mailFrom = "support@youngdecade.org";

    // Create a SMTP transporter
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === "ssl",
        auth: {
            user: mailUsername,
            pass: mailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Message object
    let mailOptions = {
        from: "support@youngdecade.org",
        to: email, // list of receivers
        subject: subject, // Subject line
        html: `<!DOCTYPE html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>Welcome to 'Xpertnow App'</title>
        </head>
    
        <body style="margin: 0; padding: 0; background-color:#ECEFF1; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table  cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
            <tr>
                <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                    <table cellpadding="0" cellspacing="0" class="full-wid">
            
                    </table>
    
                <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#ffffff; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="" width="20%" >
                            <h2>${title}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>  
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${fromName} </b> , </p>
                             <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Thank you for using our platform, </p>
                            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${message} </p>
                            <br>
                            <br>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                           Best regards,                    
                            </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold ">
                          ${app_name}
                            </p>
                            
                        </td>
                    </tr>
                    <tr>                
                        <td  style="background: #19CCCC;  padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                            <tr>
                                <td>     
                                    <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                        &#169; ${moment().year()}  ${app_name} |  All right Reserved
                                        </p>
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                            This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 
                                                                If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 
                                                                If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 
                                                                If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        
                </table>
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
    </html>`,
    };

    // Send mail with defined transport object
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        var data = {
            status: "yes",
            // otp: otp,
        };
        return data;
    } catch (error) {
        console.error("Error occurred while sending email:", error.message);
        return "no";
    }
}





// refund request mailer
async function refundmailer(
    email,
    fromName,
    app_name,
    message,
    subject,
    title,
    app_logo,
    otp
    // subject
) {


    // Assuming you have defined these variables somewhere
    const mailHost = "mail.youngdecade.org";
    const mailPort = "465";
    const mailUsername = "support@youngdecade.org";
    const mailPassword = "1*)ZuWi$McmY";
    const mailSMTPSecure = "ssl";
    const mailFrom = "support@youngdecade.org";

    // Create a SMTP transporter
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === "ssl",
        auth: {
            user: mailUsername,
            pass: mailPassword,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });

    // Message object
    let mailOptions = {
        from: "support@youngdecade.org",
        to: email, // list of receivers
        subject: subject, // Subject line
        html: `<!DOCTYPE html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title>Welcome to 'Xpertnow APP '</title>
        </head>
    
        <body style="margin: 0; padding: 0; background-color:#ECEFF1; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table  cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
            <tr>
                <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                    <table cellpadding="0" cellspacing="0" class="full-wid">
            
                    </table>
    
                <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#ffffff; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="" width="20%" >
                            <h2>${title}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>  
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Hi <b> ${fromName} </b> , </p>
                            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${message} <b> ${otp} </b>   </p>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                            Regards,                    
                            </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                          ${app_name}
                            </p>
                        </td>
                    </tr>
                    <tr>                
                        <td  style="background: #19CCCC;  padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                            <tr>
                                <td>     
                                    <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                        &#169; ${moment().year()}  ${app_name} |  All right Reserved
                                        </p>
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                            This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. 
                                                                If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. 
                                                                If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. 
                                                                If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        
                </table>
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
    </html>`,
    };

    // Send mail with defined transport object
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        var data = {
            status: "yes",
            otp: otp,
        };
        return data;
    } catch (error) {
        console.error("Error occurred while sending email:", error.message);
        return "no";
    }
}

































module.exports = {
    sendMail,
    mailer,
    mailBodyForgetPassword,
    ForgetPasswordMail,
    contectusMailer,
    purchaseSubscription,
    mailerInvite,
    JobcompleteMailer,
    refundmailer

};


