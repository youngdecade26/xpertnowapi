const connection = require("../connection");
const languageMessages = require("../shared functions/languageMessage");
const axios = require('axios');
const moment = require('moment-timezone');
const dotenv = require("dotenv");
dotenv.config();
async function getNotificationArrSingle(user_id, other_user_id, action, action_id, title,title_2,title_3,title_4, message,message_2,message_3,message_4, action_data, callback) {
  const notification_arr = {};
  const action_json = JSON.stringify(action_data);
 
  InsertNotification(user_id, other_user_id, action, action_id, action_json, title,title_2,title_3,title_4, message,message_2,message_3,message_4, (insert_status) => {
    
    if (insert_status === 'yes') {
    
      getNotificationStatus(other_user_id, (notification_status) => {
        
     
          getUserPlayerId(other_user_id, async (player_id) => {
          
            if (player_id !== 'no') {
              notification_arr.player_id = player_id;
             
              notification_arr.title = title;
              notification_arr.message = message;
              notification_arr.action_json = action_data;
           
            await oneSignalNotificationSend(title, message, action_json, notification_arr.player_id);
              callback(notification_arr);
            } else {
             
              callback(notification_arr);
            }
          });
        
      });
    } else {
      callback(notification_arr);
    }
  });
}
function InsertNotification(user_id, other_user_id, action, action_id, action_json, title,title_2,title_3,title_4, message,message_2,message_3,message_4, callback) {
  const read_status = '0';
  const delete_flag = '0';
 
  let createtime = moment().format('YYYY-MM-DD HH:mm:ss');
// 17
  const sql = "INSERT INTO user_notification_message (user_id, other_user_id, action, action_id, action_json, title,title_2,title_3,title_4, message,message_2,message_3,message_4, read_status, delete_flag, createtime, updatetime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  connection.query(sql, [user_id, other_user_id, action, action_id, action_json, title,title_2,title_3,title_4, message,message_2,message_3,message_4, read_status, delete_flag,createtime,createtime], (error, results) => {
    if (error) {
      console.error('Error inserting notification:', error);
      callback('no');
    } else {
      callback('yes');
    }
  });
}
function getNotificationStatus(user_id, callback) {
  const sql = "SELECT user_id FROM user_master WHERE user_id = ? AND notification_status = '1'";
  connection.query(sql, [user_id], (error, results) => {
    if (error) {
      console.error('Error getting notification status:', error);
      callback('no');
    } else {
      if (results.length > 0) {
        callback('yes');
      } else {
        callback('no');
      }
    }
  });
}
const getNotification = (request, response) => {
  const { user_id } = request.query;
  console.log(user_id, "user_id");
  try {
    // Query to check if the user exists
    const sql1 = `SELECT user_id, active_flag FROM user_master WHERE delete_flag = 0 AND user_id = ?`;
    const values1 = [user_id];
    connection.query(sql1, values1, (err, information) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessages.internalServerError, data: {} });
      }
      if (!information || information.length === 0) {
        return response.status(200).json({ success: false, msg: languageMessages.msgUserNotFound });
      }
      if (information[0].active_flag === 0) {
        return response.status(200).json({ success: false, msg: languageMessages.accountdeactivated, active_status: 0 });
      }
      // Query to fetch notifications
      const sql = `SELECT unm.notification_message_id, unm.user_id, unm.other_user_id, unm.action, unm.action_id, unm.action_json, unm.title, unm.message, unm.title_2, unm.title_3, unm.title_4, unm.title_5, unm.message_2, unm.message_3, unm.message_4, unm.message_5, unm.title_ar, unm.message_arr, unm.read_status, unm.createtime , um.image 
                   FROM user_notification_message as unm INNER JOIN user_master as um ON unm.user_id = um.user_id
                   WHERE unm.other_user_id = ? AND unm.delete_flag = 0 
                   ORDER BY unm.notification_message_id DESC`;
      connection.query(sql, [user_id], async (err, info) => {
        if (err) {
          return response.status(200).json({ success: false, msg: languageMessages.internalServerError, err2: err.message });
        }
        try {
          if (!info || info.length === 0) {
            return response.status(404).json({ success: true, msg: languageMessages.msgDataFound,notification_arr:'NA'});
          }
          const dateFormatter = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
          const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const notification_arr = await Promise.all(info.map(async (row) => {
            try {
              
              const date = new Date(row.createtime);
              const formattedDate = dateFormatter.format(date);
              const formattedTime = timeFormatter.format(date);
              return {
                notification_message_id: row.notification_message_id,
                user_id: row.user_id,
                user_image: row.image,
                other_user_id: row.other_user_id,
                action: row.action,
                action_id: row.action_id,
                action_json: row.action_json,
                date_time: moment(row.createtime).format("MMM DD, YYYY HH:MM A"),
                title: [row.title, row.title_2, row.title_3, row.title_4, row.title_5],
                message: [row.message, row.message_2, row.message_3, row.message_4, row.message_5],
                read_status: row.read_status,
                status: false
              };
            } catch (error) {
              console.error("Error fetching user data:", error);
              throw error;
            }
          }));
          // Update read status
          const updateRead = `UPDATE user_notification_message SET read_status = 1, updatetime = NOW() WHERE delete_flag = 0 AND other_user_id = ?`;
          connection.query(updateRead, [user_id], (updateError) => {
            if (updateError) {
              console.error("Error updating read status:", updateError);
            }
          });
          return response.status(200).json({ success: true, message: languageMessages.msgDataFound, notification_arr: notification_arr.length > 0 ? notification_arr : "NA" });
        } catch (error) {
          console.error("Error processing notifications:", error);
          return response.status(200).json({ success: false, msg: languageMessages.internalServerError, err1: error.message });
        }
      });
    });
  } catch (error) {
    console.error("Error in try block:", error);
    return response.status(200).json({ success: false, msg: languageMessages.internalServerError, err: error.message });
  }
};
const deleteSingleNotification = (request,response) =>{
  const {user_id,notification_message_id} = request.body;
  try {
    if (!user_id) {
      return response.status(200).json({ success: false, msg: languageMessages.msg_empty_param,key:'user_id' });
    }
    if (!notification_message_id) {
      return response.status(200).json({ success: false, msg: languageMessages.msg_empty_param,key:'notification_id' });
    }
    // cheak user start
    var sql1 = `SELECT user_id,active_flag FROM user_master WHERE delete_flag = 0 AND user_id = ?`;
    var values1 = [user_id];
    connection.query(sql1, values1, async (err, information) => {
      if (err) {
        return response.status(200).json({ success: false, msg: languageMessages.internalServerError, data: {} });
      }
      if (information.length === 0) {
        return response.status(200).json({ success: false, msg: languageMessages.msgUserNotFound, data: {} });
      }
   
          if(information[0].active_flag === 0 ){
              return response.status(200).json({ success: false, msg: languageMessages.accountdeactivated,active_status : 0 });
          }
    });
    // cheak user end
      var sqlNotification = "SELECT notification_message_id,user_id FROM user_notification_message where notification_message_id = ? AND other_user_id = ?  AND delete_flag = 0";
      connection.query(sqlNotification,[notification_message_id,user_id],(err,result)=>{
        if(err){
          return response.status(200).json({ success: false, msg: languageMessages.internalServerError, key : '6' });
        }else{
        
          let delete_flag = 1;
            var sqlNotification = "UPDATE user_notification_message SET delete_flag = ? ,updatetime= now() WHERE notification_message_id=? AND other_user_id = ? ";
            connection.query(sqlNotification,[delete_flag,notification_message_id,user_id],(err,result)=>{
              if(err){
                return response.status(200).json({ success: false, msg: languageMessages.internalServerError,key:'2'});
              }else{
                return response.status(200).json({ success: true, msg: languageMessages.notificationDelete });
            }
          })
        }
      });
  } catch (error) {
    console.error("Error in try block:", error);
    return response.status(200).json({ success: false, msg: languageMessages.internalServerError });
  }
}
// delete notification end
// delete All notification start
const deleteAllNotification = (request,response) =>{
  const {user_id} = request.body;
  try {
    if (!user_id) {
      return response.status(200).json({ success: false, msg: languageMessages.msg_empty_param,key:'user_id' });
    }
     // cheak user start
     var sql1 = `SELECT user_id,active_flag FROM user_master WHERE delete_flag = 0 AND user_id = ?`;
     var values1 = [user_id];
     connection.query(sql1, values1, async (err, information) => {
       if (err) {
         return response.status(200).json({ success: false, msg: languageMessages.internalServerError, data: {} });
       }
       if (information.length === 0) {
         return response.status(200).json({ success: false, msg: languageMessages.msgUserNotFound, data: {} });
       }
    
          if(information[0].active_flag === 0 ){
              return response.status(200).json({ success: false, msg: languageMessages.accountdeactivated,active_status : 0 });
          }
     });
     // cheak user end
      var sqlNotification = "SELECT notification_message_id FROM user_notification_message where other_user_id = ?  AND delete_flag = 0";
      connection.query(sqlNotification,[user_id],(err,result)=>{
        if(err){
          return response.status(200).json({ success: false, msg: languageMessages.internalServerError, key : '6' });
        }else{
       
          let delete_flag = 1;
            var sqlNotification = "UPDATE user_notification_message SET delete_flag = ? ,updatetime= now() WHERE  other_user_id = ? ";
            connection.query(sqlNotification,[delete_flag,user_id],(err,result)=>{
              if(err){
                return response.status(200).json({ success: false, msg: languageMessages.internalServerError,key:'2'});
              }else{
                return response.status(200).json({ success: true, msg: languageMessages.notificationDelete });
            }
          })
        }
      });
  } catch (error) {
    console.error("Error in try block:", error);
    return response.status(200).json({ success: false, msg: languageMessages.internalServerError });
  }
}
// delete all notification end
async function oneSignalNotificationSend(title, message, jsonData, player_id_arr) {
  try {
      var oneSignalAppId = "c3a25067-c262-4916-8db6-56f2598bba14";
      var oneSignalAuthorization = "os_v2_app_yorfaz6cmjerndnwk3zftc52crzlq6ahr6yu2g5wiumvu47icqtjghyky6idkqi5aziuqlo3z43p6nvdmuu6u3pqxrisl5omi7u3dyi";
      const fields = {
          app_id: oneSignalAppId,
          contents: { en: message },
          headings: { en: title },
          include_player_ids: player_id_arr,
          data: { action_json: jsonData },
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
          priority: 10
      };
      const config = {
          headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Authorization': 'Basic ' + oneSignalAuthorization
          }
      };
      const response = await axios.post('https://onesignal.com/api/v1/notifications', fields, config);
      return response.data;
  } catch (error) {
      console.error('Error sending OneSignal notification:', error.message);
      return null;
  }
}
async function oneSignalNotificationSendCall(notification_arr) {
  console.log('notification_arr',notification_arr)
  if (notification_arr && notification_arr.length > 0) {
      for (const key of notification_arr) {
          const player_id_arr = [];
          if (key.player_id !== '') {
              player_id_arr.push(key.player_id);
              const title = key.title;
              const message = key.message;
              const action_json = key.action_json
              
     
              return await oneSignalNotificationSend(title, message, action_json, player_id_arr);
          }
      }
  } else {
      console.log('Notification array is empty. No notifications to send.');
  }
}
async function getUserPlayerId(user_id,callback) {
  try {
    if (!user_id) return 'no';
    
    connection.query("SELECT player_id FROM user_notification WHERE user_id = ? order by user_notification_id desc",[user_id],(err,result)=>{
      if(err){
        console.log("error : ",err);
      }
      if (result.length > 0) {
        let player_id = result[0].player_id;
        if (player_id === '123456') {
            player_id = 'no';
        }
       
        callback(player_id); 
    } else {
     
        callback('no'); 
    }
    })
} catch (error) {
    console.error('Error executing query:', error.message);
    return null;
}
}
// get notification count start
const getNotificationCount = async (request,response)=>{
  const {user_id} = request.query;
  try {
    
    if(!user_id){
      return response.status(200).json({ success: false, msg: languageMessages.msg_empty_param,key:'user_id'});
  }
  var sqlVal = "SELECT user_id,active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
  await connection.query(sqlVal, [user_id], async (err, info) => {
  if (err) {
      return response.status(200).json({ success: false, msg: languageMessages.internalServerError });
  }
  if (info.length <= 0) {
      return response.status(200).json({ success: false, msg: languageMessages.msgUserNotFound });
  }
 
  if(info[0].active_flag === 0 ){
      return response.status(200).json({ success: false, msg: languageMessages.accountdeactivated,active_status : 0 });
  }
  // check notification count start
  
  const getCount = "SELECT count(notification_message_id) as count FROM user_notification_message WHERE delete_flag=0 and other_user_id=? and read_status = 0";
  await connection.query(getCount,[user_id],(getCountError,getCountResult)=>{
    if(getCountError){
      return response.status(200).json({ success: false, msg: languageMessages.internalServerError , getCountError });
    }
    let notificationCount = 0;
    
    if(getCountResult.length > 0){
      notificationCount = getCountResult[0].count;
    }
    return response.status(200).json({success : true , msg : languageMessages.msgDataFound,notificationCount});
  })
  // check notification count end
});
    
  } catch (error) {
    return response.status(200).json({ success : false , msg : languageMessages.internalServerError ,error});
  }
}
// get notification count end
module.exports = {
    getNotificationArrSingle,
    getNotification,
    deleteSingleNotification,
    deleteAllNotification,
    oneSignalNotificationSendCall,
    getNotificationCount
}