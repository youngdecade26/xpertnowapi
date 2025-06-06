const nodemailer = require("nodemailer");
var moment = require("moment");
require('dotenv').config();
async function mailer(email, subject) {
    // Assuming you have defined these variables somewhere
    const mailHost = process.env.MAIL_HOST;
    const mailPort = process.env.MAIL_PORT;
    const mailUsername = process.env.MAIL_USERNAME;
    const mailPassword = process.env.MAIL_PASSWORD;
    const mailSMTPSecure = process.env.SMTP_SECURE;
    const mailFrom = process.env.MAIL_FROM;
    // Create a SMTP transporter
    let transporter = nodemailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: mailSMTPSecure === process.env.SMTP_SECURE,
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
        from: process.env.MAIL_FROM,
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
    
                <table cellpadding="0" cellspacing="0"  style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="" width="20%" >
                            <h2>${Subject}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>  
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${fromName} </b> , </p>
                            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${message} <b> ${otp} </b> </p>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                            Regards,                    
                            </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                          ${app_name}
                            </p>
                        </td>
                    </tr>
                    <tr>                
                        <td  style="background: linear-gradient(#77C3EC, #800020);  padding-bottom:60px;">
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
    const mailHost = process.env.MAIL_HOST;
    const mailPort = process.env.MAIL_PORT;
    const mailUsername = process.env.MAIL_USERNAME;
    const mailPassword = process.env.MAIL_PASSWORD;
    const mailSMTPSecure = process.env.SMTP_SECURE;
    const mailFrom = process.env.MAIL_FROM;
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
                            <td style="background: linear-gradient(#77C3EC, #800020); padding-bottom:60px;">
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
var mailSMTPSecure = process.env.SMTP_SECURE;
var transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT, // Port number should be an integer
    secure: mailSMTPSecure === process.env.SMTP_SECURE, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false, // for testing purposes only, to avoid certificate validation errors
    },
});
// Function to send email
async function sendMail(email, subject, mailBody) {
    const mailOptions = {
        from: process.env.MAIL_FROM,
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
// Function to generate email body
function ActiveDeactiveSendMail(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.fromName}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                                <h2>Account Information</h2>
                               
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${postData.mailContent}.</p>
          
                                <br /><br />
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.fromName}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background-color:#0F225D; padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.fromName} |  All right Reserved
                                            </p>
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                                  The content of this message is confidential. If you have received it by mistake, please inform us by an email reply and then delete the message. It is forbidden to copy, forward, or in any way reveal the contents of this message to anyone.
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
function mailBodyForgotPasswordData(postData) {
    const date = new Date().getFullYear();
    const mailBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>Welcome to ${postData.fromName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color:#000000; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
                <tr>
                    <td class="pad-l-r-b" style="background-color:#FFFFFF; padding:0 70px 40px;">
                        <table cellpadding="0" cellspacing="0" class="full-wid">
            
                        </table>
                        <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
                            <tr>
                                <td>
                                    <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td class="logo" style="padding:40px 0 30px 0; background-color:#5DC89A; text-align:center; border-bottom:1px solid #E1E1E1">
                                                <img src="${postData.app_logo}" alt="" width="15%" height="18%" style="background-color: white; padding:5px">
                                                <h1 style="color:white;">Forgot Your Password</h1>
                                            </td>
                                        </tr>
                                        <tr><td></td></tr>
                                        <tr>
                                            <td class="content" style="padding:40px 40px;">
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                    Hello ${postData.name}
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                ${postData.mailContent}
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                    Regards,
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                ${postData.fromName}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#5DC89A; padding-bottom:60px;">
                                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                                    <tr>
                                                        <td>
                                                            <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#fbfbfb; margin-top:40px; line-height:20px;">
                                                                    &#169; ${date} ${postData.fromName} | All right Reserved
                                                                </p>
                                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fbfbfb; line-height:20px; margin-bottom:40px;">
                                                                    The content of this message is confidential. If you have received it by mistake, please inform us by an email reply and then delete the message. It is forbidden to copy, forward, or in any way reveal the contents of this message to anyone.
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
        </html>
    `;
    return mailBody;
}
function UserContacUs(postData) {
    const year = new Date().getFullYear();
    const mailBody = `
        <!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <title>Welcome to ${postData.fromName}</title>
            </head>
            <body style="margin: 0; padding: 0;font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
                <table cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
                    <tr>
                        <td class="pad-l-r-b" style="background-color:#FFFFFF; padding:0 70px 40px;">
                            <table cellpadding="0" cellspacing="0" class="full-wid">
            
                            </table>
            
                            <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
                                <tr>
                                    <td>
                                        <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                                            <tr style="background:#5DC89A;">
                                                <td class="logo" style="padding:40px 0 30px 0; text-align:center; border-bottom:1px solid #000000;background-color: #5DC89A;">
                                                    <img src="${postData.app_logo}" alt="" width="15%" height="18%" style="background-color: #e4d7d2; padding:5px">
                                                    <h1 style="color:white;">Contact Us</h1>
                                                </td>
                                            </tr>
                                            <tr><td></td></tr>
                                            <tr>
                                                <td class="content" style="padding:40px 40px;">
                                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#060b48; margin-top:0">
                                                    </p>
                                
                                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#060b48; margin-top:0">${postData.mailContent}</p>
                                
                                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#060b48; margin-top:0">
                                                    Regards,                  
                                                    </p>
                                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#060b48; margin-top:0">
                                                    ${postData.fromName}                    
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="background:#5DC89A; padding-bottom:60px;">
                                                    <table style="width:100%;background-color: #5DC89A;" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                                        <tr>
                                                            <td>   
                                                                <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#fffcfc; margin-top:40px; line-height:20px;">
                                                                    &#169; ${year} ${postData.fromName} | All right Reserved
                                                                    </p>
                                                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fffcfc; line-height:20px; margin-bottom:40px;">
                                                                    The content of this message is confidential. If you have received it by mistake, please inform us by an email reply and then delete the message. It is forbidden to copy, forward, or in any way reveal the contents of this message to anyone.
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
        </html>
    `;
    return mailBody;
}
function mailBodyContactUs(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.app_name}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                                <h2>Contact to ${postData.user_email}</h2>
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${postData.user_name}, </b></p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> <b>  ${postData.adminEmail}  </b> Want to contact with you..!! </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> <b> Email : </b> ${postData.user_email} ,</p>
                                 <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">  <b> Title : </b>${postData.title} </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">  <b> Message : </b>${postData.newMsg} </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.app_name}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background: linear-gradient(#77C3EC, #800020); padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.app_name} |  All right Reserved
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
        from: "support@youngdecade.org",
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
    const date = new Date().getFullYear();
    const mailBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>Welcome to ${postData.fromName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color:#FFFFFF; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
                <tr>
                    <td class="pad-l-r-b" style="background-color:#FFFFFF; padding:0 70px 40px;">
                        <table cellpadding="0" cellspacing="0" class="full-wid">
            
                        </table>
                        <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
                            <tr>
                                <td>
                                    <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td class="logo" style="padding:40px 0 30px 0; background-color:#000000; text-align:center; border-bottom:1px solid #E1E1E1">
                                                <img src="${postData.app_logo}" alt="" width="15%" height="18%" style="background-color: white; padding:5px">
                                                <h1 style="color:white;">Forgot Your Password</h1>
                                            </td>
                                        </tr>
                                        <tr><td></td></tr>
                                        <tr>
                                            <td class="content" style="padding:40px 40px;">
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                    Hello ${postData.name}
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                ${postData.mailContent}
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                    Regards,
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                ${postData.fromName}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#000000; padding-bottom:60px;">
                                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                                    <tr>
                                                        <td>
                                                            <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#fbfbfb; margin-top:40px; line-height:20px;">
                                                                    &#169; ${date} ${postData.fromName} | All right Reserved
                                                                </p>
                                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fbfbfb; line-height:20px; margin-bottom:40px;">
                                                                    The content of this message is confidential. If you have received it by mistake, please inform us by an email reply and then delete the message. It is forbidden to copy, forward, or in any way reveal the contents of this message to anyone.
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
        </html>
    `;
    return mailBody;
}
async function ActivateDeactivateMail(email, subject, mailBody) {
    const mailOptions = {
        from: "support@youngdecade.org",
        to: email,
        subject: subject,
        html: mailBody,
    };
    try {
        // Use transporter to send email
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info);
        return {
            success: true,
            message: "Email sent successfully.",
            info,
        };
    } catch (error) {
        console.error("Error sending email:", error);
        return {
            success: false,
            message: "Failed to send email.",
            error: error.message,
        };
    }
}
function mailBodyActivateDeactivate(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.app_name}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                                <h2>Account Informartion</h2>
                               
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${postData.userName}, </b></p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Your account has been ${postData.newStatusMsg}</p>
          
                                <br /><br />
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.app_name}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background: linear-gradient(#77C3EC, #800020); padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.app_name} |  All right Reserved
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
// DELETE POST MAIL
async function DeletePostMail(email, subject, mailBody) {
    const mailOptions = {
        from: "support@youngdecade.org",
        to: email,
        subject: subject,
        html: mailBody,
    };
    try {
        // Use transporter to send email
        const info = await transporter.sendMail(mailOptions);
        return {
            success: true,
            message: "Delete email sent successfully.",
            info,
        };
    } catch (error) {
        return {
            success: false,
            message: "Failed to send delete email.",
            error: error.message,
        };
    }
}
function mailBodyDeletePost(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.app_name}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                                <h2>Account Information</h2>
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${postData.userName}, </b></p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Your Post has been deleted by the admin. </p>
                                 <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"><b> Reason: </b> ${postData.deleteReason}</p>
                                <br /><br />
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.app_name}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background: linear-gradient(#77C3EC, #800020); padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.app_name} |  All right Reserved
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
function AcceptRejectSendMail(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.fromName}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                                <h2>Account Information</h2>
                               
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> ${postData.mailContent}.</p>
          
                                <br /><br />
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.fromName}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background-color:#0F225D; padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.fromName} |  All right Reserved
                                            </p>
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#000000; line-height:20px; margin-bottom:40px;">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fff; line-height:20px;">
                                                  The content of this message is confidential. If you have received it by mistake, please inform us by an email reply and then delete the message. It is forbidden to copy, forward, or in any way reveal the contents of this message to anyone.
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
function mailBodyInactive(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.app_name}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b>${postData.user_name} , </b></p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">  <b> Message : </b>${postData.newMsg} </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.app_name}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background: linear-gradient(#1765EF, #1765EF); padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.app_name} |  All right Reserved
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
function mailBodyAdmin(postData) {
    const year = new Date().getFullYear();
    const mailBody = `<!DOCTYPE html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta charset="UTF-8">
        <title>Welcome to ${postData.app_name}</title>
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
                                <img src=${postData.app_logo} alt="" width="20%" >
                            </td>
                        </tr>
                        <tr><td></td></tr>  
                        <tr>
                            <td class="content" style="padding:40px 40px;">
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b> ${postData.user_name}, </b></p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">  <b> Message : </b>${postData.newMsg} </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                                Regards,                    
                                </p>
                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0;  font-weight:bold">
                                ${postData.app_name}
                                </p>
                            </td>
                        </tr>
                        <tr>                
                            <td style="background: linear-gradient(#1765EF, #1765EF); padding-bottom:60px;">
                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                <tr>
                                    <td>     
                                        <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                            &#169;   ${year} ${postData.app_name} |  All right Reserved
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
function mailBodySubadminData(postData) {
    const date = new Date().getFullYear();
    const mailBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <title>Welcome to ${postData.fromName}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color:#FFFFFF; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
            <table cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
                <tr>
                    <td class="pad-l-r-b" style="background-color:#FFFFFF; padding:0 70px 40px;">
                        <table cellpadding="0" cellspacing="0" class="full-wid">
            
                        </table>
                        <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px;box-shadow:0 0 20px #ccc;margin-top:40px">
                            <tr>
                                <td>
                                    <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td class="logo" style="padding:40px 0 30px 0; background-color:#000000; text-align:center; border-bottom:1px solid #E1E1E1">
                                                <img src="${postData.app_logo}" alt="" width="15%" height="18%" style="background-color: white; padding:5px">
                                                <h1 style="color:white;">${postData.subject}</h1>
                                            </td>
                                        </tr>
                                        <tr><td></td></tr>
                                        <tr>
                                            <td class="content" style="padding:40px 40px;">
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:black; margin-top:0">
                                                    Hello ${postData.name}
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                ${postData.mailContent}
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                    Regards,
                                                </p>
                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">
                                                ${postData.fromName}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="background:#000000; padding-bottom:60px;">
                                                <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                                                    <tr>
                                                        <td>
                                                            <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#fbfbfb; margin-top:40px; line-height:20px;">
                                                                    &#169; ${date} ${postData.fromName} | All right Reserved
                                                                </p>
                                                                <p style="font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#fbfbfb; line-height:20px; margin-bottom:40px;">
                                                                    The content of this message is confidential. If you have received it by mistake, please inform us by an email reply and then delete the message. It is forbidden to copy, forward, or in any way reveal the contents of this message to anyone.
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
        </html>
    `;
    return mailBody;
}












async function refundmailer(
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


module.exports = {
    sendMail,
    ActiveDeactiveSendMail,
    mailBodyForgotPasswordData,
    UserContacUs,
    mailBodyContactUs,
    mailBodyAdmin,
    mailBodyInactive,
    mailer,
    mailBodyForgetPassword,
    mailBodySubadminData,
    ForgetPasswordMail,
    mailBodyActivateDeactivate,
    ActivateDeactivateMail,
    mailBodyDeletePost,
    DeletePostMail,
    AcceptRejectSendMail,
    refundmailer
};
