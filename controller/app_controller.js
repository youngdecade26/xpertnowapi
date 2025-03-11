const connection = require('../connection');
const moment = require("moment");
const jwt = require('jsonwebtoken');
const { generateOTP, hashPassword,getUserDetails,getUserDocument,getRelativeTime,getRatingBarAvg,getCategoryName,getHomeExpertJob,getHomeExpertUserJob,getHomeUserJobCount,getCustomerJobFilter,getAvgRating,getExpertJobFilter,getJobMilestone,getJobWorkSpace,getHomeExpertCompletedJob,authenticateToken } = require('../shared functions/functions');
const languageMessage = require('../shared functions/languageMessage');
const {getNotificationArrSingle,oneSignalNotificationSendCall} = require('./notification');
const twilio = require('twilio');
const util = require("util");
// Get Expert Details By category
const getExpertDetails = async (request, response) => {
    const { user_id, category_id, sub_category_id, sub_level_id,sub_two_level_category_id,sub_three_level_category_id } = request.body;
    // Validate input parameters
    if (!user_id || !category_id || !sub_category_id || !sub_level_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        // SQL query to fetch expert details
        let query = `SELECT user_id as expert_id FROM user_master  WHERE category = ? AND sub_category = ?  AND FIND_IN_SET(?, sub_category_level) AND active_flag = 1 and delete_flag=0`;
        let values = [category_id, sub_category_id, sub_level_id];
        if(sub_two_level_category_id!=0){
            query += " AND sub_two_level_category_id = ?";
            values.push((sub_two_level_category_id));
        }
        if(sub_three_level_category_id!=0){
            query += " AND sub_three_level_category_id = ?";
            values.push((sub_three_level_category_id));
        }
        connection.query(query,values, async (err, result) => {
        if (result.length > 0) {
            // Fetch user details for each expert and filter out "NA"
            const expertDetails = await Promise.all(
                result.map(async (expert) => {
                    const userDetails = await getUserDetails(expert.expert_id);
                    return userDetails === "NA" ? null : { ...expert, userDetails };
                })
            );
        // Filter out null values
        const filteredDetails = expertDetails.filter((expert) => expert !== null);
           
            return response.status(200).json({success: true,expertDetails: filteredDetails});
        }else{
            return response.status(200).json({success: true,expertDetails: 'NA'});
        }
    });
    } catch (error) {
        console.error("Error fetching expert details:", error);
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError4, key: err.message });
    }
};
//end
// Get Expert Details By Id
const getExpertDetailsById = async (request, response) => {
    let { user_id, expert_id } = request.body;
    if (!user_id || !expert_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag=0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key1: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated,active_status:0 });
            }
            
            const userDetails = await getUserDetails(expert_id);
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: userDetails });
                    
            
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError4, key: err.message });
    }
}
//end
// get expert by rating
const getExpertByRating = async (request, response) => {
    const { user_id } = request.query;
    try {
        // Promisify MySQL queries
        const queryAsync = util.promisify(connection.query).bind(connection);
        if (user_id > 0) {
            // Fetch user details
            const userQuery = `
                SELECT mobile, active_flag 
                FROM user_master 
                WHERE user_id = ? AND delete_flag = 0 AND user_type = 1
            `;
            const userResult = await queryAsync(userQuery, [user_id]);
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0].active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const updateTimeQuery = `UPDATE user_master SET last_login_date_time = NOW() WHERE user_id = ?`;
            await queryAsync(updateTimeQuery, [user_id]);
        }
        // Fetch top-rated experts
        const expertQuery = `
            SELECT user_id as expert_id
            FROM user_master 
            WHERE delete_flag = 0 AND user_type = 2 AND active_flag = 1 AND profile_completed = 1 and expert_status=1`;
        const expertResults = await queryAsync(expertQuery);
        if (expertResults.length === 0) {
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: 'NA' });
        }
        // Fetch user details for each expert and filter out "NA"
        const expertDetails = await Promise.all(
            expertResults.map(async (expert) => {
                const userDetails = await getUserDetails(expert.expert_id);
                return userDetails === "NA" ? null : { ...expert,userDetails };
            })
        );
        // Filter out null values
        const filteredDetails = expertDetails.filter((expert) => expert !== null);
        
        filteredDetails.sort((a, b) => (b.userDetails.average_rating || 0) - (a.userDetails.average_rating || 0));
        // Respond with success
        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: filteredDetails });
    } catch (err) {
        // Handle unexpected errors
        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// get job posts
const getMyJobs = async (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT job_post_id, assign_expert_id, title, category, sub_category, max_price, min_price, duration,duration_type, status, updatetime,createtime
                FROM job_post_master 
                WHERE user_id = ? AND delete_flag = 0
            `;
            connection.query(query2, [user_id], async (err, jobPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                // Fetch category and subcategory names
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch subcategory name
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0";
                        const category = await new Promise((resolve) => {
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        return {
                            ...job,
                            subcategory_id:job.sub_category,
                            sub_category: subCategory,
                            category_id:job.category,
                            category: category,
                            duration_type_label:'1=days,2=month,3=year',
                            posted_time: getRelativeTime(job.createtime),
                        };
                    })
                );
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: jobPostDetails });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// get job post details
const getJobPostDetails = async (request, response) => {
    const { user_id, job_post_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!job_post_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            let check_hire_expert_id=0;
            const query2 = `SELECT job_post_id, user_id, assign_expert_id, title, category, sub_category, max_price, min_price, duration, status, createtime, updatetime,description,duration_type,project_cost FROM job_post_master WHERE job_post_id = ? AND delete_flag = 0`;
            connection.query(query2, [job_post_id], async (err, jobPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                // Fetch category and subcategory names
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch subcategory name
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0";
                        const category = await new Promise((resolve) => {
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        // Fetch city name
                        const cityQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const city = await new Promise((resolve) => {
                            connection.query(cityQuery, [job.city], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch user name
                        const userNameQuery = "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const userName = await new Promise((resolve) => {
                            connection.query(userNameQuery, [job.user_id], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        // Fetch user image
                        const userImageQuery = "SELECT image FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const userimage = await new Promise((resolve) => {
                            connection.query(userImageQuery, [job.user_id], (err, result) => {
                                resolve(err ? null : result[0]?.image);
                            });
                        });
                        check_hire_expert_id=job.assign_expert_id;
                        return {
                            ...job,
                            sub_category: subCategory,
                            category: category,
                            city: city,
                            userName: userName,
                            userimage: userimage,
                            posted_time: getRelativeTime(job.createtime),
                            duration_type_labe:'1=days,2=month,3=year',
                            
                        };
                    })
                );
                // Fetch expert bid data
                let querybid;
                let bidValues;
                if(check_hire_expert_id===0){
                    querybid = "SELECT bid_id, expert_id, price, duration, files, createtime,status,duration_type FROM bid_master WHERE job_post_id = ? AND delete_flag = 0";
                    bidValues=[job_post_id];
                }else{
                    querybid = "SELECT bid_id, expert_id, price, duration, files, createtime,status,duration_type FROM bid_master WHERE job_post_id = ? AND delete_flag = 0 and expert_id=?";
                    bidValues=[job_post_id,check_hire_expert_id];
                }
                connection.query(querybid, bidValues, (err, bidResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    let bidsDataArray='NA';
                    if (bidResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails,bidsDataArray:bidsDataArray,bidcount:bidResult.length});
                    }
                    let finalBidResult = [];
                    let processedCount = 0;
                    bidResult.forEach((bidItem) => {
                        const expertQuery = "SELECT user_id, name, image FROM user_master WHERE delete_flag = 0 AND user_id = ?";
                        connection.query(expertQuery, [bidItem.expert_id], async(err, expertResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                            }
                            const expertbidDetails = expertResult.length > 0 ? expertResult[0] : null;
                            const expert_name=expertResult[0].name;
                            const status_label='0=pending,1=hired';
                            const expert_image = expertResult[0].image ? expertResult[0].image : "NA";
                            const averageResult = await getAvgRating(bidItem.expert_id); // Wait for the promise to resolve
                            const average_rating = averageResult.average_rating || 0;
                            finalBidResult.push({
                                ...bidItem,
                                expert_name,
                                expert_image,
                                status_label,
                                posted_time: getRelativeTime(bidItem.createtime),
                                avg_rating: parseFloat(average_rating.toFixed(1)),
                                duration_type_labe:'1=days,2=month,3=year',
                                check_hire_expert_id:check_hire_expert_id
                            });
                            processedCount++;
                            if (processedCount === bidResult.length) {
                                bidsDataArray=finalBidResult;
                                return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails,bidsDataArray:bidsDataArray,bidcount:bidResult.length});
                            }
                        });
                    });
                    
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//Create job post
const createJobPost = async (request, response) => {
    let { user_id, title, category, sub_category, max_price, min_price, duration, description,duration_type,nda_status } = request.body;
    if (!user_id || !title || !category || !sub_category || !max_price || !min_price || !duration || !description || !duration_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    
    
    
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const newUserQuery = `
            INSERT INTO job_post_master (user_id, title, category, sub_category, max_price, min_price, duration, description,duration_type,nda_status, createtime,updatetime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, now(),now())`;
            const values = [user_id, title, category, sub_category, max_price, min_price, duration, description,duration_type,nda_status]
            connection.query(newUserQuery, values, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.jobPostCreatedError, key: err });
                }
                if (request.files && request.files['file']) {
                    const filePromises = request.files['file'].map((f) => {
            
                        return new Promise((resolve, reject) => {
            
                            const fileInsertQuery = `INSERT INTO job_file_master(file_name,delete_flag,createtime,updatetime,job_id) VALUES (?, 0, NOW(), NOW(),?)`;
            
                            connection.query(fileInsertQuery, [f.filename,result.insertId], (err, result) => {
            
                                if (err) {
            
                                    reject(err);
            
                                } else {
            
                                    resolve(f.filename);
            
                                }
            
                            });
            
                        });
            
                    });
            
                }
                const query1 = "SELECT job_post_id, title, category, sub_category, max_price, min_price, duration, description, file,duration_type,nda_status, createtime FROM job_post_master WHERE job_post_id = ? AND delete_flag=0";
                const values1 = [result.insertId];
                connection.query(query1, values1, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.dataNotFound, key: err.message });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.jobPostCreated, jobPostDataArray: result[0] });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.jobPostCreatedError, key: err.message });
    }
}
//end
// Chat Consultation History
const chatConsultationHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated,active_status:0 });
            }
            const query2 = `
                SELECT chat_call_history_id, expert_id, createtime, updatetime
                FROM chat_call_history 
                WHERE user_id = ? AND type = 0 AND history_type = 0 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const expertIds = historyPosts.map(item => item.expert_id);
                const query3 = `
                    SELECT user_id, name, sub_category_level, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 2
                `;
                connection.query(query3, [expertIds], async (err, expertResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (expertResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.expertNotFound });
                    }
                    const expertDetailsWithSubCategories = await Promise.all(
                        expertResults.map(async (expert) => {
                            const subCategoryIds = expert.sub_category_level
                                .replace(/"/g, '')
                                .split(',');
                            const subCategoryPromises = subCategoryIds.map((subLevelId) => {
                                return new Promise((resolve, reject) => {
                                    const query4 = `
                                        SELECT sub_level_category_name 
                                        FROM sub_level_categories_master 
                                        WHERE sub_level_category_id = ? AND delete_flag = 0
                                    `;
                                    connection.query(query4, [subLevelId], (err, result) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(result[0]?.sub_level_category_name || null);
                                        }
                                    });
                                });
                            });
                            const subCategoryNames = await Promise.all(subCategoryPromises);
                            return {
                                ...expert,
                                sub_category_level: subCategoryNames.filter(Boolean),
                            };
                        })
                    );
                    const historyWithExpertDetails = historyPosts.map((post) => {
                        const expertDetail = expertDetailsWithSubCategories.find(
                            (expert) => expert.user_id === post.expert_id
                        );
                        return {
                            ...post,
                            expertDetails: expertDetail || {},
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: historyWithExpertDetails,
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// Chat Jobs History
const chatJobsHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, expert_id, createtime, updatetime
                FROM chat_call_history 
                WHERE user_id = ? AND type = 0 AND history_type = 1 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const expertIds = historyPosts.map(item => item.expert_id);
                const query3 = `
                    SELECT user_id, name, sub_category_level, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 2
                `;
                connection.query(query3, [expertIds], async (err, expertResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (expertResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.expertNotFound });
                    }
                    const expertDetailsWithSubCategories = await Promise.all(
                        expertResults.map(async (expert) => {
                            const subCategoryIds = expert.sub_category_level
                                .replace(/"/g, '')
                                .split(',');
                            const subCategoryPromises = subCategoryIds.map((subLevelId) => {
                                return new Promise((resolve, reject) => {
                                    const query4 = `
                                        SELECT sub_level_category_name 
                                        FROM sub_level_categories_master 
                                        WHERE sub_level_category_id = ? AND delete_flag = 0
                                    `;
                                    connection.query(query4, [subLevelId], (err, result) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(result[0]?.sub_level_category_name || null);
                                        }
                                    });
                                });
                            });
                            const subCategoryNames = await Promise.all(subCategoryPromises);
                            return {
                                ...expert,
                                sub_category_level: subCategoryNames.filter(Boolean),
                            };
                        })
                    );
                    const historyWithExpertDetails = historyPosts.map((post) => {
                        const expertDetail = expertDetailsWithSubCategories.find(
                            (expert) => expert.user_id === post.expert_id
                        );
                        return {
                            ...post,
                            expertDetails: expertDetail || {},
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: historyWithExpertDetails,
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// call Consultation History
const callConsultationHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, expert_id, call_cost, duration, createtime, updatetime
                FROM chat_call_history 
                WHERE user_id = ? AND type = 1 AND history_type = 0 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const expertIds = historyPosts.map(item => item.expert_id);
                const query3 = `
                    SELECT user_id, name, sub_category_level, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 2
                `;
                connection.query(query3, [expertIds], async (err, expertResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (expertResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.expertNotFound });
                    }
                    const expertDetailsWithSubCategories = await Promise.all(
                        expertResults.map(async (expert) => {
                            const subCategoryIds = expert.sub_category_level
                                .replace(/"/g, '')
                                .split(',');
                            const subCategoryPromises = subCategoryIds.map((subLevelId) => {
                                return new Promise((resolve, reject) => {
                                    const query4 = `
                                        SELECT sub_level_category_name 
                                        FROM sub_level_categories_master 
                                        WHERE sub_level_category_id = ? AND delete_flag = 0
                                    `;
                                    connection.query(query4, [subLevelId], (err, result) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(result[0]?.sub_level_category_name || null);
                                        }
                                    });
                                });
                            });
                            const subCategoryNames = await Promise.all(subCategoryPromises);
                            return {
                                ...expert,
                                sub_category_level: subCategoryNames.filter(Boolean),
                            };
                        })
                    );
                    const historyWithExpertDetails = historyPosts.map((post) => {
                        const expertDetail = expertDetailsWithSubCategories.find(
                            (expert) => expert.user_id === post.expert_id
                        );
                        return {
                            ...post,
                            expertDetails: expertDetail || {},
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: historyWithExpertDetails,
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// Chat Jobs History
const callJobsHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, expert_id, createtime, updatetime
                FROM chat_call_history 
                WHERE user_id = ? AND type = 1 AND history_type = 1 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const expertIds = historyPosts.map(item => item.expert_id);
                const query3 = `
                    SELECT user_id, name, sub_category_level, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 2
                `;
                connection.query(query3, [expertIds], async (err, expertResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (expertResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.expertNotFound });
                    }
                    const expertDetailsWithSubCategories = await Promise.all(
                        expertResults.map(async (expert) => {
                            const subCategoryIds = expert.sub_category_level
                                .replace(/"/g, '')
                                .split(',');
                            const subCategoryPromises = subCategoryIds.map((subLevelId) => {
                                return new Promise((resolve, reject) => {
                                    const query4 = `
                                        SELECT sub_level_category_name 
                                        FROM sub_level_categories_master 
                                        WHERE sub_level_category_id = ? AND delete_flag = 0
                                    `;
                                    connection.query(query4, [subLevelId], (err, result) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(result[0]?.sub_level_category_name || null);
                                        }
                                    });
                                });
                            });
                            const subCategoryNames = await Promise.all(subCategoryPromises);
                            return {
                                ...expert,
                                sub_category_level: subCategoryNames.filter(Boolean),
                            };
                        })
                    );
                    const historyWithExpertDetails = historyPosts.map((post) => {
                        const expertDetail = expertDetailsWithSubCategories.find(
                            (expert) => expert.user_id === post.expert_id
                        );
                        return {
                            ...post,
                            expertDetails: expertDetail || {},
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: historyWithExpertDetails,
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// Get Expert By Filter
const getExpertByFilter = async (request, response) => {
    const { user_id, state, city, category, sub_category, experience, rating } = request.body;
    try {
        // Verify user existence and status
        const query1 = `
            SELECT mobile, active_flag 
            FROM user_master 
            WHERE user_id = ? AND delete_flag = 0 AND user_type = 1
        `;
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            // Prepare query for experts
            let query2 = `
                SELECT user_id as expert_id 
                FROM user_master 
                WHERE delete_flag = 0 AND active_flag = 1 AND user_type = 2 and expert_status=1`;
            let value2 = [];
            if(state){
                query2 += " AND state = ?";
                value2.push((state));
            }
            if(city){
                query2 += " AND city = ?";
                value2.push((city));
            }
            if(category){
                query2 += " AND category = ?";
                value2.push((category));
            }
            if(sub_category){
                query2 += " AND sub_category = ?";
                value2.push((sub_category));
            }
            if (experience) {
                query2 += " AND experience >= ? AND experience < ?";
                value2.push(Number(experience), Number(experience) + 1);
            }
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
                    if (rating) {
                        const minRating = parseFloat(rating);
                    
                        finalResult = parsedResult.filter((item) => 
                            item.userDetails && item.userDetails.average_rating == minRating
                        ).map((item) => ({
                            expert_id: item.expert_id,
                            userDetails: item.userDetails,
                        }));
                    }
                    if (finalResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: "NA" });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: finalResult });
                } catch (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// Get expert by name
const getExpertByName = async (request, response) => {
    let { user_id, expert_name } = request.body
    if (!user_id || !expert_name) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
            SELECT user_id, name, mobile, sub_category_level, consulting_time, language, degree, experience, call_charge, video_call_charge, chat_charge, updatetime
            FROM user_master 
            WHERE LOWER(name) = LOWER(?)
              AND delete_flag = 0
              AND active_flag = 1
              AND user_type = 2 and expert_status=1;
        `;
            const values2 = [expert_name];
            connection.query(query2, values2, (err, expertResult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (expertResult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.expertNotFound });
                }
                const subCategoryLevelPromises = expertResult.map(async (expert) => {
                    const subCategoryLevels = expert.sub_category_level
                        .replace(/"/g, '')
                        .split(',');
                    const degrees = expert.degree
                        .replace(/"/g, '')
                        .split(',');
                    const languages = expert.language
                        .replace(/"/g, '')
                        .split(',');
                    const subCategoryPromises = subCategoryLevels.map((subLevelId) => {
                        const query3 = `
                            SELECT sub_level_category_name 
                            FROM sub_level_categories_master 
                            WHERE sub_level_category_id = ? AND delete_flag = 0
                        `;
                        const value3 = [subLevelId];
                        return new Promise((resolve, reject) => {
                            connection.query(query3, value3, (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result[0]?.sub_level_category_name);
                            });
                        });
                    });
                    const degreePromises = degrees.map((degreeId) => {
                        const query3 = `
                            SELECT name 
                            FROM categories_master 
                            WHERE category_id = ? AND delete_flag = 0
                        `;
                        const value3 = [degreeId];
                        return new Promise((resolve, reject) => {
                            connection.query(query3, value3, (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result[0]?.name);
                            });
                        });
                    });
                    const languagePromises = languages.map((languageId) => {
                        const query3 = `
                            SELECT name 
                            FROM categories_master 
                            WHERE category_id = ? AND delete_flag = 0
                        `;
                        const value3 = [languageId];
                        return new Promise((resolve, reject) => {
                            connection.query(query3, value3, (err, result) => {
                                if (err) {
                                    return reject(err);
                                }
                                resolve(result[0]?.name);
                            });
                        });
                    });
                    const subCategoryNames = await Promise.all(subCategoryPromises);
                    const degreeNames = await Promise.all(degreePromises);
                    const languageNames = await Promise.all(languagePromises);
                    return {
                        ...expert,
                        sub_category_level: subCategoryNames,
                        degree: degreeNames,
                        language: languageNames
                    };
                });
                Promise.all(subCategoryLevelPromises)
                    .then((parsedResult) => {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: parsedResult });
                    })
                    .catch((err) => {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
// wallket recharge
const walletRecharge = async (request, response) => {
    let {user_id,recharge_amount,transaction_id} = request.body;
    if (!user_id || !recharge_amount ||!transaction_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const type=1;
    const status=0;
    
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            let finalWallet;
            if (type == 0) {
                finalWallet = parseFloat(result[0].wallet_balance) + parseFloat(recharge_amount);
            }
            else if (type == 1) {
                finalWallet = parseFloat(result[0].wallet_balance) - parseFloat(recharge_amount);
            }
            const newUserQuery = `
            INSERT INTO wallet_master (user_id,type,amount,wallet_balance,createtime,status,payment_transaction_id)
            VALUES (?, ?, ?, ?, now(),?,?)
        `;
            const values = [user_id,type,recharge_amount,finalWallet,status,transaction_id]
            connection.query(newUserQuery, values, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.walletUpdateError, key: err });
                }
                const newUserQuery = `
                UPDATE user_master 
                SET wallet_balance = ?
                WHERE user_id = ?
            `;
                connection.query(newUserQuery, [finalWallet, user_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.walletUpdateError, key: err });
                    }
                    if (result.affectedRows > 0) {
                       
                        const userDetails =await getUserDetails(user_id);
                            return response.status(200).json({ success: true, msg: languageMessage.walletUpdate, userDataArray: userDetails });
                     
                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.walletUpdateError, key: err.message });
                    }
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.walletUpdateError, key: err.message });
    }
}
//end
//get user's transition history
const walletHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            let wallet = [];
            const userDetails = await getUserDetails(user_id);
            const query2 = "SELECT transition_id, payment_transaction_id, expert_id, amount, createtime, status, type FROM wallet_master WHERE user_id = ? AND delete_flag = 0";
            const values2 = [user_id];
            connection.query(query2, values2, async (err, walletresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (walletresult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, userDataArray: userDetails, wallet_history: 'NA' });
                }
                // Fetch user details for each item and category
                const finalBidResult = await Promise.all(walletresult.map(async (Item) => {
                    const userDetails = await new Promise((resolve, reject) => {
                        const userQuery = `SELECT name, image, category FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                        connection.query(userQuery, [Item.expert_id], (err, result) => {
                            if (err || result.length === 0) {
                                resolve({ name: 'NA', image: 'NA', category: 'NA' });
                            } else {
                                resolve(result[0]);
                            }
                        });
                    });
                    let categoryDetails = { name: 'NA' };
                    if (userDetails.category !== 'NA') {
                        categoryDetails = await new Promise((resolve, reject) => {
                            const categoryQuery = `SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0`;
                            connection.query(categoryQuery, [userDetails.category], (err, result) => {
                                if (err || result.length === 0) {
                                    resolve({ name: 'NA' });
                                } else {
                                    resolve(result[0]);
                                }
                            });
                        });
                    }
                    return {
                        ...Item,
                        posted_time: moment(Item.createtime).format("MMM DD YYYY hh:mm A"),
                        time: moment(Item.createtime).format("hh:mm A"),
                        status_label: Item.status === 0 ? 'credit' : 'debit',
                        type_label: Item.type === 1 ? 'recharge' : Item.type === 2 ? 'job' : Item.type === 3 ? 'consultation' : 'unknown',
                        user_name: userDetails.name,
                        user_image: userDetails.image,
                        user_category: userDetails.category,
                        category_name: categoryDetails.name,
                    };
                }));
                // Send the response after processing all the data
                return response.status(200).json({
                    success: true,
                    msg: languageMessage.dataFound,
                    userDataArray: userDetails,
                    wallet_history: finalBidResult
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//Get bids on job post
const getBidsOfJobPost = async (request, response) => {
    let { user_id, job_post_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!job_post_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = "SELECT bid_id, expert_id, price, duration, files, createtime FROM bid_master WHERE job_post_id = ? AND delete_flag = 0";
            connection.query(query2, [job_post_id], (err, bidResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (bidResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.dataNotFound });
                }
                let finalBidResult = [];
                let processedCount = 0;
                bidResult.forEach((bidItem) => {
                    const expertQuery = "SELECT user_id, name, image FROM user_master WHERE delete_flag = 0 AND user_id = ?";
                    connection.query(expertQuery, [bidItem.expert_id], (err, expertResult) => {
                        if (err) {
                            return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                        }
                        const expertDetails = expertResult.length > 0 ? expertResult[0] : null;
                        finalBidResult.push({
                            ...bidItem,
                            expertDetails,
                        });
                        processedCount++;
                        if (processedCount === bidResult.length) {
                            return response.status(200).json({
                                success: true,
                                msg: languageMessage.dataFound,
                                bidsDataArray: finalBidResult,
                            });
                        }
                    });
                });
            });
        });
    } catch (err) {
        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//Hire the Expert
const hireTheExpert = async (request, response) => {
    let {user_id, job_post_id, expert_id,bid_id} = request.body;
    if (!user_id || !job_post_id || !expert_id ||!bid_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const checkJob = "SELECT job_post_id FROM job_post_master WHERE user_id = ? AND delete_flag = 0 AND job_post_id=?";
            const jobvalues = [user_id,job_post_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                
                const newUserQuery = `UPDATE job_post_master  SET assign_expert_id = ?, status = 1,updatetime=now() WHERE job_post_id = ? and user_id=?`;
                connection.query(newUserQuery, [expert_id, job_post_id,user_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.expertHireUnsuccess, key: err });
                    }
                    if (result.affectedRows > 0) {
                        const checkJobbid = "SELECT bid_id FROM bid_master WHERE delete_flag = 0 AND job_post_id=? and expert_id=? and bid_id=?";
                        const jobbidvalues = [job_post_id,expert_id,bid_id];
                        connection.query(checkJobbid, jobbidvalues, (err, bidResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.jobBidNotFound, key: err.message });
                            }
                            if (bidResult.length === 0) {
                                return response.status(404).json({ success: false, msg: languageMessage.jobBidNotFound });
                            }
                            const bidQuery = `UPDATE bid_master  SET status = 1,updatetime=now() WHERE job_post_id = ? and bid_id=? and expert_id=?`;
                            connection.query(bidQuery, [job_post_id,bid_id,expert_id], async (err, resultbid) => {
                                if (err) {
                                    return response.status(200).json({ success: false, msg: languageMessage.expertHireUnsuccess, key: err });
                                }
                                if (resultbid.affectedRows > 0) {
                                    const user_id_notification = user_id;
                                    const other_user_id_notification = expert_id;
                                    const action_id = bid_id;
                                    const action = "expert_hired";
                                    const title = "Hired";
                                    const title_2 = title;
                                    const title_3 = title;
                                    const title_4 = title;
                                    const messages = `Congratulations! You have been successfully hired for the job. Please review the job details and proceed accordingly.`;
                                    const message_2 = messages;
                                    const message_3 = messages;
                                    const message_4 = messages;
                                    const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                                    await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                                        let notification_arr_check_new = [notification_arr_check];
                                        
                                        if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                                            const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                                            
                                        }else{
                                            console.log("Notification array is empty");
                                        }
                                    
                                    });
                                    return response.status(200).json({ success: true, msg: languageMessage.expertHireSuccess });
                                }
                            });
                        });
                    }
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.expertHireUnsuccess, key: err.message });
    }
}
//create job
const createProjectCost = async (request, response) => {
    let { user_id, job_post_id, project_cost } = request.body;
    if (!user_id || !job_post_id || !project_cost) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const newUserQuery = `
            UPDATE job_post_master 
            SET project_cost = ?
            WHERE job_post_id = ?
        `;
            connection.query(newUserQuery, [project_cost, job_post_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err });
                }
                if (result.affectedRows > 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.projectCostCreate });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
