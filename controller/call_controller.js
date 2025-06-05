//call_controller.js
const axios = require('axios');
const crypto = require('crypto');
const connection = require('../connection')
const jwt = require('jsonwebtoken');
const { generateToken, generateTokenByChannel, generateResourceId, getResourceId } = require('../shared functions/common_call_function');
const languageMessage = require('../shared functions/languageMessage');
const agoraCon = require('../shared functions/agora_confiq');
const { getNotificationArrSingle, oneSignalNotificationSendCall } = require('./notification');
const { error } = require('console');
//generate token
const generateVideocallToken = async (request, response) => {
    let { user_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    try {

        const token = await generateToken(user_id);
        return response.status(200).json({ success: true, msg: languageMessage.tokenGenerateSuccess, token: token });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err.message });
    }
}
//end
//generate ResourceId
const generatecallResourceId = async (request, response) => {
    let { user_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    try {
        const resourceId = await generateResourceId(user_id);
        return response.status(200).json({ success: true, msg: languageMessage.tokenGenerateSuccess, resourceId: resourceId });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err.message });
    }
}
//end
//generate token
const generateTokenByChannelName = async (request, response) => {
    let { user_id, channel_name } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!channel_name) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'channel_name' });
    }
    try {
        const token = await generateTokenByChannel(user_id, channel_name);
        return response.status(200).json({ success: true, msg: languageMessage.tokenGenerateSuccess, token: token });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err.message });
    }
}
//end
//start call
const VideoVoiceCallStart = async (request, response) => {
    let { user_id, other_user_id, amount, type } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!other_user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'other_user_id' });
    }
    if (!amount) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'amount' });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
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
            const query2 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
            const values2 = [user_id];
            connection.query(query2, values2, async (err, result1) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result1.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }

                const token = await generateToken(user_id);
                var user_token = token.token;
                var channelName = token.channelName;
                
                const newUserQuery = `INSERT INTO video_call_master (user_id,other_user_id,room_id,token,type,createtime,updatetime)
                VALUES (?, ?, ?, ?,?, now(),now())`;
                const values = [user_id, other_user_id, channelName, user_token, type]
                connection.query(newUserQuery, values, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.videocallStartUnsuccess, key: err });
                    }
                    const user_id_notification = user_id;
                    const other_user_id_notification = other_user_id;
                    const action_id = result.insertId;
                    let action;
                    let title;
                    let title_2;
                    let title_3;
                    let title_4;
                    let messages;
                    let message_2;
                    let message_3;
                    let message_4;
                    if (type == 1) {
                        action = "video_chat";
                        title = "Video Call";
                        title_2 = "Video Call";
                        title_3 = "Video Call";
                        title_4 = "Video Call";
                        messages = "video calling...";
                        message_2 = "video calling...";
                        message_3 = "video calling...";
                        message_4 = "video calling...";
                    } else {
                        action = "voice_chat";
                        title = "Voice Call";
                        title_2 = "Voice Call";
                        title_3 = "Voice Call";
                        title_4 = "Voice Call";
                        messages = "Voice calling...";
                        message_2 = "Voice calling...";
                        message_3 = "Voice calling...";
                        message_4 = "Voice calling...";
                    }

                    const queryOtherUser = "SELECT name, image FROM user_master WHERE user_id = ? AND delete_flag = 0";
                    const values1 = [user_id];
                    connection.query(queryOtherUser, values1, async (err, Otherresult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.userNotFound, key: err.message });
                        }
                        const user_image = Otherresult[0].image ? Otherresult[0].image : "NA";
                        const user_name = Otherresult[0].name ? Otherresult[0].name : "NA";


                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action, channelName, user_token, user_name: user_name, user_image: user_image, };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];

                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                            } else {
                                console.log("Notification array is empty");
                            }

                        });
                    });
                    return response.status(200).json({ success: true, msg: languageMessage.videocallStartSuccess, video_voice_call_id: result.insertId, token: token });

                });
            });
        });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.videocallStartUnsuccess, key: err.message });
    }

}
//end
//start call
const VideoVoiceCallJoin = async (request, response) => {
    let { user_id, video_call_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!video_call_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'video_call_id' });
    }

    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 ";
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
            const updateQuery = `UPDATE video_call_master SET status  = 1,updatetime=now() WHERE video_call_id = ?`;
            connection.query(updateQuery, [video_call_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.videocallJoinUnsuccess, key: err });
                }
                if (result.affectedRows > 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.videocallJoinSuccess });

                } else {
                    return response.status(200).json({ success: false, msg: languageMessage.videocallJoinUnsuccess, key: err.message });
                }
            });
        });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.videocallStartUnsuccess, key: err.message });
    }

}
//end
//end call
// const VideoVoiceCallEnd = async (request, response) => {
//     let { user_id, video_call_id, duration, type, call_Charges } = request.body;
//     if (!user_id) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
//     }
//     if (!video_call_id) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'video_call_id' });
//     }
//     if (!duration) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'duration' });
//     }
//     if (!call_Charges) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'call_Charges' });
//     }

