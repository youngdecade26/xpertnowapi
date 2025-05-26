const connection = require('../connection')
const jwt = require('jsonwebtoken');
const { generateOTP, hashPassword, getUserDetails, DeviceTokenStore_1_Signal } = require('../shared functions/functions');
const languageMessage = require('../shared functions/languageMessage');
const twilio = require('twilio');
const { fields } = require('../middleware/multer');
const { getNotificationArrSingle, oneSignalNotificationSendCall } = require('./notification');
const moment = require("moment");
const SECRET_KEY = "TOKEN-KEY"; // Change to your secure secret
const { mailer } = require('./MailerApi');

// send otp on mobile function
const https = require('https');
async function otpSendMessage(mobile, otp) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            hostname: 'control.msg91.com',
            path: `/api/v5/otp?otp=${otp}&otp_length=6&otp_expiry=5&template_id=67e253a1d6fc050fad3baff4&mobile=91${mobile}&authkey=435272AT2B1NRQ67e38dbeP1`,
            headers: { 'Content-Type': 'application/json' },
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('OTP API Response:', data);
                resolve(JSON.parse(data));
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// send otp 
// const axios = require('axios');

// const sendOtp = async () => {
//   try {
//     const response = await axios.post(
//       `https://control.msg91.com/api/v5/otp?template_id=67e253a1d6fc050fad3baff4&mobile=${mobile}&authkey=435272AT2B1NRQ67e38dbeP1&realTimeResponse=`,
//       {
//         Param1: "value1",
//         Param2: "value2",
//         Param3: "value3"
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('OTP API Response:', response.data);
//   } catch (error) {
//     console.error('Error sending OTP:', error.response ? error.response.data : error.message);
//   }
// };
// sendOtp();




//Get content
const getContent = async (request, response) => {
    const query = "SELECT content_id, content_type, content FROM content_master WHERE delete_flag = 0";
    connection.query(query, (err, rows) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            return response.status(200).json({ success: false, error: languageMessage.internalServerError });
        }
        let webservice_url = process.env.WEBSERVICE_URL;
        const content_arr = rows.map(row => ({
            content_id: row.content_id,
            content_type: row.content_type,
            content: row.content,
            content_url: `${webservice_url}/get_all_content_url?content_type=${row.content_type}`,
            status: false
        }));
        if (content_arr.length === 0) {
            const content_arr = 'NA';
            return response.status(200).json({ success: true, message: languageMessage.dataFound, content_arr });
        }
        return response.status(200).json({ success: true, message: languageMessage.dataFound, content_arr });
    });
};
const getAllContentUrl = (request, response) => {
    try {
        const { content_type } = request.query;
        const query1 = "SELECT content_id, content_type, content FROM content_master WHERE delete_flag = 0 AND content_type = ? ";
        const val1 = [content_type];
        connection.query(query1, val1, (valError, valResult) => {
            if (valError) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError });
            }
            if (valResult.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataFound });
            }
            let content_en;
            content_en = valResult[0].content
            let new12 = '<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src * data: gap: content:"><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui"><title>Data</title></head><body style="word-break: break-all;">' + content_en + '</body></html>';
            return response.send(new12);
        });
    } catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError });
    }
};
//end
//USER
//customer SignUp step 1

const usersignUp_1 = async (request, response) => {
    let { mobile, player_id, device_type, login_type, device_id, type } = request.body;
    if (!mobile || !player_id || !device_type || !login_type || !device_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        return response.status(200).json({ success: false, msg: languageMessage.InvalidNumber });
    }

    try {



        const query1 = "SELECT user_id, active_flag, user_type FROM user_master WHERE mobile = ? AND delete_flag=0";
        const values1 = [mobile];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }

            if (result.length > 0) {
                const user_id_get = result[0].user_id;

                if (type == 0) {
                    // const otp = 123456;
                    const otp = await generateOTP(6);
                    // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
                    // let notiSendStatus;
                    // try {
                    //     notiSendStatus = await otpSendMessage(mobile, otp);
                    // } catch (error) {
                    //     console.error('OTP Sending Failed:', error);
                    //     notiSendStatus = error;
                    // }
                    const updateOtpQuery = "UPDATE user_master SET otp = ? WHERE user_id = ? and delete_flag=0";
                    connection.query(updateOtpQuery, [otp, user_id_get], (err) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                        }
                    });
                }

                const checkSessionQuery = "SELECT device_id FROM user_sessions WHERE user_id = ?";
                connection.query(checkSessionQuery, [user_id_get], async (err, sessionResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (sessionResult.length > 0 && sessionResult[0].device_id !== device_id) {
                        const deleteOldSessionQuery = "DELETE FROM user_sessions WHERE user_id = ?";
                        connection.query(deleteOldSessionQuery, [user_id_get]);
                    }

                    const token = jwt.sign({ user_id_get, device_id }, SECRET_KEY, { expiresIn: "1h" });
                    const insertSessionQuery = "INSERT INTO user_sessions (user_id, device_id, token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?";
                    connection.query(insertSessionQuery, [user_id_get, device_id, token, token]);

                    const check_device = await DeviceTokenStore_1_Signal(user_id_get, device_type, player_id);
                    const userDetails = await getUserDetails(user_id_get);
                    return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, userDataArray: userDetails, token: token });
                });
            } else {
                if (type == 1) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }

                let id;
                if (device_type === 'andriod') { id = 0; }

                if (device_type === 'ios') { id = 1; }
                // const otp = 123456;
                const otp = await generateOTP(6);
                // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
                // let notiSendStatus;
                // try {
                //     notiSendStatus = await sendOtp(mobile, otp);
                // } catch (error) {
                //     console.error('OTP Sending Failed:', error);
                //     notiSendStatus = error;
                // }

                const newUserQuery = "INSERT INTO user_master (mobile, otp, user_type, player_id, device_type, createtime, updatetime, login_type, signup_step) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)";
                const values = [mobile, otp, 1, player_id, id, 0, 0];

                connection.query(newUserQuery, values, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                    }

                    const user_id_get = result.insertId;
                    const token = jwt.sign({ user_id_get, device_id }, SECRET_KEY, { expiresIn: "1h" });
                    const insertSessionQuery = "INSERT INTO user_sessions (user_id, device_id, token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?";
                    connection.query(insertSessionQuery, [user_id_get, device_id, token, token]);

                    const check_device = await DeviceTokenStore_1_Signal(user_id_get, device_type, player_id);
                    const userDetails = await getUserDetails(user_id_get);

                    return response.status(200).json({ success: true, msg: languageMessage.userCreatedSuccess, userDataArray: userDetails, token: token });
                });
            }
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};

//end


