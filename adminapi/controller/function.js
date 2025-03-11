const crypto = require('crypto');
const connection = require('../model/connection');

async function hashPassword(password) {
  const hash = crypto.createHash('md5');
  hash.update(password);
  return hash.digest('hex');
}
function generateOTP(limit) {
  var digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < limit; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}
async function getUserData(userId) {
  const query =
    "SELECT `user_id`, `user_type`, `email`, `name`, `dob`, `mobile`, `otp`, `otp_verify`, `image`, `gender`, `address`,`bio`, `active_flag`,  `profile_completed`, `language`, `delete_reason`, `createtime`, `updatetime`,previlages FROM user_master WHERE user_id = ? and delete_flag=0";
  // eslint-disable-next-line no-useless-catch
  try {
    const results = await new Promise((resolve, reject) => {
      connection.query(query, [userId], (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    if (results.length > 0) {
      const userData = results[0];
      const userDataArray = {
        user_id: userData.user_id,
        user_type: userData.user_type,
        email: userData.email,
        name: userData.name,
        dob: userData.dob,
        age: userData.age,
        mobile: userData.mobile,
        otp: userData.otp,
        otp_verify: userData.otp_verify,
        image: userData.image,
        gender: userData.gender,
        address: userData.address,
        active_flag: userData.active_flag,
        profile_completed: userData.profile_completed,
        language: userData.language,
        delete_reason: userData.delete_reason,
        createtime: userData.createtime,
        updatetime: userData.updatetime,
        bio: userData.bio,
        previlages: userData.previlages,
      };
    
      return userDataArray; // Return user data object
    } else {
      return null; // Return null if user not found
    }
  } catch (error) {
    throw error; // Throw error for higher-level handling
  }
}
module.exports = { hashPassword, generateOTP, getUserData };