//     try {
//         const query1 = "SELECT mobile, active_flag,user_type FROM user_master WHERE user_id = ? AND delete_flag = 0 ";
//         const values1 = [user_id];
//         connection.query(query1, values1, async (err, result) => {
//             if (err) {
//                 return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
//             }
//             if (result.length === 0) {
//                 return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
//             }
//             if (result[0]?.active_flag === 0) {
//                 return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
//             }
//             const checkConsulation = 'SELECT consultation_percentage FROM commission_master WHERE commission_id = 1 AND delete_flag = 0';
//             connection.query(checkConsulation, async (consultErr, consultRes) => {
//                 if (consultErr) {
//                     return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: consultErr.message });
//                 }

//                 let consultation_percentage = consultRes[0].consultation_percentage;

//                 let admin_earning = 0;
//                 admin_earning = call_Charges * consultation_percentage / 100;

//                 let expert_final_earning = 0;
//                 expert_final_earning = call_Charges - admin_earning

//                 let selectquery;
//                 let selectvalues;
//                 if (result[0]?.user_type == 1) {

//                     selectquery = "SELECT other_user_id FROM video_call_master WHERE video_call_id = ? AND delete_flag = 0 ";
//                     selectvalues = [video_call_id];
//                 } else {
//                     selectquery = "SELECT user_id FROM video_call_master WHERE video_call_id = ? AND delete_flag = 0 ";
//                     selectvalues = [video_call_id];
//                 }
//                 connection.query(selectquery, selectvalues, async (err, selectresult) => {
//                     if (err) {
//                         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
//                     }
//                     if (selectresult.length === 0) {
//                         return response.status(200).json({ success: false, msg: languageMessage.callIdFound });
//                     }
//                     let expert_id = selectresult[0].other_user_id;

//                     const minutes = Math.ceil(duration / 60);
//                     const updateQuery = `UPDATE video_call_master SET status  = 2,duration=?,price=?, admin_per= ?, admin_earning=?, provider_earning = ?,  updatetime=now() WHERE video_call_id = ?`;
//                     connection.query(updateQuery, [minutes, call_Charges, consultation_percentage, admin_earning, expert_final_earning, video_call_id], async (err, videoresult) => {
//                         if (err) {
//                             return response.status(200).json({ success: false, msg: languageMessage.videocallEndUnsuccess, key: err });
//                         }

//                         const updateExpertEarning = 'INSERT INTO expert_earning_master(type, user_id, expert_id, expert_earning, createtime, updatetime) VALUES(?, ?, ?, ?, NOW(), NOW())';

//                         connection.query(updateExpertEarning, [1, user_id, expert_id, expert_final_earning], async (earningErr, earningRes) => {
//                             if (earningErr) {
//                                 return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: earningErr.message });
//                             }

