const nodemailer = require('nodemailer');
require('dotenv').config();
const mailApi = (email,title, message) => {
  let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: email,
    subject: title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <title>Welcome to Cinema App</title>
        </head>
        <body style="margin: 0; padding: 0; font-size:13px; color:#444; font-family:Arial, Helvetica, sans-serif; padding-top:70px; padding-bottom:70px;">
          <table cellspacing="0" cellpadding="0" align="center" width="768" class="outer-tbl" style="margin:0 auto;">
            <tr>
              <td class="pad-l-r-b" style="background-color:#ECEFF1; padding:0 70px 40px;">
                <table cellpadding="0" cellspacing="0" class="full-wid"></table>
                <table cellpadding="0" cellspacing="0" style="width:100%; background-color:#FFFFFF; border-radius:4px; box-shadow:0 0 20px #ccc; margin-top:40px">
                  <tr>
                    <td>
                      <table border="0" style="margin:0; width:100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td class="logo" style="padding:25px 0 30px 0; text-align:center; border-bottom:1px solid #E1E1E1">
                            <img src="" alt="" width="20%">
                            <h2>Broadcast Message</h2>
                          </td>
                        </tr>
                        <tr>
                          <td class="content" style="padding:40px 40px;">
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">Dear ${email},</p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0">${message}</p>
                            <p style="font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#333333; margin-top:0; font-weight:bold">Regards,</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color:#194d33; padding-bottom:60px;">
                            <table style="width:100%" border="0" cellspacing="0" cellpadding="0" class="full-wid" align="center">
                              <tr>
                                <td>
                                  <div style="margin:0 auto; text-align:center; padding:0 100px" class="foot-items">
                                    <p style="font-family:Arial, Helvetica, sans-serif; font-size:14px; color:#ffffff; margin-top:40px; line-height:20px;">&#169; All rights reserved</p>
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
    `
  };
  mailTransporter.sendMail(mailOptions, function (err) {
    if (err) {
      console.error('Error sending email:', err);
      response.status(500).json({ success: false, msg: 'Error sending email' });
    } else {
      console.log('Email sent successfully');
      response.status(200).json({ success: true, msg: 'Email sent successfully' });
    }
  });
};
module.exports = mailApi;
