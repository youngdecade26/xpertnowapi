const connection = require("../model/connection");
const axios = require("axios");
const crypto = require("crypto");
const languageMessage = require("./languageMessage");
const CommonModel = require("../model/commonModal");
const CommonFunction = require("../common/CommonFunction");
const { decode } = require("base-64");
const moment = require("moment-timezone");
let createtime = moment().tz("Asia/kolkata").format("YYYY-MM-DD HH:mm:ss");
let updatetime = moment().tz("Asia/kolkata").format("YYYY-MM-DD HH:mm:ss");
const path = require("path");
const uniqid = require("uniqid");
require('dotenv').config();
const { app_name, app_logo, base_admin_url, currentTime } = require("../site_config");
const {
  mailBodyContactUs,
  mailBodyAdmin,
  sendMail,
  mailBodyForgetPassword,
  mailBodySubadminData,
  ForgetPasswordMail,
  ActiveDeactiveSendMail,
  mailBodyActivateDeactivate,
  mailBodyDeletePost,
  DeletePostMail,
  AcceptRejectSendMail,
  mailBodyInactive,
  refundmailer
} = require("./MailerApi");
const resetmail = require("./ForgetMailer");
const BroadcastMail = require("./BroadcastMail");
const { hashPassword, getUserData } = require("./function");
const rs = require("randomstring");
const jwt = require("jsonwebtoken");
const { request } = require("http");
const { error } = require("console");
const { responseSend } = require("../../shared functions/languageMessage");
const FetchUser = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time FROM user_master WHERE delete_flag = 0 AND user_type = 1 AND profile_completed=1  ORDER BY name ASC";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const FetchDeactiveUser = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time FROM user_master WHERE delete_flag = 0 AND user_type = 1 AND active_flag=0 AND profile_completed=1  order by user_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const FetchInactiveUser = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT user_id,  name FROM user_master WHERE delete_flag = 0 AND user_type = 1 AND profile_completed=1 AND inactive_customer=1  order by user_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const FetchInactiveExpert = async (request, response) => {
  try {
    const fetchDetails =
      `SELECT 
    um.user_id, 
    um.name  
FROM 
    user_master um
WHERE 
    um.user_type = 2  
    AND um.profile_completed = 1  and um.delete_flag=0 and um.inactive_customer=1
    GROUP BY 
    um.user_id
ORDER BY 
    um.createtime DESC`;
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const FetchDeactiveExpert = async (request, response) => {
  try {
    const fetchDetails =
      `SELECT 
    um.user_id, 
    um.f_name, 
    um.l_name, 
    um.name, 
    um.image, 
    um.email, 
    um.mobile, 
    um.dob, 
    um.address, 
    um.bio, 
    um.gender, 
    um.experience, 
    um.createtime, 
    um.active_flag, 
    um.gst_number, 
    um.adhar_number, 
    um.pan_number, 
    um.phone_code, 
    um.delete_flag, 
    um.delete_reason, 
    um.bank_user_name, 
    um.bank_name, 
    um.bank_account_no, 
    um.bank_branch, 
    um.ifsc_code,um.last_login_date_time,
    GROUP_CONCAT(DISTINCT dm.name SEPARATOR ', ') AS degrees,
    GROUP_CONCAT(DISTINCT lm.name SEPARATOR ', ') AS languages,
    cm.name AS category,
    scm.sub_category_name AS sub_category,
    GROUP_CONCAT(DISTINCT slcm.sub_level_category_name SEPARATOR ', ') AS sub_level_categories,
    um.licence_number,
    um.referral_number,
    um.call_charge,
    um.chat_charge,
    um.video_call_charge,
    um.expert_status,
  GROUP_CONCAT(DISTINCT fm.file_name SEPARATOR ', ') AS file_urls,
 um.special_skills,um.industry_name,um.institute_name
FROM 
    user_master um
LEFT JOIN degree_master dm 
    ON FIND_IN_SET(dm.degree_id, um.degree) > 0
LEFT JOIN language_master lm 
    ON FIND_IN_SET(lm.language_id, um.language) > 0
LEFT JOIN categories_master cm 
    ON um.category = cm.category_id
LEFT JOIN sub_categories_master scm 
    ON um.sub_category = scm.sub_category_id
LEFT JOIN sub_level_categories_master slcm 
    ON FIND_IN_SET(slcm.sub_level_category_id, um.sub_category_level) > 0
   LEFT JOIN file_master fm 
    ON um.user_id = fm.user_id
WHERE 
    um.user_type = 2  and um.active_flag=0
    AND um.profile_completed = 1  and um.delete_flag=0
    GROUP BY 
    um.user_id
ORDER BY 
    um.createtime DESC`;
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const FetchExpert = async (request, response) => {
  try {
    const fetchDetails =
      `SELECT 
    um.user_id, 
    um.f_name, 
    um.l_name, 
    um.name, 
    um.image, 
    um.email, 
    um.mobile, 
    um.dob, 
    um.address, 
    um.bio, 
    um.gender, 
    um.experience, 
    um.createtime, 
    um.active_flag, 
    um.gst_number, 
    um.adhar_number, 
    um.pan_number, 
    um.phone_code, 
    um.delete_flag, 
    um.delete_reason, 
    um.bank_user_name, 
    um.bank_name, 
    um.bank_account_no, 
    um.bank_branch, 
    um.ifsc_code,um.last_login_date_time,
    GROUP_CONCAT(DISTINCT dm.name SEPARATOR ', ') AS degrees,
    GROUP_CONCAT(DISTINCT lm.name SEPARATOR ', ') AS languages,
    cm.name AS category,
    scm.sub_category_name AS sub_category,
    GROUP_CONCAT(DISTINCT slcm.sub_level_category_name SEPARATOR ', ') AS sub_level_categories,
    um.licence_number,
    um.referral_number,
    um.call_charge,
    um.chat_charge,
    um.video_call_charge,
    um.expert_status,
  GROUP_CONCAT(DISTINCT fm.file_name SEPARATOR ', ') AS file_urls,
 um.special_skills,um.industry_name,um.institute_name
FROM 
    user_master um
LEFT JOIN degree_master dm 
    ON FIND_IN_SET(dm.degree_id, um.degree) > 0
LEFT JOIN language_master lm 
    ON FIND_IN_SET(lm.language_id, um.language) > 0
LEFT JOIN categories_master cm 
    ON um.category = cm.category_id
LEFT JOIN sub_categories_master scm 
    ON um.sub_category = scm.sub_category_id
LEFT JOIN sub_level_categories_master slcm 
    ON FIND_IN_SET(slcm.sub_level_category_id, um.sub_category_level) > 0
   LEFT JOIN file_master fm 
    ON um.user_id = fm.user_id
WHERE 
    um.user_type = 2  
    AND um.profile_completed = 1  and um.delete_flag=0
    GROUP BY 
    um.user_id
ORDER BY 
    um.createtime DESC`;
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,

        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};


//fetchuserDate
const fetchuserDate = async (request, response) => {
  const { fromDate, toDate } = request.query;
  console.log(fromDate, toDate);
  if (!fromDate || !toDate) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {

    const adjustedToDate = new Date(toDate);
    adjustedToDate.setUTCHours(23, 59, 59, 999);
    const formattedToDate = adjustedToDate.toISOString();
    const fetchDetails = `
      SELECT user_id, email, name, dob, mobile, image, address, bio, createtime 
      FROM user_master 
      WHERE delete_flag = 0 
        AND user_type = 1 
        AND createtime BETWEEN ? AND ? ORDER BY createtime DESC;
    `;
    connection.query(fetchDetails, [fromDate, formattedToDate], (err, res) => {
      if (err) {
        console.error("Error fetching user details:", err);
        return response
          .status(500)
          .json({ success: false, msg: "Internal server error" });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: "No users found" });
      }
      return response
        .status(200)
        .json({ success: true, msg: "User data found", data: res });
    });
  } catch (error) {
    console.error("Error in fetchuserDate endpoint:", error);
    return response
      .status(500)
      .json({ success: false, msg: "Internal server error" });
  }
};
const ViewUser = async (request, response) => {
  const { user_id } = request.params;
  if (!user_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "hey",
    });
  }
  const checkUser = "SELECT user_id FROM user_master WHERE user_id = ?";
  connection.query(checkUser, [user_id], async (err, result) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (result.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
    const FetchDetails =
      "SELECT user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time,pancard_front_image, pancard_back_image, adharcard_front_image, adharcard_back_image, gst_image FROM user_master WHERE user_id = ?";
    connection.query(FetchDetails, [user_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length > 0) {
        const updatedUsers = await Promise.all(
          res.map(async (user) => {
            const GetDebitAmount =
              "SELECT COALESCE(SUM(amount), 0) AS amount FROM wallet_master WHERE delete_flag = 0 AND status = 1 AND user_id = ?";
            const GetCreditAmount =
              "SELECT COALESCE(SUM(amount), 0) AS amount FROM wallet_master WHERE delete_flag = 0 AND status = 0 AND user_id = ?";
            user.debit_amount = await new Promise((resolve) => {
              connection.query(
                GetDebitAmount,
                [user.user_id],
                (err, result) => {
                  resolve(err || result.length === 0 ? 0 : result[0].amount);
                }
              );
            });
            user.credit_amount = await new Promise((resolve) => {
              connection.query(
                GetCreditAmount,
                [user.user_id],
                (err, result) => {
                  resolve(err || result.length === 0 ? 0 : result[0].amount);
                }
              );
            });
            return user;
          })
        );
        return response
          .status(200)
          .json({
            success: true,
            msg: languageMessage.msgDataFound,
            res: updatedUsers,
          });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  });
};
const ViewSubExpert = async (request, response) => {
  const { expert_subscription_id } = request.params;
  if (!expert_subscription_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "hey",
    });
  }
  var FetchDetails =
    "SELECT sm.subscription_id, sm.plan_type, sm.amount AS subscription_amount, sm.description, sm.duration AS subscription_duration, sm.delete_flag AS subscription_delete_flag, sm.createtime AS subscription_createtime, sm.updatetime AS subscription_updatetime, esm.expert_subscription_id, esm.expert_id, esm.subscription_id AS esm_subscription_id, esm.amount AS expert_subscription_amount, esm.start_date, esm.end_date, esm.transaction_id, esm.status, esm.duration AS expert_subscription_duration, esm.plan_name, esm.delete_flag AS expert_subscription_delete_flag, esm.createtime AS expert_subscription_createtime, esm.updatetime AS expert_subscription_updatetime, esm.mysqltime AS expert_subscription_mysqltime,um.email,um.name,um.mobile FROM subscription_master sm JOIN expert_subscription_master esm ON sm.subscription_id = esm.subscription_id JOIN user_master um ON expert_id=um.user_id   WHERE um.user_type=2 and sm.delete_flag = 0 AND esm.delete_flag = 0 and esm.expert_subscription_id=?";
  connection.query(FetchDetails, [expert_subscription_id], async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    } else {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        res: res[0],
      });
    }
  });
};
const AcceptRejectExpert = async (req, res) => {
  try {
    // Validate keyword and keyword_id
    let data = req.body;
    let { user_id, status } = data;
    console.log("user_id", user_id);
    console.log("status", status);
    // Update keyword in the database
    const query =
      "UPDATE user_master SET expert_status= ?, updatetime = NOW() WHERE user_id = ?"; // Assuming 'keyword_master' is your table name
    connection.query(query, [status, user_id], (error) => {
      if (error) {
        if (status == 1) {
          return res.status(500).json({
            success: false,
            msg: languageMessage.msgUserActivatederror,
          });
        } else {
          return res.status(500).json({
            success: false,
            msg: languageMessage.msgUserDeactivatederror,
          });
        }
      }
      // Fetch user details from the database
      const userDetailQuery =
        "SELECT name, email,expert_status FROM user_master WHERE user_id = ?";
      connection.query(userDetailQuery, [user_id], (userError, userResults) => {
        if (userError || !userResults.length) {
          console.error("Error fetching user details:", userError);
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: error,
          });
        }
        const { name, email, expert_status } = userResults[0];
        const fromName = app_name;
        const subject = "Account Info";
        let mailContent;
        if (expert_status == 1) {
          mailContent = `Hello ${name},<br>Your account has been <b>approve</b> by administration.`;
        } else {
          mailContent = `Hello ${name},<br>Your account has been <b>reject</b> by administration.`;
        }
        const mailBody = AcceptRejectSendMail({
          email,
          fromName,
          subject,
          mailContent,
          app_logo,
          name,
        });
        // Call sendMail function
        sendMail(email, subject, mailBody)
          .then((response) => {
            console.log("Email response:", response);
          })
          .catch((error) => {
            console.error("Error sending email:", error);
          });
      });
      if (status == 1) {
        return res.status(200).json({
          success: true,
          msg: languageMessage.msgApproveStatusUpdateSuccess,
        });
      } else {
        return res.status(200).json({
          success: true,
          msg: languageMessage.msgDeactiveStatusUpdateSuccess,
        });
      }
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
// get Social link
//Activate Deactivate
const ActivateDeactivate = async (req, res) => {
  try {
    // Validate keyword and keyword_id
    let data = req.body;
    let { user_id, status } = data;
    console.log("user_id", user_id);
    console.log("status", status);
    if (status == 1) {
      status = 0;
    } else if (status == 0) {
      status = 1;
    }
    // Update keyword in the database
    const query =
      "UPDATE user_master SET active_flag = ?, updatetime = NOW() WHERE user_id = ?"; // Assuming 'keyword_master' is your table name
    connection.query(query, [status, user_id], (error) => {
      if (error) {
        if (status == 1) {
          return res.status(500).json({
            success: false,
            msg: languageMessage.msgUserActivatederror,
          });
        } else {
          return res.status(500).json({
            success: false,
            msg: languageMessage.msgUserDeactivatederror,
          });
        }
      }
      // Fetch user details from the database
      const userDetailQuery =
        "SELECT name, email,active_flag FROM user_master WHERE user_id = ?";
      connection.query(userDetailQuery, [user_id], (userError, userResults) => {
        if (userError || !userResults.length) {
          console.error("Error fetching user details:", userError);
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: error,
          });
        }
        const { name, email, active_flag } = userResults[0];
        const fromName = app_name;
        const subject = "Account Info";
        let mailContent;
        if (active_flag == 1) {
          mailContent = `Hello ${name},<br>Your account has been <b>active</b> by administration.`;
        } else {
          mailContent = `Hello ${name},<br>Your account has been <b>deactive</b> by administration.`;
        }
        const mailBody = ActiveDeactiveSendMail({
          email,
          fromName,
          subject,
          mailContent,
          app_logo,
          name,
        });
        // Call sendMail function
        sendMail(email, subject, mailBody)
          .then((response) => {
            console.log("Email response:", response);
          })
          .catch((error) => {
            console.error("Error sending email:", error);
          });
      });
      if (status == 1) {
        return res.status(200).json({
          success: true,
          msg: languageMessage.msgActiveStatusUpdateSuccess,
        });
      } else {
        return res.status(200).json({
          success: true,
          msg: languageMessage.msgDeactiveStatusUpdateSuccess,
        });
      }
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
//Delete user
const DeleteUser = async (request, response) => {
  const data = request.body;
  const { user_id } = data;
  console.log(data);
  console.log(user_id);
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const checkUserQuery =
      "SELECT * FROM user_master WHERE user_id = ? AND delete_flag = 0";
    connection.query(checkUserQuery, [user_id], async (err, res) => {
      if (err) {
        console.error("Error querying database:", err);
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      const user = res[0];
      if (user.active_flag === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.accountdeactivated });
      }
      const updateUserQuery =
        "UPDATE user_master SET delete_flag = 1 WHERE user_id = ?";
      connection.query(updateUserQuery, [user_id], async (err) => {
        if (err) {
          console.error("Error updating user:", err);
          return response
            .status(200)
            .json({ success: false, msg: languageMessage.internalServerError });
        } else {
          return response
            .status(200)
            .json({ success: true, msg: languageMessage.AccoundDeleted });
        }
      });
    });
  } catch (error) {
    console.error("Caught exception:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Fetch Delete user
const FetchDeleteUser = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time FROM user_master WHERE user_type=1 AND delete_flag = 1 AND profile_completed=1  ORDER BY updatetime DESC";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      } else {
        return response.status(200).json(res);
      }
    });
  } catch (error) {
    console.error("Caught exception:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Fetch Delete  Experts
const FetchDeleteExperts = async (request, response) => {
  try {
    const fetchDetails =
      `SELECT 
    um.user_id, 
    um.f_name, 
    um.l_name, 
    um.name, 
    um.image, 
    um.email, 
    um.mobile, 
    um.dob, 
    um.address, 
    um.bio, 
    um.delete_reason,
    um.gender, 
    um.experience, 
    um.createtime, 
    um.active_flag, 
    um.gst_number, 
    um.adhar_number, 
    um.pan_number, 
    um.phone_code, 
    um.delete_flag, 
    um.delete_reason, 
    um.bank_user_name, 
    um.bank_name, 
    um.bank_account_no, 
    um.bank_branch, 
    um.ifsc_code,um.last_login_date_time,
    GROUP_CONCAT(DISTINCT dm.name SEPARATOR ', ') AS degrees,
    GROUP_CONCAT(DISTINCT lm.name SEPARATOR ', ') AS languages,
    cm.name AS category,
    scm.sub_category_name AS sub_category,
    GROUP_CONCAT(DISTINCT slcm.sub_level_category_name SEPARATOR ', ') AS sub_level_categories,
    um.licence_number,
    um.referral_number,
    um.call_charge,
    um.chat_charge,
    um.video_call_charge,
    um.expert_status,
  GROUP_CONCAT(DISTINCT fm.file_name SEPARATOR ', ') AS file_urls,
 um.special_skills,um.industry_name,um.institute_name
FROM 
    user_master um
LEFT JOIN degree_master dm 
    ON FIND_IN_SET(dm.degree_id, um.degree) > 0
LEFT JOIN language_master lm 
    ON FIND_IN_SET(lm.language_id, um.language) > 0
LEFT JOIN categories_master cm 
    ON um.category = cm.category_id
LEFT JOIN sub_categories_master scm 
    ON um.sub_category = scm.sub_category_id
LEFT JOIN sub_level_categories_master slcm 
    ON FIND_IN_SET(slcm.sub_level_category_id, um.sub_category_level) > 0
   LEFT JOIN file_master fm 
    ON um.user_id = fm.user_id
WHERE 
    um.user_type = 2  
    AND um.profile_completed = 1  AND um.delete_flag=1
    GROUP BY 
    um.user_id
ORDER BY 
    um.createtime DESC`;
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      } else {
        return response.status(200).json(res);
      }
    });
  } catch (error) {
    console.error("Caught exception:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Fetch Post details
const FetchPostDetails = (request, response) => {
  const FetchPost =
    "SELECT user_id,post_id, title, video, thumbnail, category_id, type, wallpaper, createtime FROM post_master WHERE delete_flag=0 ORDER BY createtime DESC";
  connection.query(FetchPost, (err, res) => {
    try {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res[0].active_flag === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.accountdeactivated });
      }
      const combinedData = [];
      let completedRequests = 0;
      res.map((row) => {
        const FetchData =
          "SELECT u.name as user_name, c.name as category_name FROM user_master u, category_master c WHERE u.user_id = ? AND c.category_id = ?";
        connection.query(
          FetchData,
          [row.user_id, row.category_id],
          (err, res1) => {
            try {
              if (err) {
                return response.status(200).json({
                  success: false,
                  msg: languageMessage.internalServerError,
                });
              }
              if (res1.length > 0) {
                combinedData.push({
                  post: row,
                  userDetails: res1[0],
                });
              }
              completedRequests++;
              // Check if all queries are completed
              if (completedRequests === res.length) {
                if (combinedData.length > 0) {
                  return response.status(200).json({
                    success: true,
                    msg: languageMessage.msgDataFound,
                    data: combinedData,
                  });
                } else {
                  return response.status(200).json({
                    success: false,
                    msg: languageMessage.msgDataNotFound,
                  });
                }
              }
            } catch (error) {
              return response
                .status(200)
                .json({ success: false, msg: error.message, error: error });
            }
          }
        );
      });
    } catch (error) {
      return response
        .status(200)
        .json({ success: false, msg: error.message, error: error });
    }
  });
};
// Post Analytical report
const postAnalyticalreport = async (request, response) => {
  try {
    var fetch =
      "SELECT YEAR(createtime) AS year, MONTH(createtime) AS month, COUNT(*) AS post_count FROM post_master WHERE  delete_flag=0 GROUP BY YEAR(createtime), MONTH(createtime) ORDER BY year ASC, month ASC";
    connection.query(fetch, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      } else {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
// View Post
const ViewPost = async (request, response) => {
  var { post_id } = request.query;
  post_id = decode(post_id);
  if (!post_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "post",
    });
  }
  const combinedData = [];
  var completedRequests = 0;
  var checkpost =
    "SELECT post_id, user_id, title, video, thumbnail,content_credits, category_id, type, wallpaper, createtime  FROM post_master WHERE post_id =? AND delete_flag = 0";
  connection.query(checkpost, [post_id], async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.NoPostFound });
    }
    if (res[0].active_flag === 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.accountdeactivated });
    }
    if (res.length > 0) {
      var FetchDetail =
        "SELECT u.name as user_name, u.email as user_email, c.name as category_name, p.title as playlist_title FROM user_master u, category_master c, post_playlist_master p WHERE u.user_id = ? AND c.category_id = ? AND p.user_id = u.user_id";
      connection.query(
        FetchDetail,
        [res[0].user_id, res[0].category_id],
        (err, res1) => {
          try {
            if (err) {
              return response.status(200).json({
                success: false,
                msg: languageMessage.internalServerError,
              });
            }
            if (res1.length > 0) {
              combinedData.push({
                post: res[0],
                userDetails: res1[0],
              });
            }
            if (res1.length <= 0) {
              return response.status(200).json({
                success: true,
                msg: languageMessage.msgDataNotFound,
                data: [],
              });
            }
            completedRequests++;
            if (completedRequests === res.length) {
              if (combinedData.length > 0) {
                return response.status(200).json({
                  success: true,
                  msg: languageMessage.msgDataFound,
                  data: combinedData,
                });
              } else {
                return response.status(200).json({
                  success: false,
                  msg: languageMessage.msgDataNotFound,
                  data: [],
                });
              }
            }
          } catch (error) {
            return response
              .status(200)
              .json({ success: false, msg: error.message, error: error });
          }
        }
      );
    } else {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.NoPostFound });
    }
  });
};
//Delete Post
const DeletePost = async (request, response) => {
  const Data = request.body;
  const { post_id, deleteReason } = Data;
  console.log(post_id);
  if (!post_id || !deleteReason) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: !post_id ? "post id" : "delete reason",
    });
  }
  const checkPost =
    "SELECT post_id, user_id FROM post_master WHERE post_id = ? AND delete_flag = 0";
  connection.query(checkPost, [post_id], async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msgUserNotFound,
        res: [],
      });
    }
    if (res[0].active_flag === 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.accountdeactivated });
    }
    const deletePostQuery =
      "UPDATE post_master SET delete_flag = 1 WHERE post_id = ?";
    connection.query(deletePostQuery, [post_id], async (err) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      } else {
        const fetchUsername =
          "SELECT name, email FROM user_master WHERE user_id = ? AND delete_flag = 0";
        connection.query(fetchUsername, [res[0].user_id], async (err, res1) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          }
          if (res1.length <= 0) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.msgDataNotFound,
            });
          }
          const userName = res1[0].name;
          const user_email = res1[0].email;
          const subject = "Account Information";
          const app_name = "Xpertnow";
          // const app_logo = "https://youngdecade.org/2024/xpert/admin/xpertlog.png";
          const app_logo = process.env.LOGO_URL;
          const mailBody = mailBodyDeletePost({
            userName,
            subject,
            deleteReason,
            app_logo,
            app_name,
          });
          try {
            const mailResponse = await DeletePostMail(
              user_email,
              subject,
              mailBody
            );
            if (mailResponse.success) {
              return response.status(200).json({
                success: true,
                msg: languageMessage.EmailSent,
                userName,
                user_email,
              });
            } else {
              return response.status(500).json({
                success: false,
                msg: "error1",
                error: mailResponse.error,
              });
            }
          } catch (error) {
            console.error("Error sending email:", error);
            return response.status(500).json({
              success: false,
              msg: "error1",
              error: error.message,
            });
          }
        });
      }
    });
  });
};
//Fetch Category
const FetchCategory = async (request, response) => {
  var FetchCategory =
    "SELECT category_id, name,image, createtime FROM categories_master WHERE delete_flag = 0 and category_type=3 order by category_id desc ";
  connection.query(FetchCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
// Add Category
const AddCategory = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name, type_name, image } = request.body;
  console.log("image:", image);

  // if (!name) {
  //   return response
  //     .status(200)
  //     .json({ success: false, msg: languageMessage.msg_empty_param, key: "23" });
  // }
  let CheckCategory = "";
  try {
    CheckCategory =
      "SELECT name FROM categories_master WHERE name = ? AND category_type=3 AND delete_flag = 0";
    connection.query(CheckCategory, [name], (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.CategoryAleradyExist,
          key: "categoryExists",
        });
      }

      let Insert =
        "INSERT INTO categories_master(name, type_name,category_type, image, createtime) VALUES(?, ?, ?, ?, now())";
      let values = [name, type_name, 3, image];
      // Check if image exists
      // if (image) {
      //   Insert += ", image"; // Add image column to the query
      //   values.push(image); // Add image value to the parameters
      // }
      // Insert += ") VALUES (?,?,3, NOW()";
      // if (image) {
      //   Insert += ", ?"; // Add placeholder for image value
      // }
      // Insert += ")"; // Closing the VALUES clause
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        } else {
          return response.status(200).json({
            success: true,
            msg: languageMessage.CategoryAdded,
            key: "added",
          });
        }
      });
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
//Delete Category
const DeleteCategory = async (request, response) => {
  const { category_id } = request.body;
  console.log(category_id);
  if (!category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check =
      "SELECT category_id FROM categories_master WHERE delete_flag = 0";
    connection.query(Check, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE categories_master SET delete_flag = 1 WHERE category_id = ?";
        connection.query(Delete, [category_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.DeleteCategory });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
//Category Update
const UpdateCategory = (req, res) => {
  try {
    // Check if required fields are provided
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let { category_id, action, name, type_name, image } = req.body;
    if (!action && action == "edit_category") {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!name) {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    let CheckCategory = "";
    CheckCategory =
      "SELECT name, image  FROM categories_master WHERE name = ? AND category_type=3  AND category_id != ? AND delete_flag = 0 ";
    connection.query(CheckCategory, [name, category_id], (err, result) => {
      if (err) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          msg: languageMessage.CategoryAleradyExist,
          key: "categoryExists",
        });
      }
      // Proceed to update brand detailsconst { blog_id, action, category_id, title, description }
      let updateQuery = "UPDATE categories_master SET name = ?,  updatetime = ?";
      let queryValues = [name, updatetime];
      // Check if an image was uploaded
      if (image) {
        //   // Include image update in the query
        //   let imageKey = req.file.key;
        //   const imageName = imageKey ? path.basename(imageKey) : null;
        updateQuery += ", image = ?";
        queryValues.push(image);
      }
      updateQuery += " WHERE category_id = ?";
      queryValues.push(category_id);
      // Execute the database update query
      connection.query(updateQuery, queryValues, (error, results) => {
        if (error) {
          console.error("Error executing MySQL query:", error);
          return res
            .status(500)
            .json({ success: false, msg: languageMessage.internalServerError });
        }
        // Check if any rows were affected
        if (results.affectedRows === 0) {
          return res
            .status(500)
            .json({ success: false, msg: languageMessage.internalServerError });
        } else {
          return res.status(200).json({
            success: true,
            msg: languageMessage.CategoryUpdated,
          });
        }
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};


// Fetch All Subscriptions
const FetchAllSubscriptions = async (request, response) => {
  try {
    var Fetch =
      "SELECT subscription_id, amount, subscription_type,type, description, createtime FROM subscription_master WHERE delete_flag = 0";
    connection.query(Fetch, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Fetch Subscribed Users
const FetchSubscribedUsers = async (request, response) => {
  try {
    var fetch =
      "SELECT user_id, subscription_id, subscription_type, description, amount, status, start_date, end_date, createtime FROM user_subscription_master WHERE delete_flag = 0";
    connection.query(fetch, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {

        const MultiData = [];
        let completedRequests = 0;
        for (let i = 0; i < res.length; i++) {
          const FetchUserName =
            "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
          connection.query(FetchUserName, [res[i].user_id], (error, res1) => {
            if (error) {
              return response.status(200).json({
                success: false,
                msg: languageMessage.internalServerError,
              });
            }
            if (res1.length > 0) {
              MultiData.push({
                allData: res[i],
                userDetails: res1[0],
              });
            }
            completedRequests++;
            if (completedRequests === res.length) {
              if (MultiData.length > 0) {
                return response.status(200).json({
                  success: true,
                  msg: languageMessage.msgDataFound,
                  data: MultiData,
                });
              } else {
                return response.status(200).json({
                  success: false,
                  msg: languageMessage.msgDataNotFound,
                });
              }
            }
          });
        }
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// Fetch reported Conentent
const FetchReportedContent = async (request, response) => {
  try {
    var Fetch =
      "SELECT report_id, user_id, other_user_id, report_type, reason, report_status, createtime FROM report_master WHERE delete_flag = 0";
    connection.query(Fetch, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const MultiData = [];
        let completedRequests = 0;
        for (let i = 0; i < res.length; i++) {
          const FetchUserName =
            "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
          connection.query(FetchUserName, [res[i].user_id], (error, res1) => {
            if (error) {
              return response.status(200).json({
                success: false,
                msg: languageMessage.internalServerError,
              });
            }
            if (res1.length > 0) {
              const userName = res1[0].name;
              const FetchOtherUserName =
                "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
              connection.query(
                FetchOtherUserName,
                [res[i].other_user_id],
                (error, res2) => {
                  if (error) {
                    return response.status(200).json({
                      success: false,
                      msg: languageMessage.internalServerError,
                    });
                  }
                  if (res2.length > 0) {
                    const otherUserName = res2[0].name;
                    MultiData.push({
                      allData: res[i],
                      userDetails: { userName, otherUserName },
                    });
                  }
                  completedRequests++;
                  if (completedRequests === res.length) {
                    if (MultiData.length > 0) {
                      return response.status(200).json({
                        success: true,
                        msg: languageMessage.msgDataFound,
                        data: MultiData,
                      });
                    } else {
                      return response.status(200).json({
                        success: false,
                        msg: languageMessage.msgDataNotFound,
                      });
                    }
                  }
                }
              );
            } else {
              completedRequests++;
              if (completedRequests === res.length) {
                if (MultiData.length > 0) {
                  return response.status(200).json({
                    success: true,
                    msg: languageMessage.msgDataFound,
                    data: MultiData,
                  });
                } else {
                  return response.status(200).json({
                    success: false,
                    msg: languageMessage.msgDataNotFound,
                  });
                }
              }
            }
          });
        }
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// Edit Reported Content
const EditReportedContent = async (request, response) => {
  const { report_id } = request.body;
  if (!report_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var check =
      "SELECT report_id FROM report_master WHERE report_id = ? AND delete_flag = 0";
    connection.query(check, [report_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var resolved =
          "UPDATE report_master SET report_status = 1 WHERE report_id = ?";
        connection.query(resolved, [report_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.Resolved });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// Fetch About Content
const fetchaboutcontent = async (request, response) => {
  const { contentType } = request.query;

  if (!contentType) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var fetch =
      "SELECT content FROM content_master WHERE content_type = ? AND delete_flag = 0";
    connection.query(fetch, [contentType], async (err, res) => {
      if (err) {
        return response
          .status(20)
          .json({ success: false, smg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Update Content
const updateContent = async (request, response) => {
  const contentType = request.body.contentType;
  const content = request.body.content;
  console.log("Received contentType:", contentType);
  console.log("Received content:", content);
  // Check if contentType or content is missing
  if (contentType === undefined || content === undefined) {
    console.log("Missing parameters");
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "none",
    });
  }
  try {
    const check =
      "SELECT content_type FROM content_master WHERE content_type = ? AND delete_flag = 0";
    connection.query(check, [contentType], async (err, res) => {
      if (err) {
        console.error("Error executing SELECT query:", err);
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      console.log("SELECT query result:", res);
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      const updateQuery =
        "UPDATE content_master SET content = ? WHERE content_type = ?";
      connection.query(
        updateQuery,
        [content, contentType],
        async (err, res1) => {
          if (err) {
            console.error("Error executing UPDATE query:", err);
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          }
          console.log("UPDATE query result:", res1);
          if (res1.affectedRows > 0) {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.ContentUpdated });
          } else {
            return response
              .status(200)
              .json({ success: false, msg: "No rows affected" });
          }
        }
      );
    });
  } catch (error) {
    console.error("Error updating content:", error);
    response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Fetch Contact us
const FetchContactUs = async (request, response) => {
  try {
    var fetch =
      "SELECT contact_id, name, email, message, user_type, file, status, subject, replied_date_time FROM contact_us_master WHERE delete_flag = 0";
    connection.query(fetch, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//
const updateStatus = async (request, response) => {
  const { contact_id, message } = request.body;
  if (!contact_id || !message) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  console.log(contact_id);
  try {
    var check =
      "SELECT contact_id, status FROM contact_us_master WHERE contact_id = ? AND delete_flag = 0";
    connection.query(check, [contact_id], async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var update =
          "UPDATE contact_us_master SET status = 1 ,reply = ? , replied_date_time = NOW() WHERE contact_id =? ";
        connection.query(update, [message, contact_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.RepliedSuccessfully,
              msg: message,
            });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//View Reply msg
const ViewReplymsg = async (request, response) => {
  const { contact_id } = request.body;
  try {
    // Check if contact_id is provided
    if (!contact_id) {
      return response
        .status(200)
        .json({ success: false, msg: "Contact ID is required" });
    }
    // Check if contact_id exists and is not deleted
    const checkUser =
      "SELECT * FROM contact_us_master WHERE contact_id = ? AND delete_flag = 0";
    connection.query(checkUser, [contact_id], (err, res) => {
      if (err) {
        console.error("Error checking contact_id:", err);
        return response
          .status(200)
          .json({ success: false, msg: "Internal server error" });
      }
      if (res.length === 0) {
        return response.status(200).json({
          success: false,
          msg: "Contact message not found or deleted",
        });
      }
      // Fetch reply message for the contact_id
      const fetchReply =
        "SELECT reply FROM contact_us_master WHERE contact_id = ?";
      connection.query(fetchReply, [contact_id], (fetchErr, fetchRes) => {
        if (fetchErr) {
          console.error("Error fetching reply:", fetchErr);
          return response
            .status(200)
            .json({ success: false, msg: "Error fetching reply message" });
        }
        if (fetchRes.length === 0) {
          return response
            .status(200)
            .json({ success: false, msg: "Reply message not found" });
        }
        // Assuming fetchRes is an array of rows, return the first reply message found
        return response.status(200).json({
          success: true,
          msg: "Reply message found",
          reply: fetchRes[0].reply,
        });
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return response
      .status(200)
      .json({ success: false, msg: "Internal server error" });
  }
};
// Broadcast message to All users
const BroadcastAll = async (request, response) => {
  const { title, message } = request.body;
  if (!title || !message) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var fetch =
      "SELECT email FROM user_master WHERE delete_flag = 0 AND profile_complete = 1";
    connection.query(fetch, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      let completedEmails = 0;
      for (let i = 0; i < res.length; i++) {
        const UserEmail = res[i].email;
        console.log(UserEmail);
        // Assuming BroadcastMail is an asynchronous function, use await
        await BroadcastMail(UserEmail, title, message);
        completedEmails++;
        if (completedEmails === res.length) {
          return response
            .status(200)
            .json({ success: true, msg: languageMessage.BrodcastSent });
        }
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//Users
const Users = async (request, response) => {
  var fetch =
    "SELECT user_id, name FROM user_master WHERE delete_flag = 0 AND user_type = 1 ";
  connection.query(fetch, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    } else {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
  });
};
// FetchSubscribedUsersByDate
const FetchSubscribedUsersByDate = async (request, response) => {
  const { fromDate, toDate } = request.query;
  console.log(fromDate, toDate);
  if (!fromDate || !toDate) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var fetch =
      "SELECT user_id, subscription_id, subscription_type, description, amount, status, start_date, end_date, createtime FROM user_subscription_master WHERE delete_flag = 0 AND createtime BETWEEN ? AND ? ORDER BY createtime DESC";
    connection.query(fetch, [fromDate, toDate], async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {

        const MultiData = [];
        let completedRequests = 0;
        for (let i = 0; i < res.length; i++) {
          const FetchUserName =
            "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
          connection.query(FetchUserName, [res[i].user_id], (error, res1) => {
            if (error) {
              return response.status(200).json({
                success: false,
                msg: languageMessage.internalServerError,
              });
            }
            if (res1.length > 0) {
              MultiData.push({
                allData: res[i],
                userDetails: res1[0],
              });
            }
            completedRequests++;
            if (completedRequests === res.length) {
              if (MultiData.length > 0) {
                return response.status(200).json({
                  success: true,
                  msg: languageMessage.msgDataFound,
                  data: MultiData,
                });
              } else {
                return response.status(200).json({
                  success: false,
                  msg: languageMessage.msgDataNotFound,
                });
              }
            }
          });
        }
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//AdminData
const AdminData = async (request, response) => {
  const { user_id, user_type } = request.body;
  try {
    var fetch =
      "SELECT name, email, mobile, image FROM user_master WHERE user_id=? and user_type = ? AND delete_flag = 0";
    connection.query(fetch, [user_id, user_type], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// Edit Admin Profile
// const UpdateAdminProfile = async (req, res) => {

//   const { user_id, user_type, name, email, mobile, image } = req.body;
//   // if (!user_id || !name || !email) {
//   //   return res.status(400).json({
//   //     success: false,
//   //     msg: "Missing required parameters.",
//   //   });
//   // }

//   return res.json(req.body)

//   let checkUser = await new Promise((resolve, reject) => {
//     let query = "SELECT user_id , name, email , image FROM user_master WHERE user_type = 0";
//     connection.query(query, (err, result) => {
//       if (err) {
//         reject(err)
//       }
//       else {
//         resolve(result)
//       }
//     })
//   })



//   const CheckUser =
//     "SELECT email FROM user_master WHERE  user_type != ? AND delete_flag = 0";
//   const checkValues = [user_type];
//   connection.query(CheckUser, checkValues, (err, checkResult) => {
//     if (err) {
//       console.error("Error checking email existence:", err);
//       return res.status(500).json({
//         success: false,
//         msg: languageMessage?.internalServerError || "Internal server error.",
//         error: err,
//       });
//     }
//     if (checkResult.length > 0) {
//       return res.status(200).json({
//         success: true,
//         msg: languageMessage?.msgEmailExist || "Email already exists.",
//         key: "Exists",
//       });
//     }
//     // Proceed with profile update only if email does not exist
//     try {


//       let updateQuery = "UPDATE user_master SET name = ?, email = ? , mobile = ? , image = ? WHERE user_type = 0 AND delete_flag = 0";
//       let params = [name, email, mobile, image ? image : checkUser[0].image]

//       connection.query(updateQuery, params, (err, result) => {
//         if (err) {
//           console.error("Error updating profile:", err);
//           return res.status(500).json({
//             success: false,
//             msg:
//               languageMessage?.internalServerError || "Internal server error.",
//           });
//         }
//         console.log("Update Result:", result);
//         if (result.affectedRows > 0) {
//           return res.status(200).json({
//             success: true,
//             msg:
//               languageMessage?.AdminProfileUpdated ||
//               "Profile updated successfully.",
//             key: '2'
//           });
//         } else {
//           return res.status(404).json({
//             success: false,
//             msg:
//               languageMessage?.NotFound ||
//               "Profile not found or already deleted.",
//           });
//         }
//       });
//     } catch (error) {
//       console.error("Exception during profile update:", error);
//       return res.status(500).json({
//         success: false,
//         msg: "Internal server error.",
//       });
//     }
//   });
// };
const UpdateAdminProfile = async (request, response) => {

  const { name, email, mobile, image, user_type } = request.body;



  try {
    if (!name || !email || !mobile || !user_type) {
      return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: '1' })
    }

    const checkUser = 'SELECT user_id, active_flag , image FROM  user_master WHERE  user_type = ? AND delete_flag =0 ';

    connection.query(checkUser, [user_type], async (error, result) => {

      if (error) {

        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });

      }



      if (result.length == 0) {

        return response.status(200).json({ success: false, msg: languageMessage.msgUserNotFound });

      }







      let checkMobile = "SELECT email FROM user_master WHERE email = ? AND user_type !=? AND delete_flag = 0";

      connection.query(checkMobile, [email, user_type], async (err, res) => {

        if (err) {

          return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });

        }



        if (res.length > 0) {

          return response.status(200).json({ success: false, msg: languageMessage.EmailExist });

        }



        // if (!image) {

        //     return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'image' });

        // }



        const updateDetails = 'UPDATE user_master SET  name = ?, email = ?,mobile = ?,  image = ?, updatetime = NOW() WHERE  user_type = ? AND delete_flag = 0';

        connection.query(updateDetails, [name, email, mobile, (image ? image : result[0].image), user_type], async (error1, result1) => {

          if (error1) {

            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error1.message });

          }



          if (result1.affectedRows == 0) {

            return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingdetails });

          }



          if (result1.affectedRows > 0) {

            return response.status(200).json({ success: true, msg: languageMessage.AdminProfileUpdated || 'updated' });

          }

        });

      });

    });

  }

  catch (error) {

    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });

  }

}



//new
const updateAdminDetails = async (request, response) => {

  const { name, email, mobile, image, user_type } = request.body;



  try {
    if (!name || !email || !mobile || !user_type) {
      return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: '1' })
    }

    const checkUser = 'SELECT user_id, active_flag , image FROM  user_master WHERE  user_type = ? AND delete_flag =0 ';

    connection.query(checkUser, [user_type], async (error, result) => {

      if (error) {

        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });

      }



      if (result.length == 0) {

        return response.status(200).json({ success: false, msg: languageMessage.msgUserNotFound });

      }







      let checkMobile = "SELECT email FROM user_master WHERE email = ? AND user_type !=? AND delete_flag = 0";

      connection.query(checkMobile, [email, user_type], async (err, res) => {

        if (err) {

          return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });

        }



        if (res.length > 0) {

          return response.status(200).json({ success: false, msg: languageMessage.EmailExist });

        }



        // if (!image) {

        //     return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'image' });

        // }



        const updateDetails = 'UPDATE user_master SET  name = ?, email = ?,mobile = ?,  image = ?, updatetime = NOW() WHERE  user_type = ? AND delete_flag = 0';

        connection.query(updateDetails, [name, email, mobile, (image ? image : result[0].image), user_type], async (error1, result1) => {

          if (error1) {

            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error1.message });

          }



          if (result1.affectedRows == 0) {

            return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingdetails });

          }



          if (result1.affectedRows > 0) {

            return response.status(200).json({ success: true, msg: languageMessage.AdminProfileUpdated || 'updated' });

          }

        });

      });

    });

  }

  catch (error) {

    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });

  }

}
const UpdateAdminPassword = async (request, response) => {
  const { user_id, user_type, oldPassword, newPassword } = request.body;

  try {
    if (!oldPassword) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "old_password",
      });
    }
    if (!user_id || !user_type) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,

      });
    }
    if (!newPassword) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "new_password",
      });
    }
    var sql =
      "SELECT user_id ,active_flag,name,email FROM user_master WHERE user_type = ? and user_id=? and delete_flag = 0";
    connection.query(sql, [user_type, user_id], async (err, info) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (info.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (info[0].active_flag === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.accountdeactivated,
          active_status: 0,
        });
      }
      console.log(info[0].user_id);
      var sqlforget = "select password from user_master where user_id = ?";
      connection.query(sqlforget, [info[0].user_id], async (err, data) => {
        if (err) {
          return response
            .status(200)
            .json({ success: false, msg: languageMessage.internalServerError });
        } else {
          if (data.length <= 0) {
            return response
              .status(200)
              .json({ success: false, msg: languageMessage.msgDataNotFound });
          }
          var password = data[0].password;
          console.log(password);
          const old_password_hash = await hashPassword(oldPassword);

          if (password === old_password_hash) {
            const new_pass = await hashPassword(newPassword);
            var updateSql =
              "UPDATE user_master SET password=?, updatetime = NOW() WHERE user_id = ? AND delete_flag = 0";
            connection.query(updateSql, [new_pass, info[0].user_id], (err) => {
              if (err) {
                return response.status(200).json({
                  success: false,
                  msg: languageMessage.internalServerError,
                });
              } else {
                return response.status(200).json({
                  success: true,
                  msg: languageMessage.PasswordUpdatedSuccessfully,
                  key: "success",
                });
              }
            });
          } else {
            return response.status(200).json({
              success: false,
              msg: languageMessage.newOldPassword,
              key: "failure",
            });
          }
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// fetch Subscription By Id
const fetchSubscriptionById = async (request, response) => {
  var { user_id } = request.params;
  user_id = decode(user_id);
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    // Check if user_id exists in user_subscription_master
    const checkQuery =
      "SELECT user_id FROM user_subscription_master WHERE user_id = ? AND delete_flag = 0";
    connection.query(checkQuery, [user_id], async (err, checkRes) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (checkRes.length === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      // Fetch subscription details including number_of_days
      const fetchQuery = `
        SELECT 
          usm.subscription_id, 
          usm.amount, 
          usm.subscription_type, 
          usm.status, 
          usm.description, 
          usm.start_date, 
          usm.end_date, 
          sm.number_off_day 
        FROM 
          user_subscription_master usm
        JOIN 
          subscription_master sm ON usm.subscription_id = sm.subscription_id
        WHERE 
          usm.user_id = ? AND usm.delete_flag = 0
      `;
      connection.query(fetchQuery, [user_id], async (err, fetchRes) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (fetchRes.length === 0) {
          return response
            .status(200)
            .json({ success: false, msg: languageMessage.msgDataNotFound });
        }
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          data: fetchRes,
        });
      });
    });
  } catch (error) {
    console.error("Error in fetchSubscriptionById:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//fetch post details By Id
const fetchpostdetailsById = async (request, response) => {
  var { user_id } = request.params;
  user_id = decode(user_id);
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    // Check if user_id exists in post_master
    const checkQuery =
      "SELECT user_id FROM post_master WHERE user_id = ? AND delete_flag = 0";
    connection.query(checkQuery, [user_id], async (err, checkRes) => {
      if (err) {
        console.error("Error checking post_master:", err);
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (checkRes.length === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      // Fetch post details including category information
      const fetchQuery = `
        SELECT 
          usm.post_id,
          usm.user_id, 
          usm.title, 
          usm.video, 
          usm.thumbnail, 
          usm.category_id, 
          usm.type, 
          usm.wallpaper, 
          usm.createtime,
          cm.name
        FROM 
          post_master usm
        JOIN 
          category_master cm ON usm.category_id = cm.category_id
        WHERE 
          usm.user_id = ? AND usm.delete_flag = 0
      `;
      connection.query(fetchQuery, [user_id], async (err, fetchRes) => {
        if (err) {
          console.error("Error fetching post details:", err);
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (fetchRes.length === 0) {
          return response
            .status(200)
            .json({ success: false, msg: languageMessage.msgDataNotFound });
        }
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          data: fetchRes,
        });
      });
    });
  } catch (error) {
    console.error("Error in fetchpostdetailsById:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// User Count for analytics report
const UserCount = async (request, response) => {
  try {
    var fetch =
      "SELECT YEAR(createtime) AS year, MONTH(createtime) AS month, COUNT(*) AS user_count FROM user_master WHERE user_type = 1 AND delete_flag=0 AND profile_complete = 1 GROUP BY YEAR(createtime), MONTH(createtime) ORDER BY year ASC, month ASC";
    connection.query(fetch, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      } else {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
//Admin login
const Adminlogin = async (request, response) => {
  const { email, password } = request.body;
  try {
    // Validate inputs
    if (!email) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
      });
    }
    if (!password) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
      });
    }
    // SQL query to fetch user information based on email
    const sqlLogin =
      "SELECT email, password, user_id, active_flag FROM user_master WHERE email = ? And user_type IN (0,3) AND delete_flag = 0";
    // Execute the SQL query
    connection.query(sqlLogin, [email], async (err, info) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: "5",
          error: err,
        });
      }
      if (info.length == 0) {
        return response.status(200).json({ succss: false, key: "email" });
      }
      if (info.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.userNotRegisterHere });
      }
      if (info[0].active_flag === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.accountdeactivated,
          active_status: 0,
        });
      }
      // Verify password
      const hashedPassword = await hashPassword(password);
      const userLoginData = info[0];
      if (hashedPassword !== userLoginData.password) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.PasswordNotCorrect,
          key: "password",
        });
      }
      // Fetch user data using user_id
      const userData = await getUserData(userLoginData.user_id);
      if (userData) {
        const payload = { subject: userData.email };
        const key = rs.generate();
        const token = jwt.sign(payload, key);
        return response.status(200).json({
          success: true,
          token: token,
          msg: languageMessage.loginSuccessful,
          userDataArray: userData,
        });
      } else {
        return response.status(200).json({
          success: false,
          msg: languageMessage.userNotRegisterHere,
        });
      }
    });
  } catch (error) {
    console.error("Error in try-catch block:", error);
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: "2",
      error: error,
    });
  }
};
// Admin Forget Password
const AdminForgetPassword = (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.json({
        success: false,
        msg: languageMessage.msg_empty_param,
        data: {},
      });
    }
    connection.query(
      "SELECT user_id, user_type, name FROM user_master WHERE delete_flag = 0 AND email = ? AND user_type IN(0,3) ",
      [email],
      async (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            key: "1- email",
          });
        }
        if (!results || results.length === 0) {
          return res.json({
            success: false,
            msg: languageMessage.msgUserNotFound,
            data: {},
          });
        }
        const fromName = app_name;
        const subject = "Forgot Password";
        const uniqcode = uniqid(); // Generate unique identifier
        const md5Hash = crypto.createHash("md5").update(uniqcode).digest("hex");
        const resetPassLink = `${base_admin_url}reset-password?uniqcode=${md5Hash}`;
        const mailContent = `
                Recently a request was submitted to reset a password for your account. If this was a mistake, just ignore this email and nothing will happen.
                To reset your password, visit the following link:
                <a href="${resetPassLink}" style="float: unset; width: 25%; display: block; margin: 26px auto 0; background:#000000; text-align: center; vertical-align: middle; user-select: none; border: 1px solid transparent; padding: .375rem .75rem; font-size: .875rem; line-height: 1.5; border-radius: .25rem; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #fff;text-decoration: unset;">Reset Password</a>
                `;
        // Insert query to store forgot password request
        connection.query(
          "INSERT INTO forgot_password_master (user_id, user_type, email, forgot_pass_identity, active_flag, createtime, updatetime) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
          [results[0].user_id, results[0].user_type, email, md5Hash, 0],
          (error) => {
            if (error) {
              console.error("Error inserting forgot password request:", error);
              return res.status(500).json({
                success: false,
                msg: languageMessage.internalServerError,
              });
            }
            let mailBody;
            mailBody = mailBodyForgetPassword({
              email,
              fromName,
              subject,
              mailContent,
              app_logo,
              name: results[0].name,
            });
            // Call sendMail function
            sendMail(email, subject, mailBody)
              .then((response) => {
                console.log("Email response:", response);
              })
              .catch((error) => {
                console.error("Error sending email:", error);
              });
            return res.json({
              success: true,
              msg: languageMessage.EmailSent,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      data: {},
    });
  }
};
// Admin Forget New Password
const AdminForgetNewPassword = async (request, response) => {
  const { password, uniqcode } = request.body;
  if (!uniqcode || !password) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "password",
    });
  }
  try {
    const hashedPassword = await hashPassword(password);
    connection.query(
      "SELECT forget_id, user_id FROM forgot_password_master WHERE active_flag = 0 AND forgot_pass_identity = ?",
      [uniqcode],
      (error, results) => {
        if (error) {
          console.error("Error fetching forgot password details:", error);
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            key: "results is not found",
          });
        }
        if (!results || results.length === 0) {
          return response.json({
            success: false,
            msg: languageMessage.internalServerError,
            key: "results is zero",
          });
        }
        const userId = results[0].user_id;
        // Update user's password and update forgot password record
        connection.query(
          "UPDATE user_master SET password = ?, updatetime = ? WHERE user_id = ?",
          [hashedPassword, new Date(), userId],
          (updateError, updateResults) => {
            if (updateError) {
              console.error("Error updating user password:", updateError);
              return response.status(200).json({
                success: false,
                msg: languageMessage.internalServerError,
              });
            }
            if (updateResults.affectedRows === 0) {
              return response.json({
                success: false,
                msg: languageMessage.internalServerError,
                data: {},
              });
            }
            // Update forgot password record
            connection.query(
              "UPDATE forgot_password_master SET active_flag = 1, updatetime = ? WHERE forgot_pass_identity = ?",
              [new Date(), uniqcode],
              (updateForgotError) => {
                if (updateForgotError) {
                  console.error(
                    "Error updating forgot password record:",
                    updateForgotError
                  );
                  return response.status(200).json({
                    success: false,
                    msg: languageMessage.internalServerError,
                  });
                }
                return response.json({
                  success: true,
                  msg: languageMessage.PasswordUpdatedSuccessfully,
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: err,
    });
  }
};
//Check admin Email
const CheckAdminEmail = async (request, response) => {
  const { email } = request.body;
  if (!email) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var check =
      "SELECT email FROM user_master WHERE email = ? AND user_type = 0 AND delete_flag = 0";
    connection.query(check, [email], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: res[0].email,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getCount = async (request, response) => {
  try {
    const userCount = await getUserCount();
    const expertCount = await getExpertCount();
    const subadminCount = await getSubadminCount();
    const contactCount = await getContactusUserCount();
    const jobpostCount = await getJobPostUserCount();
    const totalearning = await getTotalEarningCount();
    const totalsubscribed = await getTotalExpertSubscribedCount();
    console.log("jobpostCount : ", jobpostCount);
    return response.status(200).json({
      success: true,
      msg: languageMessage.msgDataFound,
      res: {
        userCount: userCount,
        expertCount: expertCount,
        contactCount: contactCount,
        jobpostCount: jobpostCount,
        totalearning: totalearning,
        totalsubscribed: totalsubscribed,
        totalsubadmin: subadminCount
      },
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
//get User Count
function getUserCount() {
  const userCountQuery =
    "SELECT COUNT(*) as user_count FROM user_master WHERE user_type = 1 AND  profile_completed =1 AND delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(userCountQuery, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].user_count);
    });
  });
}
function getContactusUserCount() {
  const userCountQuery =
    "SELECT COUNT(*) as contact_count FROM contact_us_master WHERE delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(userCountQuery, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].contact_count);
    });
  });
}
function getJobPostUserCount() {
  const userCountQuery =
    "SELECT COUNT(*) as job_post_count FROM job_post_master WHERE delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(userCountQuery, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].job_post_count);
    });
  });
}
function getTotalEarningCount() {
  const userCountQuery =
    "SELECT SUM(admin_commission_amount) as totalearning FROM expert_earning_master WHERE delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(userCountQuery, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].totalearning);
    });
  });
}
function getTotalExpertSubscribedCount() {
  const userCountQuery =
    "SELECT Count(expert_subscription_id) as totalsubscribed FROM expert_subscription_master WHERE delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(userCountQuery, (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].totalsubscribed);
    });
  });
}
//get Post Count
function getExpertCount() {
  var experQueryCount =
    "SELECT COUNT(*) as expert_count FROM user_master WHERE user_type = 2 AND profile_completed =1 AND delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(experQueryCount, async (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].expert_count);
    });
  });
}
function getSubadminCount() {
  var experQueryCount =
    "SELECT COUNT(*) as subadmin_count FROM user_master WHERE user_type = 3 AND profile_completed =1 AND delete_flag = 0";
  return new Promise((resolve, reject) => {
    connection.query(experQueryCount, async (err, results) => {
      if (err) {
        return reject(err);
      }
      if (!results || results.length === 0) {
        return reject(new Error(languageMessage.msgDataNotFound));
      }
      resolve(results[0].subadmin_count);
    });
  });
}
//get Subscription Count
const getSubscriptionCount = async (request, response) => {
  try {
    var getUserCount =
      "SELECT COUNT(*) as subscription_count FROM user_subscription_master WHERE  delete_flag = 0";
    connection.query(getUserCount, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//get Earning Count
const getEarningCount = async (request, response) => {
  try {
    var getUserCount =
      "SELECT SUM(amount) as earning_count FROM user_subscription_master WHERE  delete_flag = 0";
    connection.query(getUserCount, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
//get Contact Count
const getContactCount = async (request, response) => {
  try {
    var getUserCount =
      "SELECT COUNT(*) as contact_count FROM contact_us_master WHERE  delete_flag = 0";
    connection.query(getUserCount, async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// Social Links
const SocialLinks = async (request, response) => {
  const { user_id } = request.query;
  if (!user_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "user",
    });
  }
  try {
    const checkUserQuery =
      "SELECT user_id FROM social_media_master WHERE user_id = ? AND delete_flag = 0";
    connection.query(checkUserQuery, [user_id], async (err, res) => {
      if (err) {
        console.error("Database error:", err);
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      }
      if (res.length === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
        });
      }
      const fetchQuery =
        "SELECT user_id,facebook_url, instagram_url,tik_tok_url, x_url,discord_url,telegram_url,reddit_url FROM social_media_master WHERE user_id = ? AND delete_flag = 0";
      connection.query(fetchQuery, [user_id], (err, res1) => {
        if (err) {
          console.error("Database error:", err);
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
          });
        }
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res1,
        });
      });
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
    });
  }
};
const send_notification = async (req, res) => {
  if (!req.body) {
    return res.json({ success: false, msg: "All fields are required", key: 1 });
  }
  const data = req.body;
  console.log("broadcast data", data);
  // Check for required fields
  if (
    !data ||
    !data.action ||
    !data.message ||
    !data.subject ||
    !data.userType
  ) {
    return res.json({
      success: false,
      msg: "All fields are required",
      key: 2,
      data,
    });
  }
  const { subject, userType, select_arr } = data;
  const send_message = data.message;
  try {
    let user_arr = [];
    if (userType === "all") {
      // Get all notification users if userType is 'all'
      user_arr = await CommonModel.getAllNotificationUsers(userType);
    } else if (userType == "allexpert") {
      user_arr = await CommonModel.getAllNotificationUsers(userType);
    } else {
      // If select_arr is present, map selected users
      if (select_arr && select_arr.length > 0) {
        user_arr = select_arr.map((user_id) => ({
          user_id,
          user_type: userType,
        }));
      } else {
        // Otherwise, get all users based on userType
        user_arr = await CommonModel.getAllNotificationUsers(userType);
      }
    }
    let successArr = [];
    let failedArr = [];
    console.log("user_arr borad", user_arr);

    // Iterate over the users and process notifications
    for (let user of user_arr) {
      try {
        const user_id = user.user_id; // Directly use user_id as it's a number
        const user_type = user.user_type;
        const user_id_notification = 1; // Set notification sender id (assumed 1)
        const other_user_id_notification = user_id;
        const action = "broadcast";
        const action_id = "";
        const title = [subject, subject, subject, subject];
        const message = [
          send_message,
          send_message,
          send_message,
          send_message,
        ];
        const action_data = {
          user_id: user_id_notification,
          other_user_id: other_user_id_notification,
          action_id,
          action,
        };
        const notificationArrCheck = await getNotificationArrSingle(
          user_id_notification,
          other_user_id_notification,
          action,
          action_id,
          title,
          message,
          action_data
        );
        if (notificationArrCheck !== "NA") {
          let notificationArr = [notificationArrCheck];
          let notstatus = "";
          // Send notification based on user_type
          if (notificationArr.length > 0) {

            notstatus = await oneSignalNotificationSendCall(
              notificationArr
            );

            successArr.push(notstatus);

            // Check if notstatus is successful and push it to successArr
            if (notstatus && notstatus.success) {
              successArr.push({ user_id, status: "success" });
            } else {
              console.log(`Failed to send notification to user ${user_id}`);
              failedArr.push({ user_id, status: "failed" });
            }
          }
        } else {
          console.log(`Notification array check failed for user ${user_id}`);
          failedArr.push({ user_id, status: "failed" });
        }
      } catch (error) {
        // Log error for specific user, but continue processing others
        console.error(
          `Error sending notification to user ${user?.user_id}:`,
          error.message
        );
        failedArr.push({
          user_id: user?.user_id,
          status: "failed",
          error: error.message,
        });
      }
    }
    // After all notifications have been attempted, return the results
    return res.json({
      success: successArr.length > 0,
      success: true,
      msg:
        successArr.length > 0
          ? languageMessage.msgNotificationSendSuccess
          : "Failed to send notifications",
      successArr,
    });
  } catch (error) {
    console.error("Database error:", error.message);
    return res.json({
      success: false,
      msg: "Server error",
      key: error.message,
    });
  }
};
async function getNotificationArrSingle(
  user_id,
  other_user_id,
  action,
  action_id,
  subject,
  send_message,
  action_data
) {
  // return action_data;
  try {
    const insertStatus = await InsertNotification(
      user_id,
      other_user_id,
      action,
      action_id,
      JSON.stringify(action_data),
      subject[0],
      subject[0],
      subject[0],
      subject[0],
      send_message[0],
      send_message[0],
      send_message[0],
      send_message[0]
    );
    if (insertStatus === "yes") {

      const notificationStatus = await getNotificationStatus(other_user_id);
      if (notificationStatus === "yes") {
        const player_id = await getUserPlayerId(other_user_id);
        if (player_id != "no") {

          return {
            player_id: player_id,
            title: subject[0],
            message: send_message[0],
            action_json: action_data,
          };
        }
      }
    }
    return "NA";
  } catch (error) {
    console.error("Error in getNotificationArrSingle:", error);
    return error.message;
  }
}
async function InsertNotification(
  user_id,
  other_user_id,
  action,
  action_id,
  action_json,
  title,
  title_2,
  title_3,
  title_4,
  message,
  message_2,
  message_3,
  message_4
) {
  try {
    const read_status = 0;
    const delete_flag = 0;


    const query = "INSERT INTO user_notification_message (user_id, other_user_id, action, action_id, action_json, title,title_2,title_3,title_4, message,message_2,message_3,message_4, read_status, delete_flag, createtime, updatetime) VALUES (?,?,?,?,?, ?, ?, ?, ?, ?, ?,?,?,?, ?, now(), now())";
    const values = [
      user_id,
      other_user_id,
      action,
      action_id,
      action_json,
      title,
      title_2,
      title_3,
      title_4,
      message,
      message_2,
      message_3,
      message_4,
      read_status,
      delete_flag
    ];
    await connection.query(query, values);
    return "yes";
  } catch (error) {
    console.error("Error inserting notification:", error);
    return "no";
  }
}
async function getNotificationStatus(user_id) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT user_id FROM user_master WHERE user_id = ? AND notification_status = '1'";
    connection.query(sql, [user_id], (error, results) => {
      if (error) {
        console.error("Error getting notification status:", error);
        return resolve("no");
      } else {
        if (results.length > 0) {
          return resolve("yes");
        } else {
          return resolve("no");
        }
      }
    });
  });
}
const getNotification = (request, response) => {
  const { user_id } = request.query;
  console.log(user_id, "user_id");
  try {
    // Query to check if the user exists
    var sql1 = `SELECT user_id,active_flag FROM user_master WHERE delete_flag = 0 AND user_id = ?`;
    var values1 = [user_id];
    connection.query(sql1, values1, async (err, information) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          data: {},
        });
      }
      if (information.length === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      // var result = await cheakUseractiveDeactive(user_id);
      if (information[0].active_flag === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.accountdeactivated,
          active_status: 0,
        });
      }
      // Query to fetch notifications
      var sql =
        "SELECT um.username,um.image,um.f_name,um.l_name,unm.notification_message_id, unm.user_id, unm.other_user_id, unm.action, unm.action_id, unm.action_json, unm.title, unm.message, unm.title_2, unm.title_3, unm.title_4, unm.message_2, unm.message_3, unm.message_4, unm.title_ar, unm.message_arr, unm.read_status,unm.createtime FROM user_notification_message as unm , user_master as um WHERE unm.other_user_id = ? AND unm.delete_flag = 0 and um.user_id=unm.user_id ORDER BY unm.notification_message_id DESC";
      connection.query(sql, [user_id], async (err, info) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            err,
          });
        }

        try {
          const dateFormatter = new Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          const timeFormatter = new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          let notification_arr = await Promise.all(
            info.map(async (row) => {
              try {

                let date_time = calculateTimeElapsed(row.createtime);

                const date = new Date(row.createtime);
                const formattedDate = dateFormatter.format(date);
                const formattedTime = timeFormatter.format(date);
                return {
                  notification_message_id: row.notification_message_id,
                  user_id: row.user_id,
                  user_image: row.image != null ? row.image : "NA",
                  other_user_id: row.other_user_id,
                  username: row.username != null ? row.username : "NA",
                  f_name: row.f_name != null ? row.f_name : "NA",
                  l_name: row.l_name != null ? row.l_name : "NA",
                  action: row.action,
                  action_id: row.action_id,
                  action_json: row.action_json,
                  date_time: date_time,
                  title: row.title,
                  message: row.message,
                  read_status: row.read_status,
                  status: false,
                };
              } catch (error) {
                console.error("Error fetching user data:", error);
                throw error;
              }
            })
          );
          //update read status start
          let updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
          const updateRead = `UPDATE user_notification_message SET read_status = 1, updatetime = ? WHERE delete_flag = 0 AND other_user_id = ?`;
          connection.query(
            updateRead,
            [updatetime, user_id],
            (updateError, updateReadResult) => { }
          );
          //update read status end
          if (notification_arr.length <= 0) {
            notification_arr = "NA";
          }
          return response.status(200).json({
            success: true,
            message: languageMessage.msgDataFound,
            notification_arr: notification_arr,
          });
        } catch (error) {
          console.error("Error processing notifications:", error);
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error_new: error,
          });
        }
      });
    });
  } catch (error) {
    console.error("Error in try block:", error);
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
function calculateTimeElapsed(timestamp) {
  const givenTime = new Date(timestamp);
  const newTime = moment().format("YYYY-MM-DD HH:mm:ss");
  const currentTime = new Date(newTime);
  const timeDifference = currentTime - givenTime;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} ago`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }
}
// delete notification start
const deleteSingleNotification = (request, response) => {
  const { user_id, notification_message_id } = request.body;
  try {
    if (!user_id) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "user_id",
      });
    }
    if (!notification_message_id) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "notification_message_id",
      });
    }
    // cheak user start
    var sql1 = `SELECT user_id,active_flag FROM user_master WHERE delete_flag = 0 AND user_id = ?`;
    var values1 = [user_id];
    connection.query(sql1, values1, async (err, information) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          data: {},
        });
      }
      if (information.length === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgUserNotFound,
          data: {},
        });
      }
      // var result = await cheakUseractiveDeactive(user_id);
      if (information[0].active_flag === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.accountdeactivated,
          active_status: 0,
        });
      }
    });
    // cheak user end
    var sql1 = `SELECT notification_message_id FROM user_notification_message WHERE delete_flag = 0 AND notification_message_id = ?`;
    var values1 = [notification_message_id];
    connection.query(sql1, values1, async (err, information) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          data: {},
        });
      }
      if (information.length === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.NotificatiomsgDataFound,
          data: {},
        });
      }
      var sqlNotification =
        "SELECT notification_message_id,user_id FROM user_notification_message where notification_message_id = ? AND other_user_id = ?  AND delete_flag = 0";
      connection.query(
        sqlNotification,
        [notification_message_id, user_id],
        (err, result) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              key: "6",
            });
          } else {
            let delete_flag = 1;
            var sqlNotification =
              "UPDATE user_notification_message SET delete_flag = ? ,updatetime= now() WHERE notification_message_id=? AND other_user_id = ? ";
            connection.query(
              sqlNotification,
              [delete_flag, notification_message_id, user_id],
              (err, result) => {
                if (err) {
                  return response.status(200).json({
                    success: false,
                    msg: languageMessage.internalServerError,
                    key: "2",
                  });
                } else {
                  return response.status(200).json({
                    success: true,
                    msg: languageMessage.notificationDelete,
                  });
                }
              }
            );
          }
        }
      );
    });
  } catch (error) {
    console.error("Error in try block:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// delete notification end
// delete All notification start
const deleteAllNotification = (request, response) => {
  const { user_id } = request.body;
  try {
    if (!user_id) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "user_id",
      });
    }
    // cheak user start
    var sql1 = `SELECT user_id,active_flag FROM user_master WHERE delete_flag = 0 AND user_id = ?`;
    var values1 = [user_id];
    connection.query(sql1, values1, async (err, information) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          data: {},
        });
      }
      if (information.length === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgUserNotFound,
          data: {},
        });
      }
      if (information[0].active_flag === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.accountdeactivated,
          active_status: 0,
        });
      }
    });
    // cheak user end
    var sqlNotification =
      "SELECT notification_message_id FROM user_notification_message where other_user_id = ?  AND delete_flag = 0";
    connection.query(sqlNotification, [user_id], (err, result) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: "6",
        });
      } else {
        let delete_flag = 1;
        var sqlNotification =
          "UPDATE user_notification_message SET delete_flag = ? ,updatetime= now() WHERE  other_user_id = ? ";
        connection.query(
          sqlNotification,
          [delete_flag, user_id],
          (err, result) => {
            if (err) {
              return response.status(200).json({
                success: false,
                msg: languageMessage.internalServerError,
                key: "2",
              });
            } else {
              return response.status(200).json({
                success: true,
                msg: languageMessage.notificationDelete,
              });
            }
          }
        );
      }
    });
  } catch (error) {
    console.error("Error in try block:", error);
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// delete all notification end
async function oneSignalNotificationSendCall(notificationArr) {
  if (notificationArr !== "NA") {
    for (const notification of notificationArr) {
      const playerIdArr = [];
      if (notification.player_id !== "") {
        playerIdArr.push(notification.player_id);
        const languageId = 0;
        const title = notification.title;
        const message = notification.message;
        const actionJson = notification.action_json;
        return await oneSignalNotificationSend(
          title,
          message,
          actionJson,
          playerIdArr,
          languageId
        );
      }
    }
  }
}
//function 
async function oneSignalNotificationSend(
  title,
  message,
  jsonData,
  playerIdArr,
  languageId
) {
  //return title;
  const axios = require("axios");

  var oneSignalAppId = "c3a25067-c262-4916-8db6-56f2598bba14";
  var oneSignalAuthorization = "os_v2_app_yorfaz6cmjerndnwk3zftc52crzlq6ahr6yu2g5wiumvu47icqtjghyky6idkqi5aziuqlo3z43p6nvdmuu6u3pqxrisl5omi7u3dyi";

  // Define notification fields
  let fields;
  if (languageId === 0) {
    fields = {
      app_id: oneSignalAppId,
      contents: { en: message },
      headings: { en: title },
      include_player_ids: playerIdArr,
      data: { action_json: jsonData },
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
      priority: 10,
      big_picture: jsonData.image, // For Android - Add image to the notification
      ios_attachments: { id1: jsonData.image }, // For iOS - Add image to the notification
    };
  } else {
    fields = {
      app_id: oneSignalAppId,
      contents: { ar: message },
      headings: { ar: title },
      include_player_ids: playerIdArr,
      data: { action_json: jsonData },
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
      priority: 10,
      big_picture: jsonData.image, // For Android - Add image to the notification
      ios_attachments: { id1: jsonData.image }, // For iOS - Add image to the notification
    };
  }
  try {
    const response = await axios.post(
      "https://onesignal.com/api/v1/notifications",
      fields,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Basic ${oneSignalAuthorization}`,
        },
      }
    );
    if (response.status === 200) {
      return response.data;
    } else {
      return response.data;
    }
  } catch (error) {

    return error.message;
  }
}
async function getUserPlayerId(user_id) {
  try {
    const query = "SELECT player_id FROM user_notification WHERE user_id = ?";
    return new Promise((resolve, reject) => {
      connection.query(query, [user_id], (error, rows) => {
        if (error) {
          console.error("Error fetching user player id:", error);
          return resolve("no");
        }
        resolve(rows.length > 0 ? rows[0].player_id : "no");
      });
    });
  } catch (error) {
    console.error("Error fetching user player id:", error);
    return "no";
  }
}
// Function to get user language id
async function getUserLanguageId(user_id) {
  try {
    const query = "SELECT language_id FROM user_master WHERE user_id = ?";
    return new Promise((resolve, reject) => {
      connection.query(query, [user_id], (error, rows) => {
        if (error) {
          console.error("Error fetching user language id:", error);
          return resolve(0); // Return 0 in case of an error
        }
        // Resolve with language_id or 0 if no rows found
        resolve(rows.length > 0 ? rows[0].language_id : 0);
      });
    });
  } catch (error) {
    console.error("Error fetching user language id:", error);
    return error.message; // Return 0 in case of an unexpected error
  }
}
// get notification count start
const getNotificationCount = async (request, response) => {
  const { user_id } = request.query;
  try {
    if (!user_id) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "user_id",
      });
    }
    var sqlVal =
      "SELECT user_id,active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
    await connection.query(sqlVal, [user_id], async (err, info) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (info.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (info[0].active_flag === 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.accountdeactivated,
          active_status: 0,
        });
      }
      // check notification count start
      const getCount =
        "SELECT count(notification_message_id) as count FROM user_notification_message WHERE delete_flag=0 and other_user_id=? and read_status = 0";
      await connection.query(
        getCount,
        [user_id],
        (getCountError, getCountResult) => {
          if (getCountError) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              getCountError,
            });
          }
          let notificationCount = 0;
          if (getCountResult.length > 0) {
            notificationCount = getCountResult[0].count;
          }
          return response.status(200).json({
            success: true,
            msg: languageMessage.msgDataFound,
            notificationCount,
          });
        }
      );
      // check notification count end
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
// get notification count end
async function getUser(userId) {
  return new Promise((resolve, reject) => {
    const query1 =
      "SELECT  `user_id`, `login_type`, `login_type_first`, `user_type`, `email`, `password`, `username`, `f_name`, `l_name`, `name`, `dob`, `age`, `phone_code`, `mobile`, `otp`, `otp_verify`, `image`, `gender`, `address`, `latitude`, `longitude`, `zipcode`, `bio`, `bio_type`, `active_flag`, `approve_flag`, `profile_complete`, `language_id`, `facebook_id`, `google_id`, `twitter_id`, `instagram_id`, `apple_id`, `notification_status`, `delete_flag`, `delete_reason`, `createtime`, `updatetime`, `mysqltime`, `signup_step`, `avatar_id`, `currect_location_permanent`, `about` FROM user_master WHERE user_id = ? and delete_flag=0";
    connection.query(query1, [userId], async (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      if (results.length > 0) {
        const user = results[0];
        try {
          const userDataArray = {
            user_id: user.user_id,
            login_type: user.login_type,
            login_type_first: user.login_type_first,
            user_type: user.user_type,
            email: user.email,
            username: user.username,
            f_name: user.f_name,
            l_name: user.l_name,
            name: user.name,
            dob: user.dob,
            age: user.age,
            phone_code: user.phone_code,
            mobile: user.mobile,
            otp: user.otp,
            otp_verify: user.otp_verify,
            image: user.image,
            gender: user.gender,
            address: user.address,
            latitude: user.latitude,
            longitude: user.longitude,
            zipcode: user.zipcode,
            active_flag: user.active_flag,
            approve_flag: user.approve_flag,
            profile_complete: user.profile_complete,
            language_id: user.language_id,
            facebook_id: user.facebook_id,
            google_id: user.google_id,
            apple_id: user.apple_id,
            notification_status: user.notification_status,
            delete_reason: user.delete_reason,
            createtime: user.createtime,
            updatetime: user.updatetime,
            bio: user.bio,
            bio_type: user.bio_type,
            signup_step: user.signup_step,
            about: user.about,
          };
          resolve(userDataArray);
        } catch (err) {
          reject(err);
        }
      } else {
        resolve(null);
      }
    });
  });
}
// notification count start
function getNotificationCountOtherUser(user_id) {
  const getCount =
    "SELECT count(notification_message_id) as count FROM user_notification_message WHERE delete_flag=0 and other_user_id=? and read_status = 0";
  return new Promise((resolve, reject) => {
    connection.query(getCount, [user_id], (err, result) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(result[0].count);
      }
    });
  });
}
const getExportDetails = async (request, response) => {
  var { expert_id } = request.params;
  try {
    expert_id = decode(expert_id);
    const fetchDetails = `SELECT 
    um.user_id, 
    um.f_name, 
    um.l_name, 
    um.name, 
    um.image, 
    um.email, 
    um.mobile, 
    um.dob, 
    um.address, 
    um.bio, 
    um.gender, 
    um.experience, 
    um.createtime, 
    um.active_flag, 
    um.gst_number, 
    um.adhar_number, 
    um.pan_number, 
    um.phone_code, 
    um.delete_flag, 
    um.delete_reason, 
    um.bank_user_name, 
    um.bank_name, 
    um.bank_account_no, 
    um.bank_branch, 
    um.ifsc_code,
    GROUP_CONCAT(DISTINCT dm.name SEPARATOR ', ') AS degrees,
    GROUP_CONCAT(DISTINCT lm.name SEPARATOR ', ') AS languages,
    cm.name AS category,
    scm.sub_category_name AS sub_category,
    GROUP_CONCAT(DISTINCT slcm.sub_level_category_name SEPARATOR ', ') AS sub_level_categories,
    um.licence_number,
    um.referral_number,
    um.call_charge,
    um.chat_charge,
    um.video_call_charge,
    um.expert_status,
    um.inactive_customer,
    um.inactive_date_time,
    um.	last_login_date_time,
  GROUP_CONCAT(DISTINCT fm.file_name SEPARATOR ', ') AS file_urls,
  GROUP_CONCAT(DISTINCT udm.document_file SEPARATOR ', ') AS document_file_urls,
 um.special_skills,um.industry_name,um.institute_name,COALESCE(sm.state_name, 'NA') AS state_name,  COALESCE(cty.city_name, 'NA') AS city_name
FROM 
    user_master um
LEFT JOIN degree_master dm 
    ON FIND_IN_SET(dm.degree_id, um.degree) > 0
LEFT JOIN language_master lm 
    ON FIND_IN_SET(lm.language_id, um.language) > 0
LEFT JOIN categories_master cm 
    ON um.category = cm.category_id
LEFT JOIN sub_categories_master scm   
    ON um.sub_category = scm.sub_category_id
LEFT JOIN sub_level_categories_master slcm 
    ON FIND_IN_SET(slcm.sub_level_category_id, um.sub_category_level) > 0
   LEFT JOIN file_master fm 
    ON um.user_id = fm.user_id
     LEFT JOIN user_degree_master udm 
    ON um.user_id = udm.user_id
     LEFT JOIN state_master sm 
    ON um.state = sm.state_id
    LEFT JOIN city_master cty 
    ON um.city= cty.city_id
WHERE 
    um.user_type = 2 
    AND um.user_id = ?
GROUP BY 
    um.user_id
ORDER BY 
    um.user_id DESC`;
    connection.query(fetchDetails, [expert_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      // Add total milestones
      const user = res[0];
      user.total_milestones = await new Promise((resolve) => {
        const milestoneQuery = `
          SELECT COUNT(mm.milestone_id) AS milestone_count 
          FROM job_post_master jpm 
          JOIN milestone_master mm ON jpm.job_post_id = mm.job_post_id 
          WHERE mm.delete_flag = 0 AND jpm.delete_flag = 0 AND jpm.assign_expert_id = ?;
        `;
        connection.query(milestoneQuery, [user.user_id], (err, result) => {
          resolve(err || result.length === 0 ? 0 : result[0].milestone_count);
        });
      });
      user.total_expert_earning = await new Promise((resolve) => {
        const milestoneQuery1 = `
    SELECT SUM(expert_earning) AS total_earning
    FROM expert_earning_master
    WHERE delete_flag = 0 AND expert_id = ?;
  `;
        connection.query(
          milestoneQuery1,
          [user.user_id],
          (err, earningresult) => {
            if (err) {
              console.error("Error fetching total expert earnings:", err);
              resolve(0);
            } else {
              resolve(
                !earningresult || earningresult[0].total_earning === null
                  ? 0
                  : earningresult[0].total_earning
              );
            }
          }
        );
      });
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        export_arr: user,
      });
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};

//Fetch SubCategory
const FetchSubCategory = async (request, response) => {
  var FetchSubCategory =
    "SELECT  scm.sub_category_id, scm.category_id,cm.name as category_name, scm.sub_category_name, scm.image, scm.createtime FROM sub_categories_master scm join categories_master cm ON scm.category_id = cm.category_id WHERE scm.delete_flag = 0 and cm.delete_flag = 0 and cm.category_type=3 order by scm.sub_category_id desc ";
  connection.query(FetchSubCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
//Delete Category
const DeleteSubCategory = async (request, response) => {
  const { subcategory_id } = request.body;
  if (!subcategory_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check =
      "SELECT sub_category_id FROM sub_categories_master WHERE delete_flag = 0 and sub_category_id=?";
    connection.query(Check, [subcategory_id], async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgSubcategoryNotFound,
        });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE sub_categories_master SET delete_flag = 1 WHERE sub_category_id = ?";
        connection.query(Delete, [subcategory_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.SubcategoryDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const getCatgoryAll = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT category_id, name  FROM categories_master WHERE delete_flag = 0 and category_type=3 order by category_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgCategoryNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
// Add Subcategory
const AddSubCategory = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }


  let { action, name, category_id, image } = request.body;
  // if (!action && action == "add_subcategory") {
  //   return response
  //     .status(200)
  //     .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  // }
  if (!name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckCategory = "";
  try {
    CheckCategory =
      "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_name = ? AND category_id=? AND delete_flag = 0";
    connection.query(CheckCategory, [name, category_id], (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.SubcategoryAleradyExist,
          key: "categoryExists",
        });
      }
      // const image = request.file ? request.file.filename : "";
      let Insert =
        "INSERT INTO sub_categories_master(sub_category_name, category_id, createtime";
      let values = [name, category_id];
      // Check if image exists
      if (image) {
        Insert += ", image"; // Add image column to the query
        values.push(image); // Add image value to the parameters
      }
      Insert += ") VALUES (?,?, NOW()";
      if (image) {
        Insert += ", ?"; // Add placeholder for image value
      }
      Insert += ")"; // Closing the VALUES clause
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        } else {
          return response.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAdded,
            key: "added",
          });
        }
      });
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const UpdateSubCategory = (req, res) => {
  try {
    // Check if required fields are provided
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let { subcategory_id, action, name, category_id, image } = req.body;
    if (!action && action == "edit_subcategory") {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!subcategory_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!name) {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    let CheckCategory = "";
    CheckCategory =
      "SELECT sub_category_name, image FROM sub_categories_master WHERE sub_category_name = ? AND sub_category_id != ? AND delete_flag = 0 ";
    connection.query(CheckCategory, [name, subcategory_id], (err, result) => {
      if (err) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (result.length > 0) {
        return res.status(200).json({
          success: true,
          msg: languageMessage.SubcategoryAleradyExist,
          key: "categoryExists",
        });
      }

      // Proceed to update brand detailsconst { blog_id, action, category_id, title, description }
      let updateQuery =
        "UPDATE sub_categories_master SET sub_category_name = ?,category_id=?, updatetime = ?";
      let queryValues = [name, category_id, updatetime];
      // Check if an image was uploaded
      if (image) {
        // Include image update in the query
        updateQuery += ", image = ?";
        queryValues.push(image);
      }
      updateQuery += " WHERE sub_category_id = ?";
      queryValues.push(subcategory_id);
      // Execute the database update query
      connection.query(updateQuery, queryValues, (error, results) => {
        if (error) {
          console.error("Error executing MySQL query:", error);
          return res
            .status(500)
            .json({ success: false, msg: languageMessage.internalServerError });
        }
        // Check if any rows were affected
        if (results.affectedRows === 0) {
          return res
            .status(500)
            .json({ success: false, msg: languageMessage.internalServerError });
        } else {
          return res.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryUpdated,
          });
        }
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};


//Fetch SubCategory
const FetchSubLevelCategory = async (request, response) => {
  var FetchSubCategory =
    "SELECT slcm.sub_level_category_id, slcm.sub_category_id, slcm.sub_level_category_name, slcm.sub_two_level_category_name, slcm.sub_three_level_category_name, slcm.delete_flag, slcm.createtime,scm.sub_category_name FROM sub_level_categories_master slcm join sub_categories_master scm ON slcm.sub_category_id=scm.sub_category_id join categories_master cm on scm.category_id=cm.category_id WHERE cm.delete_flag = 0 AND scm.delete_flag = 0 and slcm.delete_flag = 0 order by slcm.sub_level_category_id desc ";
  connection.query(FetchSubCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const FetchSubTwoLevelCategory = async (request, response) => {
  var FetchSubCategory =
    "SELECT slcm.sub_two_level_category_id, slcm.sub_one_level_category_id, slcm.sub_two_level_category_name,slcm.delete_flag, slcm.createtime,scm.sub_level_category_name FROM sub_two_level_categories_master slcm join sub_level_categories_master scm ON slcm.sub_one_level_category_id=scm.sub_level_category_id WHERE  scm.delete_flag = 0 and slcm.delete_flag = 0 order by slcm.sub_two_level_category_id desc ";
  connection.query(FetchSubCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const FetchSubThreeLevelCategory = async (request, response) => {
  var FetchSubCategory =
    "SELECT slcm.sub_three_level_category_id, slcm.sub_two_level_category_id, slcm.sub_three_level_category_name,slcm.delete_flag, slcm.createtime,scm.sub_two_level_category_name FROM sub_three_level_categories_master slcm join sub_two_level_categories_master scm ON slcm.sub_two_level_category_id=scm.sub_two_level_category_id WHERE  scm.delete_flag = 0 and slcm.delete_flag = 0 order by slcm.sub_three_level_category_id desc ";
  connection.query(FetchSubCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const DeleteSubLevelCategory = async (request, response) => {
  const { sub_level_category_id } = request.body;
  if (!sub_level_category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check =
      "SELECT sub_level_category_id FROM sub_level_categories_master WHERE delete_flag = 0 and sub_level_category_id=?";
    connection.query(Check, [sub_level_category_id], async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgSubcategoryNotFound,
        });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE sub_level_categories_master SET delete_flag = 1 WHERE sub_level_category_id = ?";
        connection.query(Delete, [sub_level_category_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.SubcategoryDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const DeleteSubTwoLevelCategory = async (request, response) => {
  const { sub_level_category_id } = request.body;
  if (!sub_level_category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check =
      "SELECT sub_two_level_category_id FROM sub_two_level_categories_master WHERE delete_flag = 0 and sub_two_level_category_id=?";
    connection.query(Check, [sub_level_category_id], async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgSubcategoryNotFound,
        });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE sub_two_level_categories_master SET delete_flag = 1 WHERE sub_two_level_category_id = ?";
        connection.query(Delete, [sub_level_category_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.SubcategoryDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const DeleteSubThreeLevelCategory = async (request, response) => {
  const { sub_level_category_id } = request.body;
  if (!sub_level_category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check =
      "SELECT sub_three_level_category_id FROM sub_three_level_categories_master WHERE delete_flag = 0 and sub_three_level_category_id=?";
    connection.query(Check, [sub_level_category_id], async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.msgSubcategoryNotFound,
        });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE sub_three_level_categories_master SET delete_flag = 1 WHERE sub_three_level_category_id = ?";
        connection.query(Delete, [sub_level_category_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.SubcategoryDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const getSubCatgoryAll = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT sub_category_id, sub_category_name,name  FROM sub_categories_master scm join categories_master cm ON scm.category_id = cm.category_id WHERE  scm.delete_flag = 0  and cm.delete_flag = 0 and cm.category_type=3 order by scm.sub_category_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgCategoryNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getSubOneCatgoryAll = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT scm.sub_level_category_id, scm.sub_level_category_name,cm.sub_category_name  FROM sub_level_categories_master scm join sub_categories_master cm ON scm.sub_category_id = cm.sub_category_id WHERE  scm.delete_flag = 0  and cm.delete_flag = 0  order by scm.sub_level_category_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgCategoryNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getSubTwoCatgoryAll = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT scm.sub_two_level_category_id , scm.sub_two_level_category_name	,cm.sub_level_category_name  FROM sub_two_level_categories_master scm join sub_level_categories_master cm ON scm.sub_one_level_category_id = cm.sub_level_category_id WHERE  scm.delete_flag = 0  and cm.delete_flag = 0  order by scm.sub_two_level_category_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgCategoryNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const UpdateSubLevelCategory = (req, res) => {
  try {
    // Check if required fields are provided
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let {
      sublevel_category_id,
      action,
      name,
      nametwo,
      namethree,
      subcategory_id,
    } = req.body;
    if (!action && action == "edit_sublevelcategory") {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!subcategory_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!sublevel_category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!name) {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    let CheckCategory = "";
    CheckCategory =
      "SELECT sub_level_category_id FROM sub_level_categories_master WHERE LOWER(sub_level_category_name) = LOWER(?)  AND LOWER(sub_two_level_category_name) = LOWER(?)  AND LOWER(sub_three_level_category_name) = LOWER(?)  AND sub_category_id=? AND sub_level_category_id != ? AND delete_flag = 0 ";
    connection.query(
      CheckCategory,
      [name, nametwo, namethree, subcategory_id, sublevel_category_id],
      (err, result) => {
        if (err) {
          return res.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (result.length > 0) {
          return res.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAleradyExist,
            key: "categoryExists",
          });
        }
        // Proceed to update brand detailsconst { blog_id, action, category_id, title, description }
        let updateQuery =
          "UPDATE sub_level_categories_master SET sub_level_category_name = ?,sub_two_level_category_name = ?,sub_three_level_category_name = ?,sub_category_id=?, updatetime = ?";
        let queryValues = [
          name,
          nametwo,
          namethree,
          subcategory_id,
          updatetime,
        ];
        updateQuery += " WHERE sub_level_category_id = ?";
        queryValues.push(sublevel_category_id);
        // Execute the database update query
        connection.query(updateQuery, queryValues, (error, results) => {
          if (error) {
            console.error("Error executing MySQL query:", error);
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          }
          // Check if any rows were affected
          if (results.affectedRows === 0) {
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          } else {
            return res.status(200).json({
              success: true,
              msg: languageMessage.SubcategoryUpdated,
            });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const UpdateSubTwoLevelCategory = (req, res) => {
  try {
    // Check if required fields are provided
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let {
      sub_two_level_category_id,
      action,
      name,
      sub_one_category_id,
    } = req.body;
    if (!action && action == "edit_subtwolevelcategory") {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!sub_one_category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!sub_two_level_category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!name) {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    let CheckCategory = "";
    CheckCategory =
      "SELECT sub_two_level_category_id FROM sub_two_level_categories_master WHERE LOWER(sub_two_level_category_name) = LOWER(?) AND  sub_one_level_category_id=? AND sub_two_level_category_id != ? AND delete_flag = 0";
    connection.query(
      CheckCategory,
      [name, sub_one_category_id, sub_two_level_category_id],
      (err, result) => {
        if (err) {
          return res.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (result.length > 0) {
          return res.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAleradyExist,
            key: "categoryExists",
          });
        }
        // Proceed to update brand detailsconst { blog_id, action, category_id, title, description }
        let updateQuery =
          "UPDATE sub_two_level_categories_master SET sub_two_level_category_name = ?,sub_one_level_category_id=?, updatetime = ?";
        let queryValues = [
          name,
          sub_one_category_id,
          updatetime,
        ];
        updateQuery += " WHERE sub_two_level_category_id = ?";
        queryValues.push(sub_two_level_category_id);
        // Execute the database update query
        connection.query(updateQuery, queryValues, (error, results) => {
          if (error) {
            console.error("Error executing MySQL query:", error);
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          }
          // Check if any rows were affected
          if (results.affectedRows === 0) {
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          } else {
            return res.status(200).json({
              success: true,
              msg: languageMessage.SubcategoryUpdated,
            });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const UpdateSubThreeLevelCategory = (req, res) => {
  try {
    // Check if required fields are provided
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let {
      sub_three_level_category_id,
      action,
      name,
      sub_two_category_id,
    } = req.body;
    if (!action && action == "edit_subthreelevelcategory") {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!sub_two_category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!sub_three_level_category_id) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!name) {
      return res.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    let CheckCategory = "";
    CheckCategory =
      "SELECT sub_three_level_category_id FROM sub_three_level_categories_master WHERE LOWER(sub_three_level_category_name) = LOWER(?) AND  sub_two_level_category_id=? AND sub_three_level_category_id != ? AND delete_flag = 0";
    connection.query(
      CheckCategory,
      [name, sub_two_category_id, sub_three_level_category_id],
      (err, result) => {
        if (err) {
          return res.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (result.length > 0) {
          return res.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAleradyExist,
            key: "categoryExists",
          });
        }
        // Proceed to update brand detailsconst { blog_id, action, category_id, title, description }
        let updateQuery =
          "UPDATE sub_three_level_categories_master SET sub_three_level_category_name = ?,sub_two_level_category_id=?, updatetime = ?";
        let queryValues = [
          name,
          sub_two_category_id,
          updatetime,
        ];
        updateQuery += " WHERE sub_three_level_category_id = ?";
        queryValues.push(sub_three_level_category_id);
        // Execute the database update query
        connection.query(updateQuery, queryValues, (error, results) => {
          if (error) {
            console.error("Error executing MySQL query:", error);
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          }
          // Check if any rows were affected
          if (results.affectedRows === 0) {
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          } else {
            return res.status(200).json({
              success: true,
              msg: languageMessage.SubcategoryUpdated,
            });
          }
        });
      }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const AddSubLevelCategory = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name, nametwo, namethree, subcategory_id } = request.body;
  if (!action && action == "add_sublevelcategory") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!subcategory_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckCategory = "";
  try {
    CheckCategory =
      "SELECT sub_level_category_id FROM sub_level_categories_master WHERE LOWER(sub_level_category_name) = LOWER(?) AND LOWER(sub_two_level_category_name) = LOWER(?) AND LOWER(sub_three_level_category_name) = LOWER(?) AND  sub_category_id=? AND delete_flag = 0";
    connection.query(
      CheckCategory,
      [name, nametwo, namethree, subcategory_id],
      (err, res) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (res.length > 0) {
          return response.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAleradyExist,
            key: "categoryExists",
          });
        }
        const image = request.file ? request.file.filename : "";
        let Insert =
          "INSERT INTO sub_level_categories_master(sub_level_category_name,sub_two_level_category_name,sub_three_level_category_name, sub_category_id, createtime) VALUES (?,?,?,?, NOW())";
        let values = [name, nametwo, namethree, subcategory_id];
        // Check if image exists
        connection.query(Insert, values, (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.SubcategoryAdded,
              key: "added",
            });
          }
        });
      }
    );
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const AddSubTwoLevelCategory = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name, sub_one_category_id } = request.body;
  if (!action && action == "add_subtwolevelcategory") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!sub_one_category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckCategory = "";
  try {
    CheckCategory =
      "SELECT sub_two_level_category_id FROM sub_two_level_categories_master WHERE LOWER(sub_two_level_category_name) = LOWER(?) AND  sub_one_level_category_id=? AND delete_flag = 0";
    connection.query(
      CheckCategory,
      [name, sub_one_category_id],
      (err, res) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (res.length > 0) {
          return response.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAleradyExist,
            key: "categoryExists",
          });
        }
        let Insert =
          "INSERT INTO sub_two_level_categories_master(sub_two_level_category_name,sub_one_level_category_id, createtime) VALUES (?,?, NOW())";
        let values = [name, sub_one_category_id];
        // Check if image exists
        connection.query(Insert, values, (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.SubcategoryAdded,
              key: "added",
            });
          }
        });
      }
    );
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const AddSubThreeLevelCategory = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name, sub_two_category_id } = request.body;
  if (!action && action == "add_subthreelevelcategory") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!sub_two_category_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckCategory = "";
  try {
    CheckCategory =
      "SELECT sub_three_level_category_id FROM sub_three_level_categories_master WHERE LOWER(sub_three_level_category_name) = LOWER(?) AND  sub_two_level_category_id=? AND delete_flag = 0";
    connection.query(
      CheckCategory,
      [name, sub_two_category_id],
      (err, res) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (res.length > 0) {
          return response.status(200).json({
            success: true,
            msg: languageMessage.SubcategoryAleradyExist,
            key: "categoryExists",
          });
        }
        let Insert =
          "INSERT INTO sub_three_level_categories_master(sub_three_level_category_name,sub_two_level_category_id, createtime) VALUES (?,?, NOW())";
        let values = [name, sub_two_category_id];
        // Check if image exists
        connection.query(Insert, values, (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.SubcategoryAdded,
              key: "added",
            });
          }
        });
      }
    );
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const FetchDegree = async (request, response) => {
  var FetchSubCategory =
    "SELECT degree_id, name,createtime FROM degree_master  WHERE delete_flag = 0 order by degree_id desc ";
  connection.query(FetchSubCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const AddDegree = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name } = request.body;
  if (!action && action == "add_degree") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckDegree = "";
  try {
    CheckDegree =
      "SELECT name FROM degree_master WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND delete_flag = 0";
    connection.query(CheckDegree, [name], (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.DegreeAleradyExist,
          key: "Exists",
        });
      }
      let Insert =
        "INSERT INTO degree_master(name,createtime) VALUES (?, NOW())";
      let values = [name];
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        } else {
          return response.status(200).json({
            success: true,
            msg: languageMessage.DegreeAdded,
            key: "added",
          });
        }
      });
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
//Delete Category
const DeleteDegree = async (request, response) => {
  const { degree_id } = request.body;
  if (!degree_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check = "SELECT degree_id FROM degree_master WHERE delete_flag = 0";
    connection.query(Check, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE degree_master SET delete_flag = 1 WHERE degree_id = ?";
        connection.query(Delete, [degree_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.DegreeDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const EditDegree = (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const { degree_id, action, name } = req.body;
    // Validate required fields
    if (action !== "edit_degree") {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!degree_id || !name) {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    // Check if the degree name already exists
    const checkDegreeQuery = `
      SELECT name 
      FROM degree_master 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) 
      AND degree_id != ? 
      AND delete_flag = 0
    `;
    connection.query(checkDegreeQuery, [name, degree_id], (err, result) => {
      if (err) {
        console.error("Error executing check query:", err);
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          msg: languageMessage.SubcategoryAleradyExist,
          key: "Exists",
        });
      }
      // Update degree details
      const updateQuery = `
        UPDATE degree_master 
        SET name = ?, updatetime = ? 
        WHERE degree_id = ?
      `;
      const queryValues = [name, updatetime, degree_id];
      connection.query(updateQuery, queryValues, (error, results) => {
        if (error) {
          console.error("Error executing update query:", error);
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error,
          });
        }
        // Check if any rows were affected
        if (results.affectedRows === 0) {
          return res.status(200).json({
            success: false,
            msg: languageMessage.DegreeNotFound, // Use a more specific message
          });
        }
        return res.status(200).json({
          success: true,
          msg: languageMessage.DegreeUpdated,
        });
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const FetchLanguage = async (request, response) => {
  var FetchLanguage =
    "SELECT language_id, name,createtime FROM language_master  WHERE delete_flag = 0 order by language_id desc";
  connection.query(FetchLanguage, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const AddLanguage = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name } = request.body;
  if (!action && action == "add_language") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckDegree = "";
  try {
    CheckDegree =
      "SELECT name FROM language_master WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND delete_flag = 0";
    connection.query(CheckDegree, [name], (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.LanguageAleradyExist,
          key: "Exists",
        });
      }
      let Insert =
        "INSERT INTO language_master(name,createtime) VALUES (?, NOW())";
      let values = [name];
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        } else {
          return response.status(200).json({
            success: true,
            msg: languageMessage.LanguageAdded,
            key: "added",
          });
        }
      });
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const EditLanguage = (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const { language_id, action, name } = req.body;
    // Validate required fields
    if (action !== "edit_language") {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!language_id || !name) {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    // Check if the degree name already exists
    const checkDegreeQuery = `
      SELECT name 
      FROM language_master 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) 
      AND language_id != ? 
      AND delete_flag = 0
    `;
    connection.query(checkDegreeQuery, [name, language_id], (err, result) => {
      if (err) {
        console.error("Error executing check query:", err);
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (result.length > 0) {
        return res.status(400).json({
          success: false,
          msg: languageMessage.LanguageAleradyExist,
          key: "Exists",
        });
      }
      // Update degree details
      const updateQuery = `
        UPDATE language_master 
        SET name = ?, updatetime = ? 
        WHERE language_id = ?
      `;
      const queryValues = [name, updatetime, language_id];
      connection.query(updateQuery, queryValues, (error, results) => {
        if (error) {
          console.error("Error executing update query:", error);
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error,
          });
        }
        // Check if any rows were affected
        if (results.affectedRows === 0) {
          return res.status(200).json({
            success: false,
            msg: languageMessage.LanguageNotFound, // Use a more specific message
          });
        }
        return res.status(200).json({
          success: true,
          msg: languageMessage.LanguageUpdated,
        });
      });
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const DeleteLanguage = async (request, response) => {
  const { language_id } = request.body;
  if (!language_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check = "SELECT language_id FROM language_master WHERE delete_flag = 0";
    connection.query(Check, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE language_master SET delete_flag = 1 WHERE language_id = ?";
        connection.query(Delete, [language_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.LanguageDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const FetchSubscription = async (request, response) => {
  var FetchSubscription =
    "SELECT subscription_id, plan_type, amount, description, duration, createtime, updatetime FROM subscription_master  WHERE delete_flag = 0 order by subscription_id desc";
  connection.query(FetchSubscription, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const AddSubscription = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, plan_type, description, amount, duration } = request.body;
  if (!action && action == "add_subscription") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!plan_type) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckSubscription = "";
  try {
    CheckSubscription =
      "SELECT plan_type FROM subscription_master WHERE LOWER(TRIM(duration)) = LOWER(TRIM(?)) AND amount=? AND plan_type=? AND delete_flag = 0";
    connection.query(
      CheckSubscription,
      [duration, amount, plan_type],
      (err, res) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (res.length > 0) {
          return response.status(200).json({
            success: true,
            msg: languageMessage.SubscriptionAleradyExist,
            key: "Exists",
          });
        }
        let Insert =
          "INSERT INTO subscription_master (plan_type,amount,duration,description,createtime) VALUES (?,?,?,?, NOW())";
        let values = [plan_type, amount, duration, description];
        connection.query(Insert, values, (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.SubscriptionAdded,
              key: "added",
            });
          }
        });
      }
    );
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
// Delete Subscription
const DeleteSubscription = async (request, response) => {
  const { subscription_id } = request.body;
  if (!subscription_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "subscription_id",
    });
  }
  try {
    var CheckSubscription =
      "SELECT subscription_id FROM subscription_master WHERE subscription_id = ? AND delete_flag = 0";
    connection.query(CheckSubscription, [subscription_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE subscription_master SET delete_flag = 1 WHERE subscription_id = ?";
        connection.query(Delete, [subscription_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.SubscriptionDeleted,
            });
          }
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error,
    });
  }
};
// Delete Subscription
const DeleteSubAdmin = async (request, response) => {
  const { user_id } = request.body;
  if (!user_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "user_id",
    });
  }
  try {
    var CheckUser =
      "SELECT user_id FROM user_master WHERE user_id = ? And user_type=3 AND delete_flag = 0";
    connection.query(CheckUser, [user_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete = "UPDATE user_master SET delete_flag = 1 WHERE user_id = ?";
        connection.query(Delete, [user_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: "Subadmin deleted successfully",
            });
          }
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error,
    });
  }
};

// Delete Job Post
const DeleteJobPost = async (request, response) => {
  const { job_post_id } = request.body;
  if (!job_post_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "job_post_id",
    });
  }
  try {

    var Delete = "UPDATE job_post_master SET delete_flag = 1 WHERE job_post_id = ?";
    connection.query(Delete, [job_post_id], async (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: "Job Post deleted successfully",
        });
      }
    });

  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error,
    });
  }
};


const ViewSubscription = async (request, response) => {
  const { subscription_id } = request.params;
  if (!subscription_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "hey",
    });
  }
  var checkUser =
    "SELECT subscription_id FROM subscription_master WHERE subscription_id = ?";
  connection.query(checkUser, [subscription_id], async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
    if (res[0].active_flag === 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.accountdeactivated });
    }
    if (res.length > 0) {
      var FetchDetails =
        "SELECT subscription_id, plan_type, amount, description, duration, delete_flag, createtime, updatetime, mysqltime from subscription_master WHERE subscription_id = ?";
      connection.query(FetchDetails, [subscription_id], async (err, res) => {
        if (err) {
          return response
            .status(200)
            .json({ success: false, msg: languageMessage.internalServerError });
        } else {
          return response
            .status(200)
            .json({ success: true, msg: languageMessage.msgDataFound, res });
        }
      });
    } else {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
  });
};
//Edit Subscription
const EditSubscription = async (request, response) => {
  var { subscription_id, plan_type, action, duration, amount, description } =
    request.body;
  if (
    !subscription_id &&
    !plan_type &&
    !action &&
    !amount &&
    !duration &&
    !description
  ) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "1",
    });
  }
  // Validate required fields
  if (action !== "edit_subscription") {
    return response.status(400).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "2",
    });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    const CheckSubscription =
      "SELECT plan_type FROM subscription_master WHERE LOWER(TRIM(duration)) = LOWER(TRIM(?)) AND amount=? AND plan_type=? AND subscription_id !=? AND delete_flag = 0";
    connection.query(
      CheckSubscription,
      [duration, amount, plan_type, subscription_id],
      (err, res) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (res.length > 0) {
          return response.status(200).json({
            success: true,
            msg: languageMessage.SubscriptionAleradyExist,
            key: "Exists",
          });
        }
        let Update =
          "UPDATE  subscription_master SET plan_type=?,amount=?,duration=?,description=?,updatetime=? where subscription_id=?";
        let values = [
          plan_type,
          amount,
          duration,
          description,
          updatetime,
          subscription_id,
        ];
        connection.query(Update, values, (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.SubscriptionUpdated,
              key: "update",
            });
          }
        });
      }
    );
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
//Fetch Category
const FetchFAQ = (req, res) => {
  try {
    let s_no = 1;
    const FaqQuery =
      "select  customer_support_id, question,answer, createtime FROM customer_support WHERE delete_flag = 0 ORDER BY customer_support_id DESC ";
    connection.query(FaqQuery, (error, results) => {
      if (error) {
        console.error("Error executing MySQL query:", error);
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (results.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      const faq_details = results.map((result) => ({
        srno: s_no++,
        customer_support_id: result.customer_support_id,
        question: result.question,
        answer: result.answer,
        createtime: result.createtime,
      }));
      const record = {
        success: true,
        msg: "faq data found",
        data: { faq_details },
      };
      res.json(record);
    });
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const AddFAQ = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, question, answer } = request.body;
  if (!action && action == "add_faq") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!question) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckQuestion = "";
  try {
    CheckQuestion =
      "SELECT question FROM customer_support WHERE LOWER(question) = LOWER(?) AND delete_flag = 0";
    connection.query(CheckQuestion, [question], (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.CategoryAleradyExist,
          key: "faqexist",
        });
      }
      let Insert =
        "INSERT INTO customer_support(question, answer, createtime) VALUES (?,?, NOW())";
      let values = [question, answer];
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        } else {
          return response.status(200).json({
            success: true,
            msg: languageMessage.FaqAdded,
            key: "added",
          });
        }
      });
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const EditFAQ = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, customer_support_id, question, answer } = request.body;
  if (!action && action == "edit_question") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!question) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  let CheckQuestion = "";
  try {
    CheckQuestion =
      "SELECT question FROM customer_support WHERE LOWER(question) = LOWER(?) AND customer_support_id !=?  And delete_flag = 0";
    connection.query(
      CheckQuestion,
      [question, customer_support_id],
      (err, res) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (res.length > 0) {
          return response.status(200).json({
            success: true,
            msg: languageMessage.QuestionAleradyExist,
            key: "Exists",
          });
        }
        let Update =
          "Update customer_support set question=? , answer=? , updatetime=? where customer_support_id=?";
        let values = [question, answer, updatetime, customer_support_id];
        connection.query(Update, values, (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response.status(200).json({
              success: true,
              msg: languageMessage.FaqAdded,
              key: "updated",
            });
          }
        });
      }
    );
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const DeleteFaq = async (request, response) => {
  const { customer_support_id } = request.body;
  console.log(customer_support_id);
  if (!customer_support_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check =
      "SELECT customer_support_id FROM customer_support WHERE delete_flag = 0";
    connection.query(Check, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE customer_support SET delete_flag = 1 WHERE customer_support_id = ?";
        connection.query(Delete, [customer_support_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.FaqDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const ViewFAQById = async (request, response) => {
  const { customer_support_id } = request.params;
  if (!customer_support_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "faq data",
    });
  }
  var FetchDetails =
    "SELECT  customer_support_id,question,answer, createtime FROM customer_support WHERE customer_support_id = ?";
  connection.query(FetchDetails, [customer_support_id], async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    } else if (res.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    } else {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const UpdateCallCharge = async (request, response) => {
  var FetchSubCategory =
    "SELECT `video_call_price_id`, `video_call_price`, `chat_price`, `delete_flag`, `createtime`, `updatetime`, `mysqltime` FROM `video_call_price_master`WHERE delete_flag = 0  order by video_call_price_id desc ";
  connection.query(FetchSubCategory, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (res.length <= 0) {
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataNotFound,
        res: [],
      });
    }
    if (res.length > 0) {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const EditExpertCallCharge = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { callValue, expert_id } = request.body;
  if (!expert_id && !callValue) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    let Update =
      "Update user_master set call_charge=? , updatetime=? where user_id=?";
    let values = [callValue, updatetime, expert_id];
    connection.query(Update, values, (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: languageMessage.CallUpdated,
          key: "updated",
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const EditCallCharge = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, user_id, video_call_price, chat_price, call_price } =
    request.body;
  if (!action && action == "edit_call_charge") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    let Update =
      "Update user_master set video_call_charge=? , call_charge=?, chat_charge=?  , updatetime=? where user_type=2 and user_id=?";
    let values = [
      video_call_price,
      call_price,
      chat_price,
      updatetime,
      user_id,
    ];
    connection.query(Update, values, (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: languageMessage.CallUpdated,
          key: "updated",
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const FetchCommission = (req, res) => {
  try {
    let s_no = 1;
    const FaqQuery =
      "select  commission_id, commission_percentage,consultation_percentage,createtime,mini_withdrawal_amt,withdrawal_updatetime,updatetime,platform_fee,gst,tds,tcs FROM commission_master WHERE delete_flag = 0 ORDER BY commission_id DESC ";
    connection.query(FaqQuery, (error, results) => {
      if (error) {
        console.error("Error executing MySQL query:", error);
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (results.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      const record = {
        success: true,
        msg: "data found",
        data: results,
      };
      res.json(record);
    });
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const EditMiniWithdrawalAmt = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, commission_id, mini_withdrawal_amt } = request.body;
  if (!action && action == "edit_mini_withdrawal_amt") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!commission_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    let Update =
      "Update commission_master set mini_withdrawal_amt=? , withdrawal_updatetime=? where commission_id=?";
    let values = [mini_withdrawal_amt, updatetime, commission_id];
    connection.query(Update, values, (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: "Minimum withdrawal amount updated",
          key: "updated",
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const EditCommission = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let {
    action,
    commission_id,
    commission_percentage,
    consultation_percentage,
    platform_fee
  } = request.body;
  if (!action && action == "edit_commission") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!commission_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    let Update =
      "Update commission_master set commission_percentage=? ,consultation_percentage=? ,platform_fee=?, updatetime=? where commission_id=?";
    let values = [
      commission_percentage,
      consultation_percentage,
      platform_fee,
      updatetime,
      commission_id,
    ];
    connection.query(Update, values, (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: "commission updated",
          key: "updated",
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const ManagePost = async (request, response) => {
  var Fetchpost =
    "SELECT jpm.job_post_id, jpm.user_id,um.name as user_name, jpm.assign_expert_id, jpm.status, jpm.title, jpm.category, jpm.sub_category, jpm.max_price, jpm.min_price, jpm.duration, jpm.description, jpm.file, jpm.nda_status, jpm.project_cost, jpm.delete_flag, jpm.createtime, jpm.updatetime, jpm.mysqltime FROM job_post_master as jpm JOIN user_master um ON jpm.user_id= um.user_id WHERE jpm.delete_flag = 0 order by jpm.job_post_id desc";
  try {
    connection.query(Fetchpost, async (err, posts) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.assign_expert_id) {
              const GetExpertName =
                "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
              post.expert_name = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.assign_expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve("NA");
                    else resolve(result[0].name);
                  }
                );
              });
            } else {
              post.expert_name = "NA";
            }
            // Fetch Category Name
            if (post.category) {
              const GetCategoryName =
                "SELECT name AS category_name FROM categories_master WHERE delete_flag = 0 AND category_id = ?";
              post.category_name = await new Promise((resolve) => {
                connection.query(
                  GetCategoryName,
                  [post.category],
                  (err, catresult) => {
                    if (err || catresult.length === 0) resolve("NA");
                    else resolve(catresult[0].category_name);
                  }
                );
              });
            } else {
              post.category_name = "NA";
            }
            // Fetch Subcategory Name
            if (post.sub_category) {
              const GetSubCategoryName =
                "SELECT sub_category_name AS subcategory_name FROM sub_categories_master WHERE delete_flag = 0 AND sub_category_id = ?";
              post.subcategory_name = await new Promise((resolve) => {
                connection.query(
                  GetSubCategoryName,
                  [post.sub_category],
                  (err, subcatresult) => {
                    if (err || subcatresult.length === 0) resolve("NA");
                    else resolve(subcatresult[0].subcategory_name);
                  }
                );
              });
            } else {
              post.subcategory_name = "NA";
            }
            return post;
          })
        );
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const ViewPostById = async (request, response) => {
  const { post_id } = request.params;
  if (!post_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "post_id",
    });
  }
  var Fetchpost =
    "SELECT jpm.job_post_id, jpm.user_id,um.name as user_name, jpm.assign_expert_id, jpm.status, jpm.title, jpm.category, jpm.sub_category, jpm.max_price, jpm.min_price, jpm.duration, jpm.description, jpm.file, jpm.nda_status, jpm.project_cost, jpm.delete_flag, jpm.createtime, jpm.updatetime, jpm.mysqltime FROM job_post_master as jpm  JOIN user_master um ON jpm.user_id= um.user_id WHERE jpm.delete_flag = 0 and jpm.job_post_id =?  order by jpm.job_post_id desc";
  try {
    connection.query(Fetchpost, [post_id], async (err, posts) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.assign_expert_id) {
              const GetExpertName =
                "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
              post.expert_name = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.assign_expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve("NA");
                    else resolve(result[0].name);
                  }
                );
              });
            } else {
              post.expert_name = "NA";
            }
            // Fetch Category Name
            if (post.category) {
              const GetCategoryName =
                "SELECT name AS category_name FROM categories_master WHERE delete_flag = 0 AND category_id = ?";
              post.category_name = await new Promise((resolve) => {
                connection.query(
                  GetCategoryName,
                  [post.category],
                  (err, catresult) => {
                    if (err || catresult.length === 0) resolve("NA");
                    else resolve(catresult[0].category_name);
                  }
                );
              });
            } else {
              post.category_name = "NA";
            }
            // Fetch Subcategory Name
            if (post.sub_category) {
              const GetSubCategoryName =
                "SELECT sub_category_name AS subcategory_name FROM sub_categories_master WHERE delete_flag = 0 AND sub_category_id = ?";
              post.subcategory_name = await new Promise((resolve) => {
                connection.query(
                  GetSubCategoryName,
                  [post.sub_category],
                  (err, subcatresult) => {
                    if (err || subcatresult.length === 0) resolve("NA");
                    else resolve(subcatresult[0].subcategory_name);
                  }
                );
              });
            } else {
              post.subcategory_name = "NA";
            }
            return post;
          })
        );
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getStateAll = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT `state_id`, `state_name`, `delete_flag`, `createtime`, `updatetime`, `mysqltime` FROM `state_master`  WHERE  delete_flag = 0  order by state_name ASC";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getCityAll = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT ct.city_id, ct.state_id,st.state_name, ct.city_name, ct.delete_flag, ct.createtime, ct.updatetime, ct.mysqltime FROM city_master ct JOIN state_master st ON ct.state_id =st.state_id WHERE  ct.delete_flag = 0 and st.delete_flag = 0 order by st.state_name ASC";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataFound, res });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const AddCity = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, city_name, state_id } = request.body;
  if (!action && action == "add_city") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!city_name) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  let CheckCity = "";
  try {
    CheckCity =
      "SELECT city_name FROM city_master WHERE LOWER(TRIM(city_name)) = LOWER(TRIM(?)) and state_id=? AND delete_flag = 0";
    connection.query(CheckCity, [city_name, state_id], (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.CityAleradyExist,
          key: "Exists",
        });
      }
      let Insert =
        "INSERT INTO city_master(city_name,state_id,createtime) VALUES (?,?, NOW())";
      let values = [city_name, state_id];
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(200).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        } else {
          return response.status(200).json({
            success: true,
            msg: languageMessage.CityAdded,
            key: "added",
          });
        }
      });
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const DeleteCity = async (request, response) => {
  const { city_id } = request.body;
  if (!city_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check = "SELECT city_id FROM city_master WHERE delete_flag = 0";
    connection.query(Check, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete = "UPDATE city_master SET delete_flag = 1 WHERE city_id = ?";
        connection.query(Delete, [city_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.CityDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const DeleteRating = async (request, response) => {
  const { rating_id } = request.body;
  if (!rating_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Check = "SELECT rating_id FROM rating_master WHERE delete_flag = 0";
    connection.query(Check, async (err, res) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        var Delete =
          "UPDATE rating_master SET delete_flag = 1 WHERE rating_id = ?";
        connection.query(Delete, [rating_id], async (err) => {
          if (err) {
            return response.status(200).json({
              success: false,
              msg: languageMessage.internalServerError,
              error: err,
            });
          } else {
            return response
              .status(200)
              .json({ success: true, msg: languageMessage.RatingDeleted });
          }
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (err) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError, err });
  }
};
const EditCity = (req, res) => {
  try {
    // Validate request body
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const { city_id, action, city_name, state_id } = req.body;
    // Validate required fields
    if (action !== "edit_city") {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    if (!city_id || !state_id || !city_name) {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        key: "2",
      });
    }
    const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
    // Check if the degree name already exists
    const checkDegreeQuery = `
      SELECT city_name 
      FROM city_master 
      WHERE LOWER(TRIM(city_name)) = LOWER(TRIM(?)) 
      AND state_id =? AND city_id != ? 
      AND delete_flag = 0
    `;
    connection.query(
      checkDegreeQuery,
      [city_name, state_id, city_id],
      (err, result) => {
        if (err) {
          console.error("Error executing check query:", err);
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        if (result.length > 0) {
          return res.status(200).json({
            success: true,
            msg: languageMessage.CityAleradyExist,
            key: "Exists",
          });
        }
        // Update degree details
        const updateQuery = `
        UPDATE city_master 
        SET city_name = ?,state_id=?, updatetime = ? 
        WHERE city_id = ?
      `;
        const queryValues = [city_name, state_id, updatetime, city_id];
        connection.query(updateQuery, queryValues, (error, results) => {
          if (error) {
            console.error("Error executing update query:", error);
            return res.status(500).json({
              success: false,
              msg: languageMessage.internalServerError,
              error,
            });
          }
          // Check if any rows were affected
          if (results.affectedRows === 0) {
            return res.status(200).json({
              success: false,
              msg: languageMessage.msgDataNotFound, // Use a more specific message
            });
          }
          return res.status(200).json({
            success: true,
            msg: languageMessage.CityUpdated,
          });
        });
      }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getRefundRequest = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT mm.milestone_id, mm.job_post_id, mm.milestone_number, mm.price, mm.duration, mm.duration_type, mm.description, mm.title, mm.status, mm.release_status, mm.released_date_time, mm.file, mm.milestone_status, mm.reject_reason, mm.delete_flag, mm.createtime, mm.updatetime, mm.mysqltime, mm.dispute_title, mm.dispute_description, mm.dispute_amount, mm.dispute_file,um.name,mm.mark_as_resolved FROM milestone_master mm JOIN job_post_master jpm ON mm.job_post_id =jpm.job_post_id LEFT JOIN user_master um ON jpm.user_id =um.user_id WHERE mm.delete_flag = 0 and mm.milestone_status=5 order by mm.milestone_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          request_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getWithdrawalRequest = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT ewm.expert_withdraw_id, ewm.expert_id,um.name, ewm.withdraw_status, ewm.withdraw_amount, ewm.transaction_id, ewm.transaction_date_time, ewm.total_earning_amount, ewm.earning_after_withdraw, ewm.withdraw_message, ewm.reason, ewm.delete_flag, ewm.createtime, ewm.updatetime, ewm.mysqltime ,um.bank_user_name, um.bank_name, um.bank_account_no, um.bank_branch, um.ifsc_code FROM expert_withdraw_master ewm JOIN user_master um ON ewm.expert_id=um.user_id WHERE um.user_type=2 and ewm.delete_flag = 0 order by ewm.expert_withdraw_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getWithdrawalRequestById = async (request, response) => {
  const { withdraw_id } = request.params;
  try {
    const fetchDetails =
      "SELECT ewm.expert_withdraw_id, ewm.expert_id,um.name,um.email,um.mobile,um.dob,um.age,um.phone_code,um.gender,um.gst_number,um.adhar_number,um.pan_number, ewm.withdraw_status, ewm.withdraw_amount, ewm.transaction_id, ewm.transaction_date_time, ewm.total_earning_amount, ewm.earning_after_withdraw, ewm.withdraw_message, ewm.reason, ewm.delete_flag, ewm.createtime, ewm.updatetime, ewm.mysqltime ,um.bank_user_name, um.bank_name, um.bank_account_no, um.bank_branch, um.ifsc_code FROM expert_withdraw_master ewm JOIN user_master um ON ewm.expert_id=um.user_id WHERE  ewm.expert_withdraw_id=? and  um.user_type=2 and ewm.delete_flag = 0 order by ewm.expert_withdraw_id desc";
    connection.query(fetchDetails, [withdraw_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const FetchSubscribedExpert = async (request, response) => {
  try {

    const fetchDetails =
      "SELECT sm.subscription_id, sm.plan_type, sm.amount AS subscription_amount, sm.description, sm.duration AS subscription_duration, sm.delete_flag AS subscription_delete_flag, sm.createtime AS subscription_createtime, sm.updatetime AS subscription_updatetime, esm.expert_subscription_id, esm.expert_id, esm.subscription_id AS esm_subscription_id, esm.amount AS expert_subscription_amount, esm.start_date, esm.end_date, esm.transaction_id, esm.status, esm.duration AS expert_subscription_duration, esm.plan_name, esm.delete_flag AS expert_subscription_delete_flag, esm.createtime AS expert_subscription_createtime, esm.updatetime AS expert_subscription_updatetime, esm.mysqltime AS expert_subscription_mysqltime,um.email,um.name,um.mobile FROM subscription_master sm JOIN expert_subscription_master esm ON sm.subscription_id = esm.subscription_id JOIN user_master um ON expert_id=um.user_id   WHERE um.user_type=2 and sm.delete_flag = 0 AND esm.delete_flag = 0";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const viewExpertEye = async (request, response) => {
  var FetchDetails =
    "SELECT expert_eye_id, content, createtime FROM expert_eye_master WHERE delete_flag = 0 AND expert_eye_id = 1";
  connection.query(FetchDetails, async (err, res) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    } else if (res.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgDataNotFound });
    } else {
      return response
        .status(200)
        .json({ success: true, msg: languageMessage.msgDataFound, res });
    }
  });
};
const updateExpertEye = async (request, response) => {
  const { content } = request.body;
  if (!content) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
    });
  }
  const UpdateQuery =
    "UPDATE expert_eye_master SET content = ?, updatetime = NOW() WHERE expert_eye_id = 1 AND delete_flag = 0";
  connection.query(UpdateQuery, [content], (updateErr, updateRes) => {
    if (updateErr) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.internalServerError,
      });
    }
    return response.status(200).json({
      success: true,
      msg: languageMessage.msdExpEyeUpdate,
    });
  });
};
const getRating = async (request, response) => {
  try {
    const fetchDetails = `SELECT 
    rt.rating_id, 
    rt.expert_id, 
    expert.name AS expert_name, 
    rt.user_id, 
    user.name AS user_name, 
    rt.rating, 
    rt.review, 
    rt.delete_flag, 
    rt.createtime, 
    rt.updatetime, 
    rt.mysqltime 
  FROM 
    rating_master rt 
  JOIN 
    user_master user 
  ON 
    rt.user_id = user.user_id AND user.user_type = 1 
  JOIN 
    user_master expert 
  ON 
    rt.expert_id = expert.user_id AND expert.user_type = 2 
  WHERE 
    rt.delete_flag = 0 
  ORDER BY 
    rt.rating_id DESC`;
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getUserRating = async (request, response) => {
  let { user_id } = request.query;
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const fetchDetails = `SELECT 
    rt.rating_id, 
    rt.expert_id, 
    expert.name AS expert_name, 
    rt.user_id, 
    user.name AS user_name, 
    rt.rating, 
    rt.review, 
    rt.delete_flag, 
    rt.createtime, 
    rt.updatetime, 
    rt.mysqltime ,
    cm.name as category_name
  FROM 
    rating_master rt 
  JOIN 
    user_master user 
  ON 
    rt.user_id = user.user_id AND user.user_type = 1 
  JOIN 
    user_master expert 
  ON 
    rt.expert_id = expert.user_id AND expert.user_type = 2 
LEFT JOIN 
    categories_master cm 
ON expert.category = cm.category_id
  WHERE 
    rt.delete_flag = 0 AND rt.user_id = ?
  ORDER BY 
    rt.rating_id DESC`;
    connection.query(fetchDetails, [user_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getUserPost = async (request, response) => {
  let { user_id } = request.query;
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  var Fetchpost =
    "SELECT jpm.job_post_id, jpm.user_id,um.name as user_name, jpm.assign_expert_id, jpm.status, jpm.title, jpm.category, jpm.sub_category, jpm.max_price, jpm.min_price, jpm.duration, jpm.description, jpm.file, jpm.nda_status, jpm.project_cost, jpm.delete_flag, jpm.createtime, jpm.updatetime, jpm.mysqltime FROM job_post_master as jpm JOIN user_master um ON jpm.user_id= um.user_id WHERE jpm.delete_flag = 0 AND jpm.user_id = ? order by jpm.job_post_id desc";
  try {
    connection.query(Fetchpost, [user_id], async (err, posts) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.assign_expert_id) {
              const GetExpertName =
                "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
              post.expert_name = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.assign_expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve("NA");
                    else resolve(result[0].name);
                  }
                );
              });
            } else {
              post.expert_name = "NA";
            }
            // Fetch Category Name
            if (post.category) {
              const GetCategoryName =
                "SELECT name AS category_name FROM categories_master WHERE delete_flag = 0 AND category_id = ?";
              post.category_name = await new Promise((resolve) => {
                connection.query(
                  GetCategoryName,
                  [post.category],
                  (err, catresult) => {
                    if (err || catresult.length === 0) resolve("NA");
                    else resolve(catresult[0].category_name);
                  }
                );
              });
            } else {
              post.category_name = "NA";
            }
            // Fetch Subcategory Name
            if (post.sub_category) {
              const GetSubCategoryName =
                "SELECT sub_category_name AS subcategory_name FROM sub_categories_master WHERE delete_flag = 0 AND sub_category_id = ?";
              post.subcategory_name = await new Promise((resolve) => {
                connection.query(
                  GetSubCategoryName,
                  [post.sub_category],
                  (err, subcatresult) => {
                    if (err || subcatresult.length === 0) resolve("NA");
                    else resolve(subcatresult[0].subcategory_name);
                  }
                );
              });
            } else {
              post.subcategory_name = "NA";
            }
            return post;
          })
        );
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getPostMilestone = async (request, response) => {
  let { job_post_id } = request.query;
  if (!job_post_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    var Fetchpost =
      "SELECT milestone_id,job_post_id,milestone_number,price,duration,description,status,release_status,file,released_date_time,createtime,updatetime FROM milestone_master WHERE delete_flag = 0 AND job_post_id = ? order by milestone_number ASC";
    connection.query(Fetchpost, [job_post_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          milestone_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getExpertRating = async (request, response) => {
  let { expert_id } = request.query;
  if (!expert_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const fetchDetails = `SELECT 
    rt.rating_id, 
    rt.expert_id, 
    expert.name AS expert_name, 
    rt.user_id, 
    user.name AS user_name, 
    rt.rating, 
    rt.review, 
    rt.delete_flag, 
    rt.createtime, 
    rt.updatetime, 
    rt.mysqltime 
  FROM 
    rating_master rt 
  JOIN 
    user_master user 
  ON 
    rt.user_id = user.user_id AND user.user_type = 1 
  JOIN 
    user_master expert 
  ON 
    rt.expert_id = expert.user_id AND expert.user_type = 2 
  WHERE 
    rt.delete_flag = 0 AND rt.expert_id = ?
  ORDER BY 
    rt.rating_id DESC`;
    connection.query(fetchDetails, [expert_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getEarningById = async (request, response) => {
  let { expert_id } = request.query;
  if (!expert_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const fetchDetails = `SELECT em.expert_earning_id, em.type,em.subscription_type, em.user_id,um.name, em.expert_id, em.milestone_id, em.total_amount, em.commission_percentage, em.admin_commission_amount, em.expert_earning, em.transition_id, em.invoice_url, em.delete_flag, em.createtime,ms.milestone_number,ms.price as milestone_price,ms.duration,ms.status,ms.description,ms.release_status, ms.released_date_time, ms.file, jps.job_post_id ,jps.user_id as job_post_user_id, jps.assign_expert_id as job_post_expert_id,   jps.status as job_post_status, jps.title as job_post_title,  jps.max_price, jps.min_price, jps.duration as job_post_duration, jps.description as job_post_description, jps.file as job_post_file, jps.nda_status, jps.project_cost,em.gst_per,em.tds_per,em.tcs_per,em.expert_type,em.gst_amt,em.tds_amt,em.tcs_amt,em.grand_total_expert_earning,em.platform_fees_gst_amt,em.platform_fees,em.	net_expert_earning FROM expert_earning_master as em JOIN user_master um ON em.user_id= um.user_id join milestone_master ms ON ms.milestone_id=em.milestone_id join job_post_master jps ON jps.job_post_id = ms.job_post_id  WHERE em.delete_flag = 0 AND em.expert_id=? order by em.expert_earning_id desc`;
    connection.query(fetchDetails, [expert_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getConsultationById = async (request, response) => {
  let { expert_id } = request.query;
  if (!expert_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const fetchDetails = `SELECT vcm.video_call_id, vcm.type, vcm.user_id,user.name AS user_name,  vcm.other_user_id, expert.name AS expert_name,  vcm.call_unique_number, vcm.price, vcm.transaction_id, vcm.duration, vcm.call_duration, vcm.status, vcm.rejected_by, vcm.total_diamond, vcm.room_id, vcm.token, vcm.provider_earning, vcm.admin_per,vcm.admin_earning, vcm.delete_flag, vcm.createtime, vcm.updatetime, vcm.mysqltime, vcm.wallet_amount, vcm.wallet_paid, vcm.tip_amount, vcm.tip_transaction_id, vcm.attend_call, vcm.switch_account, vcm.wallet_paid_tip, vcm.wallet_paid_amount_tip 
  FROM 
    video_call_master vcm 
  JOIN 
    user_master user 
  ON 
    vcm.user_id = user.user_id AND user.user_type = 1 
  JOIN 
    user_master expert 
  ON 
    vcm.other_user_id = expert.user_id AND expert.user_type = 2 
  WHERE 
    vcm.delete_flag = 0 AND vcm.other_user_id = ?
  ORDER BY 
    vcm.video_call_id DESC`;
    connection.query(fetchDetails, [expert_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getUserConsultationById = async (request, response) => {
  let { user_id } = request.query;
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const fetchDetails = `SELECT vcm.video_call_id, vcm.type, vcm.user_id,user.name AS user_name,  vcm.other_user_id, expert.name AS expert_name,  vcm.call_unique_number, vcm.price, vcm.transaction_id, vcm.duration, vcm.call_duration, vcm.status, vcm.rejected_by, vcm.total_diamond, vcm.room_id, vcm.token, vcm.provider_earning, vcm.admin_per,vcm.admin_earning, vcm.delete_flag, vcm.createtime, vcm.updatetime, vcm.mysqltime, vcm.wallet_amount, vcm.wallet_paid, vcm.tip_amount, vcm.tip_transaction_id, vcm.attend_call, vcm.switch_account, vcm.wallet_paid_tip, vcm.wallet_paid_amount_tip 
  FROM 
    video_call_master vcm 
  LEFT JOIN 
    user_master user 
  ON 
    vcm.user_id = user.user_id AND user.user_type = 1 
  LEFT JOIN 
    user_master expert 
  ON 
    vcm.other_user_id = expert.user_id AND expert.user_type = 2 
  WHERE 
    vcm.delete_flag = 0 AND vcm.user_id = ?
  ORDER BY 
    vcm.video_call_id DESC`;
    connection.query(fetchDetails, [user_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getExpertPost = async (request, response) => {
  let { expert_id } = request.query;
  if (!expert_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  var Fetchpost =
    "SELECT jpm.job_post_id, jpm.user_id,um.name as user_name, jpm.assign_expert_id, jpm.status, jpm.title, jpm.category, jpm.sub_category, jpm.max_price, jpm.min_price, jpm.duration, jpm.description, jpm.file, jpm.nda_status, jpm.project_cost, jpm.delete_flag, jpm.createtime, jpm.updatetime, jpm.mysqltime FROM job_post_master as jpm JOIN user_master um ON jpm.user_id= um.user_id WHERE jpm.delete_flag = 0 AND jpm.assign_expert_id = ? order by jpm.job_post_id desc";
  try {
    connection.query(Fetchpost, [expert_id], async (err, posts) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.assign_expert_id) {
              const GetExpertName =
                "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
              post.expert_name = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.assign_expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve("NA");
                    else resolve(result[0].name);
                  }
                );
              });
            } else {
              post.expert_name = "NA";
            }
            // Fetch Category Name
            if (post.category) {
              const GetCategoryName =
                "SELECT name AS category_name FROM categories_master WHERE delete_flag = 0 AND category_id = ?";
              post.category_name = await new Promise((resolve) => {
                connection.query(
                  GetCategoryName,
                  [post.category],
                  (err, catresult) => {
                    if (err || catresult.length === 0) resolve("NA");
                    else resolve(catresult[0].category_name);
                  }
                );
              });
            } else {
              post.category_name = "NA";
            }
            // Fetch Subcategory Name
            if (post.sub_category) {
              const GetSubCategoryName =
                "SELECT sub_category_name AS subcategory_name FROM sub_categories_master WHERE delete_flag = 0 AND sub_category_id = ?";
              post.subcategory_name = await new Promise((resolve) => {
                connection.query(
                  GetSubCategoryName,
                  [post.sub_category],
                  (err, subcatresult) => {
                    if (err || subcatresult.length === 0) resolve("NA");
                    else resolve(subcatresult[0].subcategory_name);
                  }
                );
              });
            } else {
              post.subcategory_name = "NA";
            }
            return post;
          })
        );
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const FetchNdaPrice = (req, res) => {
  try {
    let s_no = 1;
    const FaqQuery =
      "select  nda_price_id, price, image, createtime,updatetime FROM nda_price_master WHERE delete_flag = 0 ORDER BY nda_price_id DESC ";
    connection.query(FaqQuery, (error, results) => {
      if (error) {
        console.error("Error executing MySQL query:", error);
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (results.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      const record = {
        success: true,
        msg: "faq data found",
        data: results,
      };
      res.json(record);
    });
  } catch (error) {
    console.error("Error executing MySQL query:", error);
    res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const EditNdaPrice = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, nda_price_id, price, image } = request.body;
  if (!action && !action == "edit_nda_price") {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!nda_price_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  if (!price) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "3" });
  }
  if (!image) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "4" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    let Update =
      "Update nda_price_master set price=? , image=?, updatetime=? where nda_price_id=?";
    let values = [price, image, updatetime, nda_price_id];
    connection.query(Update, values, (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: "NDA Price updated",
          key: "updated",
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getActiveUserTabularReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const fetchUsersQuery = `
      SELECT 
      user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time
      FROM 
        user_master 
      WHERE 
        delete_flag = 0 
        AND user_type = 1
        AND profile_completed = 1  AND inactive_customer = 0
        AND createtime BETWEEN ? AND ? 
      ORDER BY 
        createtime ASC
    `;
    connection.query(fetchUsersQuery, [fromDate, toDate], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (result.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      return res.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        user_arr: result,
      });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getInactiveUserTabularReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const fetchWalletQuery = `SELECT GROUP_CONCAT(DISTINCT wm.user_id SEPARATOR ',') as user_ids FROM wallet_master wm WHERE wm.delete_flag = 0 AND wm.createtime BETWEEN ? AND ?
    `;
    connection.query(fetchWalletQuery, [fromDate, toDate], async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (result.length > 0) {
        const fetchUsersQuery = `
      SELECT 
      user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time
      FROM 
        user_master 
      WHERE 
        delete_flag = 0 
        AND user_type = 1
        AND active_flag = 0
        AND profile_completed = 1 
        AND user_id NOT IN (?)
      ORDER BY 
        createtime ASC
    `;
        const userIds = result[0]?.user_ids || "0";
        await connection.query(fetchUsersQuery, [userIds], (err, resultget) => {
          if (err) {
            return res
              .status(500)
              .json({ success: false, msg: languageMessage.internalServerError });
          }
          if (resultget.length === 0) {
            return res
              .status(200)
              .json({ success: false, msg: languageMessage.msgDataNotFound });
          }
          return res.status(200).json({
            success: true,
            msg: languageMessage.msgDataFound,
            user_arr: resultget,
          });
        });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getUserTabularReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const fetchUsersQuery = `
      SELECT 
      user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,inactive_customer,inactive_date_time,bank_user_name,bank_name,bank_account_no,bank_branch,ifsc_code,last_login_date_time
      FROM 
        user_master 
      WHERE 
        delete_flag = 0 
        AND user_type = 1
        AND profile_completed = 1
        AND createtime BETWEEN ? AND ? 
      ORDER BY 
        createtime ASC
    `;
    connection.query(fetchUsersQuery, [fromDate, toDate], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (result.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      return res.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        user_arr: result,
      });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getExpertTabularReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const fetchUsersQuery = `SELECT 
    um.user_id, 
    um.f_name, 
    um.l_name, 
    um.name, 
    um.image, 
    um.email, 
    um.mobile, 
    um.dob, 
    um.address, 
    um.bio, 
    um.gender, 
    um.experience, 
    um.createtime, 
    um.active_flag, 
    um.gst_number, 
    um.adhar_number, 
    um.pan_number, 
    um.phone_code, 
    um.delete_flag, 
    um.delete_reason, 
    um.bank_user_name, 
    um.bank_name, 
    um.bank_account_no, 
    um.bank_branch, 
    um.ifsc_code,um.last_login_date_time,
    GROUP_CONCAT(DISTINCT dm.name SEPARATOR ', ') AS degrees,
    GROUP_CONCAT(DISTINCT lm.name SEPARATOR ', ') AS languages,
    cm.name AS category,
    scm.sub_category_name AS sub_category,
    GROUP_CONCAT(DISTINCT slcm.sub_level_category_name SEPARATOR ', ') AS sub_level_categories,
    um.licence_number,
    um.referral_number,
    um.call_charge,
    um.chat_charge,
    um.video_call_charge,
    um.expert_status,
  GROUP_CONCAT(DISTINCT fm.file_name SEPARATOR ', ') AS file_urls,
 um.special_skills,um.industry_name,um.institute_name
FROM 
    user_master um
LEFT JOIN degree_master dm 
    ON FIND_IN_SET(dm.degree_id, um.degree) > 0
LEFT JOIN language_master lm 
    ON FIND_IN_SET(lm.language_id, um.language) > 0
LEFT JOIN categories_master cm 
    ON um.category = cm.category_id
LEFT JOIN sub_categories_master scm 
    ON um.sub_category = scm.sub_category_id
LEFT JOIN sub_level_categories_master slcm 
    ON FIND_IN_SET(slcm.sub_level_category_id, um.sub_category_level) > 0
   LEFT JOIN file_master fm 
    ON um.user_id = fm.user_id
WHERE 
    um.user_type = 2  
    AND um.profile_completed = 1  AND um.createtime BETWEEN ? AND ? 
    GROUP BY 
    um.user_id
ORDER BY 
    um.createtime DESC`;
    connection.query(fetchUsersQuery, [fromDate, toDate], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (result.length === 0) {
        return res
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      return res.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        user_arr: result,
      });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const getJobPostTabularReport = async (request, response) => {
  const { fromDate, toDate } = request.body;
  // Validate fromdate and todate
  if (!fromDate || !toDate) {
    return response.status(400).json({
      success: false,
      msg: languageMessage.msg_empty_param,
    });
  }
  const Fetchpost = `
    SELECT 
      jpm.job_post_id, 
      jpm.user_id, 
      um.name as user_name, 
      jpm.assign_expert_id, 
      jpm.status, 
      jpm.title, 
      jpm.category, 
      jpm.sub_category, 
      jpm.max_price, 
      jpm.min_price, 
      jpm.duration, 
      jpm.description, 
      jpm.file, 
      jpm.nda_status, 
      jpm.project_cost, 
      jpm.delete_flag, 
      jpm.createtime, 
      jpm.updatetime, 
      jpm.mysqltime 
    FROM 
      job_post_master as jpm 
    JOIN 
      user_master um 
    ON 
      jpm.user_id = um.user_id 
    WHERE 
      jpm.delete_flag = 0 
      AND jpm.createtime BETWEEN ? AND ? 
    ORDER BY 
      jpm.job_post_id DESC`;
  try {
    connection.query(Fetchpost, [fromDate, toDate], async (err, posts) => {
      if (err) {
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          // Fetch Expert Name
          if (post.assign_expert_id) {
            const GetExpertName =
              "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
            post.expert_name = await new Promise((resolve) => {
              connection.query(
                GetExpertName,
                [post.assign_expert_id],
                (err, result) => {
                  if (err || result.length === 0) resolve("NA");
                  else resolve(result[0].name);
                }
              );
            });
          } else {
            post.expert_name = "NA";
          }
          // Fetch Category Name
          if (post.category) {
            const GetCategoryName =
              "SELECT name AS category_name FROM categories_master WHERE delete_flag = 0 AND category_id = ?";
            post.category_name = await new Promise((resolve) => {
              connection.query(
                GetCategoryName,
                [post.category],
                (err, catresult) => {
                  if (err || catresult.length === 0) resolve("NA");
                  else resolve(catresult[0].category_name);
                }
              );
            });
          } else {
            post.category_name = "NA";
          }
          // Fetch Subcategory Name
          if (post.sub_category) {
            const GetSubCategoryName =
              "SELECT sub_category_name AS subcategory_name FROM sub_categories_master WHERE delete_flag = 0 AND sub_category_id = ?";
            post.subcategory_name = await new Promise((resolve) => {
              connection.query(
                GetSubCategoryName,
                [post.sub_category],
                (err, subcatresult) => {
                  if (err || subcatresult.length === 0) resolve("NA");
                  else resolve(subcatresult[0].subcategory_name);
                }
              );
            });
          } else {
            post.subcategory_name = "NA";
          }
          return post;
        })
      );
      return response.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        res: enrichedPosts,
      });
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getEarningTabularReport = async (request, response) => {
  const { fromDate, toDate } = request.body;
  // Validate fromdate and todate
  if (!fromDate || !toDate) {
    return response.status(400).json({
      success: false,
      msg: languageMessage.msg_empty_param,
    });
  }

  const Fetchpost = `SELECT em.expert_earning_id, em.type,em.subscription_type, em.user_id,um.name, em.expert_id, em.milestone_id, em.total_amount, em.commission_percentage, em.admin_commission_amount, em.expert_earning, em.transition_id, em.invoice_url, em.delete_flag, em.createtime,ms.milestone_number,ms.price as milestone_price,ms.duration,ms.status,ms.description,ms.release_status, ms.released_date_time, ms.file, jps.job_post_id ,jps.user_id as job_post_user_id, jps.assign_expert_id as job_post_expert_id,   jps.status as job_post_status, jps.title as job_post_title,  jps.max_price, jps.min_price, jps.duration as job_post_duration, jps.description as job_post_description, jps.file as job_post_file, jps.nda_status, jps.project_cost,em.gst_per,em.tds_per,em.tcs_per FROM expert_earning_master as em JOIN user_master um ON em.user_id= um.user_id join milestone_master ms ON ms.milestone_id=em.milestone_id join job_post_master jps ON jps.job_post_id = ms.job_post_id  WHERE em.delete_flag = 0 AND em.createtime BETWEEN ? AND ?  order by em.expert_earning_id desc`;
  try {
    connection.query(Fetchpost, [fromDate, toDate], async (err, posts) => {
      if (err) {
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.expert_id) {
              const GetExpertName =
                "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
              post.expert_name = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve("NA");
                    else resolve(result[0].name);
                  }
                );
              });
            } else {
              post.expert_name = "NA";
            }
            return post;
          })
        );

        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const ManageEarnings = async (request, response) => {

  var Fetchpost =
    `SELECT em.expert_earning_id, em.type,em.subscription_type, em.user_id,um.name, em.expert_id, em.milestone_id, em.total_amount, em.commission_percentage, em.admin_commission_amount, em.expert_earning, em.transition_id, em.invoice_url, em.delete_flag, em.createtime,ms.milestone_number,ms.price as milestone_price,ms.duration,ms.status,ms.description,ms.release_status, ms.released_date_time, ms.file, jps.job_post_id ,jps.user_id as job_post_user_id, jps.assign_expert_id as job_post_expert_id,   jps.status as job_post_status, jps.title as job_post_title,  jps.max_price, jps.min_price, jps.duration as job_post_duration, jps.description as job_post_description, jps.file as job_post_file, jps.nda_status, jps.project_cost,em.gst_per,em.tds_per,em.tcs_per,em.expert_type,em.gst_amt,em.tds_amt,em.tcs_amt,em.grand_total_expert_earning,em.platform_fees_gst_amt,em.platform_fees,em.net_expert_earning, SUM(em.admin_commission_amount) OVER () AS totalAdmin_commission_amount, SUM(em.platform_fees) OVER () AS total_platform_fees
    FROM 
    expert_earning_master as em 
    JOIN 
    user_master um 
    ON 
    em.user_id= um.user_id 
    join 
    milestone_master ms 
    ON 
    ms.milestone_id=em.milestone_id 
    join 
    job_post_master jps 
    ON 
    jps.job_post_id = ms.job_post_id  
    WHERE 
    em.delete_flag = 0 
    order by 
    em.expert_earning_id 
    desc`;
  try {
    connection.query(Fetchpost, async (err, posts) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: err.message,
        });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.expert_id) {
              const GetExpertName =
                `SELECT u.name AS expert_name, c.name AS category_name, sc.sub_category_name
                FROM user_master AS u 
                LEFT JOIN 
                categories_master AS c 
                ON 
                u.category = c.category_id 
                LEFT JOIN 
                sub_categories_master AS sc
                ON 
                u.sub_category = sc. sub_category_id
                WHERE 
                u.delete_flag = 0 AND u.user_id = ?`;
              const { expert_name, category_name, sub_category_name } = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve({ expert_name: "NA", category_name: "NA" });
                    else resolve({
                      expert_name: result[0].expert_name || "NA",
                      category_name: result[0].category_name || "NA",
                      sub_category_name: result[0].sub_category_name || "NA",
                    });
                  }
                );
              });

              post.expert_name = expert_name;
              post.category_name = category_name;
              post.sub_category_name = sub_category_name;

            } else {
              post.expert_name = "NA";
            }
            return post;
          })
        );
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const getEarningDetailsById = async (request, response) => {
  var { expert_earning_id } = request.params;

  var Fetchpost =
    "SELECT em.expert_earning_id, em.type,em.subscription_type, em.user_id,um.name, em.expert_id, em.milestone_id, em.total_amount, em.commission_percentage, em.admin_commission_amount, em.expert_earning, em.transition_id, em.invoice_url, em.delete_flag, em.createtime,ms.milestone_number,ms.price as milestone_price,ms.duration,ms.status,ms.description,ms.release_status, ms.released_date_time, ms.file, jps.job_post_id,jps.category,jps.sub_category ,jps.user_id as job_post_user_id, jps.assign_expert_id as job_post_expert_id,   jps.status as job_post_status, jps.title as job_post_title,  jps.max_price, jps.min_price, jps.duration as job_post_duration, jps.description as job_post_description, jps.file as job_post_file, jps.nda_status, jps.project_cost,em.gst_per,em.tds_per,em.tcs_per FROM expert_earning_master as em JOIN user_master um ON em.user_id= um.user_id join milestone_master ms ON ms.milestone_id=em.milestone_id join job_post_master jps ON jps.job_post_id = ms.job_post_id  WHERE em.delete_flag = 0 and em.expert_earning_id=? order by em.expert_earning_id desc";
  try {
    connection.query(Fetchpost, [expert_earning_id], async (err, posts) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: err.message,
        });
      }
      if (posts.length <= 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataNotFound,
          res: [],
        });
      }
      if (posts.length > 0) {
        const enrichedPosts = await Promise.all(
          posts.map(async (post) => {
            // Fetch Expert Name
            if (post.expert_id) {
              const GetExpertName =
                "SELECT name FROM user_master WHERE delete_flag = 0 AND user_id = ?";
              post.expert_name = await new Promise((resolve) => {
                connection.query(
                  GetExpertName,
                  [post.expert_id],
                  (err, result) => {
                    if (err || result.length === 0) resolve("NA");
                    else resolve(result[0].name);
                  }
                );
              });
            } else {
              post.expert_name = "NA";
            }
            // Fetch Category Name
            if (post.category) {
              const GetCategoryName =
                "SELECT name AS category_name FROM categories_master WHERE delete_flag = 0 AND category_id = ?";
              post.category_name = await new Promise((resolve) => {
                connection.query(
                  GetCategoryName,
                  [post.category],
                  (err, catresult) => {
                    if (err || catresult.length === 0) resolve("NA");
                    else resolve(catresult[0].category_name);
                  }
                );
              });
            } else {
              posts.category_name = "NA"; // This line is incorrect
            }
            // Fetch Subcategory Name
            if (post.sub_category) {
              const GetSubCategoryName =
                "SELECT sub_category_name AS subcategory_name FROM sub_categories_master WHERE delete_flag = 0 AND sub_category_id = ?";
              post.subcategory_name = await new Promise((resolve) => {
                connection.query(
                  GetSubCategoryName,
                  [post.sub_category],
                  (err, subcatresult) => {
                    if (err || subcatresult.length === 0) resolve("NA");
                    else resolve(subcatresult[0].subcategory_name);
                  }
                );
              });
            } else {
              post.subcategory_name = "NA";
            }
            return post;
          })
        );
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: enrichedPosts,
        });
      }
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};

const getUserAnalyticalReport = async (req, res) => {
  try {
    const fetchAnalyticsQuery = `
      SELECT 
        COUNT(*) AS total_users,
        SUM(active_flag = 1) AS active_users,
        SUM(gender = 'male') AS male_users,
        SUM(gender = 'female') AS female_users,
        YEAR(createtime) AS year,
        MONTH(createtime) AS month,
        COUNT(user_id) AS user_count
      FROM 
        user_master
      WHERE 
        delete_flag = 0 AND user_type = 1 AND profile_completed = 1
      GROUP BY 
        YEAR(createtime), MONTH(createtime)
      ORDER BY 
        YEAR(createtime) ASC, MONTH(createtime) ASC
    `;
    connection.query(fetchAnalyticsQuery, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      }
      if (result.length === 0) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
        });
      }
      // Extract monthly user data
      const user_count_arr = result.map((row) => ({
        user_count: row.user_count,
        month: row.month,
        year: row.year,
      }));
      // Aggregate data from the first row (since total and active users are the same across rows)
      const aggregatedData = {
        total_users: result[0]?.total_users || 0,
        active_users: result[0]?.active_users || 0,
        male_users: result[0]?.male_users || 0,
        female_users: result[0]?.female_users || 0,
      };
      return res.status(200).json({
        success: true,
        msg: [languageMessage.msgDataFound],
        aggregated_data: aggregatedData,
        user_count_arr: user_count_arr,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
const getExpertAnalyticalReport = async (req, res) => {
  try {
    const fetchAnalyticsQuery = `
      SELECT 
        COUNT(*) AS total_users,
        SUM(active_flag = 1) AS active_users,
        SUM(gender = 'male') AS male_users,
        SUM(gender = 'female') AS female_users,
        YEAR(createtime) AS year,
        MONTH(createtime) AS month,
        COUNT(user_id) AS user_count
      FROM 
        user_master
      WHERE 
        delete_flag = 0 AND user_type = 2 AND profile_completed = 1
      GROUP BY 
        YEAR(createtime), MONTH(createtime)
      ORDER BY 
        YEAR(createtime) ASC, MONTH(createtime) ASC
    `;
    connection.query(fetchAnalyticsQuery, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      }
      if (result.length === 0) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
        });
      }
      // Extract monthly user data
      const user_count_arr = result.map((row) => ({
        user_count: row.user_count,
        month: row.month,
        year: row.year,
      }));
      // Aggregate data from the first row (since total and active users are the same across rows)
      const aggregatedData = {
        total_users: result[0]?.total_users || 0,
        active_users: result[0]?.active_users || 0,
        male_users: result[0]?.male_users || 0,
        female_users: result[0]?.female_users || 0,
      };
      return res.status(200).json({
        success: true,
        msg: [languageMessage.msgDataFound],
        aggregated_data: aggregatedData,
        user_count_arr: user_count_arr,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
const getPostAnalyticalReport = async (req, res) => {
  try {
    const fetchAnalyticsQuery = `
      SELECT 
        COUNT(*) AS total_post,
        SUM(delete_flag = 0) AS active_post,
        YEAR(createtime) AS year,
        MONTH(createtime) AS month,
        COUNT(job_post_id) AS post_count
      FROM 
        job_post_master
      WHERE 
        delete_flag = 0
      GROUP BY 
        YEAR(createtime), MONTH(createtime)
      ORDER BY 
        YEAR(createtime) ASC, MONTH(createtime) ASC
    `;
    connection.query(fetchAnalyticsQuery, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      }
      if (result.length === 0) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
        });
      }
      // Extract monthly user data
      const post_count_arr = result.map((row) => ({
        post_count: row.post_count,
        month: row.month,
        year: row.year,
      }));
      // Aggregate data from the first row (since total and active users are the same across rows)
      const aggregatedData = {
        total_post: result[0]?.total_post || 0,
        active_post: result[0]?.active_post || 0,
      };
      return res.status(200).json({
        success: true,
        msg: [languageMessage.msgDataFound],
        aggregated_data: aggregatedData,
        post_count_arr: post_count_arr,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
const getEarningAnalyticalReport = async (req, res) => {
  try {
    const fetchAnalyticsQuery = `
      SELECT 
        COUNT(*) AS total_earning,
        SUM(delete_flag = 0) AS active_earning,
        YEAR(createtime) AS year,
        MONTH(createtime) AS month,
        COUNT(transaction_id) AS earning_count
      FROM 
        transaction_master
      WHERE 
        delete_flag = 0
      GROUP BY 
        YEAR(createtime), MONTH(createtime)
      ORDER BY 
        YEAR(createtime) ASC, MONTH(createtime) ASC
    `;
    connection.query(fetchAnalyticsQuery, (err, result) => {
      if (err) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      }
      if (result.length === 0) {
        return res.status(200).json({
          success: false,
          msg: languageMessage.msgDataNotFound,
        });
      }
      // Extract monthly user data
      const earning_count_arr = result.map((row) => ({
        earning_count: row.earning_count,
        month: row.month,
        year: row.year,
      }));
      // Aggregate data from the first row (since total and active users are the same across rows)
      const aggregatedData = {
        total_earning: result[0]?.total_earning || 0,
        active_earning: result[0]?.active_earning || 0,
      };
      return res.status(200).json({
        success: true,
        msg: [languageMessage.msgDataFound],
        aggregated_data: aggregatedData,
        earning_count_arr: earning_count_arr,
      });
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
const AcceptWithdrawRequest = (req, res) => {
  const { withdraw_id, transaction_id } = req.body;
  if (!withdraw_id || !transaction_id) {
    return res.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
    });
  }
  const checkQuery = `
    SELECT expert_withdraw_id, withdraw_amount, total_earning_amount 
    FROM expert_withdraw_master
    WHERE expert_withdraw_id = ? AND withdraw_status = 0 AND delete_flag = 0
  `;
  connection.query(checkQuery, [withdraw_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        msg: languageMessage.internalServerError,
        key: err.message,
      });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        msg: languageMessage.msgDataNotFound,
      });
    }
    let total = Number(results[0].total_earning_amount);
    let withdraw = Number(results[0].withdraw_amount);
    const earningAfterWithdraw = total - withdraw;
    const currentDateTime = new Date();
    const updateQuery = `
      UPDATE expert_withdraw_master
      SET withdraw_status = 1, 
          transaction_id = ?, 
          earning_after_withdraw = ?,
          transaction_date_time = ?, 
          updatetime = ? 
      WHERE expert_withdraw_id = ?
    `;
    connection.query(
      updateQuery,
      [
        transaction_id,
        earningAfterWithdraw,
        currentDateTime,
        currentDateTime,
        withdraw_id,
      ],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            key: updateErr.message,
          });
        }
        return res.status(200).json({
          success: true,
          msg: "Withdrawal request approved successfully.",
        });
      }
    );
  });
};
const RejectWithdrawRequest = (req, res) => {
  const { withdraw_id, reason } = req.body;
  if (!withdraw_id || !reason) {
    return res.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
    });
  }
  const checkQuery = `
    SELECT expert_withdraw_id, withdraw_amount, total_earning_amount 
    FROM expert_withdraw_master
    WHERE expert_withdraw_id = ? AND withdraw_status = 0 AND delete_flag = 0
  `;
  connection.query(checkQuery, [withdraw_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        msg: languageMessage.internalServerError,
        key: err.message,
      });
    }
    const currentDateTime = new Date();
    const updateQuery = `
      UPDATE expert_withdraw_master
      SET withdraw_status = 2, 
          reason = ?,
          updatetime = ? 
      WHERE expert_withdraw_id = ?
    `;
    connection.query(
      updateQuery,
      [reason, currentDateTime, withdraw_id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            key: updateErr.message,
          });
        }
        return res.status(200).json({
          success: true,
          msg: "Withdrawal request Rejected.",
        });
      }
    );
  });
};
const getContactUs = (req, res) => {
  try {
    const userQuery = `
      SELECT 
        contact_id, 
        user_id, 
        name, 
        message, 
        email, 
        status, 
        createtime, 
        reply_datetime
      FROM contact_us_master
      WHERE delete_flag = 0 
      ORDER BY contact_id DESC`;
    connection.query(userQuery, (error, results) => {
      if (error) {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: error.message,
        });
      }
      return res.status(200).json({
        success: true,
        msg: languageMessage.msgDataFound,
        data: results,
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: error.message,
    });
  }
};
const sendReplyController = (req, res) => {
  try {
    const { contact_id, user_email, user_name, message, title } = req.body;
    console.log(
      "maildata =>",
      contact_id,
      user_email,
      user_name,
      message,
      title
    );
    // Check if required fields are provided
    if (!contact_id || !user_email || !message || !user_name || !title) {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        error: req.body,
      });
    }
    // Send email notification

    const subject = "Contact Us Reply";
    const newMsg = message;
    const app_name = "xpert now";
    // const app_logo = "https://youngdecade.org/2024/xpert/admin/xpertlog.png";
    const app_logo = process.env.LOGO_URL;
    const mailBody = mailBodyContactUs({
      user_email,
      app_name,
      subject,
      newMsg,
      app_logo,
      user_name,
    });
    sendMail(user_email, subject, mailBody)
      .then((response) => {
        console.log("Email response:", response);
        // Update contact_us_master after mail send
        const updateQuery = `UPDATE contact_us_master SET status = 1,reply_datetime=NOW(), reply = ? WHERE contact_id = ?
                `;
        connection.query(
          updateQuery,
          [message, contact_id],
          (updateError, updateResult) => {
            if (updateError) {
              console.error("Error updating contact_us_master:", updateError);
              return res.status(500).json({
                success: false,
                msg: languageMessage.internalServerError,
                key: updateError.message,
              });
            }
            console.log("Contact us master updated successfully");
            return res.status(200).json({
              success: true,
              msg: ["Contact Us reply send successfully"],
            });
          }
        );
      })
      .catch((error) => {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: error.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: error.message,
    });
  }
};
const getUserWalletDetailsId = async (request, response) => {
  let { user_id } = request.query;
  if (!user_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
    const fetchDetails = `SELECT wm.transition_id, wm.user_id,user.name as user_name,wm.expert_id,  COALESCE(expert.name, 'NA') AS name, wm.amount, wm.wallet_balance, wm.createtime, wm.updatetime, wm.type,wm.status,
    COALESCE(cm.name, 'NA') AS category_name
  FROM 
    wallet_master wm 
  JOIN 
    user_master user 
  ON 
    wm.user_id = user.user_id AND user.user_type = 1
    LEFT JOIN 
    user_master expert 
  ON 
    wm.expert_id = expert.user_id AND expert.user_type = 2 
LEFT JOIN 
    categories_master cm 
ON 
    expert.category = cm.category_id 
  WHERE 
    wm.delete_flag = 0 AND wm.user_id = ?
  ORDER BY 
    wm.transition_id DESC`;
    connection.query(fetchDetails, [user_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        const expertId = res[0].expert_id;
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          user_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const MarkAsResolved = (req, res) => {
  const { milestone_id } = req.body;
  if (!milestone_id) {
    return res.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
    });
  }
  const currentDateTime = new Date();
  const updateQuery = `
      UPDATE milestone_master
      SET mark_as_resolved = 1,
          updatetime = ? 
      WHERE milestone_id = ?
    `;
  connection.query(
    updateQuery,
    [currentDateTime, milestone_id],
    (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: updateErr.message,
        });
      }
      return res.status(200).json({
        success: true,
        msg: "Mark as approved successfully",
      });
    }
  );
};
const getRefundRequestById = async (request, response) => {
  const { milestone_id } = request.params;
  try {
    const fetchDetails =
      "SELECT mm.milestone_id, mm.job_post_id, mm.milestone_number, mm.price, mm.duration, mm.duration_type, mm.description, mm.title, mm.status, mm.release_status, mm.released_date_time, mm.file, mm.milestone_status, mm.reject_reason, mm.delete_flag, mm.createtime, mm.updatetime, mm.mysqltime, mm.dispute_title, mm.dispute_description, mm.dispute_amount, mm.dispute_file,um.name,mm.mark_as_resolved FROM milestone_master mm JOIN job_post_master jpm ON mm.job_post_id =jpm.job_post_id LEFT JOIN user_master um ON jpm.user_id =um.user_id WHERE mm.delete_flag = 0 and mm.milestone_id=? and mm.milestone_status=5 order by mm.milestone_id desc";
    connection.query(fetchDetails, [milestone_id], (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          request_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgDataNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};
const sendMailController = (req, res) => {
  try {
    const { user_id, user_email, user_name, message, title } = req.body;
    // Check if required fields are provided
    if (!user_id || !user_email || !message || !user_name || !title) {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        error: req.body,
      });
    }
    // Send email notificationc
    const subject = title;
    const newMsg = message;
    const app_name = "xpert now";
    // const app_logo = "https://youngdecade.org/2024/xpert/admin/xpertlog.png";
    const app_logo = process.env.LOGO_URL;
    const mailBody = mailBodyAdmin({
      user_email,
      app_name,
      subject,
      newMsg,
      app_logo,
      user_name,
    });
    sendMail(user_email, subject, mailBody)
      .then((response) => {
        console.log("Email response:", response);
        return res.status(200).json({
          success: true,
          msg: ["Admin send mail successfully"],
        });
      })
      .catch((error) => {
        return res.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: error.message,
        });
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: error.message,
    });
  }
};
const ManageSubAdmin = async (request, response) => {
  try {
    const fetchDetails =
      "SELECT user_id, email,f_name,l_name, name, dob, mobile, image, address, bio, createtime ,gender,active_flag FROM user_master WHERE delete_flag = 0 AND user_type = 3 AND profile_completed=1 order by user_id desc";
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          subadmin_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};

const GetDetailsUpdateRequests = async (request, response) => {
  try {
    const fetchDetails =
      `SELECT 
      drm.details_request_id, drm.user_id, um.name, drm.type, drm.description, drm.status, drm.createtime 
      FROM 
      details_request_master AS drm  
      LEFT JOIN
      user_master AS um
      ON
      um.user_id = drm.user_id
      WHERE 
      um.delete_flag = 0`;
    connection.query(fetchDetails, (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length <= 0) {
        return response
          .status(200)
          .json({ success: true, msg: languageMessage.msgUserNotFound });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          subadmin_arr: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  } catch (error) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};


const UpdateDetailsRequestStatus = async (request, response) => {
  try {
    const { details_request_id, newStatus } = request.body;

    if (!details_request_id || newStatus === undefined) {
      return response.status(200).json({
        success: false,
        msg: languageMessage.msg_empty_param,
      });
    }

    const updateQuery = `
      UPDATE details_request_master
      SET status = ?
      WHERE details_request_id = ? AND delete_flag = 0
    `;

    connection.query(updateQuery, [newStatus, details_request_id], (err, res) => {
      if (err) {
        console.error(err);
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
        });
      }

      if (res.affectedRows === 0) {
        return response.status(200).json({
          success: false,
          msg: "No record found or already deleted.",
        });
      }

      return response.status(200).json({
        success: true,
        msg: "Status updated successfully.",
      });
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
    });
  }
};



const AddSubAdmin = async (request, response) => {
  if (!request.body) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let { action, name, email, password, privileges, image } = request.body;
  if (
    !action ||
    action !== "add_subadmin" ||
    !name ||

    !email ||
    !password ||
    !privileges
  ) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const profile_completed = 1;
  const delete_flag = 0;
  const active_flag = 1;
  const user_type = 3;


  try {
    // Hash the password
    const hash_password = await hashPassword(password);
    // Check if user with the same email already exists
    const CheckUser =
      "SELECT email FROM user_master WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))  AND delete_flag = ?";
    const checkValues = [email, delete_flag];
    connection.query(CheckUser, checkValues, (err, res) => {
      if (err) {
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgEmailExist,
          key: "Exists",
        });
      }
      // let image;
      // if (!request.file) {
      //   image = "";
      // } else {
      //   image = request.file.filename;
      // }
      // Insert new sub-admin
      const privilegeString = privileges.join(",");
      const Insert =
        "INSERT INTO user_master (name, email, user_type, profile_completed, delete_flag, active_flag, previlages, password,image, createtime, updatetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, NOW(), NOW())";
      const values = [
        name,
        email,
        user_type,
        profile_completed,
        delete_flag,
        active_flag,
        privilegeString,
        hash_password,
        image,
      ];
      connection.query(Insert, values, (err) => {
        if (err) {
          return response.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        const subject = "Login Credentials";
        const mailContent = `<p >
      <br> Your ${app_name} account has been created, login credentials are below
      <br> 
      <br> Email: ${email} <br><br> Password: ${password}
         <br><br> `;
        const fromName = app_name;
        let mailBody;
        mailBody = mailBodySubadminData({
          email,
          fromName,
          subject,
          mailContent,
          app_logo,
          name,
        });
        // Call sendMail function
        sendMail(email, subject, mailBody)
          .then((response) => {
            console.log("Email response:", response);
          })
          .catch((error) => {
            console.error("Error sending email:", error);
          });
        return response.status(200).json({
          success: true,
          msg: languageMessage.SubAdminAdded,
          key: "added",
        });
      });
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const GetSubadminData = async (request, response) => {
  const { user_id } = request.params;
  if (!user_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "hey",
    });
  }
  const checkUser =
    "SELECT user_id FROM user_master WHERE delete_flag=0 and  user_id = ?";
  connection.query(checkUser, [user_id], async (err, result) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (result.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
    const FetchDetails =
      "SELECT user_id, email, name, image, createtime ,active_flag,previlages FROM user_master WHERE delete_flag=0 and user_type=3 and user_id = ?";
    connection.query(FetchDetails, [user_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  });
};
const EditSubAdmin = async (request, response) => {
  if (!request.body) {
    return response.status(400).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "1",
    });
  }
  let { user_id, action, name, email, password, privileges, image } = request.body;
  if (
    !user_id ||
    !action ||
    action !== "edit_subadmin" ||
    !name ||
    !email ||
    !privileges
  ) {
    return response.status(400).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "2",
    });
  }
  const delete_flag = 0;
  const user_type = 3;
  try {
    // Hash the password if provided
    const hash_password = password ? await hashPassword(password) : null;
    // Check if a user with the same email already exists
    const CheckUser =
      "SELECT email FROM user_master WHERE LOWER(TRIM(email)) = LOWER(TRIM(?)) AND user_id != ? AND delete_flag = ?";
    const checkValues = [email, user_id, delete_flag];
    connection.query(CheckUser, checkValues, (err, res) => {
      if (err) {
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      }
      if (res.length > 0) {
        return response.status(200).json({
          success: true,
          msg: languageMessage.msgEmailExist,
          key: "Exists",
        });
      }
      const privilegeString = privileges.join(",");
      // Update sub-admin details
      let updateQuery =
        "UPDATE user_master SET name = ?, email = ?, previlages = ?, updatetime = NOW()";
      let queryValues = [name, email, privilegeString];
      if (image) {
        updateQuery += ", image = ?";
        queryValues.push(image);
      }
      if (password) {
        updateQuery += ", password = ?";
        queryValues.push(hash_password);
      }
      updateQuery += " WHERE user_id = ? AND user_type = ? AND delete_flag = ?";
      queryValues.push(user_id, user_type, delete_flag);
      connection.query(updateQuery, queryValues, (err) => {
        if (err) {
          return response.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: err,
          });
        }
        return response.status(200).json({
          success: true,
          msg: "Sub-admin updated successfully",
          key: "update",
        });
      });
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      error: error.message,
    });
  }
};
const ViewSubAdminUser = async (request, response) => {
  const { user_id } = request.params;
  if (!user_id) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.msg_empty_param,
      key: "hey",
    });
  }
  const checkUser = "SELECT user_id FROM user_master WHERE user_id = ?";
  connection.query(checkUser, [user_id], async (err, result) => {
    if (err) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.internalServerError });
    }
    if (result.length <= 0) {
      return response
        .status(200)
        .json({ success: false, msg: languageMessage.msgUserNotFound });
    }
    const FetchDetails =
      "SELECT user_id, f_name, l_name, name, image, email, mobile, dob, address, bio, gender, createtime, active_flag, gst_number, adhar_number, pan_number, phone_code, delete_flag, delete_reason,previlages FROM user_master WHERE user_id = ?";
    connection.query(FetchDetails, [user_id], async (err, res) => {
      if (err) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.internalServerError });
      }
      if (res.length > 0) {

        return response.status(200).json({
          success: true,
          msg: languageMessage.msgDataFound,
          res: res,
        });
      } else {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.msgUserNotFound });
      }
    });
  });
};
const EditTax = async (request, response) => {
  if (!request.body) {
    return request
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "1" });
  }
  let {
    action,
    commission_id,
    gst,
    tds,
    tcs,
  } = request.body;
  if (!commission_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param, key: "2" });
  }
  const updatetime = moment().format("YYYY-MM-DD HH:mm:ss");
  try {
    let Update =
      "Update commission_master set gst=? ,tds=? ,tcs=?, updatetime=? where commission_id=?";
    let values = [
      gst,
      tds,
      tcs,
      updatetime,
      commission_id,
    ];
    connection.query(Update, values, (err) => {
      if (err) {
        return response.status(200).json({
          success: false,
          msg: languageMessage.internalServerError,
          error: err,
        });
      } else {
        return response.status(200).json({
          success: true,
          msg: "tax updated",
          key: "updated",
        });
      }
    });
  } catch (error) {
    return response.status(200).json({
      success: false,
      msg: languageMessage.internalServerError,
      error,
    });
  }
};
const sendInactiveMailController = async (req, res) => {
  try {
    const { user_emails, message, title, type } = req.body;
    if (!user_emails || !message || !title) {
      return res.status(400).json({
        success: false,
        msg: languageMessage.msg_empty_param,
        error: req.body,
      });
    }
    const subject = title;
    const newMsg = message;
    const app_name = "xpert now";
    // const app_logo = "https://youngdecade.org/2024/xpert/admin/xpertlog.png";
    const app_logo = process.env.LOGO_URL;
    const user_name = type == 'expert' ? 'Expert' : 'Customer';

    const emailResults = await Promise.all(
      user_emails.map(async (user_email) => {
        try {
          const mailBody = mailBodyInactive({
            user_email,
            app_name,
            subject,
            newMsg,
            app_logo,
            user_name,
          });
          const response = await sendMail(user_email, subject, mailBody);
          return { user_email, success: true };
        } catch (error) {
          return { user_email, success: false, error: error.message };
        }
      })
    );
    return res.status(200).json({
      success: true,
      msg: "Admin send mail process completed",
      results: emailResults,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: error.message,
    });
  }
};
const getInactiveExpertTabularReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const fetchWalletQuery = `SELECT GROUP_CONCAT(DISTINCT wm.expert_id SEPARATOR ',') as expert_ids FROM wallet_master wm WHERE wm.delete_flag = 0 AND wm.createtime BETWEEN ? AND ?`;
    connection.query(
      fetchWalletQuery,
      [fromDate, toDate],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, msg: languageMessage.internalServerError });
        }
        if (result.length > 0) {
          const fetchUsersQuery = `SELECT 
    um.user_id, 
    um.f_name, 
    um.l_name, 
    um.name, 
    um.image, 
    um.email, 
    um.mobile, 
    um.dob, 
    um.address, 
    um.bio, 
    um.gender, 
    um.experience, 
    um.createtime, 
    um.active_flag, 
    um.gst_number, 
    um.adhar_number, 
    um.pan_number, 
    um.phone_code, 
    um.delete_flag, 
    um.delete_reason, 
    um.bank_user_name, 
    um.bank_name, 
    um.bank_account_no, 
    um.bank_branch, 
    um.ifsc_code,um.last_login_date_time,
    GROUP_CONCAT(DISTINCT dm.name SEPARATOR ', ') AS degrees,
    GROUP_CONCAT(DISTINCT lm.name SEPARATOR ', ') AS languages,
    cm.name AS category,
    scm.sub_category_name AS sub_category,
    GROUP_CONCAT(DISTINCT slcm.sub_level_category_name SEPARATOR ', ') AS sub_level_categories,
    um.licence_number,
    um.referral_number,
    um.call_charge,
    um.chat_charge,
    um.video_call_charge,
    um.expert_status,
  GROUP_CONCAT(DISTINCT fm.file_name SEPARATOR ', ') AS file_urls,
 um.special_skills,um.industry_name,um.institute_name
FROM 
    user_master um
LEFT JOIN degree_master dm 
    ON FIND_IN_SET(dm.degree_id, um.degree) > 0
LEFT JOIN language_master lm 
    ON FIND_IN_SET(lm.language_id, um.language) > 0
LEFT JOIN categories_master cm 
    ON um.category = cm.category_id
LEFT JOIN sub_categories_master scm 
    ON um.sub_category = scm.sub_category_id
LEFT JOIN sub_level_categories_master slcm 
    ON FIND_IN_SET(slcm.sub_level_category_id, um.sub_category_level) > 0
   LEFT JOIN file_master fm 
    ON um.user_id = fm.user_id
WHERE 
    um.user_type = 2 
    AND um.active_flag = 0
    AND um.delete_flag = 0  
    AND um.profile_completed = 1  
    AND um.user_id NOT IN (?)
    GROUP BY 
    um.user_id
ORDER BY 
    um.createtime DESC`;
          const userIds = result[0]?.expert_ids || "0";
          await connection.query(
            fetchUsersQuery,
            [userIds],
            (err, resultget) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  msg: languageMessage.internalServerError,
                });
              }
              if (resultget.length === 0) {
                return res.status(200).json({
                  success: false,
                  msg: languageMessage.msgDataNotFound,
                });
              }
              return res.status(200).json({
                success: true,
                msg: languageMessage.msgDataFound,
                user_arr: resultget,
              });
            }
          );
        }
      }
    );
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: languageMessage.internalServerError });
  }
};