//customer Verify Otp
const userOtpVerify = async (request, response) => {
    let { user_id, otp } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!otp) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, otp FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const userOpt = result[0].otp;
            if (userOpt !== otp) {
                return response.status(200).json({ success: false, msg: languageMessage.invalidOtp });
            }
            const clearOtpQuery = `
            UPDATE user_master 
            SET otp = NULL, otp_verify = 1
            WHERE user_id = ?
        `;
            connection.query(clearOtpQuery, [user_id], async (err) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.otpVerifiedSuccess, userDataArray: userDetails });

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end


//customer Resend Otp
const userResendOtp = async (request, response) => {
    let { user_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, otp FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            const otp = await generateOTP(6);
            // const otp = 123456;

            // const mobile = result[0].mobile;
            // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
            // let notiSendStatus;
            // try {
            //     notiSendStatus = await otpSendMessage(mobile, otp);
            // } catch (error) {
            //     console.error('OTP Sending Failed:', error);
            //     notiSendStatus = error;
            // }

            const clearOtpQuery = `
            UPDATE user_master 
            SET otp = ?
            WHERE user_id = ?
        `;
            connection.query(clearOtpQuery, [otp, user_id], async (err) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, userDataArray: userDetails });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end

//customer Sign Up step 2
const usersignUp_2 = async (request, response) => {
    let { user_id, name, email, dob, gender, pan_number, adhar_number, gst_number, pancard_front_image, pancard_back_image, adharcard_front_image, adharcard_back_image, gst_image, image } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    // let fileIds;
    // if (request.files && request.files['image']) {
    //     const filePromises = request.files['image'].map((f) => {
    //         return new Promise((resolve, reject) => {
    //             const fileInsertQuery = `INSERT INTO file_master(file_name, delete_flag, createtime, updatetime,user_id ) VALUES (?, 0, NOW(), NOW(),?)`;
    //             connection.query(fileInsertQuery, [f.filename,user_id], (err, result) => {
    //                 if (err) {
    //                     reject(err);
    //                 } else {
    //                     resolve(f.filename);
    //                 }
    //             });
    //         });
    //     });
    //     try {
    //         fileIds = await Promise.all(filePromises);
    //     } catch (err) {
    //         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    //     }
    // }
    // let fileIdsJson;
    // if (fileIds) {
    //     fileIdsJson = fileIds.toString();
    // }

    // return response.status(200).json({ "fileIdsJson" :fileIdsJson })
    // let pancard_front_image;
    // let pancard_back_image;
    // let adharcard_front_image;
    // let adharcard_back_image;
    // let gst_image;
    // if (request.files && request.files['pancard_front_image']){
    //     pancard_front_image = request.files['pancard_front_image'][0].filename;
    // }

    // if (request.files && request.files['pancard_back_image']) {
    //     pancard_back_image = request.files['pancard_back_image'][0].filename;
    // }

    // if (request.files && request.files['adharcard_front_image']) {
    //     adharcard_front_image = request.files['adharcard_front_image'][0].filename;
    // }
    // if (request.files && request.files['adharcard_back_image']) {
    //     adharcard_back_image = request.files['adharcard_back_image'][0].filename;
    // }
    // if (request.files && request.files['gst_image']) {
    //     gst_image = request.files['gst_image'][0].filename;
    // }
    try {
        const query1 = "SELECT mobile, active_flag, email FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            if (name || email || dob || gender || pan_number || adhar_number || gst_number || image) {
                let updateQuery = `UPDATE user_master SET profile_completed=1, updatetime = NOW() `;
                let updateValues = [];
                if (name) {
                    updateQuery += `, name = ?`;
                    updateValues.push(name);
                }
                if (email) {
                    updateQuery += `, email = ?`;
                    updateValues.push(email);
                }
                if (dob) {
                    updateQuery += `, dob = ?`;
                    updateValues.push(dob);
                }
                if (gender) {
                    updateQuery += `, gender = ?`;
                    updateValues.push(gender);
                }
                if (image) {
                    updateQuery += `, image = ?`;
                    updateValues.push(image);
                }
                if (pan_number) {
                    updateQuery += `, pan_number = ?`;
                    updateValues.push(pan_number);
                }
                if (adhar_number) {
                    updateQuery += `, adhar_number = ?`;
                    updateValues.push(adhar_number);
                }
                if (gst_number) {
                    updateQuery += `, gst_number = ?`;
                    updateValues.push(gst_number);
                }
                if (pancard_front_image) {
                    updateQuery += `, pancard_front_image = ?`;
                    updateValues.push(pancard_front_image);
                }
                if (pancard_back_image) {
                    updateQuery += `, pancard_back_image = ?`;
                    updateValues.push(pancard_back_image);
                }
                if (adharcard_front_image) {
                    updateQuery += `, adharcard_front_image = ?`;
                    updateValues.push(adharcard_front_image);
                }
                if (adharcard_back_image) {
                    updateQuery += `, adharcard_back_image = ?`;
                    updateValues.push(adharcard_back_image);
                }
                if (gst_image) {
                    updateQuery += `, gst_image = ?`;
                    updateValues.push(gst_image);
                }

                updateQuery += ` WHERE user_id = ? AND delete_flag=0`;
                updateValues.push(user_id);
                connection.query(updateQuery, updateValues, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (result.affectedRows > 0) {
                        const user_id_notification = user_id;
                        const other_user_id_notification = user_id;
                        const action = "signup";
                        const action_id = "0";
                        const title = "Xpert Now";
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const messages = `You’re in! Welcome to ${title}`;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                            } else {
                                console.log("Notification array is empty");
                            }
                        });
                        const userDetails = await getUserDetails(user_id);
                        return response.status(200).json({ success: true, msg: languageMessage.updateSuccess, userDataArray: userDetails });
                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                });
            } else {
                const updateQuery = `UPDATE user_master SET profile_completed=1, updatetime = NOW() WHERE user_id = ? AND delete_flag=0`;
                const updateValues = [user_id];
                connection.query(updateQuery, updateValues, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (result.affectedRows > 0) {
                        const user_id_notification = user_id;
                        const other_user_id_notification = user_id;
                        const action = "signup";
                        const action_id = "0";
                        const title = "Xpert Now";
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const messages = `You’re in! Welcome to ${title}`;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                            } else {
                                console.log("Notification array is empty");
                            }
                        });
                        const userDetails = await getUserDetails(user_id);
                        return response.status(200).json({ success: true, msg: languageMessage.updateSuccess, userDataArray: userDetails });
                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                });
            }

        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//customer Get Expertise Category
const getExpertiseCategory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT category_id, type_name, name, updatetime FROM categories_master WHERE category_type = 3 AND delete_flag=0";
            connection.query(query1, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: result });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//customer Get sub Expertise Categories
