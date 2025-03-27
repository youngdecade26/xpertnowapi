const crypto = require('crypto');
const moment = require("moment");
const connection = require('../connection');
const jwt = require('jsonwebtoken');
const languageMessage = require('../shared functions/languageMessage');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const SECRET_KEY = "TOKEN-KEY";
    const userId = req.body.user_id || req.query.user_id || 0; // Get user_id from request
    if (userId == 0) {
      return next(); // Skip authentication if user_id is 0
    }
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // return res.status(401).json({ success: false, msg: "Unauthorized" });
        return res.status(401).json({ success: false, msg: languageMessage.checkUnathorizedToken,active_status:0 });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // return res.status(200).json({ success: false, msg: "Invalid token" });
            return res.status(200).json({ success: false, msg: languageMessage.checkToken,active_status:0});
        }
        console.log("Decoded Token:", decoded);  //Debugging: Check what’s inside the token
        const userId = decoded.user_id_get; //Extract user_id
        const deviceId = decoded.device_id; //Extract device_id
        if (!userId || !deviceId) {
            // return res.status(200).json({ success: false, msg: "Invalid token data" });
            return res.status(200).json({ success: false, msg: languageMessage.checkInvalidToken,active_status:0});
        }
        // Check session in DB
        const checkSessionQuery = `
            SELECT token FROM user_sessions 
            WHERE user_id = ? AND device_id = ? 
            ORDER BY session_id DESC LIMIT 1
        `;
        connection.query(checkSessionQuery, [userId, deviceId], (err, result) => {
            if (err) {
                // return res.status(200).json({ success: false, msg: "Database error",active_status:0 });
                return res.status(200).json({ success: false, msg: languageMessage.checkToken,active_status:0 });
            }
            if (result.length === 0 || result[0].token !== token) {
                return res.status(200).json({ success: false, msg: languageMessage.checkToken,active_status:0 });
            }
            req.user = decoded;
            next();
        });
    });
};
async function hashPassword(password) {
    const hash = crypto.createHash('md5');
    hash.update(password);
    return hash.digest('hex');
}
async function generateOTP(limit) {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
async function getUserDetails(user_id){
   return new Promise(async (resolve, reject) => {
      connection.query("select * from user_master where user_id = ? AND delete_flag = 0",
          [user_id],
          async (error, rows) => {
            if (error) {
              console.log("database  get all user details error ");
              reject(error); // Reject the promise with the error
            } else {
              if (rows.length > 0) {
                const userData = rows[0];
                let age = 0;
                let dob_new;
                let formattedDob;
                let category_name='NA';
                let subcategory_name='NA';
                let sub_category_level_name='NA';
                let sub_category_level_two_name='NA';
                let sub_category_level_three_name='NA';
                let degree_name='NA';
                let language_name='NA';
                let state_name='NA';
                let city_name='NA';
                let documentResult='NA';
                let degreeDocumentResult='NA';
                let average_rating=0;
                let walletResult=0;
                let earningResult=0;
                let withdrawlResult=0;
  
                if (userData.dob) {
                  dob_new = moment(userData.dob).format('MMM DD, YYYY');
                  formattedDob = moment(userData.dob).format('YYYY-MM-DD');
                }
                //earning amount
                if (userData.user_id) {
                    try {
                        earningResult = await getExpertTotalEarning(userData.user_id); // Wait for the promise to resolve
                       
                        
                    } catch (err) {
                        console.log("Error fetching category name:", err.message);
                    }
                  }
                  //earning amount
                if (userData.user_id) {
                    try {
                        withdrawlResult = await getExpertTotalWithdrawl(userData.user_id); // Wait for the promise to resolve
                        
                        
                    } catch (err) {
                        console.log("Error fetching category name:", err.message);
                    }
                }
                //wallet amount
                if (userData.user_id) {
                    try {
                        walletResult = await getUserTotalWallet(userData.user_id); // Wait for the promise to resolve
                       
                        
                    } catch (err) {
                        console.log("Error fetching category name:", err.message);
                    }
                  }
                if (userData.category) {
                  try {
                      categoryResult = await getCategoryName(userData.category); // Wait for the promise to resolve
                      category_name = categoryResult.name || 'NA';
                      
                  } catch (err) {
                      console.log("Error fetching category name:", err.message);
                  }
                }
                if (userData.sub_category) {
                  try {
                    subcategoryResult = await getSubcategoryName(userData.sub_category); // Wait for the promise to resolve
                      subcategory_name = subcategoryResult.sub_category_name || 'NA';
                      
                  } catch (err) {
                      console.log("Error fetching sub_category name:", err.message);
                  }
                }
                if (userData.sub_category_level) {
                  try {
                      const subCategoryIds = userData.sub_category_level.split(',').map(id => parseInt(id.trim(), 10)); // Parse to array
                      subcategorylabelResult = await getSubcategoryLabelName(subCategoryIds); // Fetch labels
                      sub_category_level_name = subcategorylabelResult.join(', ') || 'NA'; // Join names or use 'NA'
                  } catch (err) {
                      console.log("Error fetching sub_category label name:", err.message);
                  }
                }
                if(userData.sub_two_level_category_id){
                    try {
                      subcategoryResult = await getSubcategoryLevelTwoName(userData.sub_two_level_category_id); // Wait for the promise to resolve
                      sub_category_level_two_name = subcategoryResult.sub_two_level_category_name || 'NA';
                        
                    } catch (err) {
                        console.log("Error fetching sub_two_level_category name:", err.message);
                    }
                }
                if(userData.sub_three_level_category_id){
                    try {
                      subcategoryResult = await getSubcategoryLevelThreeName(userData.sub_three_level_category_id); // Wait for the promise to resolve
                      sub_category_level_three_name = subcategoryResult.sub_three_level_category_name || 'NA';
                        
                    } catch (err) {
                        console.log("Error fetching sub_two_level_category name:", err.message);
                    }
                }
                if (userData.degree) {
                  try {
                      const degreeIds = userData.degree.split(',').map(id => parseInt(id.trim(), 10)); // Parse to array
                      degreelabelResult = await getDegreeName(degreeIds); // Fetch labels
                      degree_name = degreelabelResult.join(', ') || 'NA'; // Join names or use 'NA'
                  } catch (err) {
                      console.log("Error fetching sub_category label name:", err.message);
                  }
                }
                if (userData.language) {
                  try {
                      const languageIds = userData.language.split(',').map(id => parseInt(id.trim(), 10)); // Parse to array
                      languagelabelResult = await getLanguageName(languageIds); // Fetch labels
                      language_name = languagelabelResult.join(', ') || 'NA'; // Join names or use 'NA'
                  } catch (err) {
                      console.log("Error fetching sub_category label name:", err.message);
                  }
                }
                if (userData.state) {
                  try {
                      stateResult = await getStateName(userData.state); // Wait for the promise to resolve
                      state_name = stateResult.state_name || 'NA';
                      
                  } catch (err){
                      console.log("Error fetching state name:", err.message);
                  }
                }
                if (userData.city) {
                  try {
                      cityResult = await getCityName(userData.city); // Wait for the promise to resolve
                      city_name = cityResult.city_name || 'NA';
                      
                  } catch (err){
                      console.log("Error fetching city name:", err.message);
                  }
                }
                if (userData.user_id) {
                  try {
                      documentResult = await getUserDocument(userData.user_id); // Wait for the promise to resolve
                      //city_name = cityResult.city_name || 'NA';
                      
                  } catch (err){
                      console.log("Error fetching city name:", err.message);
                  }
                }
                if (userData.user_id) {
                  try {
                      averageResult = await getAvgRating(userData.user_id); // Wait for the promise to resolve
                      average_rating = averageResult.average_rating || 0;
                      
                  } catch (err) {
                      console.log("Error fetching average rating:", err.message);
                  }
                }
                if (userData.user_id) {
                    try {
                        degreeDocumentResult = await getUserDegreeDocument(userData.user_id); // Wait for the promise to resolve
                        //city_name = cityResult.city_name || 'NA';
                        
                    } catch (err){
                        console.log("Error fetching degree:", err.message);
                    }
                }
                userData.dob_new = dob_new;
                userData.dob = formattedDob;
                userData.category_name = category_name;
                userData.subcategory_name = subcategory_name;
                userData.subcategory_label_name = sub_category_level_name;
                userData.sub_category_level_two_name = sub_category_level_two_name;
                userData.sub_category_level_three_name = sub_category_level_three_name;
                userData.degree_name = degree_name;
                userData.language_name = language_name;
                userData.state_name = state_name;
                userData.city_name = city_name;
                userData.average_rating = parseFloat(average_rating.toFixed(1));
                userData.document_arr = documentResult;
                userData.degree_arr = degreeDocumentResult;
                userData.wallet_amount = walletResult;
                userData.earning_amount = earningResult-withdrawlResult;
                resolve(userData);
                const userDataArray = {
                  user_id: userData.user_id,
                  user_type: userData.user_type,
                  user_type_label: "0=admin,1=user",
                  login_type: userData.login_type,
                  login_type_first: userData.login_type_first,
                  login_type_label: "0=app, 1=google, 2=apple, 3=facebook",
                  email: userData.email,
                  f_name: userData.f_name,
                  l_name: userData.l_name,
                  full_name: userData.name,
                  age: age,
                  category_name:category_name,
                  phone_code: userData.phone_code,
                  mobile: userData.mobile,
                  otp_type: userData.otp_type,
                  otp: userData.otp,
                  otp_verify: userData.otp_verify,
                  image: userData.image,
                  gender: userData.gender,
                  gender_lebal: "1=men,2=women,3=other",
                  address: userData.address,
  
                  latitude: userData.latitude,
  
  
  
                  longitude: userData.longitude,
  
  
  
                  zipcode: userData.zipcode,
  
  
  
                  bio: userData.bio,
  
  
  
                  active_flag: userData.active_flag,
  
  
  
                  approve_flag: userData.approve_flag,
  
  
  
                  profile_complete: userData.profile_complete,
  
  
  
                  language_id: userData.language_id,
  
  
  
                  facebook_id: userData.facebook_id,
  
  
  
                  google_id: userData.google_id,
  
  
  
                  apple_id: userData.apple_id,
  
  
  
                  notification_status: userData.notification_status,
  
  
  
                  delete_flag: userData.delete_flag,
  
  
  
                  delete_reason: userData.delete_reason,
  
  
  
                  createtime: moment(userData.createtime).format(
  
                    "DD-MM-YYYY h:mm A"
  
                  ),
  
  
  
                  updatetime: moment(userData.updatetime).format(
  
                    "DD-MM-YYYY h:mm A"
  
                  ),
  
  
                  about: userData.about,
  
  
                };
  
                resolve(userDataArray);
  
              } else {
  
                resolve("NA");
  
              }
  
            }
  
            resolve("NA");
  
          }
  
        );
  
      });
  
    }
    function formatDate(dateString) {
      const date = new Date(dateString);
      
      // Get the month's name
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const month = monthNames[date.getMonth()];
      
      // Get the day and year
      const day = date.getDate();
      const year = date.getFullYear();
      
      // Return formatted string
      return `${month} ${day}, ${year}`;
  }
  
    async function getCategoryName(category_id){
   
     
       return new Promise((resolve, reject) => {
     
         connection.query(
     
             "select name from categories_master where category_id = ? AND delete_flag = 0",
     
             [category_id],
     
             (error, rows) => {
     
               if (error) {
     
                 console.log("database  get all user details error ");
     
     
     
                 reject(error); // Reject the promise with the error
     
               } else {
     
                 if (rows.length > 0) {
     
                   const userData = rows[0];
                   
                   resolve(userData);
                  
     
                 } else {
     
                   resolve("NA");
     
                 }
     
               }
     
               resolve("NA");
     
             }
     
           );
     
         });
     
       }
       async function getSubcategoryName(sub_category_id){
       
         return new Promise((resolve, reject) => {
       
           connection.query(
       
               "select sub_category_name from sub_categories_master where sub_category_id = ? AND delete_flag = 0",
       
               [sub_category_id],
       
               (error, rows) => {
       
                 if (error) {
       
                   console.log("database  get all user details error ");
       
       
       
                   reject(error); // Reject the promise with the error
       
                 } else {
       
                   if (rows.length > 0) {
       
                     const userData = rows[0];
                     
                     resolve(userData);
                    
       
                   } else {
       
                     resolve("NA");
       
                   }
       
                 }
       
                 resolve("NA");
       
               }
       
             );
       
           });
       
        }
        async function getSubcategoryLabelName(sub_level_category_ids) {
          return new Promise((resolve, reject) => {
              const placeholders = sub_level_category_ids.map(() => '?').join(',');
              const query = `
                  SELECT sub_level_category_name
                  FROM sub_level_categories_master
                  WHERE sub_level_category_id IN (${placeholders}) AND delete_flag = 0
              `;
      
              connection.query(query, sub_level_category_ids, (error, rows) => {
                  if (error) {
                      console.log("Database error while getting subcategory labels:", error.message);
                      reject(error);
                  } else if (rows.length > 0) {
                      const subCategoryNames = rows.map(row => row.sub_level_category_name); // Ensure column matches
                      resolve(subCategoryNames);
                  } else {
                      resolve([]); // Empty array if no rows
                  }
              });
          });
      }
      async function getDegreeName(degree_ids) {
        return new Promise((resolve, reject) => {
            const placeholders = degree_ids.map(() => '?').join(',');
            const query = `
                SELECT name
                FROM degree_master
                WHERE degree_id IN (${placeholders}) AND delete_flag = 0
            `;
    
            connection.query(query, degree_ids, (error, rows) => {
                if (error) {
                    console.log("Database error while getting degree name:", error.message);
                    reject(error);
                } else if (rows.length > 0) {
                    const degreeNames = rows.map(row => row.name); // Ensure column matches
                    resolve(degreeNames);
                } else {
                    resolve([]); // Empty array if no rows
                }
            });
        });
    }
    async function getLanguageName(language_ids) {
      return new Promise((resolve, reject) => {
          const placeholders = language_ids.map(() => '?').join(',');
          const query = `
              SELECT name
              FROM language_master
              WHERE language_id IN (${placeholders}) AND delete_flag = 0
          `;
  
          connection.query(query, language_ids, (error, rows) => {
              if (error) {
                  console.log("Database error while getting degree name:", error.message);
                  reject(error);
              } else if (rows.length > 0) {
                  const languageNames = rows.map(row => row.name); // Ensure column matches
                  resolve(languageNames);
              } else {
                  resolve([]); // Empty array if no rows
              }
          });
      });
  }
  async function getStateName(state_id){
    
   
     return new Promise((resolve, reject) => {
   
       connection.query(
   
           "select state_name from state_master where state_id = ? AND delete_flag = 0",
   
           [state_id],
   
           (error, rows) => {
   
             if (error) {
   
               console.log("database  get all user details error ");
   
   
   
               reject(error); // Reject the promise with the error
   
             } else {
   
               if (rows.length > 0) {
   
                 const userData = rows[0];
                 
                 resolve(userData);
                
   
               } else {
   
                 resolve("NA");
   
               }
   
             }
   
             resolve("NA");
   
           }
   
         );
   
       });
   
     }
     async function getCityName(city_id){
      
     
       return new Promise((resolve, reject) => {
     
         connection.query(
     
             "select city_name from city_master where city_id = ? AND delete_flag = 0",
     
             [city_id],
     
             (error, rows) => {
     
               if (error) {
     
                 console.log("database  get all user details error ");
     
     
     
                 reject(error); // Reject the promise with the error
     
               } else {
     
                 if (rows.length > 0) {
     
                   const userData = rows[0];
                   
                   resolve(userData);
                  
     
                 } else {
     
                   resolve("NA");
     
                 }
     
               }
     
               resolve("NA");
     
             }
     
           );
     
         });
     
       }
       async function getUserDocument(user_id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT file_id,file_name
                FROM file_master
                WHERE user_id=? AND delete_flag = 0
            `;
    
            connection.query(query, user_id, (error, rows) => {
                if (error) {
                    console.log("Database error while getting degree name:", error.message);
                    reject(error);
                } else if (rows.length > 0) {
                    const documentNames = rows.map(row => row.file_name); // Ensure column matches
                    resolve(rows);
                } else {
                    resolve('NA'); // Empty array if no rows
                }
            });
        });
    }
    async function getUserDegreeDocument(user_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT file_id,document_file
                FROM user_degree_master
                WHERE user_id=? AND delete_flag = 0
            `;
    
            connection.query(query, user_id, (error, rows) => {
                if (error) {
                    console.log("Database error while getting degree name:", error.message);
                    reject(error);
                } else if (rows.length > 0) {
                    const documentNames = rows.map(row => row.document_file); // Ensure column matches
                    resolve(rows);
                } else {
                    resolve('NA'); // Empty array if no rows
                }
            });
        });
    }
    async function DeviceTokenStore_1_Signal(user_id, device_type, player_id) {
      
    
      const inserttime = moment().format("YYYY-MM-DD HH:mm:ss");
    
    
    
      try {
    
        connection.query(
    
          "INSERT INTO user_notification (user_id, device_type, player_id, inserttime) VALUES (?, ?, ?, ?)",
    
          [user_id, device_type, player_id, inserttime]
    
        );
    
        return "yes";
    
      } catch (error) {
    
        throw error;
    
      }
    
    }
    async function getAvgRating(user_id){
     
     
       return new Promise((resolve, reject) => {
     
         connection.query(
     
             "SELECT AVG(rating) AS average_rating FROM rating_master WHERE expert_id = ? AND delete_flag = 0",
     
             [user_id],
     
             (error, rows) => {
     
               if (error) {
     
                 console.log("database  get all user details error ");
     
     
     
                 reject(error); // Reject the promise with the error
     
               } else {
     
                 if (rows.length > 0) {
     
                   const userData = rows[0];
                   
                   resolve(userData);
                  
     
                 } else {
     
                   resolve(0);
     
                 }
     
               }
     
               resolve(0);
     
             }
     
           );
     
         });
     
       }
      function getRelativeTime(datetime) {
        const now = new Date();
        const inputDate = new Date(datetime);
        const diffInSeconds = Math.floor((now - inputDate) / 1000);
    
        if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`; // Seconds
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} min ago`; // Minutes
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`; // Hours
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`; // Days
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} month${months > 1 ? 's' : ''} ago`; // Months
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years} year${years > 1 ? 's' : ''} ago`; // Years
        }
      }
    
      async function getRatingBarAvg(user_id) {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT COUNT(rating) AS rating_count, rating FROM rating_master WHERE expert_id = ? AND delete_flag = 0 GROUP BY rating ORDER BY rating DESC",
                [user_id],
                (error, rows) => {
                    if (error) {
                        console.log("Database error in getting all user details.");
                        reject(error); // Reject the promise with the error
                    } else {
                        // Initialize an array to hold ratings from 1 to 5
                        const ratingMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
                        // Map the existing ratings to their counts
                        rows.forEach(row => {
                            ratingMap[row.rating] = row.rating_count;
                        });
    
                        // Calculate the total count of ratings
                        const totalRatings = Object.values(ratingMap).reduce((sum, count) => sum + count, 0);
    
                        // Create the final response with percentage for each rating
                        const ratingDataWithPercentage = Object.keys(ratingMap).map(rating => ({
                            rating: parseInt(rating, 10),
                            rating_count: ratingMap[rating],
                            percentage: totalRatings > 0
                                ? ((ratingMap[rating] / totalRatings) * 100).toFixed(2)
                                : "0.00" // Prevent division by zero
                        }));
    
                        resolve(ratingDataWithPercentage); // Return the modified data
                    }
                }
            );
        });
    }
    
    
    async function getHomeExpertJob(user_id) {
      return new Promise((resolve, reject) => {
        const query = `SELECT job_post_id,user_id,assign_expert_id,title,category,sub_category,max_price,min_price,duration,status,createtime,duration_type FROM job_post_master WHERE assign_expert_id = ? And status=2 AND delete_flag = 0 order by job_post_id desc`;
        connection.query(query, [user_id], async (err, jobPosts) => {
              if (err) {
                  return reject({ success: false, msg: "Internal Server Error", key: err.message });
              }
  
              if (!jobPosts || jobPosts.length === 0) {
                  return resolve('NA');
              }
  
              try {
                  const jobPostDetails = await Promise.all(
                      jobPosts.map(async (job) => {
                          // Fetch sub-category name
                          const subCategoryName = await new Promise((resolve) => {
                              const subCategoryQuery = `
                                  SELECT sub_category_name 
                                  FROM sub_categories_master 
                                  WHERE sub_category_id = ? AND delete_flag = 0`;
  
                              connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                  resolve(err ? null : result[0]?.sub_category_name || null);
                              });
                          });
  
                          // Fetch category name
                          const categoryName = await new Promise((resolve) => {
                              const categoryQuery = `
                                  SELECT name 
                                  FROM categories_master 
                                  WHERE category_id = ? AND delete_flag = 0`;
  
                              connection.query(categoryQuery, [job.category], (err, result) => {
                                  resolve(err ? null : result[0]?.name || null);
                              });
                          });
                            const userDetails = await new Promise((resolve, reject) => {
                                const userQuery = `SELECT name, image, category FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                                connection.query(userQuery, [job.user_id], (err, result) => {
                                    if (err || result.length === 0) {
                                        resolve({ name: 'NA', image: 'NA', category: 'NA' });
                                    } else {
                                        resolve(result[0]);
                                    }
                                });
                            });

                            // Fetch document
                            let jobdocument = [];
                            const jobDocQuery = "SELECT file_name FROM job_file_master WHERE job_id = ? AND delete_flag = 0";
                            jobdocument = await new Promise((resolve) => {
                                connection.query(jobDocQuery, [job.job_post_id], (err, fileresult) => {
                                    if (err || !fileresult || fileresult.length === 0) {
                                        resolve('NA'); // Return an empty array if no files are found
                                    } else {
                                        resolve(fileresult.map(row => row.file_name)); // Return an array of file names
                                    }
                                });
                            });
  
                          // Return enriched job details
                          return {
                              ...job,
                              sub_category_id: job.sub_category,
                              sub_category: subCategoryName,
                              category_id: job.category,
                              category: categoryName,
                              posted_time: getRelativeTime(job.createtime),
                              status_label: '0=pending,1=hired,2=inprogress,3=completed',
                              duration_type_labe:'1=days,2=month,3=year',
                              user_name: userDetails.name,
                              user_image: userDetails.image,
                              file_name: jobdocument,
                          };
                      })
                  );
  
                  resolve(jobPostDetails);
              } catch (error) {
                  reject({ success: false, msg: "Error processing job details", key: error.message });
              }
          });
      });
  }
  
  async function getHomeExpertUserJob(expert_id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                job_post_id, 
                assign_expert_id, 
                title, 
                category, 
                sub_category, 
                max_price, 
                min_price, 
                duration, 
                status, 
                createtime,
                user_id,
                duration_type
            FROM job_post_master 
            WHERE assign_expert_id = 0 AND delete_flag = 0 order by job_post_id desc`;
        connection.query(query,async (err, jobPosts) => {
            if (err) {
                return reject({ success: false, msg: "Internal Server Error", key: err.message });
            }
            if (!jobPosts || jobPosts.length === 0) {
                return resolve('NA');
            }
            try {
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch sub-category name
                        const subCategoryName = await new Promise((resolve) => {
                            const subCategoryQuery = `
                                SELECT sub_category_name 
                                FROM sub_categories_master 
                                WHERE sub_category_id = ? AND delete_flag = 0`;
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name || 'NA');
                            });
                        });
                        // Fetch category name
                        const categoryName = await new Promise((resolve) => {
                            const categoryQuery = `
                                SELECT name 
                                FROM categories_master 
                                WHERE category_id = ? AND delete_flag = 0`;
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name || 'NA');
                            });
                        });
                       // Fetch user name
                       const userNameQuery = await new Promise((resolve) => {
                          const userQuery = `SELECT name,image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                          connection.query(userQuery, [job.user_id], (err, result) => {
                              resolve(err ? null : result[0]?.name || 'NA');
                          });
                      });
                      // Fetch user name
                      const userimageQuery = await new Promise((resolve) => {
                          const imageQuery = `SELECT image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                          connection.query(imageQuery, [job.user_id], (err, result) => {
                              resolve(err ? null : result[0]?.image || 'NA');
                          });
                      });
                      // Fetch save status
                      const jobStatusQuery = await new Promise((resolve) => {
                        const jobQuery = `
                            SELECT book_mark_id 
                            FROM job_bookmark_master 
                            WHERE job_post_id = ? AND expert_id = ? AND delete_flag = 0`;
                    
                        connection.query(jobQuery, [job.job_post_id, expert_id], (err, result) => {
                            if (err || !result || result.length === 0) {
                                resolve(0); // Return 0 if there's an error or no result
                            } else {
                                resolve(result[0].book_mark_id > 0 ? 1 : 0); // Return 1 if book_mark_id > 0, otherwise 0
                            }
                        });
                      });
                      // Fetch bid status
                      const bidStatusQuery = await new Promise((resolve) => {
                        const bidQuery = `
                            SELECT bid_id 
                            FROM bid_master 
                            WHERE job_post_id = ? AND expert_id = ? AND delete_flag = 0`;
                    
                        connection.query(bidQuery, [job.job_post_id, expert_id], (err, result) => {
                            if (err || !result || result.length === 0) {
                                resolve(0); // Return 0 if there's an error or no result
                            } else {
                                resolve(result[0].bid_id > 0 ? 1 : 0); // Return 1 if bid_id > 0, otherwise 0
                            }
                        });
                      });
                    
                      
                        // Return enriched job details
                        return {
                            ...job,
                            sub_category: subCategoryName,
                            category: categoryName,
                            posted_time: getRelativeTime(job.createtime),
                            status_label: '0=pending,1=hired,2=inprogress,3=completed',
                            user_name:userNameQuery,
                            user_image:userimageQuery,
                            save_status:jobStatusQuery,
                            duration_type_labe:'1=days,2=month,3=year',
                            bid_status:bidStatusQuery,
                        };
                    })
                );
                resolve(jobPostDetails);
            } catch (error) {
                reject({ success: false, msg: "Error processing job details", key: error.message });
            }
        });
    });
}
async function getHomeUserJobCount() {
  return new Promise((resolve, reject) => {
      const query = ` SELECT COUNT(job_post_id) as total_job FROM job_post_master WHERE assign_expert_id = 0 AND delete_flag = 0 order by job_post_id desc`;
      connection.query(query,async (err, jobPosts) => {
          if (err) {
              return reject({ success: false, msg: "Internal Server Error", key: err.message });
          }
          if (!jobPosts || jobPosts.length === 0) {
              return resolve(0);
          }
          try {
            resolve(jobPosts[0].total_job);
          } catch (error) {
            reject({ success: false, msg: "Error processing job details", key: error.message });
          }
      });
  });
}
async function getCustomerJobFilter(user_id,category,sub_category) {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT 
              job_post_id, 
              assign_expert_id, 
              title, 
              category, 
              sub_category, 
              max_price, 
              min_price, 
              duration, 
              status, 
              createtime,
              duration_type
              
          FROM job_post_master 
          WHERE delete_flag = 0 and category=? and sub_category=? and user_id=? order by job_post_id desc`;
      connection.query(query,[category,sub_category,user_id],async (err, jobPosts) => {
          if (err) {
              return reject({ success: false, msg: "Internal Server Error", key: err.message });
          }
          if (!jobPosts || jobPosts.length === 0) {
              return resolve('NA');
          }
          try {
              const jobPostDetails = await Promise.all(
                  jobPosts.map(async (job) => {
                      // Fetch sub-category name
                      const subCategoryName = await new Promise((resolve) => {
                          const subCategoryQuery = `
                              SELECT sub_category_name 
                              FROM sub_categories_master 
                              WHERE sub_category_id = ? AND delete_flag = 0`;
                          connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                              resolve(err ? null : result[0]?.sub_category_name || 'NA');
                          });
                      });
                      // Fetch category name
                      const categoryName = await new Promise((resolve) => {
                          const categoryQuery = `
                              SELECT name 
                              FROM categories_master 
                              WHERE category_id = ? AND delete_flag = 0`;
                          connection.query(categoryQuery, [job.category], (err, result) => {
                              resolve(err ? null : result[0]?.name || 'NA');
                          });
                      });
                     // Fetch user name
                     const userNameQuery = await new Promise((resolve) => {
                        const userQuery = `SELECT name,image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                        connection.query(userQuery, [job.assign_expert_id], (err, result) => {
                            resolve(err ? null : result[0]?.name || 'NA');
                        });
                    });
                    // Fetch user name
                    const userimageQuery = await new Promise((resolve) => {
                        const imageQuery = `SELECT image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                        connection.query(imageQuery, [job.assign_expert_id], (err, result) => {
                            resolve(err ? null : result[0]?.image || 'NA');
                        });
                    });
                    
                  
                    
                      // Return enriched job details
                      return {
                          ...job,
                          sub_category_id:job.sub_category,
                          sub_category: subCategoryName,
                          category_id:job.category,
                          category: categoryName,
                          posted_time: getRelativeTime(job.createtime),
                          status_label: '0=pending,1=hired,2=inprogress,3=completed',
                          expert_name:userNameQuery,
                          expert_image:userimageQuery,
                          duration_type_labe:'1=days,2=month,3=year',
                          
                      };
                  })
              );
              resolve(jobPostDetails);
          } catch (error) {
              reject({ success: false, msg: "Error processing job details", key: error.message });
          }
      });
  });
}
async function getExpertJobFilter(user_id,category,sub_category) {
  return new Promise((resolve, reject) => {
      const query = `SELECT job_post_id,user_id,title,category,sub_category,max_price,min_price,duration,status,createtime,duration_type FROM job_post_master WHERE delete_flag = 0 and category=? and sub_category=? and assign_expert_id=? order by job_post_id desc`;
      connection.query(query,[category,sub_category,user_id],async (err, jobPosts) => {
          if (err) {
              return reject({ success: false, msg: "Internal Server Error", key: err.message });
          }
          if (!jobPosts || jobPosts.length === 0) {
              return resolve('NA');
          }
          try {
              const jobPostDetails = await Promise.all(
                  jobPosts.map(async (job) => {
                      // Fetch sub-category name
                      const subCategoryName = await new Promise((resolve) => {
                          const subCategoryQuery = `
                              SELECT sub_category_name 
                              FROM sub_categories_master 
                              WHERE sub_category_id = ? AND delete_flag = 0`;
                          connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                              resolve(err ? null : result[0]?.sub_category_name || 'NA');
                          });
                      });
                      // Fetch category name
                      const categoryName = await new Promise((resolve) => {
                          const categoryQuery = `
                              SELECT name 
                              FROM categories_master 
                              WHERE category_id = ? AND delete_flag = 0`;
                          connection.query(categoryQuery, [job.category], (err, result) => {
                              resolve(err ? null : result[0]?.name || 'NA');
                          });
                      });
                     // Fetch user name
                     const userNameQuery = await new Promise((resolve) => {
                        const userQuery = `SELECT name,image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                        connection.query(userQuery, [job.user_id], (err, result) => {
                            resolve(err ? null : result[0]?.name || 'NA');
                        });
                    });
                    // Fetch user name
                    const userimageQuery = await new Promise((resolve) => {
                        const imageQuery = `SELECT image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                        connection.query(imageQuery, [job.user_id], (err, result) => {
                            resolve(err ? null : result[0]?.image || 'NA');
                        });
                    });
                    
                  
                    
                      // Return enriched job details
                      return {
                          ...job,
                          sub_category_id:job.sub_category,
                          sub_category: subCategoryName,
                          category_id:job.category,
                          category: categoryName,
                          posted_time: getRelativeTime(job.createtime),
                          status_label: '0=pending,1=hired,2=inprogress,3=completed',
                          user_name:userNameQuery,
                          user_image:userimageQuery,
                          duration_type_labe:'1=days,2=month,3=year',
                          
                      };
                  })
              );
              resolve(jobPostDetails);
          } catch (error) {
              reject({ success: false, msg: "Error processing job details", key: error.message });
          }
      });
  });
}
async function getJobWorkSpace(job_post_id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT milestone_id,price,duration,description,title,file,createtime,milestone_status,duration_type FROM milestone_master WHERE delete_flag = 0 and job_post_id=? order by job_post_id desc`;
  
        connection.query(query,[job_post_id],async (err, jobPosts) => {
            if (err) {
                return reject({ success: false, msg: "Internal Server Error", key: err.message });
            }
  
            if (!jobPosts || jobPosts.length === 0) {
                return resolve('NA');
            }
  
            try {
                let task = 0;
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        task += 1;
                        // Return enriched job details
                        return {
                            ...job,
                            task_no:task,
                            posted_time : moment(job.createtime).format("MMM DD YYYY hh:mm A"),
                            status_label: '0=pending,1=accept,2=reject,3=milestone request send,4=release milestone,5=dispute,6=cancel,7=convert milestone',
                            duration_type_label: '1=days,2=month,3=year',
                        };
                    })
                );
  
                resolve(jobPostDetails);
            } catch (error) {
                reject({ success: false, msg: "Error processing job details", key: error.message });
            }
        });
    });
  }
  async function getJobMilestone(job_post_id){
    return new Promise((resolve, reject) =>{
        const query = `SELECT milestone_id,price,duration,description,title,file,createtime,milestone_status,duration_type FROM milestone_master WHERE delete_flag = 0 and job_post_id=? and milestone_status!=0 order by job_post_id desc`;
        connection.query(query,[job_post_id],async (err, jobPosts)=>{
            if(err){
                return reject({ success: false, msg: "Internal Server Error", key: err.message });
            }
            if(!jobPosts || jobPosts.length === 0){
                return resolve('NA');
            }
            try{
                let task = 0;
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Return enriched job details
                        task += 1;
                        return {
                            ...job,
                            milestone_no:task,
                            posted_time : moment(job.createtime).format("MMM DD YYYY hh:mm A"),
                            status_label: '0=pending,1=accept,2=reject,3=milestone request send,4=release milestone,5=dispute,6=cancel,7=convert milestone',
                            duration_type_label: '1=days,2=month,3=year',
                        };
                    })
                );
  
                resolve(jobPostDetails);
            } catch (error) {
                reject({ success: false, msg: "Error processing job details", key: error.message });
            }
        });
    });
  }
  async function getHomeExpertCompletedJob(user_id) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                job_post_id, 
                user_id,
                assign_expert_id, 
                title, 
                category, 
                sub_category, 
                max_price, 
                min_price, 
                duration, 
                status, 
                createtime,
                duration_type
            FROM job_post_master 
            WHERE assign_expert_id = ? And status=3 AND delete_flag = 0 order by job_post_id desc`;
        connection.query(query, [user_id], async (err, jobPosts) => {
            if (err) {
                return reject({ success: false, msg: "Internal Server Error", key: err.message });
            }
            if (!jobPosts || jobPosts.length === 0) {
                return resolve('NA');
            }
            try {
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch sub-category name
                        const subCategoryName = await new Promise((resolve) => {
                            const subCategoryQuery = `
                                SELECT sub_category_name 
                                FROM sub_categories_master 
                                WHERE sub_category_id = ? AND delete_flag = 0`;
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name || null);
                            });
                        });
                        // Fetch category name
                        const categoryName = await new Promise((resolve) => {
                            const categoryQuery = `
                                SELECT name 
                                FROM categories_master 
                                WHERE category_id = ? AND delete_flag = 0`;
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name || null);
                            });
                        });
                        const userDetails = await new Promise((resolve, reject) => {
                            const userQuery = `SELECT name, image, category FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                            connection.query(userQuery, [job.user_id], (err, result) => {
                                if (err || result.length === 0) {
                                    resolve({ name: 'NA', image: 'NA', category: 'NA' });
                                } else {
                                    resolve(result[0]);
                                }
                            });
                        });
                        // Return enriched job details
                        return {
                            ...job,
                            sub_category_id: job.sub_category,
                            sub_category: subCategoryName,
                            category_id: job.category,
                            category: categoryName,
                            posted_time: getRelativeTime(job.createtime),
                            status_label: '0=pending,1=hired,2=inprogress,3=completed',
                            duration_type_labe:'1=days,2=month,3=year',
                            user_name: userDetails.name,
                            user_image: userDetails.image,
                        };
                    })
                );
                resolve(jobPostDetails);
            } catch (error) {
                reject({ success: false, msg: "Error processing job details", key: error.message });
            }
        });
    });
}
async function getUserTotalWallet(user_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT SUM(CASE WHEN status = 0 THEN amount ELSE 0 END) AS credit_amount,
                SUM(CASE WHEN status = 1 THEN amount ELSE 0 END) AS debit_amount
            FROM wallet_master
            WHERE user_id = ? AND delete_flag = 0
            `,
            [user_id],
            (error, rows) => {
                if (error) {
                    console.log("Database error while fetching user wallet details");
                    reject(error); // Reject the promise with the error
                } else {
                    if (rows.length > 0) {
                        const creditAmount = rows[0].credit_amount || 0;
                        const debitAmount = rows[0].debit_amount || 0;
                        // Calculate the wallet balance
                        const walletBalance = creditAmount - debitAmount;
                        resolve(parseFloat(walletBalance.toFixed(2))); // Resolve with the calculated wallet balance
                    } else {
                        resolve(0); // Resolve with "NA" if no rows are returned
                    }
                }
            }
        );
    });
}
async function getExpertTotalEarning(user_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT SUM(expert_earning) AS expert_earning FROM wallet_master WHERE expert_id = ? AND delete_flag = 0`,
            [user_id],
            (error, rows) => {
                if (error) {
                    console.log("Database error while fetching user wallet details");
                    reject(error); // Reject the promise with the error
                } else {
                    if (rows.length > 0) {
                        const earningAmount = rows[0].expert_earning || 0;
                       
                        resolve(parseFloat(earningAmount.toFixed(2))); // Resolve with the calculated wallet balance
                    } else {
                        resolve(0); // Resolve with "NA" if no rows are returned
                    }
                }
            }
        );
    });
}
async function getExpertTotalWithdrawl(user_id) {
    return new Promise((resolve, reject) => {
        connection.query(
            `SELECT SUM(withdraw_amount) AS withdraw_amount FROM expert_withdraw_master WHERE expert_id = ? AND delete_flag = 0 and withdraw_status IN(0,1)`,
            [user_id],
            (error, rows) => {
                if (error) {
                    console.log("Database error while fetching user wallet details");
                    reject(error); // Reject the promise with the error
                } else {
                    if (rows.length > 0) {
                        const withdrawlAmount = rows[0].withdraw_amount || 0;
                       
                        resolve(parseFloat(withdrawlAmount.toFixed(2))); // Resolve with the calculated wallet balance
                    } else {
                        resolve(0); // Resolve with "NA" if no rows are returned
                    }
                }
            }
        );
    });
}
async function getSubcategoryLevelTwoName(sub_two_level_category_id){
    return new Promise((resolve, reject) => {
        connection.query("select sub_two_level_category_name from sub_two_level_categories_master where sub_two_level_category_id = ? AND delete_flag = 0",
           [sub_two_level_category_id],
           (error, rows) => {
                if (error) {
                    reject(error); // Reject the promise with the error
                } else {
                    if(rows.length > 0) {
                        const userData = rows[0];
                        resolve(userData);
                    }else{
                        resolve("NA");
                    }
                }
                resolve("NA");
            }
        );
    });
}
async function getSubcategoryLevelThreeName(sub_three_level_category_id){
    return new Promise((resolve, reject) => {
        connection.query("select sub_three_level_category_name from sub_three_level_categories_master where sub_three_level_category_id = ? AND delete_flag = 0",
           [sub_three_level_category_id],
           (error, rows) => {
                if (error) {
                    reject(error); // Reject the promise with the error
                } else {
                    if(rows.length > 0) {
                        const userData = rows[0];
                        resolve(userData);
                    }else{
                        resolve("NA");
                    }
                }
                resolve("NA");
            }
        );
    });
}
module.exports = { generateOTP, hashPassword,getUserDetails,formatDate,getCategoryName,getSubcategoryName,getSubcategoryLabelName,getDegreeName,getLanguageName,getStateName,getCityName,getUserDocument,DeviceTokenStore_1_Signal,getAvgRating,getRelativeTime,getRatingBarAvg,getHomeExpertJob,getHomeExpertUserJob,getHomeUserJobCount,getCustomerJobFilter,getExpertJobFilter,getJobMilestone,getJobWorkSpace,getHomeExpertCompletedJob,getUserTotalWallet,getExpertTotalEarning,getExpertTotalWithdrawl,authenticateToken,getSubcategoryLevelTwoName,getSubcategoryLevelThreeName};