//adin details 
const adminDetails = async (request, response) => {
  const { user_id } = request.query;
  if (!user_id) {
    return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
  }

  const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
  connection.query(checkUser, [user_id], async (err, result) => {
    if (err) {
      return response.status(200).json({ success: false, msg: languageMessage.internalServerError });
    }
    if (result.length == 0) {
      return response.status(200).json({ success: false, msg: languageMessage.msgUserNotFound });
    }
    if (result[0].active_flag == 0) {
      return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated });
    }

    return response.status(200).json({ success: true, msg: languageMessage.msgDataFound, data: result })
  })
}



//  get all refunds request 
const getAllRefundRequests = async (request, response) => {
  try {
    const sql = 'SELECT * FROM refund_request_master WHERE delete_flag = 0 AND otp_verify= 1 ORDER BY createtime DESC ';
    connection.query(sql, async (err, res) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: err.message });
      }

      if (res.length == 0) {
        return response.status(200).json({ success: false, msg: languageMessage.msgDataNotFound, request_arr: [] });
      }
      let request_arr = [];
      for (let data of res) {
        request_arr.push({
          refund_id: data.refund_id,
          user_id: data.user_id,
          name: data.name,
          email: data.email,
          title: data.title,
          amount: data.refund_amount,
          description: data.description,
          refund_status: data.refund_status,
          status: data.refund_status === 0 ? 'Pending' : data.refund_status === 1 ? 'Accepted' : data.refund_status === 2 ? 'Rejected' : 'Replied',
          transaction_id: data.transaction_id,
          createtime: moment(data.createtime).format("DD-MM-YYYY hh:mm A"),
        })

      }

      return response.status(200).json({ success: true, msg: languageMessage.msgDataFound, request_arr: request_arr });
    })
  }
  catch (error) {
    return res.status(500).json({ success: false, msg: languageMessage.internalServerError });
  }
}