//                             if (videoresult.affectedRows > 0) {
//                                 const user_id_notification = user_id;
//                                 let other_user_type;
//                                 let other_user_id_notification;
//                                 if (result[0]?.user_type == 1) {
//                                     other_user_id_notification = selectresult[0]?.other_user_id;
//                                     other_user_type = 2;
//                                 } else {
//                                     other_user_id_notification = selectresult[0]?.user_id;
//                                     other_user_type = 1;
//                                 }
//                                 const action_id = video_call_id;
//                                 let action;
//                                 let title;
//                                 let title_2;
//                                 let title_3;
//                                 let title_4;
//                                 let messages;
//                                 let message_2;
//                                 let message_3;
//                                 let message_4;
//                                 if (type == 1) {
//                                     action = "video_chat_ended";
//                                     title = "Video Call Ended";
//                                     title_2 = "Video Call Ended";
//                                     title_3 = "Video Call Ended";
//                                     title_4 = "Video Call Ended";
//                                     messages = "video calling ended...";
//                                     message_2 = "video calling ended...";
//                                     message_3 = "video calling ended...";
//                                     message_4 = "video calling ended...";
//                                 } else {
//                                     action = "voice_chat_ended";
//                                     title = "Voice Call Ended";
//                                     title_2 = "Voice Call Ended";
//                                     title_3 = "Voice Call Ended";
//                                     title_4 = "Voice Call Ended";
//                                     messages = "Voice calling ended...";
//                                     message_2 = "Voice calling ended...";
//                                     message_3 = "Voice calling ended...";
//                                     message_4 = "Voice calling ended...";
//                                 }
//                                 const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action, user_type: other_user_type, duration: duration, call_Charges: call_Charges };
//                                 await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
//                                     let notification_arr_check_new = [notification_arr_check];

//                                     if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
//                                         const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

//                                     } else {
//                                         console.log("Notification array is empty");
//                                     }

//                                 });
//                                 return response.status(200).json({ success: true, msg: languageMessage.videocallEndSuccess });

//                             } else {
//                                 return response.status(200).json({ success: false, msg: languageMessage.videocallEndUnsuccess, key: err.message });
//                             }
//                         });
//                     });
//                 });
//             })
//         })
//     } catch (err) {
//         return response.status(200).json({ success: false, msg: languageMessage.videocallEndUnsuccess, key: err.message });
//     }

// }