const getMilestones = async (request, response) => {
    let { } = request.body;
}

// Get expert's earning 
const getExpertEarning = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `SELECT SUM(expert_earning) AS partial_expert_earning FROM expert_earning_master WHERE expert_id = ?`;
            connection.query(query2, [user_id], async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                const partialEarning = result[0]?.partial_expert_earning;
                const query2 = `SELECT SUM(withdraw_amount) AS total_withdraw_amount FROM expert_withdraw_master WHERE expert_id = ? AND withdraw_status=1`;
                connection.query(query2, [user_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    const withdraws = result[0]?.total_withdraw_amount;
                    const total_expert_earning = partialEarning - withdraws;
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, userDataArray: { total_expert_earning: total_expert_earning } });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//make withdraw request
const withdrawRequest = async (request, response) => {
    let { user_id, withdraw_amount, withdraw_message} = request.body;
    if (!user_id || !withdraw_amount || !withdraw_message) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const newUserQuery = `INSERT INTO expert_withdraw_master (expert_id,withdraw_amount,withdraw_message,createtime,updatetime)VALUES (?,?,?,now(),now())`;
            const values = [user_id,withdraw_amount,withdraw_message]
            connection.query(newUserQuery, values, async (err, requestresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.withdrawSendError, key: err });
                }
                const userDetails = await getUserDetails(user_id);
                return response.status(200).json({ success: true, msg: languageMessage.withdrawSend,userDetails:userDetails});
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.withdrawSendError, key: err.message });
    }
}
//end
//get withdraw history
const withdrawHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query1 = "SELECT expert_withdraw_id, expert_id, withdraw_status, withdraw_amount, total_earning_amount, withdraw_message, earning_after_withdraw,createtime FROM expert_withdraw_master WHERE expert_id = ? order by expert_withdraw_id desc";
            const values1 = [user_id];
            connection.query(query1, values1, async (err, withdrawlresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (withdrawlresult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, withdrawRequestData: "NA" });
                }
                // Fetch user details for each item and category
                const finalBidResult = await Promise.all(withdrawlresult.map(async (Item) => {
                    return {
                        ...Item,
                        posted_time: moment(Item.createtime).format("MMM DD YYYY"),
                        time: moment(Item.createtime).format("hh:mm A"),
                        status_label: '	0=pending 1=approved 2=reject',
                    };
                }));
                if(finalBidResult.length===0){
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, withdrawRequestData: "NA" });
                }
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, withdrawRequestData: finalBidResult });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
// call Consultation History
const expertCallConsultationHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, user_id, call_cost, duration, createtime, updatetime
                FROM chat_call_history 
                WHERE expert_id = ? AND type = 1 AND history_type = 0 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const usersIds = historyPosts.map(item => item.user_id);
                const query3 = `
                    SELECT user_id, name, image, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 1
                `;
                connection.query(query3, [usersIds], async (err, userResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (userResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                    }
                    const combinedHistoryPosts = historyPosts.map(history => {
                        const user = userResults.find(user => user.user_id === history.user_id);
                        return {
                            ...history,
                            user_name: user ? user.name : null,
                            user_image: user ? user.image : null,
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: combinedHistoryPosts
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// call Jobs History
const expertCallJobsHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, user_id, call_cost, duration, createtime, updatetime
                FROM chat_call_history 
                WHERE expert_id = ? AND type = 1 AND history_type = 1 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const usersIds = historyPosts.map(item => item.user_id);
                const query3 = `
                    SELECT user_id, name, image, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 1
                `;
                connection.query(query3, [usersIds], async (err, userResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (userResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                    }
                    const combinedHistoryPosts = historyPosts.map(history => {
                        const user = userResults.find(user => user.user_id === history.user_id);
                        return {
                            ...history,
                            user_name: user ? user.name : null,
                            user_image: user ? user.image : null,
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: combinedHistoryPosts
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//get job posts for expert
const getJobPostsForExpert = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, category, sub_category FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const category = result[0].category;
            const subCategory = result[0].sub_category;
            const query2 = `
            SELECT job_post_id, user_id, title, category, sub_category, max_price, min_price, duration, status, updatetime
            FROM job_post_master 
            WHERE category = ? AND sub_category = ? AND status = 0 AND delete_flag = 0`;
            connection.query(query2, [category, subCategory], async (err, jobPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                // Fetch category and subcategory names
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch subcategory name
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0";
                        const category = await new Promise((resolve) => {
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        // Fetch user name
                        const userNameQuery = "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const name = await new Promise((resolve) => {
                            connection.query(userNameQuery, [job.user_id], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        return {
                            ...job,
                            sub_category: subCategory,
                            category: category,
                            user_name: name,
                        };
                    })
                );
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: jobPostDetails });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//get expert's earning history
const getExpertEarningHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, category, sub_category FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query1 = "SELECT expert_earning_id, total_amount, admin_commission_amount, commission_percentage, expert_earning, invoice_url, transition_id, createtime,type,user_id FROM expert_earning_master WHERE expert_id = ? ";
            const values1 = [user_id];
            connection.query(query1, values1, async (err, earningresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (earningresult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, earning_history: 'NA' });
                }
                // Fetch user details for each item and category
                const finalBidResult = await Promise.all(earningresult.map(async (Item) => {
                    const userDetails = await new Promise((resolve, reject) => {
                        const userQuery = `SELECT name, image FROM user_master WHERE user_id = ? AND delete_flag = 0`;
                        connection.query(userQuery, [Item.user_id], (err, result) => {
                            if (err || result.length === 0) {
                                resolve({ name: 'NA', image: 'NA', category: 'NA' });
                            } else {
                                resolve(result[0]);
                            }
                        });
                    });
                    return {
                        ...Item,
                        posted_time: moment(Item.createtime).format("MMM DD YYYY hh:mm A"),
                        time: moment(Item.createtime).format("hh:mm A"),
                        type_label:"0=milestone,1=consultant,2=subscription",
                        user_name: userDetails.name,
                        user_image: userDetails.image,
                    };
                }));
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, earning_history: finalBidResult, });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
// call Consultation History
const expertChatConsultationHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, user_id, call_cost, duration, createtime, updatetime
                FROM chat_call_history 
                WHERE expert_id = ? AND type = 0 AND history_type = 0 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const usersIds = historyPosts.map(item => item.user_id);
                const query3 = `
                    SELECT user_id, name, image, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 1
                `;
                connection.query(query3, [usersIds], async (err, userResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (userResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                    }
                    const combinedHistoryPosts = historyPosts.map(history => {
                        const user = userResults.find(user => user.user_id === history.user_id);
                        return {
                            ...history,
                            user_name: user ? user.name : null,
                            user_image: user ? user.image : null,
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: combinedHistoryPosts
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// call Jobs History
const expertChatJobsHistory = async (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT chat_call_history_id, user_id, call_cost, duration, createtime, updatetime
                FROM chat_call_history 
                WHERE expert_id = ? AND type = 0 AND history_type = 1 AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                const usersIds = historyPosts.map(item => item.user_id);
                const query3 = `
                    SELECT user_id, name, image, updatetime
                    FROM user_master 
                    WHERE user_id IN (?) 
                      AND delete_flag = 0
                      AND active_flag = 1
                      AND user_type = 1
                `;
                connection.query(query3, [usersIds], async (err, userResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (userResults.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                    }
                    const combinedHistoryPosts = historyPosts.map(history => {
                        const user = userResults.find(user => user.user_id === history.user_id);
                        return {
                            ...history,
                            user_name: user ? user.name : null,
                            user_image: user ? user.image : null,
                        };
                    });
                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        historyPosts: combinedHistoryPosts
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
const getReviewsOfExpert = (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        let total_review_count = 0;
        let avg_rating = 0;
        let reply_arr = "NA";
        const query1 = `
            SELECT mobile, active_flag, image 
            FROM user_master 
            WHERE user_id = ? AND delete_flag = 0 AND user_type = 2
        `;
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const expert_image = result[0].image ? result[0].image : "NA";
            const rating_bar = await getRatingBarAvg(user_id);
            const query2 = `
                SELECT rating_id, user_id, rating, review, createtime
                FROM rating_master
                WHERE expert_id = ? AND delete_flag = 0
            `;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    //return response.status(200).json({ success: true, msg: languageMessage.dataFound });
                    var rating_bar_new= [
                        {
                            "rating": 1,
                            "rating_count": 0,
                            "percentage": "0.00"
                        },
                        {
                            "rating": 2,
                            "rating_count": 0,
                            "percentage": "0.00"
                        },
                        {
                            "rating": 3,
                            "rating_count": 0,
                            "percentage": "0.00"
                        },
                        {
                            "rating": 4,
                            "rating_count": 0,
                            "percentage": "0.00"
                        },
                        {
                            "rating": 5,
                            "rating_count": 0,
                            "percentage": "0.00"
                        }
                    ];
                    var total_review_count=0;
                    var avg_rating="0.0";
                    return response.status(200).json({success: true,msg: languageMessage.dataFound,historyPosts:'NA',rating_bar:rating_bar_new,total_review_count,avg_rating: avg_rating,expert_image});
                }
                var total_review_count=0;
                var avg_rating=0;
                const usersIds = historyPosts.map(item => item.user_id);
                const query3 = `
                    SELECT user_id, name, image 
                    FROM user_master 
                    WHERE user_id IN (?) AND delete_flag = 0 AND active_flag = 1 AND user_type = 1
                `;
                connection.query(query3, [usersIds], async (err, userResults) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    const combinedHistoryPosts = await Promise.all(
                        historyPosts.map(async history => {
                            const user = userResults.find(user => user.user_id === history.user_id);
                            total_review_count++;
                            avg_rating += history.rating;
                            // Fetch reply for each review
                            const replyquery = `
                                SELECT rating_reply_id, expert_id, reply_message 
                                FROM rating_reply_master 
                                WHERE rating_id = ? AND delete_flag = 0
                            `;
                            const replyResult = await new Promise(resolve => {
                                connection.query(replyquery, [history.rating_id], (err, results) => {
                                    if (err || results.length === 0) {
                                        return resolve("NA");
                                    }
                                    resolve(results[0]); // Return the first reply
                                });
                            });
                            
                            return {
                                ...history,
                                user_name: user ? user.name : "NA",
                                user_image: user && user.image ? user.image : "NA",
                                relative_time: getRelativeTime(history.createtime),
                                reply_arr: replyResult,
                            };
                        })
                    );
                    const get_avg_rating = total_review_count > 0 ? avg_rating / total_review_count : 0;
                    return response.status(200).json({success: true,msg: languageMessage.dataFound,historyPosts: combinedHistoryPosts,rating_bar,total_review_count,avg_rating: get_avg_rating.toFixed(1),expert_image});
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//get expert's my job
const getExpertMyJobs = (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
                SELECT job_post_id, user_id,assign_expert_id, title, category, sub_category, max_price, min_price, duration, status, updatetime
                ,createtime FROM job_post_master 
                WHERE assign_expert_id = ? AND delete_flag = 0`;
            connection.query(query2, [user_id], async (err, jobPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                // Fetch category and subcategory names
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch subcategory name
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0";
                        const category = await new Promise((resolve) => {
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name);
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
                        return {
                            ...job,
                            sub_category: subCategory,
                            category: category,
                            posted_time: getRelativeTime(job.createtime),
                            status_label: '0=pending,1=hired,2=inprogress,3=completed',
                            user_name:userNameQuery,
                            user_image:userimageQuery,
                        };
                    })
                );
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: jobPostDetails });
            });
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
const getSubscriptionPlans = (request, response) => {
    let { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `SELECT subscription_id, amount, description, duration, plan_type,createtime FROM subscription_master WHERE delete_flag = 0 order by plan_type asc`;
            connection.query(query2, async (err, subscriptions) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (subscriptions.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound,subscriptionPlanDetails:'NA'});
                }
               
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, subscriptionPlanDetails: subscriptions,plan_type_label:'0=free, 1=primium,2 standard'});
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
const buySubscription = (request, response) => {
    let { user_id, subscription_id } = request.body;
    if (!user_id || !subscription_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const query2 = `
            SELECT subscription_id, amount, description, duration, createtime,plan_type
            FROM subscription_master 
            WHERE subscription_id = ? AND delete_flag = 0`;
            connection.query(query2, [subscription_id], async (err, subscriptions) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (subscriptions.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                let startdate = new Date();
                let enddate = new Date();
                const transaction_id='123456';
                const status=1;
                const amount=subscriptions[0].amount;
                const duration=subscriptions[0].duration;
                const plan_type=subscriptions[0].plan_type;
                enddate.setMonth(startdate.getMonth() + subscriptions[0].duration);
                const subscriptionQuery = `INSERT INTO expert_subscription_master(expert_id,subscription_id,amount,start_date,end_date,transaction_id,status,duration,plan_type,createtime,updatetime)
                VALUES (?,?,?,?,?,?,?,?,?,now(),now())`;
                const values = [user_id,subscription_id,amount,startdate,enddate,transaction_id,status,duration,plan_type]
                connection.query(subscriptionQuery, values, async (err, buyresult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.buySubscriptionUnsuccess, key: err });
                    }
                    if (buyresult.affectedRows > 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.buySubscriptionSuccess});
                    } else {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.buySubscriptionUnsuccess, key: err.message });
    }
}
//reply on review
const reviewReply = async (request, response) => {
    let {user_id,rating_id,message } = request.body;
    if (!user_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'user_id'});
    }
    if (!rating_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'rating_id'});
    }
    if (!message){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'message'});
    }
    
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const newUserQuery = `INSERT INTO rating_reply_master (expert_id, rating_id, reply_message,createtime,updatetime)
            VALUES (?, ?, ?, now(),now())`;
            const values = [user_id, rating_id, message]
            connection.query(newUserQuery, values, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err });
                }
                return response.status(200).json({ success: true, msg: languageMessage.replySentSuccess});
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err.message });
    }
}
//end
//rate now expert
const rateExpert = async (request, response) => {
    let {user_id,expert_id,rating,review} = request.body;
    if (!user_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'user_id'});
    }
    if (!expert_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'expert_id'});
    }
    if (!rating){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'rating'});
    }
    if (!review){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'review'});
    }
    
    try {
        const query1 = "SELECT mobile, active_flag,name FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const user_name = result[0].name ? result[0].name : "NA";
            const newUserQuery = `INSERT INTO rating_master(user_id,expert_id,rating,review,createtime,updatetime)
            VALUES (?, ?, ?,?, now(),now())`;
            const values = [user_id,expert_id,rating,review]
            connection.query(newUserQuery, values, async (err, ratingresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.ratingSentUnsuccess, key: err });
                }
                const user_id_notification = user_id;
                const other_user_id_notification = expert_id;
                const action_id = ratingresult.insertId;
                const action = "rate_now";
                const title = "Rating";
                const title_2 = title;
                const title_3 = title;
                const title_4 = title;
                const messages = `${user_name} has given ${rating}-star rating!`;
                const message_2 = messages;
                const message_3 = messages;
                const message_4 = messages;
                const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                    let notification_arr_check_new = [notification_arr_check];
                    
                    if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                        const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                        
                    }else{
                        console.log("Notification array is empty");
                    }
                
                });
                return response.status(200).json({ success: true, msg: languageMessage.ratingSentSuccess});
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.ratingSentUnsuccess, key: err.message });
    }
}
//end
//get customer call history
const CustomerCallHistory = async (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        // Check if the user exists
        const userQuery = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type = 1";
        connection.query(userQuery, [user_id], (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            // Fetch call history
            const callHistoryQuery = `
                SELECT video_call_id, other_user_id, price, duration, call_duration, status, createtime ,type
                FROM video_call_master 
                WHERE user_id = ? AND delete_flag = 0 
                ORDER BY video_call_id DESC
            `;
            connection.query(callHistoryQuery, [user_id], (err, callHistory) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (!Array.isArray(callHistory) || callHistory.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, call_history: "NA" });
                }
                // Fetch expert details and category names for each call history record
                let completedRequests = 0;
                const call_history = [];
                callHistory.forEach((record) => {
                    const expertDetailQuery = "SELECT name, image, category,call_charge,video_call_charge,chat_charge FROM user_master WHERE user_id = ? AND delete_flag = 0";
                    connection.query(expertDetailQuery, [record.other_user_id], (err, expertResult) => {
                        if (err) {
                            return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                        }
                        const expertDetails = expertResult.length > 0 ? expertResult[0] : { name: 'NA', image: 'NA', category: 'NA' };
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ?";
                        connection.query(categoryQuery, [expertDetails.category], (err, categoryResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                            }
                            const categoryName = categoryResult.length > 0 ? categoryResult[0].name : 'NA';
                            const formattedTime = moment(record.createtime).format("MMM DD YYYY hh:mm A");
                            call_history.push({
                                ...record,
                                createtime: formattedTime,
                                type_label:'1=video,2=voice',
                                status_label:'0-pending,1-start,2-completed,3=rejected',
                                expert_name: expertDetails.name,
                                expert_image: expertDetails.image,
                                expert_category_id: expertDetails.category,
                                category_name: categoryName,
                                call_charge: expertDetails.call_charge,
                                video_call_charge: expertDetails.video_call_charge,
                                chat_charge: expertDetails.chat_charge,
                            });
                            // Check if all queries are completed
                            completedRequests++;
                            if (completedRequests === callHistory.length) {
                                return response.status(200).json({
                                    success: true,
                                    msg: languageMessage.dataFound,
                                    call_history,
                                });
                            }
                        });
                    });
                });
            });
        });
    } catch (err) {
        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// get customer call history
const ExpertCallHistory = async (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        // Check if the user exists
        const userQuery = "SELECT mobile, active_flag,category FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type = 2";
        connection.query(userQuery, [user_id], (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            // Fetch call history
            const callHistoryQuery = `
                SELECT video_call_id, user_id, price, duration, call_duration, status, createtime ,type
                FROM video_call_master 
                WHERE other_user_id = ? AND delete_flag = 0 
                ORDER BY video_call_id DESC
            `;
            connection.query(callHistoryQuery, [user_id], (err, callHistory) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (!Array.isArray(callHistory) || callHistory.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, call_history: "NA" });
                }
                // Fetch expert details and category names for each call history record
                let completedRequests = 0;
                const call_history = [];
                callHistory.forEach((record) => {
                    const expertDetailQuery = "SELECT name, image FROM user_master WHERE user_id = ? AND delete_flag = 0";
                    connection.query(expertDetailQuery, [record.user_id], (err, expertResult) => {
                        if (err) {
                            return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                        }
                        const expertDetails = expertResult.length > 0 ? expertResult[0] : { name: 'NA', image: 'NA', category: 'NA' };
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ?";
                        connection.query(categoryQuery, [userResult[0].category], (err, categoryResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                            }
                            const categoryName = categoryResult.length > 0 ? categoryResult[0].name : 'NA';
                            const formattedTime = moment(record.createtime).format("MMM DD YYYY hh:mm A");
                            call_history.push({
                                ...record,
                                createtime: formattedTime,
                                type_label:'1=video,2=voice',
                                status_label:'0-pending,1-start,2-completed,3=rejected',
                                user_name: expertDetails.name,
                                user_image: expertDetails.image,
                                expert_category_id: userResult[0].category,
                                category_name: categoryName,
                            });
                            // Check if all queries are completed
                            completedRequests++;
                            if (completedRequests === callHistory.length) {
                                return response.status(200).json({
                                    success: true,
                                    msg: languageMessage.dataFound,
                                    call_history,
                                });
                            }
                        });
                    });
                });
            });
        });
    }catch(err){
        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// exper bid on job
const ExpertBidJob = async (request, response) => {
    let {user_id,job_post_id,duration,price,duration_type} = request.body;
    if (!user_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'user_id'});
    }
    if (!job_post_id){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'job_post_id'});
    }
    if (!duration){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'duration'});
    }
    if (!price){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'price'});
    }
    if (!duration_type){
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'duration_type'});
    }
    let pdf_file = null;
    let nda_file = null;
    if (request.files && request.files['pdf_file']) {
        pdf_file = request.files['pdf_file'][0].filename;
    }
    if (request.files && request.files['nda_file']) {
        nda_file = request.files['nda_file'][0].filename;
    }
    
    try {
        
        const query1 = "SELECT mobile, active_flag,name FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            const checkJob = "SELECT user_id FROM job_post_master WHERE job_post_id = ? AND delete_flag = 0";
            const jobvalue = [job_post_id];
            connection.query(checkJob, jobvalue, async (err, jobresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobresult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.jobNotFound });
                }
            
                const other_user_id = jobresult[0].user_id ? jobresult[0].user_id : 0;
                const bidQuery = `INSERT INTO bid_master(job_post_id,expert_id,price,duration,files,nda_file,duration_type,createtime,updatetime)
                VALUES (?,?,?,?,?,?,?,now(),now())`;
                const values = [job_post_id,user_id,price,duration,pdf_file,nda_file,duration_type]
                connection.query(bidQuery, values, async (err, bidresult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.bidSentUnsuccess, key: err });
                    }
                    const user_id_notification = user_id;
                    const other_user_id_notification = other_user_id;
                    const action_id = bidresult.insertId;
                    const action = "new_bid";
                    const title = "New Bid Alert";
                    const title_2 = title;
                    const title_3 = title;
                    const title_4 = title;
                    const messages = `An expert has bid on your job. Check it out now!`;
                    const message_2 = messages;
                    const message_3 = messages;
                    const message_4 = messages;
                    const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                    await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                        let notification_arr_check_new = [notification_arr_check];
                        
                        if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                            const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                            
                        }else{
                            console.log("Notification array is empty");
                        }
                    
                    });
                    return response.status(200).json({ success: true, msg: languageMessage.bidSentSuccess});
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.bidSentUnsuccess, key: err.message });
    }
}
//get expert's home job
const getExpertHomeJobs = (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if(err){
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            const jobPostDetails = await getHomeExpertJob(user_id);
            const completedJobDetails = await getHomeExpertCompletedJob(user_id);
            const userjobPost = await getHomeExpertUserJob(user_id);
            const userjobPostCount = await getHomeUserJobCount();
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: jobPostDetails,userjobPost:userjobPost,userjobPostCount:userjobPostCount,completedJobDetails:completedJobDetails })
           
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//book mark job
const bookMarkJob = async (request, response) => {
    let {user_id, job_post_id,type} = request.body;
    if (!user_id || !job_post_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            const checkJob = "SELECT job_post_id FROM job_post_master WHERE delete_flag = 0 AND job_post_id=?";
            const jobvalues = [job_post_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                if(type==0){
                    const bookMarkQuery = `INSERT INTO job_bookmark_master(expert_id,job_post_id,createtime,updatetime)
                    VALUES (?,?,now(),now())`;
                    connection.query(bookMarkQuery, [user_id,job_post_id], async (err, result) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.bookMarkUnsuccess, key: err });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.bookMarkSuccess });
                    });
                }else{
                    const bookMarkQuery = `DELETE FROM job_bookmark_master WHERE expert_id=? and job_post_id=?`;
                    connection.query(bookMarkQuery, [user_id,job_post_id], async (err, result) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.jobUnsaveUnsuccess, key: err });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.jobSaveSuccess });
                    });
                }
                
            });
        });
    } catch (err) {
        if(type==0){
            return response.status(200).json({ success: false, msg: languageMessage.bookMarkUnsuccess, key: err.message });
        }else{
            return response.status(200).json({ success: false, msg: languageMessage.jobUnsaveUnsuccess, key: err.message });
        }
        
    }
}
//report on job
const reportOnJob = async (request, response) => {
    let {user_id, job_post_id,reason} = request.body;
    if (!user_id || !job_post_id ||!reason) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            const checkJob = "SELECT job_post_id FROM job_post_master WHERE delete_flag = 0 AND job_post_id=?";
            const jobvalues = [job_post_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                const bookMarkQuery = `INSERT INTO report_master(expert_id,job_post_id,type,reason,createtime,updatetime)
                VALUES (?,?,?,?,now(),now())`;
                connection.query(bookMarkQuery, [user_id,job_post_id,0,reason], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.jobReportUnsuccess, key: err });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.jobReportSuccess });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.jobReportUnsuccess, key: err.message });
    }
}
//get customer job fiter
const customerJobFilter = (request, response) => {
    const {user_id,category,sub_category} = request.body;
    if (!user_id ||!category ||!sub_category) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if(err){
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
           
            const userjobPost = await getCustomerJobFilter(user_id,category,sub_category);
            
            return response.status(200).json({ success: true, msg: languageMessage.dataFound,userjobPost:userjobPost})
           
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//get expert job fiter
const expertJobFilter = (request, response) => {
    const {user_id,category,sub_category} = request.body;
    if (!user_id ||!category ||!sub_category) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if(err){
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
           
            const userjobPost = await getExpertJobFilter(user_id,category,sub_category);
            
            return response.status(200).json({ success: true, msg: languageMessage.dataFound,userjobPost:userjobPost})
           
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//create Job Cost
const createJobCost = async (request, response) => {
    let {user_id, job_post_id,project_cost} = request.body;
    if (!user_id || !job_post_id || !project_cost) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            const checkJob = "SELECT job_post_id FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and user_id = ? and assign_expert_id!=0";
            const jobvalues = [job_post_id,user_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                const bookMarkQuery = `UPDATE job_post_master SET project_cost = ?, updatetime = now(),status=2 WHERE job_post_id=? and user_id = ?`;
                connection.query(bookMarkQuery, [project_cost,job_post_id,user_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.projectCostUnsuccess, key: err });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.projectCostSuccess });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.projectCostUnsuccess, key: err.message });
    }
}
//create Job milestone
const createJobMilestone = async (request, response) => {
    let {user_id, job_post_id,title,amount,duration,description,duration_type} = request.body;
    if (!user_id || !job_post_id || !title ||!description ||!amount ||!duration ||!duration_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    let pdf_file = null;
    if (request.files && request.files['pdf_file']) {
        pdf_file = request.files['pdf_file'][0].filename;
    }
    try {
        const query1 = "SELECT name,mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const user_name=userResult[0].name;
            const checkJob = "SELECT job_post_id,title,assign_expert_id FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and user_id = ? and assign_expert_id!=0";
            const jobvalues = [job_post_id,user_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                const project_title=jobResult[0].title;
                const other_user_id=jobResult[0].assign_expert_id;
                const bookMarkQuery = `INSERT INTO milestone_master(job_post_id,price,duration,description,file,title,duration_type,createtime,updatetime)
                VALUES (?,?,?,?,?,?,?,now(),now())`;
                connection.query(bookMarkQuery, [job_post_id,amount,duration,description,pdf_file,title,duration_type], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.milestoneCreateUnsuccess, key: err });
                    }
                    const user_id_notification = user_id;
                    const other_user_id_notification = other_user_id;
                    const action_id = result.insertId;
                    const action = "create_milestone";
                    const title = "New Milestone Created!";
                    const messages = `${user_name} has created a new milestone for the project ${project_title}`;
                    const title_2 = title;
                    const title_3 = title;
                    const title_4 = title;
                    const message_2 = messages;
                    const message_3 = messages;
                    const message_4 = messages;
                    const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                    await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                        let notification_arr_check_new = [notification_arr_check];
                        
                        if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                            const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                            
                        }else{
                            console.log("Notification array is empty");
                        }
                    
                    });
                    return response.status(200).json({ success: true, msg: languageMessage.milestoneCreateSuccess });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.milestoneCreateUnsuccess, key: err.message });
    }
}
//get job milestone
const getJobWorkMilestone = (request, response) => {
    const {user_id,job_post_id} = request.query;
    if (!user_id ||!job_post_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if(err){
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const jobMilestone = await getJobMilestone(job_post_id);
            const jobWorkSpace = await getJobWorkSpace(job_post_id);
            return response.status(200).json({ success: true, msg: languageMessage.dataFound,jobWorkSpace:jobWorkSpace,jobMilestone:jobMilestone});
           
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//update 
const acceptRejectMilestone = async (request, response) => {
    let {user_id, milestone_id,type,reject_reason} = request.body;
    if (!user_id || !milestone_id || !type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if(type==2){
        if (!reject_reason) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,reject_reason:'reject_reason' });
        }
    }
    try {
        const query1 = "SELECT name,mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const user_name=userResult[0].name;
            const checkMilestone = "SELECT job_post_id FROM milestone_master WHERE delete_flag = 0 AND milestone_id=? and milestone_status=0";
            const milestonevalues = [milestone_id];
            connection.query(checkMilestone, milestonevalues, (err, milestoneResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.WorkSpaceNotFound, key: err.message });
                }
                if (milestoneResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.WorkSpaceNotFound });
                }
                const checkJob = "SELECT user_id,title FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and assign_expert_id=?";
                const jobvalues = [milestoneResult[0].job_post_id,user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                    }
                    const project_title=jobResult[0].title;
                    let updateMilestone;
                    let updateValue;
                    if(type==1){
                        updateMilestone = `UPDATE milestone_master SET milestone_status=?,updatetime = now() WHERE milestone_id=?`;
                        updateValue=[type,milestone_id];
                    }else{
                        updateMilestone = `UPDATE milestone_master SET milestone_status=?,reject_reason=?,updatetime = now() WHERE milestone_id=?`;
                        updateValue=[type,reject_reason,milestone_id];
                    }
                    connection.query(updateMilestone, updateValue, async (err, updateResult) => {
                        if (err) {
                            if(type==1){
                                return response.status(200).json({ success: false, msg: languageMessage.WorkAcceptUnsuccess, key: err });
                            }else{
                                return response.status(200).json({ success: false, msg: languageMessage.WorkRejectUnsuccess, key: err });
                            }
                            
                        }
                        const user_id_notification = user_id;
                        const other_user_id_notification = jobResult[0].user_id;
                        const action_id = milestone_id;
                        let action;
                        let title;
                        let messages;
                        if(type==1){
                            action = "accept_milestone";
                            title = "Milestone Accepted";
                            messages = `${user_name} has accepted work space for the project ${project_title}`;
                        }else{
                            action = "reject_milestone";
                            title = "Milestone Rejected";
                            messages = `${user_name} has rejected work space for the project ${project_title}`;
                        }
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                        await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            
                            if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                                
                            }else{
                                console.log("Notification array is empty");
                            }
                        
                        });
                        if(type==1){
                            return response.status(200).json({ success: true, msg: languageMessage.WorkAcceptSuccess });
                        }else{
                            return response.status(200).json({ success: true, msg: languageMessage.WorkRejectSuccess });
                        }
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//sent milestone request
const sentMilestoneRequest = async (request, response) => {
    let {user_id, milestone_id} = request.body;
    if (!user_id || !milestone_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    
    try {
        const query1 = "SELECT name,mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const user_name=userResult[0].name;
            const checkMilestone = "SELECT job_post_id FROM milestone_master WHERE delete_flag = 0 AND milestone_id=? and milestone_status=1";
            const milestonevalues = [milestone_id];
            connection.query(checkMilestone, milestonevalues, (err, milestoneResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.WorkSpaceNotFound, key: err.message });
                }
                if (milestoneResult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.WorkSpaceNotFound });
                }
                const checkJob = "SELECT user_id,title FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and assign_expert_id=?";
                const jobvalues = [milestoneResult[0].job_post_id,user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.jobNotFound });
                    }
                    const project_title=jobResult[0].title;
                   
                    const updateMilestone = `UPDATE milestone_master SET milestone_status=3,updatetime = now() WHERE milestone_id=?`;
                    const updateValue=[milestone_id];
                    
                    connection.query(updateMilestone, updateValue, async (err, updateResult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.milestoneRequestUnsuccess, key: err });
                        }
                        const user_id_notification = user_id;
                        const other_user_id_notification = jobResult[0].user_id;
                        const action_id = milestone_id;
                        
                        const action = "milestone_request";
                        const title = "Milestone Request";
                        const messages = `${user_name} has sent a milestone request for the project ${project_title}`;
                       
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                        await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            
                            if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                                
                            }else{
                                console.log("Notification array is empty");
                            }
                        
                        });
                        return response.status(200).json({ success: true, msg: languageMessage.milestoneRequestSuccess });
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.milestoneRequestUnsuccess, key: err.message });
    }
}
//milestone request release,cancel,dispute 
const checkMilestoneRequest = async (request, response) => {
    let {user_id,milestone_id,type} = request.body;
    if (!user_id || !milestone_id || !type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    
    try {
        const query1 = "SELECT name,mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            const user_name=userResult[0].name;
            const checkMilestone = "SELECT job_post_id FROM milestone_master WHERE delete_flag = 0 AND milestone_id=? and milestone_status=3";
            const milestonevalues = [milestone_id];
            connection.query(checkMilestone, milestonevalues, (err, milestoneResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.WorkSpaceNotFound, key: err.message });
                }
                if (milestoneResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.WorkSpaceNotFound });
                }
                const checkJob = "SELECT assign_expert_id,title FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and user_id=?";
                const jobvalues = [milestoneResult[0].job_post_id,user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                    }
                    const project_title=jobResult[0].title;
                    
                    const updateMilestone = `UPDATE milestone_master SET milestone_status=?,updatetime = now() WHERE milestone_id=?`;
                    const updateValue=[type,milestone_id];
                    connection.query(updateMilestone, updateValue, async (err, updateResult) => {
                        if (err) {
                            if(type==4){
                                return response.status(200).json({ success: false, msg: languageMessage.milestoneReleaseUnsuccess, key: err });
                            }
                            if(type==5){
                                return response.status(200).json({ success: false, msg: languageMessage.milestoneDisputeUnsuccess, key: err });
                            }
                            if(type==6){
                                return response.status(200).json({ success: false, msg: languageMessage.milestoneCancelUnsuccess, key: err });
                            }
                            
                        }
                        const user_id_notification = user_id;
                        const other_user_id_notification = jobResult[0].assign_expert_id;
                        const action_id = milestone_id;
                        let action;
                        let title;
                        let messages;
                        if(type==4){
                            action = "milestone_release";
                            title = "Milestone Release";
                            messages = `${user_name} has release milestone for the project ${project_title}`;
                        }if(type==5){
                            action = "milestone_dipute";
                            title = "Milestone Dispute";
                            messages = `${user_name} has dipute milestone for the project ${project_title}`;
                        }
                        if(type==6){
                            action = "milestone_cancel";
                            title = "Milestone Cancelled";
                            messages = `${user_name} has cancel milestone for the project ${project_title}`;
                        }
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
                        const message_2 = messages;
                        const message_3 = messages;
                        const message_4 = messages;
                        const action_data = {user_id: user_id_notification,other_user_id: other_user_id_notification,action_id: action_id,action: action};
                        await getNotificationArrSingle(user_id_notification,other_user_id_notification,action,action_id,title,title_2,title_3,title_4,messages,message_2,message_3,message_4,action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];
                            
                            if(notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new!=''){
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);
                                
                            }else{
                                console.log("Notification array is empty");
                            }
                        });
                        if(type==4){
                            return response.status(200).json({ success: true, msg: languageMessage.milestoneReleaseSuccess });
                        }
                        if(type==5){
                            return response.status(200).json({ success: true, msg: languageMessage.milestoneDisputeSuccess });
                        }
                        if(type==6){
                            return response.status(200).json({ success: true, msg: languageMessage.milestoneCancelSuccess });
                        }
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
// get job post details
const getExpertJobDetails = async (request, response) => {
    const { user_id, job_post_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!job_post_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            let check_hire_expert_id=0;
            const query2 = `SELECT job_post_id, user_id, assign_expert_id, title, category, sub_category, max_price, min_price, duration, status, createtime, updatetime,description,duration_type,project_cost FROM job_post_master WHERE job_post_id = ? AND delete_flag = 0`;
            connection.query(query2, [job_post_id], async (err, jobPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobPosts.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                // Fetch category and subcategory names
                const jobPostDetails = await Promise.all(
                    jobPosts.map(async (job) => {
                        // Fetch subcategory name
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0";
                        const category = await new Promise((resolve) => {
                            connection.query(categoryQuery, [job.category], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        // Fetch city name
                        const cityQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        const city = await new Promise((resolve) => {
                            connection.query(cityQuery, [job.city], (err, result) => {
                                resolve(err ? null : result[0]?.sub_category_name);
                            });
                        });
                        // Fetch user name
                        const userNameQuery = "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const userName = await new Promise((resolve) => {
                            connection.query(userNameQuery, [job.user_id], (err, result) => {
                                resolve(err ? null : result[0]?.name);
                            });
                        });
                        // Fetch user image
                        const userImageQuery = "SELECT image FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const userimage = await new Promise((resolve) => {
                            connection.query(userImageQuery, [job.user_id], (err, result) => {
                                resolve(err ? null : result[0]?.image);
                            });
                        });
                        check_hire_expert_id=job.assign_expert_id;
                        return {
                            ...job,
                            sub_category: subCategory,
                            category: category,
                            city: city,
                            userName: userName,
                            userimage: userimage,
                            posted_time: getRelativeTime(job.createtime),
                            duration_type_labe:'1=days,2=month,3=year',
                            
                        };
                    })
                );
                // Fetch expert bid data
                let querybid;
                let bidValues;
               
                querybid = "SELECT bid_id, expert_id, price, duration, files, createtime,status,duration_type FROM bid_master WHERE job_post_id = ? AND delete_flag = 0 and expert_id=?";
                bidValues=[job_post_id,user_id];
                
                connection.query(querybid, bidValues, (err, bidResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    let bidsDataArray='NA';
                    if (bidResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails,bidsDataArray:bidsDataArray,bidcount:bidResult.length});
                    }
                    let finalBidResult = [];
                    let processedCount = 0;
                    bidResult.forEach((bidItem) => {
                        const expertQuery = "SELECT user_id, name, image FROM user_master WHERE delete_flag = 0 AND user_id = ?";
                        connection.query(expertQuery, [bidItem.expert_id], async(err, expertResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                            }
                            const expertbidDetails = expertResult.length > 0 ? expertResult[0] : null;
                            const expert_name=expertResult[0].name;
                            const status_label='0=pending,1=hired';
                            const expert_image = expertResult[0].image ? expertResult[0].image : "NA";
                            const averageResult = await getAvgRating(bidItem.expert_id); // Wait for the promise to resolve
                            const average_rating = averageResult.average_rating || 0;
                            finalBidResult.push({
                                ...bidItem,
                                expert_name,
                                expert_image,
                                status_label,
                                posted_time: getRelativeTime(bidItem.createtime),
                                avg_rating: parseFloat(average_rating.toFixed(1)),
                                duration_type_labe:'1=days,2=month,3=year',
                                check_hire_expert_id:check_hire_expert_id
                            });
                            processedCount++;
                            if (processedCount === bidResult.length) {
                                bidsDataArray=finalBidResult;
                                return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails,bidsDataArray:bidsDataArray});
                            }
                        });
                    });
                    
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//get user details
const getUserProfile = (request, response) => {
    const {user_id} = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'user_id'});
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if(err){
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
           
            const userDetails = await getUserDetails(user_id);
            
            return response.status(200).json({ success: true, msg: languageMessage.dataFound,userDetails:userDetails})
           
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
const downloadApp = async (request, response) => {
    response.send(
        `
    <!DOCTYPE html>
    <html lang="en-US">
    <head>
        <title>Cinema</title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <section>
            <div class="btn-holder">
                <a class="btn" href="https://www.apple.com/in/app-store/" style="padding-left: 0;">
                    <img alt="" src="https://youngdecade.org/2024/xpert/server/downloadImg/appstore.png">
                </a>
                <a class="btn" href="https://play.google.com/store/apps">
                    <img alt="" src="https://youngdecade.org/2024/xpert/server/downloadImg/googleplay.png">
                </a>
            </div>
        </section>
    </body>
    </html>
  `
    );
};
const deepLink = async(request,response)=>{
    const get_link = request.query.link;
    response.send(`
      <!DOCTYPE html>
      <html>
         <head>
         <title>Wait..</title>
         <script src='//code.jquery.com/jquery-1.11.2.min.js'></script>
           <script>
           (function() {
             var app = {
               launchApp: function() {
                   var get_link = '${get_link}';
                   window.location.replace(get_link);
                   this.timer = setTimeout(this.openWebApp, 3000);
               },
               openWebApp: function() {
                   window.location.replace("https://youngdecade.org/2024/xpert/server/downloadApp");
               }
             };
             app.launchApp();
           })();
           </script>
           <style type="text/css">
             .twitter-detect {
               display: none;
             }
           </style>
         </head>
         <body>
         <p>Website content.</p>
         </body>
      </html>
    `);
}
// Get Expert By Filter
const getExpertByFilterSubLabel = async (request, response) => {
    const { user_id, state, city, category, sub_category,sub_category_level,experience, rating,sub_two_level_category_id,sub_three_level_category_id} = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        // Verify user existence and status
        const query1 = `
            SELECT mobile, active_flag 
            FROM user_master 
            WHERE user_id = ? AND delete_flag = 0 AND user_type = 1
        `;
        const values1 = [user_id];
        connection.query(query1, values1, (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            // Prepare query for experts
            let query2 = `SELECT user_id as expert_id FROM user_master WHERE delete_flag = 0 AND active_flag = 1 AND user_type = 2 and expert_status=1`;
            let value2 = [];
            if(state){
                query2 += " AND state = ?";
                value2.push((state));
            }
            if(city){
                query2 += " AND city = ?";
                value2.push((city));
            }
            if(category){
                query2 += " AND category = ?";
                value2.push((category));
            }
            if(sub_category){
                query2 += " AND sub_category = ?";
                value2.push((sub_category));
            }
            if(sub_category_level){
                query2 += " AND FIND_IN_SET(?, sub_category_level)";
                value2.push((sub_category_level));
            }
            if (experience) {
                query2 += " AND experience >= ? AND experience < ?";
                value2.push(Number(experience), Number(experience) + 1);
            }
            if(sub_two_level_category_id){
                query2 += " AND sub_two_level_category_id = ?";
                value2.push((sub_two_level_category_id));
            }
            if(sub_three_level_category_id){
                query2 += " AND sub_three_level_category_id = ?";
                value2.push((sub_three_level_category_id));
            }
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
                    if (rating) {
                        finalResult = parsedResult.filter(
                            (item) => item.average_rating >= parseFloat(rating) && item.average_rating < parseFloat(rating) + 1
                        );
                    }
                    if (finalResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: "NA" });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: finalResult });
                } catch (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//logout user
const logOut = (request, response) => {
    const {user_id} = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param,key:'user_id'});
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, result) => {
            if(err){
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated ,active_status:0});
            }
            
            
                const delete_query = "DELETE FROM `user_notification` WHERE user_id = ? AND delete_flag = 0";
                const delete_values = [user_id];
                connection.query(delete_query, delete_values, async (err, delete_result) => {
                    return response.status(200).json({ success: true, msg: languageMessage.logOutSuccess});
                });
            
        });
    } catch (err){
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
const AddAvailibility = async (request, response) => {
  var { expert_id, dayofweeks,activeStatus,morningStart,morningEnd,eveningStart,eveningEnd } = request.body;
if (!expert_id || !dayofweeks || !activeStatus || !morningStart || !morningEnd || ! eveningStart || !eveningEnd) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key : "expert_id" });
  }
const dayOfWeek_arr=dayofweeks.split(',');
const activeStatus_arr=activeStatus.split(',');
const morningStart_arr=morningStart.split(',');
const morningEnd_arr=morningEnd.split(',');
const eveningStart_arr=eveningStart.split(',');
const eveningEnd_arr=eveningEnd.split(',');
  try {
    const CheckExpert =
      "SELECT user_id, active_flag, user_type FROM user_master WHERE user_id = ? AND user_type=2 AND delete_flag=0";
    connection.query(CheckExpert, [expert_id], async (err, result) => {
      if (err) {
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: err.message,
        });
      }
      if (result.length === 0) {
        return response
          .status(404)
          .json({ success: false, msg: languageMessage.expertNotFound });
      }
      const CheckAvailibityExpert =
      "SELECT expert_id FROM availiability_master WHERE expert_id = ? AND  delete_flag=0";
      connection.query(CheckAvailibityExpert,[expert_id],async(err,checkExpert)=>{
        if(err){
            return response.status(500).json({
                success:false,
                msg:languageMessage.internalServerError,
                key:err.message
            });
        }
        if(checkExpert.length>0){
           return response.status(200).json({
                success:false,
                msg:languageMessage.AvailibilityAlreadyExists,
            }); 
        }
     
      // SQL Insert Query
      const InsertQuery = `INSERT INTO availiability_master 
        (expert_id, days,active_status, morn_start_time, morn_end_time, even_start_time, even_end_time, createtime, updatetime, mysqltime) 
        VALUES (?, ?, ?, ?,?,?,?, NOW(), NOW(), NOW())`;
        for(let i=0;i<7;i++){
          connection.query(
            InsertQuery,
            [
              expert_id,
              dayOfWeek_arr[i],
              activeStatus_arr[i],
              morningStart_arr[i],
              morningEnd_arr[i],
              eveningStart_arr[i],
              eveningEnd_arr[i],
            ],
            (err, result) => {
              if (err) {
          return response.status(200).json({
            success: true,
            msg: err.message,
          });
        };
              
            }
          );
        }
  
     return response.status(200).json({
            success: true,
            msg: languageMessage.AvailibilityCreated,
          });
  
    });
     });
  } catch (err) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: err.message,
    });
  }
};
// get availibility by expert id
const getAvailiblityDetailsById = async (request, response) => {
  const { expert_id } = request.query;
  if (!expert_id) {
    return response
      .status(200)
      .json({ success: false, msg: languageMessage.msg_empty_param });
  }
  try {
        const CheckExpert ="SELECT user_id, active_flag, user_type FROM user_master WHERE user_id = ? AND user_type=2 AND delete_flag=0";
    const values1 = [expert_id];
    connection.query(CheckExpert, values1, async (err, result) => {
      if (err) {
        return response
          .status(200)
          .json({
            success: false,
            msg: languageMessage.internalServerError,
            key1: err.message,
          });
      }
      if (result.length === 0) {
        return response
          .status(200)
          .json({ success: false, msg: languageMessage.expertNotFound });
      }
      if (result[0]?.active_flag === 0) {
        return response
          .status(200)
          .json({
            success: false,
            msg: languageMessage.accountdeactivated,
            active_status: 0,
          });
      }
       connection.query("select availiabilty_id, expert_id, days, status, active_status, morn_start_time, morn_end_time, even_start_time, even_end_time, delete_flag, createtime, updatetime, mysqltime from availiability_master where expert_id = ? AND delete_flag = 0",
  [expert_id],async (error, rows) => {
          if (error) {
          return response
          .status(200)
          .json({
            success: false,
            msg: languageMessage.internalServerError,
            key1: error.message,
          });
       } 
    
        if (rows.length > 0) {
  
                  const availibilityData = rows.map(result => (
                {
                    availiabilty_id : result.availiabilty_id ||'NA',
                    expert_id:expert_id ||'NA',
                    dayOfWeek: result.days ||'NA',
                    activeStatus: result.active_status ||0,
                    morningStart: new Date('1970-01-01T' + result.morn_start_time + 'Z')
  .toLocaleTimeString('en-US',
    {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
  )  ||'NA',
                    morningEnd: new Date('1970-01-01T' + result.morn_end_time + 'Z')
  .toLocaleTimeString('en-US',
    {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
  )  ||'NA',
                    eveningStart: new Date('1970-01-01T' + result.even_start_time + 'Z')
  .toLocaleTimeString('en-US',
    {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
  ) ||'NA',
                    eveningEnd: new Date('1970-01-01T' + result.even_end_time + 'Z')
  .toLocaleTimeString('en-US',
    {timeZone:'UTC',hour12:true,hour:'numeric',minute:'numeric'}
  ) ||'NA',
               
                }));
                  return response.status(200).json({
                    success: true,
                    msg: languageMessage.dataFound,
                    availibilityData: availibilityData,
                  });
  
              }else{
                 return response.status(200).json({
                    success: true,
                    msg: languageMessage.dataFound,
                    availibilityData: [],
                  });
  
              }
               
  
          }
  
        );
   
   
    });
  } catch (err) {
    return response
      .status(200)
      .json({
        success: false,
        msg: languageMessage.internalServerError4,
        key: err.message,
      });
  }
};
const EditAvailibility = async (request, response) => {
  var { expert_id, dayofweeks,activeStatus,morningStart,morningEnd,eveningStart,eveningEnd } = request.body;
if (!expert_id || !dayofweeks || !activeStatus || !morningStart || !morningEnd || ! eveningStart || !eveningEnd) {
    return response
      .status(400)
      .json({ success: false, msg: languageMessage.msg_empty_param, key : "expert_id" });
  }
 
const dayOfWeek_arr=dayofweeks.split(',');
const activeStatus_arr=activeStatus.split(',');
const morningStart_arr=morningStart.split(',');
const morningEnd_arr=morningEnd.split(',');
const eveningStart_arr=eveningStart.split(',');
const eveningEnd_arr=eveningEnd.split(',');
if (dayOfWeek_arr.length !=7 || activeStatus_arr.length !=7 || morningStart_arr.length !=7 || morningEnd_arr.length !=7 ||  eveningStart_arr.length !=7 || eveningEnd_arr.length !=7) {
    return response
      .status(500)
      .json({ success: false, msg: languageMessage.invalidData, key : {'dayOfWeek':dayOfWeek_arr.length,'activeStatus':activeStatus_arr.length,'morningStart':morningStart_arr.length,'morningEnd':morningEnd_arr.length,'eveningStart':eveningStart_arr.length,'eveningEnd':eveningEnd_arr.length} });
  }
var availibility_arr=[];
  try {
    const CheckExpert =
      "SELECT user_id, active_flag, user_type FROM user_master WHERE user_id = ? AND user_type=2 AND delete_flag=0";
    connection.query(CheckExpert, [expert_id], async (err, result) => {
      if (err) {
        return response.status(500).json({
          success: false,
          msg: languageMessage.internalServerError,
          key: err.message,
        });
      }
      if (result.length === 0) {
        return response
          .status(404)
          .json({ success: false, msg: languageMessage.expertNotFound });
      }
        if (result[0]?.active_flag === 0) {
        return response
          .status(200)
          .json({
            success: false,
            msg: languageMessage.accountdeactivated,
            active_status: 0,
          });
      }
      const CheckAvailibityExpert =
      "SELECT availiabilty_id FROM availiability_master WHERE expert_id = ? AND  delete_flag=0";
      connection.query(CheckAvailibityExpert,[expert_id],async(err,checkExpert)=>{
        if(err){
            return response.status(500).json({
                success:false,
                msg:languageMessage.internalServerError,
                key:err.message
            });
        }
        if(checkExpert.length>0){
          await checkExpert.map((record)=>{
          availibility_arr.push(record.availiabilty_id);
          });
          
        }
     
      // SQL Insert Query
      const UpdateQuery = `Update availiability_master SET  days = ?,active_status = ?, morn_start_time = ?, morn_end_time = ?, even_start_time = ?, even_end_time = ?, updatetime = NOW() WHERE delete_flag=0 and availiabilty_id=?`;
        for(let i=0;i<7;i++){
          connection.query(
            UpdateQuery,
            [
              dayOfWeek_arr[i],
              activeStatus_arr[i],
              morningStart_arr[i],
              morningEnd_arr[i],
              eveningStart_arr[i],
              eveningEnd_arr[i],
              availibility_arr[i]
            ],
            (err, result) => {
              if (err) {
          return response.status(200).json({
            success: true,
            msg: err.message,
          });
        };
              
            }
          );
        }
  
     return response.status(200).json({
            success: true,
            msg: languageMessage.AvailibilityUdpatedError,
          });
  
    });
     });
  } catch (err) {
    return response.status(500).json({
      success: false,
      msg: languageMessage.internalServerError,
      key: err.message,
    });
  }
};

module.exports = {getExpertDetails,getExpertDetailsById,getExpertByRating,getMyJobs,getJobPostDetails,createJobPost,chatConsultationHistory,chatJobsHistory,callConsultationHistory,callJobsHistory,getExpertByFilter,walletRecharge,walletHistory,getExpertByName,getExpertEarning,withdrawRequest,withdrawHistory,expertCallConsultationHistory,expertCallJobsHistory,getJobPostsForExpert,getExpertEarningHistory,expertChatConsultationHistory,expertChatJobsHistory,getReviewsOfExpert,getExpertMyJobs,getBidsOfJobPost,hireTheExpert,createProjectCost,getSubscriptionPlans,buySubscription,reviewReply,rateExpert,ExpertBidJob,CustomerCallHistory,ExpertCallHistory,getExpertHomeJobs,bookMarkJob,reportOnJob,customerJobFilter,expertJobFilter,createJobCost,createJobMilestone,getJobWorkMilestone,acceptRejectMilestone,sentMilestoneRequest,checkMilestoneRequest,getExpertJobDetails,getUserProfile,downloadApp,deepLink,getExpertByFilterSubLabel,logOut,AddAvailibility,EditAvailibility,getAvailiblityDetailsById};