// accept refund 
const acceptRefund = async (request, response) => {
  const { refund_id, transaction_id } = request.body;
  try {
    const check = 'SELECT refund_id FROM refund_request_master WHERE refund_id = ? AND delete_flag= 0';
    connection.query(check, [refund_id], async (err, res) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
      }
      if (res.length > 0) {
        const sql = 'UPDATE refund_request_master SET refund_status = 1, transaction_id = ?, updatetime = NOW() WHERE refund_id = ? AND delete_flag = 0';
        connection.query(sql, [transaction_id, refund_id], async (err1, res1) => {
          if (err1) {
            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
          }
          if (res1.affectedRows > 0) {
            return response.status(200).json({ success: true, msg: languageMessage.msgDataFound })
          }
          else {
            return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingdetails })
          }
        })
      }
    })
  }
  catch (error) {
    return res.status(500).json({ success: false, msg: languageMessage.internalServerError });
  }
}


// reject refund request 
const rejectRefundRequest = async (request, response) => {
  const { refund_id } = request.body;
  try {
    const sql = 'UPDATE refund_request_master SET refund_status = 2, updatetime = NOW() WHERE refund_id = ? AND delete_flag =0';
    connection.query(sql, [refund_id], async (err, res) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
      }
      if (res.affectedRows == 0) {
        return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingdetails });
      }
      return response.status(200).json({ success: true, msg: languageMessage.msgDataFound })
    })
  }
  catch (error) {
    return res.status(500).json({ success: false, msg: languageMessage.internalServerError, key: error.message });
  }
}