const getSubExpertiseCategory = async (request, response) => {
    let { user_id, category_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT type_name, name, sub_categories, updatetime FROM categories_master WHERE  category_id = ? AND delete_flag=0";
            connection.query(query1, [category_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const parsedResult = result.map(item => ({
                    ...item,
                    sub_categories: item.sub_categories ? JSON.parse(item.sub_categories) : [],
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: parsedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//customer Get sub Expertise Categories level
const getSubExpertiseCategoryLevel = async (request, response) => {
    let { user_id, sub_category_id } = request.query;
    if (!user_id || !sub_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT sub_level_category_id, sub_level_category_name, updatetime FROM sub_level_categories_master WHERE sub_category_id = ? AND delete_flag=0";
            connection.query(query1, [sub_category_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: result });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
// Manage User Privacy
const managePrivacy = async (request, response) => {
    let { user_id, chat_access, img_access, screenshot_access, callrecord_access } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!chat_access) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'chat_access' });
    }
    if (!img_access) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: ' img_access' });
    }
    if (!screenshot_access) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: ' screenshot_access' });
    }
    if (!callrecord_access) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'callrecord_access' });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const newUserQuery = `
            UPDATE user_master 
            SET chat_access = ?, img_access = ?, screenshot_access = ?, callrecord_access = ?
            WHERE user_id = ?
        `;
            connection.query(newUserQuery, [chat_access, img_access, screenshot_access, callrecord_access, user_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }

                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.PolicyUpdateSuccess, userDataArray: userDetails });

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Delete Account
const deleteAccount = async (request, response) => {
    let { user_id, reason } = request.body
    if (!user_id || !reason) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const newUserQuery = `
            UPDATE user_master 
            SET delete_reason = ?, delete_flag = 1
            WHERE user_id = ?
        `;
            connection.query(newUserQuery, [reason, user_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }

                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.profileDeleteSuccess, userDataArray: userDetails });

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//user edit profile 
const editProfile = async (request, response) => {
    let { user_id, name, email, dob, gender, pan_number, adhar_number, gst_number, pancard_front_image, pancard_back_image, adharcard_front_image, adharcard_back_image, gst_image, image } = request.body;
    //    return response.status(200).json( request.body);
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }

    if (!name) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'name' });
    }
    if (!email) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'email' });
    }
    if (!dob) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'dob' });
    }
    if (!gender) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'gender' });
    }
    if (!pan_number) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'pan_number' });
    }
    if (!adhar_number) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'adhar_number' });
    }

    // if(!adhar_number){
    //     return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key:'adhar_number' });
    // }



    // let image = null;
    // let pancard_front_image;
    // let pancard_back_image;
    // let adharcard_front_image;
    // let adharcard_back_image;
    // let gst_image;

    // if (request.files && request.files['pancard_front_image']) {
    //     pancard_front_image = request.files['pancard_front_image'][0].filename;
    // }

    // if (request.files && request.files['pancard_back_image']) {
    //     pancard_back_image = request.files['pancard_back_image'][0].filename;
    // }

    // if (request.files && request.files['adharcard_front_image']) {
    //     adharcard_front_image = request.files['adharcard_front_image'][0].filename;
    // }
    // if (request.files && request.files['adharcard_back_image']) {
    //     adharcard_back_image = request.files['adharcard_back_image'][0].filename;
    // }
    // if (request.files && request.files['gst_image']) {
    //     gst_image = request.files['gst_image'][0].filename;
    // }
    // if (request.files && request.files['image']) {
    //     image = request.files['image'][0].filename;
    // }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            // Prepare the query dynamically based on the presence of gst_number
            let updateQuery = `
                UPDATE user_master 
                SET name = ?, email = ?, dob = ?, gender = ?, pan_number = ?, adhar_number = ?,gst_number = ?
            `;
            let updateValues = [name, email, dob, gender, pan_number, adhar_number, gst_number];
            if (image) {
                updateQuery += `, image = ?`;
                updateValues.push(image);
            }
            if (pancard_front_image) {
                updateQuery += `, pancard_front_image = ?`;
                updateValues.push(pancard_front_image);
            }
            if (pancard_back_image) {
                updateQuery += `, pancard_back_image = ?`;
                updateValues.push(pancard_back_image);
            }
            if (adharcard_front_image) {
                updateQuery += `, adharcard_front_image = ?`;
                updateValues.push(adharcard_front_image);
            }
            if (adharcard_back_image) {
                updateQuery += `, adharcard_back_image = ?`;
                updateValues.push(adharcard_back_image);
            }
            if (gst_image) {
                updateQuery += `, gst_image = ?`;
                updateValues.push(gst_image);
            }
            updateQuery += ` WHERE user_id = ?`;
            updateValues.push(user_id);
            connection.query(updateQuery, updateValues, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }
                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.profileUpdatedSuccess, userDataArray: userDetails });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};