const VideoVoiceCallEnd = async (request, response) => {
    let {user_id,video_call_id,duration,type,call_Charges} = request.body;
    if (!user_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'user_id'});
    }
    if (!video_call_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'video_call_id'});
    }
    if (!duration){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'duration'});
    }
    if (!call_Charges){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'call_Charges'});
    }
    
    try {
        const query1 = "SELECT mobile, active_flag,user_type FROM user_master WHERE user_id = ? AND delete_flag = 0 ";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated,active_status:0 });
            }
                const checkConsulation = 'SELECT consultation_percentage FROM commission_master WHERE commission_id = 1 AND delete_flag = 0';
            connection.query(checkConsulation, async (consultErr, consultRes) => {
                if (consultErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: consultErr.message });
                }

                let consultation_percentage = consultRes[0].consultation_percentage;

                let admin_earning = 0;
                admin_earning = call_Charges * consultation_percentage / 100;

                let expert_final_earning = 0;
                expert_final_earning = call_Charges - admin_earning


        
            let selectquery;
            let selectvalues;
            let expert_id ;
            if(result[0]?.user_type==1){
                selectquery = "SELECT other_user_id FROM video_call_master WHERE video_call_id = ? AND delete_flag = 0 ";
                selectvalues = [video_call_id];
            }else{
                selectquery = "SELECT user_id FROM video_call_master WHERE video_call_id = ? AND delete_flag = 0 ";
                selectvalues = [video_call_id];
            }
            connection.query(selectquery, selectvalues, async (err, selectresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (selectresult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.callIdFound });
                }

                // get expert id
                if(result[0]?.user_type==2){
                    expert_id = user_id;
                }
                else{
                    expert_id = selectresult[0].other_user_id;
                }

                let customer_id;
                if(result[0]?.user_type==1){
                    customer_id = user_id
                }
                else{
                    customer_id = selectresult[0].user_id;
                }
               
                const minutes = Math.ceil(duration / 60);
                const updateQuery = `UPDATE video_call_master SET status  = 2,duration=?,price=?, admin_per= ?, admin_earning=?, provider_earning=?,  updatetime=now() WHERE video_call_id = ?`;
                    connection.query(updateQuery, [minutes, call_Charges, consultation_percentage, admin_earning,expert_final_earning, video_call_id], async (err, videoresult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.videocallEndUnsuccess, key: err });
                        }

                const updateExpertEarning = 'INSERT INTO expert_earning_master(type, user_id, expert_id, expert_earning, createtime, updatetime) VALUES(?, ?, ?, ?, NOW(), NOW())';
                
                connection.query(updateExpertEarning, [1, customer_id, expert_id, expert_final_earning], async(earningErr, earningRes) => {
                    if(earningErr){
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: earningErr.message});
                    }
    
                        if (videoresult.affectedRows > 0) {
                            const user_id_notification = user_id;
                            let other_user_type;
                            let other_user_id_notification;
                            if(result[0]?.user_type==1){
                                other_user_id_notification = selectresult[0]?.other_user_id;
                                other_user_type=2;
                            }else{
                                other_user_id_notification = selectresult[0]?.user_id;
                                other_user_type=1;
                            }
                            const action_id = video_call_id;
                            let action;
                            let title;
                            let title_2;
                            let title_3;
                            let title_4;
                            let messages;
                            let message_2;
                            let message_3;
                            let message_4;
                            if(type==1){
                                action = "video_chat_ended";
                                title = "Video Call Ended";
                                title_2 = "Video Call Ended";
                                title_3 = "Video Call Ended";
                                title_4 = "Video Call Ended";
                                messages = "video calling ended...";
                                message_2 = "video calling ended...";
                                message_3 = "video calling ended...";
                                message_4 = "video calling ended...";
                            }else{
                                action = "voice_chat_ended";
                                title = "Voice Call Ended";
                                title_2 = "Voice Call Ended";
                                title_3 = "Voice Call Ended";
                                title_4 = "Voice Call Ended";
                                messages = "Voice calling ended...";
                                message_2 = "Voice calling ended...";
                                message_3 = "Voice calling ended...";
                                message_4 = "Voice calling ended...";
                            }
                            const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action,user_type:other_user_type,duration:duration,call_Charges:call_Charges};
                            await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                                let notification_arr_check_new = [notification_arr_check];
                                
                                if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                                    const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                                    
                                }else{
                                    console.log("Notification array is empty");
                                }
                            
                            });
                            return response.status(200).json({ success: true, msg: languageMessage.videocallEndSuccess});
                            
                        } else {
                            return response.status(200).json({ success: false, msg: languageMessage.videocallEndUnsuccess, key: err.message });
                        }
                    });
                });
            });
        })

    });
            
        }catch (err) {
            return response.status(200).json({ success: false, msg: languageMessage.videocallEndUnsuccess, key: err.message });
        }
    
    } 