//  get refund details by id 
const getrefundDetailsById = async (request, response) => {
  const { refund_id } = request.params;

  try {
    const sql = 'SELECT * FROM refund_request_master WHERE refund_id = ? AND delete_flag = 0';
    connection.query(sql, [refund_id], async (err, res) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
      }
      if (res.length == 0) {
        return response.status(200).json({ success: false, msg: languageMessage.msgDataNotFound, request_arr: [] });
      }

      let data = res[0];
      let request_arr = [];
      request_arr.push({
        refund_id: data.refund_id,
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        title: data.title,
        amount: data.refund_amount,
        description: data.description,
        refund_status: data.refund_status,
        status: data.refund_status === 0 ? 'Pending' : data.refund_status === 1 ? 'Accepted' : data.refund_status === 2 ? 'Rejected' : 'Replied',
        transaction_id: data.transaction_id,
        createtime: moment(data.createtime).format("DD-MM-YYYY hh:mm A"),
      })
      return response.status(200).json({ success: true, msg: languageMessage.msgDataFound, request_arr: request_arr })
    })
  }
  catch (error) {
    return res.status(500).json({ success: false, msg: languageMessage.internalServerError, key: error.message });
  }
}
//send refund mail

const sendRefundMail = async (request, response) => {
  const { email, refund_id, reply } = request.body;
  try {
    if (!refund_id) {
      return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'refund_id' });
    }
    if (!email) {
      return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'email' });
    }
    if (!reply) {
      return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'reply' });
    }
    const sql = 'SELECT * FROM refund_request_master WHERE refund_id = ? AND delete_flag = 0';
    connection.query(sql, [refund_id], async (err, res) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
      }
      if (res.length == 0) {
        return response.status(200).json({ success: false, msg: languageMessage.msgDataNotFound });
      }

      let data = res[0];

      const update = 'UPDATE  refund_request_master SET refund_status = 3, reply= ?, updatetime = NOW() WHERE refund_id = ? AND delete_flag = 0'
      connection.query(update, [reply, refund_id], async (err1, res1) => {
        if (err1) {
          return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
        }

        const useremail = email;
        const fromName = data.name;
        const message = `Thank you for reaching out to us regarding your refund request.<br></br> ${reply}`;
        const subject = 'Refund Request Acknowledgement';
        const title = 'Refund Request Acknowledgement';
        const app_logo = "https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png";
        const app_name = "Team Xpertnow";

        await refundmailer(useremail, fromName, app_name, message, subject, title, app_logo)
          .then((data) => {
            if (data.status === 'yes') {
              return response.status(200).json({ success: true, msg: "email send successfully" });
            } else {
              return response.status(200).json({ success: false, msg: "Error sending email" })
            }
          });
      });
    });
  }
  catch (error) {
    return res.status(500).json({ success: false, msg: languageMessage.internalServerError, key: error.message });
  }
}










