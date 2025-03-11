const mysql = require('mysql');
const moment = require('moment');
const crypto = require('crypto');

const mysqlcon = mysql.createConnection({
  host: "xpertnowapp.ch0gwucc0tlw.ap-south-1.rds.amazonaws.com",
  user: "xpertadmin",
  password: "21Mruq9jIex5O9dCVeOA",
  database: "xpertnowDB",
});
// Database  connection 
mysqlcon.connect((err) => {
    if (err) {
        console.error('Database  connection error:', err);
        return;
    }
    
});
module.exports = {
    //========================================== get user details function start =========================================
    async getUserDetails(user_id) {
       
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT   `courses`,`referral_code`,`college_id`,`user_id`, `login_type`, `login_type_first`, `user_type`, `email`, `password`, `username`, `f_name`, `l_name`, `name`, `dob`, `age`, `phone_code`, `mobile`, `otp`, `otp_verify`, `image`, `gender`, `address`, `latitude`, `longitude`, `zipcode`, `bio`, `active_flag`, `approve_flag`, `profile_complete`, `language_id`, `facebook_id`, `google_id`, `twitter_id`, `instagram_id`, `apple_id`, `notification_status`, `delete_flag`, `delete_reason`, `createtime`, `updatetime`, `mysqltime`, `signup_step` FROM user_master WHERE  user_id = ?', [user_id], async function (err, result, fields) {
                if (err) {
                    console.log('data base error in user details get ', err)
                    reject(err);
                }
                if (!result || result.length === 0) {
                    resolve("NA");
                } else {
                    const {
                        courses, referral_code, college_id, user_id, login_type, login_type_first, user_type, email, password, username, f_name, l_name, name, dob, age, phone_code, mobile, otp, otp_verify, image, gender, address, latitude, longitude, zipcode, bio, bio_type, active_flag, approve_flag, profile_complete, language_id, facebook_id, google_id, twitter_id, instagram_id, apple_id, notification_status, delete_flag, delete_reason, createtime, updatetime, mysqltime, signup_step, avatar_id, currect_location_permanent, about
                    } = result[0];
                    const socialTypeArr = ['app', 'google', 'apple', 'facebook', 'twitter', 'instagram'];
                    const loginType = socialTypeArr[login_type];
                    const loginTypeFirst = socialTypeArr[login_type_first];
                    // Check and assign default values for social IDs
                    const defaultSocialId = (id) => id ? id : "NA";
                    const facebookId = defaultSocialId(facebook_id);
                    const googleId = defaultSocialId(google_id);
                    const twitterId = defaultSocialId(twitter_id);
                    const instagramId = defaultSocialId(instagram_id);
                    const appleId = defaultSocialId(apple_id);
                    // Handle null values for device ID and image
                    // const deviceId = device_id || "NA";
                    const userImage = image || "NA";
                    // Handle null values for date of birth and calculate age
                    let userDob = "NA";
                    let userAge = 0;
                    if (dob && dob !== '0000-00-00') {
                        userDob = moment(dob).format('DD-MM-YYYY');
                        userAge = moment().diff(moment(dob, 'DD-MM-YYYY'), 'years');
                    }
                    // resolve(courses);
                    const ManageModel = require('./manageModel');
                    let filteredCoursesMinimal = []
                    let courses_arr = await ManageModel.getAllCourses();
                    // Fetch all courses
                    if (courses) {
                        let defaultCoursesArr = courses.split(",").map(Number); // Parse the default courses string into an array of numbers
                        let filteredCourses = courses_arr.filter(course => defaultCoursesArr.includes(course.course_id)); // Filter courses
                        filteredCoursesMinimal = filteredCourses.map(course => ({
                            course_Id: course.course_id,
                            course_name: course.course_name
                        }));
                    }
                    // Format date of birth for display
                    const dobShow = moment(userDob, 'DD-MM-YYYY').format('YYYY-MM-DD');
                    const userArr = {
                        courses: courses.toString(),
                        courses_arr: filteredCoursesMinimal,
                        courses_arr1: courses_arr,
                        college_id: user_id,
                        user_id: user_id,
                        user_type: user_type,
                        login_type: loginType,
                        login_type_first: loginTypeFirst,
                        name: name,
                        f_name: f_name,
                        referral_code: referral_code,
                        l_name: l_name,
                        mobile: mobile,
                        phone_code: phone_code,
                        email: email,
                        password: password,
                        username: username,
                        age: age,
                        bio_type: bio_type,
                        avatar_id: avatar_id,
                        currect_location_permanent: currect_location_permanent,
                        about: about,
                        otp: otp,
                        otp_verify: otp_verify,
                        image: userImage,
                        profile_complete: profile_complete,
                        active_flag: active_flag,
                        approve_flag: approve_flag,
                        notification_status: notification_status,
                        delete_flag: delete_flag,
                        latitude: latitude,
                        longitude: longitude,
                        address: address,
                        facebook_id: facebookId,
                        google_id: googleId,
                        twitter_id: twitterId,
                        instagram_id: instagramId,
                        apple_id: appleId,
                        delete_reason: delete_reason,
                        createtime: createtime,
                        updatetime: updatetime,
                        signup_step: signup_step,
                        gender: gender,
                        zipcode: zipcode,
                        about_me: about,
                        bio: bio,
                        language_id: language_id,
                        dob_show: dobShow,
                        status: false,
                    };
                    resolve(userArr);
                }
            });
        });
    },
    async getUserDetailsPrivilege(user_id) {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT   `privilege`,`courses`,`referral_code`,`college_id`,`user_id`, `login_type`, `login_type_first`, `user_type`, `email`, `password`, `username`, `f_name`, `l_name`, `name`, `dob`, `age`, `phone_code`, `mobile`, `otp`, `otp_verify`, `image`, `gender`, `address`, `latitude`, `longitude`, `zipcode`, `bio`, `active_flag`, `approve_flag`, `profile_complete`, `language_id`, `facebook_id`, `google_id`, `twitter_id`, `instagram_id`, `apple_id`, `notification_status`, `delete_flag`, `delete_reason`, `createtime`, `updatetime`, `mysqltime`, `signup_step` FROM user_master WHERE  user_id = ?', [user_id], async function (err, result, fields) {
                if (err) {
                    console.log('data base error in user details get ', err)
                    reject(err);
                }
                if (!result || result.length === 0) {
                    resolve("NA");
                } else {
                    const {
                        privilege, courses, referral_code, college_id, user_id, login_type, login_type_first, user_type, email, password, username, f_name, l_name, name, dob, age, phone_code, mobile, otp, otp_verify, image, gender, address, latitude, longitude, zipcode, bio, bio_type, active_flag, approve_flag, profile_complete, language_id, facebook_id, google_id, twitter_id, instagram_id, apple_id, notification_status, delete_flag, delete_reason, createtime, updatetime, mysqltime, signup_step, avatar_id, currect_location_permanent, about
                    } = result[0];
                    const socialTypeArr = ['app', 'google', 'apple', 'facebook', 'twitter', 'instagram'];
                    const loginType = socialTypeArr[login_type];
                    const loginTypeFirst = socialTypeArr[login_type_first];
                    // Check and assign default values for social IDs
                    const defaultSocialId = (id) => id ? id : "NA";
                    const facebookId = defaultSocialId(facebook_id);
                    const googleId = defaultSocialId(google_id);
                    const twitterId = defaultSocialId(twitter_id);
                    const instagramId = defaultSocialId(instagram_id);
                    const appleId = defaultSocialId(apple_id);
                    // Handle null values for device ID and image
                   
                    const userImage = image || "NA";
                    // Handle null values for date of birth and calculate age
                    let userDob = "NA";
                    let userAge = 0;
                    if (dob && dob !== '0000-00-00') {
                        userDob = moment(dob).format('DD-MM-YYYY');
                        userAge = moment().diff(moment(dob, 'DD-MM-YYYY'), 'years');
                    }
                   
                    const ManageModel = require('./manageModel');
                    let filteredPrivilegeMinimal = []
                    let privilege_arr = await ManageModel.getAllPrivileges();
                    // Fetch all courses
                    if (privilege) {
                        let defaultPrivilegeArr = privilege.split(",").map(Number); // Parse the default courses string into an array of numbers
                        let filteredPrivilege = privilege_arr.filter(privilege => defaultPrivilegeArr.includes(privilege.privilege_id)); // Filter courses
                        filteredPrivilegeMinimal = filteredPrivilege.map(privilege => ({
                            course_name: privilege.privilege,
                            course_Id: privilege.privilege_id,
                        }));
                    }
                    // Format date of birth for display
                    const dobShow = moment(userDob, 'DD-MM-YYYY').format('YYYY-MM-DD');
                    const userArr = {
                        privilege: privilege.toString(),
                        privilege_arr: filteredPrivilegeMinimal,
                        privilege_arr1: privilege_arr,
                        college_id: user_id,
                        user_id: user_id,
                        user_type: user_type,
                        login_type: loginType,
                        login_type_first: loginTypeFirst,
                        name: name,
                        f_name: f_name,
                        referral_code: referral_code,
                        l_name: l_name,
                        mobile: mobile,
                        phone_code: phone_code,
                        email: email,
                        password: password,
                        username: username,
                        age: age,
                        bio_type: bio_type,
                        avatar_id: avatar_id,
                        currect_location_permanent: currect_location_permanent,
                        about: about,
                        otp: otp,
                        otp_verify: otp_verify,
                        image: userImage,
                        profile_complete: profile_complete,
                        active_flag: active_flag,
                        approve_flag: approve_flag,
                        notification_status: notification_status,
                        delete_flag: delete_flag,
                        latitude: latitude,
                        longitude: longitude,
                        address: address,
                        facebook_id: facebookId,
                        google_id: googleId,
                        twitter_id: twitterId,
                        instagram_id: instagramId,
                        apple_id: appleId,
                        delete_reason: delete_reason,
                        createtime: createtime,
                        updatetime: updatetime,
                        signup_step: signup_step,
                        gender: gender,
                        zipcode: zipcode,
                        about_me: about,
                        bio: bio,
                        language_id: language_id,
                        dob_show: dobShow,
                        status: false,
                    };
                    
                    resolve(userArr);
                }
            });
        });
    },
    //========================================== get user details function end =========================================
    async checkAccountActivateDeactivate(user_id) {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT active_flag FROM user_master WHERE user_id = ?',
                [user_id], (error, rows) => {
                    if (error) {
                        console.log('database active check error', error)
                        resolve('NA');
                    } else {
                        if (rows.length > 0) {
                            const { active_flag } = rows[0];
                            resolve(active_flag === '1' ? '1' : '0');
                        } else {
                            resolve('0');
                        }
                    }
                });
        });
    },
    async getAdminDetail() {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT user_id, email, name, image,mobile FROM user_master WHERE delete_flag = 0 AND user_type = 0 and profile_complete=1', (error, rows) => {
                if (error) {
                    console.log('database admin check error', error)
                    resolve('NA');
                } else {
                    if (result.length > 0) {
                        const { user_id, email, name, image, mobile } = result[0];
                        const addmin_arr = { admin_id: user_id, admin_email: email, admin_name: name, admin_image: image, admin_mobile: mobile };
                        resolve(addmin_arr);
                    } else {
                        resolve('NA');
                    }
                }
            });
        });
    },
    async md5(password) {
        const hash = crypto.createHash('md5');
        hash.update(password);
        return hash.digest('hex');
    },
    async dateFormate(date) {
        return moment(date).format('DD MMMM YYYY, hh:mm A')
    },
    
    //================ check User function start ============================
    async checkUserOldPassword(oldpassword, user_id) {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT user_id FROM user_master where delete_flag= 0 and user_type=0 and profile_complete=1 and BINARY password = ? and user_id = ?', [oldpassword, user_id], (error, rows) => {
                if (error) {
                    console.log('database user check old pass error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.length > 0) {
                        // Email exists, resolve with user_id
                        resolve(1); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    //===================dashboard ================================================
    async getAllSubAdminCount(college_id) {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT user_id FROM user_master WHERE delete_flag = 0 and user_type =3 and college_id=? ', [college_id], (error, rows) => {
                if (error) {
                    console.log('database getAllMusaCount check error', error)
                    resolve('NA');
                } else {
                    if (rows.length > 0) {
                        resolve(rows.length);
                    } else {
                        resolve('0');
                    }
                }
            });
        });
    },
    async getAllSubscriptionCount() {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT subscription_id FROM subscriptions_master WHERE delete_flag = 0', (error, rows) => {
                if (error) {
                    console.log('database getAllSubscriptionCount check error', error)
                    resolve('NA');
                } else {
                    if (rows.length > 0) {
                        resolve(rows.length);
                    } else {
                        resolve('0');
                    }
                }
            });
        });
    },
    async getAllEventCount(college_id) {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT em.event_id, em.college_id, em.user_id, em.event_title, em.event_description, em.reason, em.event_date_time, em.address, em.latitude, em.longitude, em.outside, em.status, em.type, em.url, em.max_people, em.category_id, em.event_type, em.amount, em.image, em.delete_flag, em.mysqltime, em.updatetime, em.createtime, um.email FROM event_master em INNER JOIN user_master um ON em.user_id = um.user_id WHERE em.delete_flag = 0 AND em.college_id=? order by em.event_id desc', [college_id], (error, rows) => {
                if (error) {
                    console.log('database getAllEventCount check error', error)
                    resolve('NA');
                } else {
                    if (rows.length > 0) {
                        resolve(rows.length);
                    } else {
                        resolve('0');
                    }
                }
            });
        });
    },
    async getAllUserCount(college_id) {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT user_id FROM user_master WHERE delete_flag = 0 and college_id=? and user_type =1 ', [college_id], (error, rows) => {
                if (error) {
                    console.log('database getAllUserCount check error', error)
                    resolve('NA');
                } else {
                    if (rows.length > 0) {
                        resolve(rows.length);
                    } else {
                        resolve('0');
                    }
                }
            });
        });
    },
    async getAllBookingCount() {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT booking_id FROM booking_master WHERE delete_flag = 0', (error, rows) => {
                if (error) {
                    console.log('database booking_id check error', error)
                    resolve('NA');
                } else {
                    if (rows.length > 0) {
                        resolve(rows.length);
                    } else {
                        resolve('0');
                    }
                }
            });
        });
    },
    //===================content_arr ================================================
    async getAllContent() {
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT `content_id`, `content_type`, `content`, `content_1`, `content_2`, `delete_flag` FROM `content_master` WHERE delete_flag = 0 ', (error, rows) => {
                if (error) {
                    console.log('database content_type get all error ')
                    reject(error); // Reject the promise with the error
                } else {
                    let content_arr = '';
                    if (rows.length > 0) {
                        content_arr = rows;
                    } else {
                        content_arr = [];
                    }
                    resolve(content_arr); // Resolve the promise with the rows
                }
            });
        });
    },
    //=======================================================update content 
    async updateContent(content_id, content) {
        return new Promise((resolve, reject) => {
            const updatetime = moment().format('YYYY-MM-DD HH:mm:ss');
            let query = '';
           
            query = 'UPDATE content_master SET content = ?,updatetime=? WHERE delete_flag=0 and  content_id = ? ';
            mysqlcon.query(query, [content, updatetime, content_id], (error, rows) => {
                if (error) {
                    console.log('database update content error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.affectedRows > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows.affectedRows); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    async getAllContactus() {
        let s_no = 0;
        return new Promise((resolve, reject) => {
            mysqlcon.query(
                'SELECT * FROM contact_us_master where delete_flag= ? order by contact_id desc', [0],
                (error, rows) => {
                    if (error) {
                        console.log('database contactus get all error ')
                        reject(error); // Reject the promise with the error
                    } else {
                        let contactus_arr = '';
                        if (rows.length > 0) {
                            rows.forEach(row => {
                                s_no++;
                                row.s_no = s_no;
                                row.createtime = moment(row.createtime).format('DD MMMM YYYY, hh:mm A');
                                row.replied_date_time = moment(row.replied_date_time).format('DD MMMM YYYY, hh:mm A');
                                row.encode_user_id = Buffer.from(row.contact_id.toString()).toString('base64');
                                                     
                            });
                            contactus_arr = rows;
                        } else {
                            contactus_arr = [];
                        }
                        resolve(contactus_arr); // Resolve the promise with the rows
                    }
                });
        });
    },
    async checkContactus(contact_id) {
        return new Promise((resolve, reject) => {
            console.log(contact_id)
            mysqlcon.query('SELECT contact_id FROM contact_us_master where delete_flag= 0   and contact_id = ?', [contact_id], (error, rows) => {
                if (error) {
                    console.log('database user contact_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.length > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows[0].contact_id); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    async deleteContactus(contact_id) {
        return new Promise((resolve, reject) => {
            const updatetime = moment().format('YYYY-MM-DD HH:mm:ss');
            query = 'UPDATE contact_us_master SET delete_flag = ?,updatetime=? WHERE  contact_id = ? ';
            mysqlcon.query(query, [1, updatetime, contact_id], (error, rows) => {
                if (error) {
                    console.log('database delete contact_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.affectedRows > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows.affectedRows); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    //=======================================================update updateFaq 
    async updateContactus(contact_id) {
        return new Promise((resolve, reject) => {
            const updatetime = moment().format('YYYY-MM-DD HH:mm:ss');
            query = 'UPDATE contact_us_master SET status=1,replied_date_time=?,updatetime=? WHERE delete_flag=0 and  contact_id = ? ';
            mysqlcon.query(query, [updatetime, updatetime, contact_id], (error, rows) => {
                if (error) {
                    console.log('database update contact_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.affectedRows > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows.affectedRows); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    //================================ faqs ===================================
    async getAllFaqs() {
        let s_no = 0;
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT  `faq_id`, `faq_type`, `question`, `answer`, `question_hindi`, `answer_hindi`, `createtime`  FROM `faq_master` WHERE  delete_flag = 0  order by faq_id desc', (error, rows) => {
                if (error) {
                    console.log('database faqs get all error ')
                    reject(error); // Reject the promise with the error
                } else {
                    let faqs_arr = '';
                    if (rows.length > 0) {
                        rows.forEach(row => {
                            s_no++;
                            row.s_no = s_no;
                            row.createtime = moment(row.createtime).format('DD-MM-YYYY hh:mm A');
                            row.faq_id = Buffer.from(row.faq_id.toString()).toString('base64');
                            
                        });
                        faqs_arr = rows;
                    } else {
                        faqs_arr = [];
                    }
                    resolve(faqs_arr); // Resolve the promise with the rows
                }
            });
        });
    },
    //================ check User function start ============================
    async checkFaq(faq_id) {
        return new Promise((resolve, reject) => {
            console.log(faq_id)
            mysqlcon.query('SELECT faq_id FROM faq_master where delete_flag= 0   and faq_id = ?', [faq_id], (error, rows) => {
                if (error) {
                    console.log('database user faq_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.length > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows[0].faq_id); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    //=======================================================update updateFaq 
    async updateFaq(faq_type, faq_id, question, answer, question_hindi, answer_hindi) {
        return new Promise((resolve, reject) => {
            const updatetime = moment().format('YYYY-MM-DD HH:mm:ss');
            query = 'UPDATE faq_master SET faq_type= ?,question = ?,answer = ?,question_hindi = ?,answer_hindi = ?,updatetime=? WHERE delete_flag=0 and  faq_id = ? ';
            mysqlcon.query(query, [faq_type, question, answer, question_hindi, answer_hindi, updatetime, faq_id], (error, rows) => {
                if (error) {
                    console.log('database update faq_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.affectedRows > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows.affectedRows); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    async addFaq(faq_type, question, answer, question_hindi, answer_hindi) {
        return new Promise((resolve, reject) => {
            const updatetime = moment().format('YYYY-MM-DD HH:mm:ss');
            const createtime = moment().format('YYYY-MM-DD HH:mm:ss');
            query = 'INSERT INTO faq_master (faq_type, question,answer,question_hindi,answer_hindi,updatetime,createtime) VALUES (?, ?,?, ?,?, ?,?)';
            mysqlcon.query(query, [faq_type, question, answer, question_hindi, answer_hindi, updatetime, createtime], (error, rows) => {
                if (error) {
                    console.log('database update faq_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.affectedRows > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows.insertId); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    async deleteFaq(faq_id) {
        return new Promise((resolve, reject) => {
            const updatetime = moment().format('YYYY-MM-DD HH:mm:ss');
            query = 'DELETE FROM faq_master WHERE faq_id = ?';
            mysqlcon.query(query, [faq_id], (error, rows) => {
                if (error) {
                    console.log('database delete faq_id error ')
                    reject(error);       // Reject the promise with the error
                } else {
                    if (rows.affectedRows > 0) {
                        // Email exists, resolve with user_id
                        resolve(rows.affectedRows); // Resolve with user_id
                    } else {
                        // Email does not exist, resolve with 0
                        resolve(0);       // Resolve with 0
                    }
                }
            });
        });
    },
    async getAllNotificationUsers(userType) {
        try {
            let query = '';
            if (userType === 'user') {
                query = 'SELECT `user_id`, `user_type`, `name`, `f_name`, `l_name`, `image`, `mobile`, `createtime` FROM `user_master` WHERE delete_flag = 0 and active_flag != 0 and user_type = 1 order by user_id desc';
            } else if (userType === "expert") {
              query ="SELECT `user_id`, `user_type`, `name`, `f_name`, `l_name`, `image`, `mobile`, `createtime` FROM `user_master` WHERE delete_flag = 0 and active_flag != 0 and user_type = 2 order by user_id desc";
            } else if (userType == "allexpert") {
              query =
                "SELECT `user_id`, `user_type`, `name`, `f_name`, `l_name`, `image`, `mobile`, `createtime` FROM `user_master` WHERE delete_flag = 0 and active_flag != 0 and user_type = 2 order by user_id desc";
            } else {
              query =
                "SELECT `user_id`, `user_type`, `name`, `f_name`, `l_name`, `image`, `mobile`, `createtime` FROM `user_master` WHERE delete_flag = 0 and active_flag != 0 and user_type = 1 order by user_id desc";
            }
            const rows = await new Promise((resolve, reject) => {
                mysqlcon.query(query, (error, rows) => {
                    if (error) {
                        console.error('Database error:', error);
                        reject(error);
                    } else {
                        let s_no = 0;
                        const user_arr = rows.map(row => {
                            s_no++;
                            return {
                                ...row,
                                s_no,
                                createtime: moment(row.createtime).format('DD-MM-YYYY hh:mm A'),
                                user_id: row.user_id,
                                user_type: row.user_type === 1 ? 'user' : row.user_type === 2 ? 'expert' : '',
                            };
                        });
                        resolve(user_arr);
                    }
                });
            });
            return rows;
        } catch (error) {
            console.error("Error fetching notification users:", error);
            throw error;
        }
    },
    async getNotifications() {
        let s_no = 0;
        return new Promise((resolve, reject) => {
            mysqlcon.query('SELECT unm.notification_message_id, unm.user_id, unm.other_user_id, unm.action, unm.action_id, unm.title, unm.title_2, unm.message, unm.message_2, unm.read_status, unm.createtime, un.user_notification_id, un.device_type, un.player_id, un.inserttime,um.name, um.image, umo.name AS other_name, umo.image AS other_image FROM user_notification_message unm LEFT JOIN user_notification un ON unm.user_id = un.user_id LEFT JOIN user_master um ON unm.user_id = um.user_id LEFT JOIN user_master umo ON unm.other_user_id = umo.user_id WHERE unm.delete_flag = 0 order by notification_message_id desc', (error, rows) => {
                if (error) {
                    console.log('database faqs get all error ')
                    reject(error); // Reject the promise with the error
                } else {
                    let notification_arr = '';
                    if (rows.length > 0) {
                        rows.forEach(row => {
                            s_no++;
                            row.s_no = s_no;
                            
                        });
                        notification_arr = rows;
                    } else {
                        notification_arr = [];
                    }
                    resolve(notification_arr); // Resolve the promise with the rows
                }
            });
        });
    },
};