//end
//get notification 
const getUserNotification = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query2 = "SELECT notification_message_id, action, title, message, updatetime,createtime FROM user_notification_message WHERE user_id = ? AND delete_flag=0 AND read_status = 0";
            const values2 = [user_id];
            connection.query(query2, values2, async (err, notificationresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                // Fetch user details for each item and category
                const finalBidResult = await Promise.all(notificationresult.map(async (Item) => {
                    return {
                        ...Item,
                        notification_date: moment(Item.createtime).format("MMM DD YYYY"),
                        notification_time: moment(Item.createtime).format("hh:mm A"),
                    };
                }));
                if (finalBidResult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, notifications: "NA" });
                }
                return response.status(200).json({ success: false, msg: languageMessage.dataFound, notifications: finalBidResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//get customer Support
const getCustomerSupport = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query2 = "SELECT customer_support_id, question, answer, updatetime FROM customer_support WHERE delete_flag=0";
            const values2 = [user_id];
            connection.query(query2, values2, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const updatedResult = result.map(faq => ({
                    ...faq,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, dataArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end

// Expert SignUp step 1
const signUp_1 = async (request, response) => {
    let { mobile, player_id, device_type, device_id, type } = request.body;
    if (!mobile) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!player_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!device_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!device_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }



    if (!/^[6-9]\d{9}$/.test(mobile)) {
        return response.status(200).json({ success: false, msg: languageMessage.InvalidNumber });
    }

    try {
        const query1 = "SELECT user_id, active_flag, user_type FROM user_master WHERE mobile = ? AND delete_flag=0";
        const values1 = [mobile];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length > 0) {
                if (result[0].user_type === 1) {
                    return response.status(200).json({ success: false, msg: languageMessage.alreadyUseNum });
                }

                const user_id_get = result[0].user_id;
                if (type == 0) {
                    // const otp = 123456;
                    const otp = await generateOTP(6);
                    // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
                    // let notiSendStatus;
                    // try {
                    //     notiSendStatus = await otpSendMessage(mobile, otp);
                    // } catch (error) {
                    //     console.error('OTP Sending Failed:', error);
                    //     notiSendStatus = error;
                    // }
                    const newUserQuery = `UPDATE user_master SET otp = ? WHERE user_id = ?`;
                    connection.query(newUserQuery, [otp, result[0].user_id], async (err, result1) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                        }
                    });
                }

                let get_device_type;
                if (device_type === 'andriod') { get_device_type = 0; }
                if (device_type === 'ios') { get_device_type = 1; }
                if (device_type === 'web') { get_device_type = 2; }
                const checkSessionQuery = "SELECT device_id FROM user_sessions WHERE user_id = ?";
                connection.query(checkSessionQuery, [user_id_get], async (err, sessionResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (sessionResult.length > 0 && sessionResult[0].device_id !== device_id) {
                        // Logout the previous session
                        const deleteOldSessionQuery = "DELETE FROM user_sessions WHERE user_id = ?";
                        connection.query(deleteOldSessionQuery, [user_id_get]);
                    }
                    // Generate new token
                    const token = jwt.sign({ user_id_get, device_id }, SECRET_KEY, { expiresIn: "1h" });
                    // Store new session
                    const insertSessionQuery = "INSERT INTO user_sessions (user_id, device_id, token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?";
                    connection.query(insertSessionQuery, [user_id_get, device_id, token, token]);
                    const check_device = await DeviceTokenStore_1_Signal(result[0].user_id, get_device_type, player_id);
                    const userDetails = await getUserDetails(result[0].user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, userDataArray: userDetails, token: token });
                });
                // });
                return;
            }
            else {
                if (type == 1) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }
                let id;
                if (device_type === 'andriod') { id = 0; }
                if (device_type === 'ios') { id = 1; }
                if (device_type === 'web') { id = 2; }
                // const otp = 123456;
                const otp = await generateOTP(6);

                // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
                // let notiSendStatus;
                // try {
                //     notiSendStatus = await otpSendMessage(mobile, otp);
                // } catch (error) {
                //     console.error('OTP Sending Failed:', error);
                //     notiSendStatus = error;
                // }
                const newUserQuery = `
            INSERT INTO user_master (mobile, otp, user_type, player_id, device_type, createtime, updatetime)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `;
                const values = [mobile, otp, 2, player_id, id]
                connection.query(newUserQuery, values, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                    }
                    const user_id_get = result.insertId;
                    const checkSessionQuery = "SELECT device_id FROM user_sessions WHERE user_id = ?";
                    connection.query(checkSessionQuery, [user_id_get], async (err, sessionResult) => {
                        if (err) {
                            return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                        }
                        if (sessionResult.length > 0 && sessionResult[0].device_id !== device_id) {
                            // Logout the previous session
                            const deleteOldSessionQuery = "DELETE FROM user_sessions WHERE user_id = ?";
                            connection.query(deleteOldSessionQuery, [user_id_get]);
                        }
                        // Generate new token
                        const token = jwt.sign({ user_id_get, device_id }, SECRET_KEY, { expiresIn: "1h" });
                        // Store new session
                        const insertSessionQuery = "INSERT INTO user_sessions (user_id, device_id, token) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?";
                        connection.query(insertSessionQuery, [user_id_get, device_id, token, token]);
                        const check_device = await DeviceTokenStore_1_Signal(user_id_get, id, player_id);
                        const userDetails = await getUserDetails(result.insertId);
                        return response.status(200).json({ success: true, msg: languageMessage.userCreatedSuccess, userDataArray: userDetails, token: token });

                    });
                });
            }
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end