module.exports = {
  EditTax,
  getNotificationArrSingle,
  getNotification,
  deleteSingleNotification,
  deleteAllNotification,
  oneSignalNotificationSendCall,
  getNotificationCount,
  getNotificationCountOtherUser,
  FetchUser,
  FetchDeactiveUser,
  FetchExpert,
  FetchDeactiveExpert,
  fetchuserDate,
  FetchSubscribedUsersByDate,
  ViewUser,
  ViewSubAdminUser,
  SocialLinks,
  DeleteUser,
  FetchDeleteUser,
  FetchPostDetails,
  ViewPost,
  DeletePost,
  FetchCategory,
  AddCategory,
  DeleteCategory,
  UpdateCategory,
  FetchAllSubscriptions,
  EditSubscription,
  FetchSubscribedUsers,
  FetchReportedContent,
  EditReportedContent,
  fetchaboutcontent,
  updateContent,
  FetchContactUs,
  updateStatus,
  ViewReplymsg,
  BroadcastAll,
  Users,
  AdminData,
  UpdateAdminPassword,
  fetchSubscriptionById,
  fetchpostdetailsById,
  UpdateAdminProfile,
  UserCount,
  Adminlogin,
  AdminForgetPassword,
  AdminForgetNewPassword,
  CheckAdminEmail,
  getCount,
  getSubscriptionCount,
  getContactCount,
  getEarningCount,
  ActivateDeactivate,
  AcceptRejectExpert,
  postAnalyticalreport,
  send_notification,
  getExportDetails,
  FetchDeleteExperts,
  FetchSubCategory,
  DeleteSubCategory,
  DeleteSubLevelCategory,
  DeleteSubTwoLevelCategory,
  DeleteSubThreeLevelCategory,
  getCatgoryAll,
  getSubCatgoryAll,
  getSubOneCatgoryAll,
  getSubTwoCatgoryAll,
  AddSubCategory,
  AddSubLevelCategory,
  AddSubTwoLevelCategory,
  AddSubThreeLevelCategory,
  UpdateSubCategory,
  UpdateSubLevelCategory,
  UpdateSubTwoLevelCategory,
  UpdateSubThreeLevelCategory,
  FetchSubLevelCategory,
  FetchSubTwoLevelCategory,
  FetchSubThreeLevelCategory,
  FetchDegree,
  AddDegree,
  EditDegree,
  DeleteDegree,
  FetchLanguage,
  AddLanguage,
  EditLanguage,
  DeleteLanguage,
  FetchSubscription,
  AddSubscription,
  DeleteSubscription,
  DeleteSubAdmin,
  DeleteJobPost,
  ViewSubscription,
  GetSubadminData,
  FetchFAQ,
  AddFAQ,
  EditFAQ,
  DeleteFaq,
  ViewFAQById,
  UpdateCallCharge,
  EditCallCharge,
  EditExpertCallCharge,
  FetchCommission,
  EditCommission,
  EditMiniWithdrawalAmt,
  ManagePost,
  ViewPostById,
  getStateAll,
  getCityAll,
  AddCity,
  DeleteCity,
  DeleteRating,
  EditCity,
  getWithdrawalRequest,
  getWithdrawalRequestById,
  getRefundRequestById,
  FetchSubscribedExpert,
  ViewSubExpert,
  viewExpertEye,
  updateExpertEye,
  getRating,
  getUserRating,
  getUserPost,
  getPostMilestone,
  getExpertRating,
  getExpertPost,
  FetchNdaPrice,
  EditNdaPrice,
  getUserTabularReport,
  getInactiveUserTabularReport,
  getActiveUserTabularReport,
  getExpertTabularReport,
  getJobPostTabularReport,
  getInactiveExpertTabularReport,
  getUserAnalyticalReport,
  getExpertAnalyticalReport,
  getPostAnalyticalReport,
  ManageEarnings,
  getEarningTabularReport,
  getEarningAnalyticalReport,
  AcceptWithdrawRequest,
  RejectWithdrawRequest,
  getContactUs,
  sendReplyController,
  getEarningDetailsById,
  getConsultationById,
  getEarningById,
  getUserConsultationById,
  getUserWalletDetailsId,
  getRefundRequest,
  MarkAsResolved,
  sendMailController,
  sendInactiveMailController,
  ManageSubAdmin,
  AddSubAdmin,
  EditSubAdmin,
  FetchInactiveExpert,
  FetchInactiveUser,
  updateAdminDetails,
  adminDetails,
  GetDetailsUpdateRequests,
  UpdateDetailsRequestStatus,
  getAllRefundRequests,
  acceptRefund,
  rejectRefundRequest,
  getrefundDetailsById,
  sendRefundMail
};