//end
//reject call
const VideoVoiceCallReject = async (request, response) => {
    let { user_id, video_call_id, type } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!video_call_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'video_call_id' });
    }

    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 ";
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
            const selectquery = "SELECT user_id FROM video_call_master WHERE video_call_id = ? AND delete_flag = 0 ";
            const selectvalues = [video_call_id];
            connection.query(selectquery, selectvalues, async (err, selectresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (selectresult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.callIdFound });
                }
                const other_user_id = selectresult[0].user_id;
                const updateQuery = `UPDATE video_call_master SET status =3,rejected_by=?,updatetime=now() WHERE video_call_id = ?`;
                connection.query(updateQuery, [user_id, video_call_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.videocallRejectUnsuccess, key: err });
                    }

                    if (result.affectedRows > 0) {
                        const user_id_notification = user_id;
                        const other_user_id_notification = other_user_id;
                        const action_id = video_call_id;
                        let action;
                        let title;
                        let title_2;
                        let title_3;
                        let title_4;
                        let messages;
                        let message_2;
                        let message_3;
                        let message_4;
                        if (type == 1) {
                            action = "video_chat_reject";
                            title = "Video Call Rejected";
                            title_2 = title;
                            title_3 = title;
                            title_4 = title;
                            messages = "video calling rejected...";
                            message_2 = messages;
                            message_3 = messages;
                            message_4 = messages;
                        } else {
                            action = "voice_chat_reject";
                            title = "Voice Call Rejected";
                            title_2 = title;
                            title_3 = title;
                            title_4 = title;
                            messages = "Voice calling rejected...";
                            message_2 = messages;
                            message_3 = messages;
                            message_4 = messages;
                        }
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];

                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                            } else {
                                console.log("Notification array is empty");
                            }

                        });
                        return response.status(200).json({ success: true, msg: languageMessage.videocallRejectSuccess });

                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.videocallRejectUnsuccess, key: err.message });
                    }
                });
            });
        });

    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.videocallRejectUnsuccess, key: err.message });
    }

}
//end
// Middleware to log requests & responses
axios.interceptors.request.use(request => {
    console.log("Starting Request:", request);
    return request;
});

axios.interceptors.response.use(response => {
    console.log("Response:", response.data);
    return response;
});