//Expert Verify Otp
const otpVerify = async (request, response) => {
    let { user_id, otp } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!otp) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, otp FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const userOpt = result[0].otp;
            if (userOpt !== otp) {
                return response.status(200).json({ success: false, msg: languageMessage.invalidOtp });
            }
            const clearOtpQuery = `
            UPDATE user_master 
            SET otp = NULL, otp_verify = 1
            WHERE user_id = ?
        `;
            connection.query(clearOtpQuery, [user_id], async (err) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }

                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.otpVerifiedSuccess, userDataArray: userDetails });

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Resend Otp
const resendOtp = async (request, response) => {
    let { user_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, otp FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const otp = await generateOTP(6);
            // const otp = 123456;
            // const mobile = result[0].mobile;
            // const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP
            // let notiSendStatus;
            // try {
            //     notiSendStatus = await otpSendMessage(mobile, otp);
            // } catch (error) {
            //     console.error('OTP Sending Failed:', error);
            //     notiSendStatus = error;
            // }
            const clearOtpQuery = `
            UPDATE user_master 
            SET otp = ?
            WHERE user_id = ?
        `;
            connection.query(clearOtpQuery, [otp, user_id], async (err) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }

                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, userDataArray: userDetails });

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get Cities for Expert
const getCities = async (request, response) => {
    let { user_id, state_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!state_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT city_id,state_id,city_name FROM city_master WHERE state_id = ? AND delete_flag=0";
            connection.query(query1, [state_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const updatedResult = result.map(city => ({
                    ...city,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, citiesDataArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get States for Expert
const getStates = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT state_id, state_name FROM state_master WHERE delete_flag=0";
            connection.query(query1, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const updatedResult = result.map(state => ({
                    ...state,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, statesDataArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get Degree for Expert
const getDegree = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT degree_id, name FROM degree_master WHERE delete_flag=0";
            connection.query(query1, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const updatedResult = result.map(degree => ({
                    ...degree,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, degreeDataArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get CategoryDetails for Expert
const getCategoryDetails = async (request, response) => {
    // let { user_id } = request.query;
    try {
        const query1 = "SELECT category_id, type_name, name, image, updatetime FROM categories_master WHERE delete_flag=0 ORDER BY createtime DESC";
        connection.query(query1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            const updatedResult = result.map(category => ({
                ...category,
                status: false
            }));
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: updatedResult });
        });
        // });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get sub Categories for Expert
const getSubCategoryDetails = async (request, response) => {
    let { category_id } = request.query;

    if (!category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {

        const query1 = "SELECT sub_category_id, sub_category_name, image, updatetime FROM sub_categories_master WHERE category_id = ? AND delete_flag=0";
        connection.query(query1, [category_id], async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            const updatedSubResult = result.map(subcategory => ({
                ...subcategory,
                status: false
            }));
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: updatedSubResult });
        });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get Sub category levels
const getSubCategoryLevelDetails = async (request, response) => {
    let { sub_category_id } = request.query;
    if (!sub_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {

        const query1 = "SELECT sub_level_category_id, sub_level_category_name, updatetime FROM sub_level_categories_master WHERE sub_category_id = ? AND delete_flag=0";
        connection.query(query1, [sub_category_id], async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            const updatedResult = result.map(category => ({
                ...category,
                status: false
            }));
            if (updatedResult.length === 0) {
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: 'NA' });
            }
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: updatedResult });
        });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Get Expert Languages
const getExpertLanguages = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT language_id,name FROM language_master WHERE delete_flag=0";
            connection.query(query1, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const updatedResult = result.map(language => ({
                    ...language,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertLanguagesArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Expert Sign Up step 2
const signUp_2 = async (request, response) => {
    let { user_id, name, email, dob, gender, state, city, address, degree, language, licence_number, referral_number, category, sub_category, sub_category_level, experience, about, pan_number, adhar_number, gst_number, call_charge, industry_name, institute_name, sub_two_level_category_id, sub_three_level_category_id, file, degree_file, image, pancard_front_image, pancard_back_image, adharcard_front_image, adharcard_back_image, gst_image, resume } = request.body;

    // let image = null;
    let fileIds;
    if (file) {
        let images = file.split(",")
        const filePromises = images.map((data) => {
            return new Promise((resolve, reject) => {
                const fileInsertQuery = `INSERT INTO file_master (file_name,user_id, delete_flag, createtime, updatetime) VALUES (?,?, 0, NOW(), NOW())`;
                connection.query(fileInsertQuery, [data, user_id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
        try {
            fileIds = await Promise.all(filePromises);

        } catch (err) {
            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
        }
    }
    if (degree_file) {
        let degree_image = degree_file.split(",");
        const degreeFilePromises = degree_image.map((degree_data) => {
            return new Promise((resolve, reject) => {
                const fileInsertQuery = `INSERT INTO user_degree_master (document_file, user_id, delete_flag, createtime, updatetime) VALUES (?,?, 0, NOW(), NOW())`;
                connection.query(fileInsertQuery, [degree_data, user_id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(degree_data);
                    }
                });
            });
        });
        try {
            fileIds = await Promise.all(degreeFilePromises);
        } catch (err) {
            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
        }
    }
    // if(request.files && request.files['image']){
    //     image = request.files['image'][0].filename;
    // }
    // let pancard_front_image;
    // let pancard_back_image;
    // let adharcard_front_image;
    // let adharcard_back_image;
    // let gst_image;
    // if (request.files && request.files['pancard_front_image']) {
    //     pancard_front_image = request.files['pancard_front_image'][0].filename;
    // }

    // if (request.files && request.files['pancard_back_image']) {
    //     pancard_back_image = request.files['pancard_back_image'][0].filename;
    // }

    // if (request.files && request.files['adharcard_front_image']) {
    //     adharcard_front_image = request.files['adharcard_front_image'][0].filename;
    // }
    // if (request.files && request.files['adharcard_back_image']) {
    //     adharcard_back_image = request.files['adharcard_back_image'][0].filename;
    // }
    // if (request.files && request.files['gst_image']) {
    //     gst_image = request.files['gst_image'][0].filename;
    // }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            let subCategoryLevelJson;
            if (sub_category_level) {
                subCategoryLevelJson = sub_category_level.toString();
            }
            const degreeJson = degree.toString();
            const languageJson = language.toString();

            let fileIdsJson;
            if (fileIds) {
                fileIdsJson = fileIds.toString();
            }
            // return response.status(200).json({"res": fileIdsJson})
            if (name) {
                let updateQuery = `UPDATE user_master SET name = ?, email = ?, dob = ?, gender = ?, state = ?, city = ?, address = ?,degree = ?, language = ?,image = ?, licence_number = ?, referral_number = ?,category = ?, sub_category = ?, sub_category_level = ?, experience = ?,about = ?, pan_number = ?, gst_number = ?, call_charge = ?,industry_name=?,institute_name=?,sub_two_level_category_id=?,sub_three_level_category_id=?, profile_completed=1,updatetime = NOW() `;
                let updateValues = [name, email, dob, gender, state, city, address, degreeJson, languageJson, image, licence_number, referral_number, category, sub_category, subCategoryLevelJson, experience, about, pan_number, gst_number, call_charge, industry_name, institute_name, sub_two_level_category_id, sub_three_level_category_id];
                if (pancard_front_image) {
                    updateQuery += `, pancard_front_image = ?`;
                    updateValues.push(pancard_front_image);
                }
                if (pancard_back_image) {
                    updateQuery += `, pancard_back_image = ?`;
                    updateValues.push(pancard_back_image);
                }
                // if (adharcard_front_image) {
                //     updateQuery += `, adharcard_front_image = ?`;
                //     updateValues.push(adharcard_front_image);
                // }
                // if (adharcard_back_image) {
                //     updateQuery += `, adharcard_back_image = ?`;
                //     updateValues.push(adharcard_back_image);
                // }
                if (gst_image) {
                    updateQuery += `, gst_image = ?`;
                    updateValues.push(gst_image);
                }

                if (resume) {
                    updateQuery += `, resume = ?`;
                    updateValues.push(resume);
                }
                updateQuery += ` WHERE user_id = ? AND delete_flag=0`;
                updateValues.push(user_id);
                connection.query(updateQuery, updateValues, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (result.affectedRows > 0) {
                        const user_id_notification = user_id;
                        const other_user_id_notification = user_id;
                        const action = "signup";
                        const action_id = "0";
                        const title = "Xpert Now";
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const messages = `You’re in! Welcome to ${title}`;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                            } else {
                                console.log("Notification array is empty");
                            }
                        });
                        const userDetails = await getUserDetails(user_id);
                        return response.status(200).json({ success: true, msg: languageMessage.updateSuccess, userDataArray: userDetails });
                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                });
            } else {
                const updateQuery = `UPDATE user_master SET profile_completed=1,updatetime = NOW() WHERE user_id = ? AND delete_flag=0`;
                const updateValues = [user_id];
                connection.query(updateQuery, updateValues, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (result.affectedRows > 0) {
                        const user_id_notification = user_id;
                        const other_user_id_notification = user_id;
                        const action = "signup";
                        const action_id = "0";
                        const title = "Xpert Now";
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const messages = `You’re in! Welcome to ${title}`;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                            } else {
                                console.log("Notification array is empty");
                            }
                        });
                        const userDetails = await getUserDetails(user_id);
                        return response.status(200).json({ success: true, msg: languageMessage.updateSuccess, userDataArray: userDetails });
                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                });
            }

        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end





//Expert Update Bank Details
const updateBankDetails = async (request, response) => {
    let { user_id, bank_user_name, bank_name, bank_account_no, bank_branch, ifsc_code } = request.body;
    if (!user_id || !bank_user_name || !bank_name || !bank_account_no || !bank_branch || !ifsc_code) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const file = request?.file ? request?.file.filename : null;
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const updateQuery = `
            UPDATE user_master 
            SET 
                bank_user_name = ?, bank_name = ?, bank_account_no = ?, bank_branch = ?, ifsc_code = ?,
                updatetime = NOW()
            WHERE user_id = ? AND delete_flag=0
        `;
            const updateValues = [
                bank_user_name, bank_name, bank_account_no, bank_branch, ifsc_code, user_id
            ];
            connection.query(updateQuery, updateValues, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result.affectedRows > 0) {

                    const userDetails = await getUserDetails(user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.updateBankSuccess, userDataArray: userDetails });

                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//edit call charge
const editCallCharge = async (request, response) => {
    let { user_id, call_charge } = request.body;
    if (!user_id || !call_charge) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const newUserQuery = `
            UPDATE user_master 
            SET call_charge = ?
            WHERE user_id = ?
        `;
            connection.query(newUserQuery, [call_charge, user_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }
                if (result.affectedRows > 0) {
                    const userDetails = await getUserDetails(user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.editSuccess, userDataArray: userDetails });
                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//edit expertise and experience
const editExpertiseAndExperience = async (request, response) => {

    let { user_id, category, sub_category, sub_category_level, experience, about, sub_two_level_category_id, sub_three_level_category_id } = request.body;
    if (!user_id || !category || !sub_category || !sub_category_level || !experience || !about || !sub_two_level_category_id || !sub_three_level_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const subCategoryLevel = sub_category_level.toString();
            const newUserQuery = `
            UPDATE user_master 
            SET category = ?, sub_category = ?, sub_category_level = ?, experience = ?, about = ?,sub_two_level_category_id=?,sub_three_level_category_id=?
            WHERE user_id = ?
        `;
            const value = [category, sub_category, subCategoryLevel, experience, about, sub_two_level_category_id, sub_three_level_category_id, user_id]
            connection.query(newUserQuery, value, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }
                if (result.affectedRows > 0) {
                    const userDetails = await getUserDetails(user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.editSuccess, userDataArray: userDetails });
                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//edit professional details
const editProfessionalDetails = async (request, response) => {
    let { user_id, degree, language, licence_number, referral_number, industry_name, institute_name, file, degree_file, resume } = request.body;
    // Check required fields
    if (!user_id || !degree || !language) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let fileIds;
    if (file) {
        let files = file.split(",");
        const filePromises = files.map((data) => {
            return new Promise((resolve, reject) => {
                const fileDeleteQuery = `DELETE FROM file_master WHERE user_id=?`;
                connection.query(fileDeleteQuery, [user_id], (err, result) => {
                    const fileInsertQuery = `INSERT INTO file_master (file_name, delete_flag, createtime, updatetime,user_id) VALUES (?, 0, NOW(), NOW(),?)`;
                    connection.query(fileInsertQuery, [data, user_id], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.insertId);
                        }
                    });
                });
            });
        });
        try {
            fileIds = await Promise.all(filePromises);
        } catch (err) {
            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
        }
    }

    if (degree_file) {
        let degrees = degree_file.split(",")
        const filePromises = degrees.map((data) => {
            return new Promise((resolve, reject) => {
                const fileDeleteQuery = `DELETE FROM user_degree_master WHERE user_id=?`;
                connection.query(fileDeleteQuery, [user_id], (err, result) => {
                    const fileInsertQuery = `INSERT INTO user_degree_master (document_file, delete_flag, createtime, updatetime,user_id) VALUES (?, 0, NOW(), NOW(),?)`;
                    connection.query(fileInsertQuery, [data, user_id], (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result.insertId);
                        }
                    });
                });

            });
        });
    }
    const degrees = degree.toString();
    const languages = language.toString();
    const fileIdsJson = fileIds ? fileIds.toString() : null;
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            // Build the query dynamically to handle optional fields
            const updates = [
                `degree = ?`,
                `language = ?`,
                fileIdsJson ? `file = ?` : null,
                licence_number ? `licence_number = ?` : null,
                referral_number ? `referral_number = ?` : null,
                industry_name ? `industry_name = ?` : null,
                institute_name ? `institute_name = ?` : null,
                resume ? `resume = ?` : null,
            ].filter(Boolean); // Remove `null` fields
            const newUserQuery = `
                UPDATE user_master 
                SET ${updates.join(", ")}
                WHERE user_id = ?
            `;
            const values = [
                degrees,
                languages,
                ...(fileIdsJson ? [fileIdsJson] : []),
                ...(licence_number ? [licence_number] : []),
                ...(referral_number ? [referral_number] : []),
                ...(industry_name ? [industry_name] : []),
                ...(institute_name ? [institute_name] : []),
                ...(resume ? [resume] : []),
                user_id,
            ];
            connection.query(newUserQuery, values, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result.affectedRows > 0) {
                    const userDetails = await getUserDetails(user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.editSuccess, userDataArray: userDetails });
                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//edit document number
const editDocNumber = async (request, response) => {
    let { user_id, pan_number, adhar_number, gst_number, pancard_front_image, pancard_back_image, adharcard_front_image, adharcard_back_image, gst_image } = request.body;
    if (!user_id || !pan_number) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    // let pancard_front_image;
    // let pancard_back_image;
    // let adharcard_front_image;
    // let adharcard_back_image;
    // // let gst_image;
    // if (request.files && request.files['pancard_front_image']) {
    //     pancard_front_image = request.files['pancard_front_image'][0].filename;
    // }
    // if (request.files && request.files['pancard_back_image']) {
    //     pancard_back_image = request.files['pancard_back_image'][0].filename;
    // }
    // if (request.files && request.files['adharcard_front_image']) {
    //     adharcard_front_image = request.files['adharcard_front_image'][0].filename;
    // }
    // if (request.files && request.files['adharcard_back_image']) {
    //     adharcard_back_image = request.files['adharcard_back_image'][0].filename;
    // }
    // if (request.files && request.files['gst_image']) {
    //     gst_image = request.files['gst_image'][0].filename;
    // }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            let newUserQuery = `UPDATE user_master SET pan_number = ?, gst_number = ?`;
            let value = [pan_number, gst_number]
            if (pancard_front_image) {
                newUserQuery += `, pancard_front_image = ?`;
                value.push(pancard_front_image);
            }
            if (pancard_back_image) {
                newUserQuery += `, pancard_back_image = ?`;
                value.push(pancard_back_image);
            }
            // if (adharcard_front_image) {
            //     newUserQuery += `, adharcard_front_image = ?`;
            //     value.push(adharcard_front_image);
            // }
            // if (adharcard_back_image) {
            //     newUserQuery += `, adharcard_back_image = ?`;
            //     value.push(adharcard_back_image);
            // }
            if (gst_image) {
                newUserQuery += `, gst_image = ?`;
                value.push(gst_image);
            }
            newUserQuery += ` WHERE user_id = ? AND delete_flag=0`;
            value.push(user_id);
            connection.query(newUserQuery, value, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }
                if (result.affectedRows > 0) {
                    const userDetails = await getUserDetails(user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.editSuccess, userDataArray: userDetails });
                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//edit profile details
const editProfileDetails = async (request, response) => {
    let { user_id, name, email, dob, gender, state, city, address, image } = request.body;
    if (!user_id || !name || !email || !dob || !gender || !state || !city || !address) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let fileIds;
    if (image) {
        let images = image.split(",");
        const filePromises = images.map((data) => {
            return new Promise((resolve, reject) => {
                const fileInsertQuery = `INSERT INTO file_master (file_name, delete_flag, createtime, updatetime,user_id) VALUES (?, 0, NOW(), NOW(),?)`;
                connection.query(fileInsertQuery, [data, user_id], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
        try {
            fileIds = await Promise.all(filePromises);
        } catch (err) {
            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
        }
    }
    let fileIdsJson;
    if (fileIds) {
        fileIdsJson = fileIds.toString();
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            // Initialize the query and values
            let updateQuery = "UPDATE user_master SET name = ?, email = ?, gender = ?, state = ?, city = ?, address = ? WHERE user_id = ?";
            let values = [name, email, gender, state, city, address, user_id];
            // Add dob and image to the query only if they are provided
            if (dob) {
                updateQuery = updateQuery.replace("WHERE", ", dob = ? WHERE");
                values.splice(values.length - 1, 0, dob); // Insert dob before user_id
            }
            if (fileIdsJson) {
                updateQuery = updateQuery.replace("WHERE", ", image = ? WHERE");
                values.splice(values.length - 1, 0, fileIdsJson); // Insert image before user_id
            }
            connection.query(updateQuery, values, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }
                if (result.affectedRows > 0) {
                    const userDetails = await getUserDetails(user_id);
                    return response.status(200).json({ success: true, msg: languageMessage.editSuccess, userDataArray: userDetails });
                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//get notification 
const getExpertNotification = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query2 = `SELECT unm.notification_message_id, unm.user_id, unm.other_user_id, unm.action, unm.action_id, unm.action_json, unm.title, unm.message, unm.title_2, unm.title_3, unm.title_4, unm.title_5, unm.message_2, unm.message_3, unm.message_4, unm.message_5, unm.title_ar, unm.message_arr, unm.read_status, unm.createtime , um.image 
                   FROM user_notification_message as unm INNER JOIN user_master as um ON unm.user_id = um.user_id
                   WHERE unm.other_user_id = ? AND unm.delete_flag = 0 
                   ORDER BY unm.notification_message_id DESC`;
            const values2 = [user_id];
            connection.query(query2, values2, async (err, notificationresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                // Fetch user details for each item and category
                const finalBidResult = await Promise.all(notificationresult.map(async (Item) => {
                    return {
                        ...Item,
                        notification_date: moment(Item.createtime).format("MMM DD YYYY"),
                        notification_time: moment(Item.createtime).format("hh:mm A"),
                    };
                }));
                if (finalBidResult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, notifications: "NA" });
                }
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, notifications: finalBidResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//get Expert Eye
const getExpertEye = async (request, response) => {
    let { user_id } = request.query
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        if (user_id > 0) {
            const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 ";
            const values1 = [user_id];
            connection.query(query1, values1, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }
                if (result[0]?.active_flag === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
                }
                const query2 = "SELECT expert_eye_id, content, createtime, updatetime FROM expert_eye_master WHERE delete_flag=0 ";
                const values2 = [user_id];
                connection.query(query2, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    const updateTimeQuery = `UPDATE user_master SET last_login_date_time=NOW() WHERE user_id = ?`;
                    connection.query(updateTimeQuery, [user_id], async (err, timeresult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                        }

                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertEye: result });
                    });
                });
            });
        } else {
            const query2 = "SELECT expert_eye_id, content, createtime, updatetime FROM expert_eye_master WHERE delete_flag=0 ";
            const values2 = [user_id];
            connection.query(query2, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }

                return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertEye: result });
            });
        }
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//Delete Account
const deleteExpertAccount = async (request, response) => {
    let { user_id, reason } = request.body
    if (!user_id || !reason) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 ";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const newUserQuery = `
            UPDATE user_master 
            SET delete_reason = ?, delete_flag = 1
            WHERE user_id = ?
        `;
            connection.query(newUserQuery, [reason, user_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }

                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.profileDeleteSuccess, userDataArray: userDetails });

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
// Get Expert By Filter
const getExpertByCatSubCat = async (request, response) => {
    const { user_id, category_id, sub_category_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'category_id' });
    }
    if (!sub_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'sub_category_id' });
    }
    try {
        if (user_id > 0) {
            // Verify user existence and status
            const query1 = `SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0`;
            const values1 = [user_id];
            connection.query(query1, values1, (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }
                if (result[0]?.active_flag === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
                }
                // Prepare query for experts
                let query2 = `SELECT user_id as expert_id FROM user_master WHERE delete_flag = 0 AND active_flag = 1 AND user_type = 2 AND category = ? AND sub_category = ? and expert_status=1`;
                let value2 = [category_id, sub_category_id];
                connection.query(query2, value2, async (err, expertResult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (expertResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: 'NA' });
                    }
                    try {
                        // Fetch details for each expert, including average_rating from getUserDetails
                        const parsedResult = await Promise.all(
                            expertResult.map(async (expert) => {
                                const userDetails = await getUserDetails(expert.expert_id); // Fetch user details including average_rating
                                return {
                                    expert_id: expert.expert_id,
                                    userDetails,
                                };
                            })
                        );
                        // Filter by rating if provided
                        let finalResult = parsedResult;
                        if (finalResult.length === 0) {
                            return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: "NA" });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: finalResult });
                    } catch (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                });
            });
        } else {
            // Prepare query for experts
            let query2 = `SELECT user_id as expert_id FROM user_master WHERE delete_flag = 0 AND active_flag = 1 AND user_type = 2 AND category = ? AND sub_category = ? and expert_status=1`;
            let value2 = [category_id, sub_category_id];
            connection.query(query2, value2, async (err, expertResult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (expertResult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: 'NA' });
                }
                try {
                    // Fetch details for each expert, including average_rating from getUserDetails
                    const parsedResult = await Promise.all(
                        expertResult.map(async (expert) => {
                            const userDetails = await getUserDetails(expert.expert_id); // Fetch user details including average_rating
                            return {
                                expert_id: expert.expert_id,
                                userDetails,
                            };
                        })
                    );
                    // Filter by rating if provided
                    let finalResult = parsedResult;
                    if (finalResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: "NA" });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: finalResult });
                } catch (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });

        }
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//delete single notification
const deleteSingleNotification = (request, response) => {
    const { user_id, notification_message_id } = request.body;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        if (!notification_message_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'notification_id' });
        }

        // Verify user existence and status
        const query1 = `SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0`;
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
        });
        // cheak user end

        var sqlNotification = "SELECT notification_message_id,user_id FROM user_notification_message where notification_message_id = ? AND other_user_id = ?  AND delete_flag = 0";

        connection.query(sqlNotification, [notification_message_id, user_id], (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: '6' });
            } else {
                let delete_flag = 1;
                var sqlNotification = "UPDATE user_notification_message SET delete_flag = ? ,updatetime= NOW() WHERE notification_message_id=? AND other_user_id = ? ";
                connection.query(sqlNotification, [delete_flag, notification_message_id, user_id], (err, deleteresult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.notificationDeleteUnsuccess, key: '2' });
                    } else {
                        return response.status(200).json({ success: true, msg: languageMessage.notificationDeleteSuccess });
                    }
                })
            }
        });

    } catch (error) {
        console.error("Error in try block:", error);
        return response.status(200).json({ success: false, msg: languageMessage.notificationDeleteUnsuccess });
    }
}
// delete notification end
//delete all notification
const deleteAllNotification = (request, response) => {
    const { user_id } = request.body;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }


        // Verify user existence and status
        const query1 = `SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0`;
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
        });
        // cheak user end

        var sqlNotification = "SELECT notification_message_id,user_id FROM user_notification_message where other_user_id = ?  AND delete_flag = 0";

        connection.query(sqlNotification, [user_id], (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: '6' });
            } else {
                let delete_flag = 1;
                var sqlNotification = "UPDATE user_notification_message SET delete_flag = ? ,updatetime= NOW() WHERE other_user_id = ? ";
                connection.query(sqlNotification, [delete_flag, user_id], (err, deleteresult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.notificationDeleteUnsuccess, key: '2' });
                    } else {
                        return response.status(200).json({ success: true, msg: languageMessage.notificationDeleteSuccess });
                    }
                })
            }
        });

    } catch (error) {
        console.error("Error in try block:", error);
        return response.status(200).json({ success: false, msg: languageMessage.notificationDeleteUnsuccess });
    }
}
// delete notification end
//customer Get sub Expertise Categories level
const getSubLevelTwoCategory = async (request, response) => {
    let { user_id, sub_one_level_category_id } = request.query;
    if (!user_id || !sub_one_level_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT sub_two_level_category_id,sub_two_level_category_name FROM sub_two_level_categories_master WHERE sub_one_level_category_id = ? AND delete_flag=0";
            connection.query(query1, [sub_one_level_category_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result.length == 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: 'NA' });
                }
                const updatedResult = result.map(categories => ({
                    ...categories,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//customer Get sub Expertise Categories level
const getSubLevelThreeCategory = async (request, response) => {
    let { user_id, sub_two_level_category_id } = request.query;
    if (!user_id || !sub_two_level_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT sub_three_level_category_id,sub_three_level_category_name FROM sub_three_level_categories_master WHERE sub_two_level_category_id = ? AND delete_flag=0";
            connection.query(query1, [sub_two_level_category_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result.length == 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: 'NA' });
                }
                const updatedResult = result.map(categories => ({
                    ...categories,
                    status: false
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, categoryDetailsArray: updatedResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}

//end


// update online offline status
const onlineOffline = async (request, response) => {
    const { user_id, status } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        if (!status) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'status' });
        }

        const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id =? AND delete_flag = 0';
        connection.query(checkUser, [user_id], async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (res.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound })
            }
            if (res[0].active_flag == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 })
            }
            const sql = 'UPDATE user_master SET online_status = ?, updatetime = NOW() WHERE user_id = ? AND delete_flag=  0';
            connection.query(sql, [status, user_id], async (err1, res1) => {
                if (err1) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, erorr: err1.message });
                }
                if (res1.affectedRows == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.statusNotUpdated })
                }
                const userDataArray = await getUserDetails(user_id);
                if (userDataArray.length == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound })
                }
                if (status == 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.expertOffline, userDataArray: userDataArray });
                }
                if (status == 1) {
                    return response.status(200).json({ success: true, msg: languageMessage.expertOnline, userDataArray: userDataArray });
                }
            })
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}



//  Update profile Reuqest
const editProfileRequest = async (request, response) => {
    const { user_id, description, type } = request.body;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        if (!description) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'description' });
        }
        if (!type) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'type' });
        }


        const checkAdminEmail = 'SELECT email , name FROM user_master WHERE user_type = 0 AND delete_flag = 0';
        connection.query(checkAdminEmail, async (error, result) => {
            if (error) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
            }
            if (result.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }
            let admin_email = result[0].email;
            let admin_name = result[0].name


            const checkUser = 'SELECT user_id, name, email, active_flag FROM user_master WHERE user_id = ? AND delete_flag  = 0';
            connection.query(checkUser, [user_id], async (err, res) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
                }
                if (res.length == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }
                if (res[0].active_flag == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
                }

                let expertName = res[0].name;
                let expertEmail = res[0].email;
                const sql = 'INSERT INTO  details_request_master( user_id, type, description, createtime, updatetime) VALUES(?, ?, ?, NOW(), NOW())';
                connection.query(sql, [user_id, type, description], async (err1, res1) => {
                    if (err1) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                    }
                    if (res1.affectedRows == 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.RequestNotSent });
                    }
                    let details_request_id = res1.insertId;
                    // const user_email = admin_email;

                    // const fromName = admin_name;

                    // const app_name = 'Xpertnow';

                    // const message = description;

                    // const title = "Profile Update Request";

                    // const subject = "Profile Update Request";

                    // const app_logo = "https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png";

                    // const expert_email = expertEmail;
                    // const expert_name = expertName;

                    // await mailer(user_email, fromName, app_name, message, title, subject, app_logo, expert_email, expert_name).then(data => {

                    //     if (data.status === 'yes') {

                    return response.status(200).json({ success: true, msg: languageMessage.RequestSent });
                    //  }
                    // });
                })
            });
        })
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }

}


// Get update request status 
const getRequestStatus = async (request, response) => {
    const { user_id } = request.query;
    try {


        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }

        const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
        connection.query(checkUser, [user_id], async (error, result) => {
            if (error) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
            }
            if (result.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0].active_flag == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }


            const sql = 'SELECT status, type FROM details_request_master WHERE user_id = ? AND delete_flag = 0 ORDER BY createtime DESC LIMIT 1';
            connection.query(sql, [user_id], async (err1, res1) => {
                if (err1) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                }

                let status = 0;

                if (res1.length > 0) {
                    let data = {
                        status: res1[0].status,
                        type: res1[0].type,
                        type_label: '1 = professional details, 2 = gst, pancard',
                        status_label: '0 = pending, 1 = approved, 2 = rejected'
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, data: data });
                }
                else {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, status: status });
                }
            })
        })
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}









module.exports = { signUp_2, signUp_1, getStates, getCities, getDegree, getCategoryDetails, getExpertLanguages, updateBankDetails, getSubCategoryDetails, getSubCategoryLevelDetails, otpVerify, resendOtp, getContent, getAllContentUrl, managePrivacy, deleteAccount, editProfile, getUserNotification, getCustomerSupport, editCallCharge, editExpertiseAndExperience, editProfessionalDetails, editDocNumber, editProfileDetails, getExpertEye, deleteExpertAccount, deleteSingleNotification, deleteAllNotification, usersignUp_1, userOtpVerify, userResendOtp, usersignUp_2, getExpertiseCategory, getSubExpertiseCategory, getSubExpertiseCategoryLevel, getExpertNotification, getExpertByCatSubCat, getSubLevelTwoCategory, getSubLevelThreeCategory, onlineOffline, editProfileRequest, getRequestStatus }