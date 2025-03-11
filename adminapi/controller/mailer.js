const nodemailer = require('nodemailer');
require('dotenv').config();
function mailApi({ useremail, fromName, app_name, message, subject, app_logo, generateotp }) {
  return new Promise((resolve, reject) => {
    let mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: useremail,
      subject: subject,
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
    
                <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px; box-shadow:0 0 20px #ccc; margin-top:40px">
            <tr>
            <td>
                <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="${app_logo}" alt="${app_name}" width="20%" >
                            <h2>Contact to ${fromName}</h2>
                        </td>
                    </tr>
                    <tr><td></td></tr>  
                    <tr>
                        <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> Dear <b>${useremail}</b></p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> <b>${fromName}</b> wants to contact you..!! </p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0"> <b> Email : ${useremail}</b> ,</p>
                            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">  <b> Message : ${
                              message + generateotp
                            } </b>  </p>
            
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">
                            Regards,                    
                            </p>
                        </td>
                    </tr>
                    <tr>                
                        <td style="background-color:#194d33; padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                            <tr>
                                <td>     
                                    <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                        <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">
                                        &#169;  |  All right Reserved
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
    </html>`
    };
    mailTransporter.sendMail(mailOptions, function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ status: 'yes', otp: generateotp });
    });
  });
}
module.exports = mailApi;