// Start Agora Recording API
const startRecording = async (request, response) => {
    try {
        const { user_id, token, resourceId, channelName } = request.body;

        if (!user_id) {
            return response.status(400).json({ success: false, msg: "Missing user_id" });
        }
        if (!token) {
            return response.status(400).json({ success: false, msg: "Missing token" });
        }
        if (!resourceId) {
            return response.status(400).json({ success: false, msg: "Missing resourceId" });
        }
        if (!channelName) {
            return response.status(400).json({ success: false, msg: "Missing channelName" });
        }

        const uid = `${user_id}`;

        // Start Recording Request
        const startResponse = await axios.post(
            `https://api.agora.io/v1/apps/${agoraCon.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/mode/individual/start`,
            {
                cname: channelName,
                uid: uid,
                clientRequest: {
                    recordingConfig: {
                        maxIdleTime: 30,
                        streamTypes: 2,
                        channelType: 1,
                        videoStreamType: 0,
                        subscribeUidGroup: 1 // ✅ Fix: Add subscribeUidGroup for single mode
                    },
                    storageConfig: {
                        vendor: 1, // Amazon S3
                        region: agoraCon.REGION,
                        bucket: agoraCon.BUCKET_NAME,
                        accessKey: agoraCon.accessKey,
                        secretKey: agoraCon.secretKey,
                        fileNamePrefix: ["uploads"]
                    }
                }
            },
            {
                auth: {
                    username: agoraCon.CUSTOMER_ID,
                    password: agoraCon.CUSTOMER_SECRET
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        // If Agora API response is missing `sid`, return an error
        if (!startResponse.data.sid) {
            return response.status(500).json({ success: false, msg: "Failed to start recording, no session ID received." });
        }

        return response.status(200).json({
            success: true,
            message: "Recording started successfully",
            resourceId,
            sid: startResponse.data.sid,
            token,
            channelName,
            uid,
        });

    } catch (error) {
        console.error("Error starting recording:", error.response ? error.response.data : error.message);
        return response.status(500).json({ success: false, message: "Failed to start recording", error: error.response?.data || error.message });
    }
};

//end
const endRecording = async (request, response) => {
    try {
        const { user_id, sid, resourceId, channelName } = request.body;

        if (!user_id || !sid || !resourceId || !channelName) {
            return response.status(400).json({ success: false, msg: "Missing required parameters" });
        }
        const uid = `${user_id}`;

        // Stop Recording Request
        const stopResponse = await axios.post(
            `https://api.agora.io/v1/apps/${agoraCon.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/individual/stop`,
            {
                cname: channelName,
                uid: uid,
                clientRequest: {
                    // ✅ Include extra parameters to avoid "worker not found" error
                    async_stop: false,
                    mediaStop: true
                }
            },
            {
                auth: {
                    username: agoraCon.CUSTOMER_ID,
                    password: agoraCon.CUSTOMER_SECRET
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!stopResponse.data.serverResponse) {
            return response.status(500).json({ success: false, msg: "Failed to stop recording, no response received." });
        }

        return response.status(200).json({
            success: true,
            message: "Recording stopped successfully",
            resourceId,
            sid,
            uid,
            fileList: stopResponse.data.serverResponse.fileList || []
        });
    } catch (error) {
        console.error("Error stopping recording:", error.response ? error.response.data : error.message);
        return response.status(500).json({ success: false, message: "Failed to stop recording", error: error.response?.data || error.message });
    }
};

const getRecordingDetails = async (request, response) => {
    try {
        const { user_id, sid, resourceId, channelName } = request.body;

        if (!user_id || !sid || !resourceId || !channelName) {
            return response.status(400).json({ success: false, msg: "Missing required parameters" });
        }

        console.log(`Fetching recording details - Resource ID: ${resourceId}, SID: ${sid}, Channel: ${channelName}`);

        // Get Recording Details from Agora
        const recordingResponse = await axios.get(
            `https://api.agora.io/v1/apps/${agoraCon.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/individual/query`,
            {
                auth: {
                    username: agoraCon.CUSTOMER_ID,
                    password: agoraCon.CUSTOMER_SECRET
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!recordingResponse.data || !recordingResponse.data.serverResponse) {
            return response.status(500).json({ success: false, msg: "Failed to fetch recording details, no response received." });
        }

        return response.status(200).json({
            success: true,
            message: "Recording details fetched successfully",
            resourceId,
            sid,
            user_id,
            recordingDetails: recordingResponse.data.serverResponse
        });

    } catch (error) {
        console.error("Error fetching recording details:", error.response ? error.response.data : error.message);
        return response.status(500).json({ success: false, message: "Failed to fetch recording details", error: error.response?.data || error.message });
    }
};

const checkRecordingStatus = async (request, response) => {
    try {
        const { resourceId, sid, channelName } = request.body;

        if (!resourceId) {
            return response.status(400).json({ success: false, msg: "Missing resourceId" });
        }
        if (!sid) {
            return response.status(400).json({ success: false, msg: "Missing sid" });
        }
        if (!channelName) {
            return response.status(400).json({ success: false, msg: "Missing channelName" });
        }

        // Check Recording Status Request
        const statusResponse = await axios.get(
            `https://api.agora.io/v1/apps/${agoraCon.AGORA_APP_ID}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/individual/query`,
            {
                auth: {
                    username: agoraCon.CUSTOMER_ID,
                    password: agoraCon.CUSTOMER_SECRET
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        return response.status(200).json({
            success: true,
            message: "Recording status retrieved successfully",
            data: statusResponse.data
        });
    } catch (error) {
        console.error("Error checking recording status:", error.response ? error.response.data : error.message);
        return response.status(500).json({ success: false, message: "Failed to retrieve recording status", error: error.response?.data || error.message });
    }
};












module.exports = { generateVideocallToken, VideoVoiceCallStart, VideoVoiceCallJoin, VideoVoiceCallEnd, VideoVoiceCallReject, generateTokenByChannelName, generatecallResourceId, startRecording, endRecording, getRecordingDetails, checkRecordingStatus }