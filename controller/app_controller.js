const connection = require('../connection');
const moment = require("moment");
const jwt = require('jsonwebtoken');
const { generateOTP, hashPassword, getUserDetails, getUserDocument, getRelativeTime, getRatingBarAvg, getCategoryName, getHomeExpertJob, getHomeExpertUserJob, getHomeUserJobCount, getCustomerJobFilter, getAvgRating, getExpertJobFilter, getJobMilestone, getJobWorkSpace, getHomeExpertCompletedJob, authenticateToken, getUserTotalWallet } = require('../shared functions/functions');
const languageMessage = require('../shared functions/languageMessage');
const { getNotificationArrSingle, oneSignalNotificationSendCall } = require('./notification');
// const twilio = require('twilio');
const util = require("util");
const { connect } = require('http2');
const { request } = require('http');
// const { multer} = require('../middleware/multer');
const { mailer, JobcompleteMailer, refundmailer } = require('./MailerApi');
// Get Expert Details By category
// const getExpertDetails = async (request, response) => {
//     const { user_id, category_id, sub_category_id, sub_level_id, sub_two_level_category_id, sub_three_level_category_id } = request.body;
//     // Validate input parameters
//     if (!user_id || !category_id || !sub_category_id || !sub_level_id) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
//     }
//     try {
//         // SQL query to fetch expert details
//         let query = `SELECT user_id as expert_id FROM user_master  WHERE category = ? AND sub_category = ?  AND FIND_IN_SET(?, sub_category_level) AND active_flag = 1 and delete_flag=0`;
//         let values = [category_id, sub_category_id, sub_level_id];
//         if (sub_two_level_category_id != 0) {
//             query += " AND sub_two_level_category_id = ?";
//             values.push((sub_two_level_category_id));
//         }
//         if (sub_three_level_category_id != 0) {
//             query += " AND sub_three_level_category_id = ?";
//             values.push((sub_three_level_category_id));
//         }
//         connection.query(query, values, async (err, result) => {
//             if (result.length > 0) {
//                 // Fetch user details for each expert and filter out "NA"
//                 const expertDetails = await Promise.all(
//                     result.map(async (expert) => {
//                         const userDetails = await getUserDetails(expert.expert_id);
//                         return userDetails === "NA" ? null : { ...expert, userDetails };
//                     })
//                 );
//                 // Filter out null values
//                 const filteredDetails = expertDetails.filter((expert) => expert !== null);

//                 return response.status(200).json({ success: true, expertDetails: filteredDetails });
//             } else {
//                 return response.status(200).json({ success: true, expertDetails: 'NA' });
//             }
//         });
//     } catch (error) {
//         console.error("Error fetching expert details:", error);
//         return response.status(200).json({ success: false, msg: languageMessage.internalServerError4, key: err.message });
//     }
// };
//end

const getExpertDetails = async (request, response) => {
    const { user_id, category_id, sub_category_id, sub_level_id, sub_two_level_category_id, sub_three_level_category_id } = request.body;

    // Validate mandatory parameters
    if (!user_id || !category_id || !sub_category_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }

    try {
        // Base query
        let query = `SELECT user_id as expert_id FROM user_master WHERE category = ? AND sub_category = ? AND active_flag = 1 AND delete_flag = 0`;
        let values = [category_id, sub_category_id];

        // Add sub_level_id condition if it's not 0
        if (sub_level_id && sub_level_id != 0) {
            query += ` AND FIND_IN_SET(?, sub_category_level)`;
            values.push(sub_level_id);
        }

        // Add sub_two_level_category_id condition if it's not 0
        if (sub_two_level_category_id && sub_two_level_category_id != 0) {
            query += ` AND sub_two_level_category_id = ?`;
            values.push(sub_two_level_category_id);
        }

        // Add sub_three_level_category_id condition if it's not 0
        if (sub_three_level_category_id && sub_three_level_category_id != 0) {
            query += ` AND sub_three_level_category_id = ?`;
            values.push(sub_three_level_category_id);
        }

        // Execute query
        connection.query(query, values, async (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }

            if (result.length > 0) {
                const expertDetails = await Promise.all(
                    result.map(async (expert) => {
                        const userDetails = await getUserDetails(expert.expert_id);
                        return userDetails === "NA" ? null : { ...expert, userDetails };
                    })
                );

                const filteredDetails = expertDetails.filter((expert) => expert !== null);

                return response.status(200).json({ success: true, expertDetails: filteredDetails });
            } else {
                return response.status(200).json({ success: true, expertDetails: 'NA' });
            }
        });

    } catch (error) {
        console.error("Error fetching expert details:", error);
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: error.message });
    }
};

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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                SELECT mobile, active_flag , online_status
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

        const chatSql = 'DELETE FROM chat_status_master WHERE user_id = ? '
        connection.query(chatSql, [user_id], async (chatErr, chatRes) => {
            if (chatErr) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: chatErr.message });
            }

            // Fetch top-rated experts
            const expertQuery = `
                SELECT user_id as expert_id
                FROM user_master 
                WHERE delete_flag = 0 AND user_type = 2 AND active_flag = 1 AND profile_completed = 1 and expert_status=1`;


            //       const expertQuery = `
            //     SELECT um.user_id AS expert_id
            //     FROM user_master um
            //     JOIN expert_subscription_master esm ON um.user_id = esm.expert_id
            //     JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id
            //     WHERE 
            //         um.delete_flag = 0 
            //         AND um.user_type = 2 
            //         AND um.active_flag = 1 
            //         AND um.profile_completed = 1 
            //         AND um.expert_status = 1
            //         AND esm.delete_flag = 0
            //         AND sm.delete_flag = 0
            //         AND DATE_ADD(esm.createtime, INTERVAL sm.duration DAY) >= NOW()
            //     GROUP BY um.user_id
            // `;
            const expertResults = await queryAsync(expertQuery);
            if (expertResults.length === 0) {
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: 'NA' });
            }
            // Fetch user details for each expert and filter out "NA"
            const expertDetails = await Promise.all(
                expertResults.map(async (expert) => {
                    const userDetails = await getUserDetails(expert.expert_id);
                    return userDetails === "NA" ? null : { ...expert, userDetails };
                })
            );
            // Filter out null values
            const filteredDetails = expertDetails.filter((expert) => expert !== null);

            filteredDetails.sort((a, b) => (b.userDetails.average_rating || 0) - (a.userDetails.average_rating || 0));
            // Respond with success
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: filteredDetails });
        })
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query2 = `
                SELECT job_post_id, assign_expert_id, title, category, sub_category, max_price, min_price, duration,duration_type, status, updatetime,createtime
                FROM job_post_master 
                WHERE user_id = ? AND delete_flag = 0 AND status!=3 ORDER BY createtime DESC
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
                            subcategory_id: job.sub_category,
                            sub_category: subCategory,
                            category_id: job.category,
                            category: category,
                            duration_type_label: '1=days,2=month,3=year',
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            let check_hire_expert_id = 0;
            const query2 = `SELECT job_post_id, user_id, assign_expert_id, title, category, sub_category, max_price, min_price, duration, status, createtime, updatetime,description,duration_type,project_cost, email FROM job_post_master WHERE job_post_id = ? AND delete_flag = 0`;
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
                        let subCategory = 'NA';
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, subresult) => {
                                if (err || !subresult || subresult.length === 0) {
                                    resolve('NA');
                                } else {
                                    resolve(subresult[0].sub_category_name);
                                }
                            });
                        });
                        // Fetch category name
                        const categoryQuery = "SELECT name FROM categories_master WHERE category_id = ? AND delete_flag = 0";
                        const category = await new Promise((resolve) => {
                            connection.query(categoryQuery, [job.category], (err, catresult) => {
                                resolve(err ? null : catresult[0]?.name);
                            });
                        });
                        // Fetch city name
                        const cityQuery = "SELECT city_name FROM city_master WHERE city_id = ? AND delete_flag = 0";
                        const city = await new Promise((resolve) => {
                            connection.query(cityQuery, [job.city], (err, cityresult) => {
                                resolve(err ? null : cityresult[0]?.city_name);
                            });
                        });
                        // Fetch user name
                        const userNameQuery = "SELECT name FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const userName = await new Promise((resolve) => {
                            connection.query(userNameQuery, [job.user_id], (err, nameresult) => {
                                resolve(err ? null : nameresult[0]?.name);
                            });
                        });
                        // const userEmailQuery = "SELECT email FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        // const userEmail = await new Promise((resolve) => {
                        //     connection.query(userEmailQuery, [job.user_id], (err, emailResult) => {
                        //         resolve(err ? null : emailResult[0]?.email);
                        //     });
                        // });



                        // Fetch user image
                        const userImageQuery = "SELECT image FROM user_master WHERE user_id = ? AND delete_flag = 0";
                        const userimage = await new Promise((resolve) => {
                            connection.query(userImageQuery, [job.user_id], (err, imageresult) => {
                                resolve(err ? null : imageresult[0]?.image);
                            });
                        });
                        // Fetch document
                        let jobdocument = [];
                        const jobDocQuery = "SELECT file_name FROM job_file_master WHERE job_id = ? AND delete_flag = 0";
                        jobdocument = await new Promise((resolve) => {
                            connection.query(jobDocQuery, [job_post_id], (err, fileresult) => {
                                if (err || !fileresult || fileresult.length === 0) {
                                    resolve('NA'); // Return an empty array if no files are found
                                } else {
                                    resolve(fileresult.map(row => row.file_name)); // Return an array of file names
                                }
                            });
                        });

                        const milestoneSql = `
                    SELECT milestone_id, status, milestone_status  
                    FROM milestone_master 
                    WHERE job_post_id = ? AND delete_flag = 0
                `;

                        const mileStoneStatus = await new Promise((resolve) => {
                            connection.query(milestoneSql, [job_post_id], (err, milestoneRes) => {
                                if (err || !milestoneRes || milestoneRes.length === 0) {
                                    return resolve(false); // Default to false if no milestones exist
                                }

                                for (const milestone of milestoneRes) {
                                    if ([0, 1, 3].includes(milestone.milestone_status)) {
                                        return resolve(false); // If any milestone is pending, return false immediately
                                    }
                                }

                                return resolve(true); // If all milestones are completed, return true
                            });
                        });

                        check_hire_expert_id = job.assign_expert_id;

                        return {
                            ...job,
                            category: category,
                            city: city,
                            userName: userName,
                            userimage: userimage,

                            posted_time: getRelativeTime(job.createtime),
                            duration_type_labe: '1=days,2=month,3=year',
                            status_label: '0=pending,1=hired,2=inprogress,3=completed',
                            file_name: jobdocument,
                            sub_category: subCategory,
                            job_complete_status: mileStoneStatus
                        };
                    })
                );
                // Fetch expert bid data
                let querybid;
                let bidValues;
                if (check_hire_expert_id === 0) {
                    querybid = "SELECT bid_id, expert_id, price, duration, files, createtime,status,duration_type, nda_file FROM bid_master WHERE job_post_id = ? AND delete_flag = 0";
                    bidValues = [job_post_id];
                } else {
                    querybid = "SELECT bid_id, expert_id, price, duration, files, createtime,status,duration_type, nda_file FROM bid_master WHERE job_post_id = ? AND delete_flag = 0 and expert_id=?";
                    bidValues = [job_post_id, check_hire_expert_id];
                }
                connection.query(querybid, bidValues, (err, bidResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }

                    let bidsDataArray = 'NA';
                    if (bidResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails, bidsDataArray: bidsDataArray, bidcount: bidResult.length });
                    }

                    let finalBidResult = [];
                    let processedCount = 0;
                    bidResult.forEach((bidItem) => {
                        const expertQuery = "SELECT user_id, name, image, chat_charge, call_charge, video_call_charge, category FROM user_master WHERE delete_flag = 0 AND user_id = ?";
                        connection.query(expertQuery, [bidItem.expert_id], async (err, expertResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                            }
                            const categoryName = 'SELECT type_name, name FROM categories_master WHERE category_id = ? AND delete_flag= 0';
                            connection.query(categoryName, [expertResult[0].category], async (err, catResult) => {
                                if (err) {
                                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
                                }



                                const expertbidDetails = expertResult.length > 0 ? expertResult[0] : null;
                                const expert_name = expertResult[0].name;
                                const status_label = '0=pending,1=hired';
                                const expert_image = expertResult[0].image ? expertResult[0].image : "NA";
                                const averageResult = await getAvgRating(bidItem.expert_id); // Wait for the promise to resolve
                                const average_rating = averageResult.average_rating || 0;
                                const chat_charge = expertResult[0].chat_charge;
                                const call_charge = expertResult[0].call_charge;
                                const video_call_charge = expertResult[0].video_call_charge;
                                const category_name = catResult[0].name;

                                finalBidResult.push({
                                    ...bidItem,
                                    expert_name,
                                    expert_image,
                                    chat_charge,
                                    call_charge,
                                    video_call_charge,
                                    category_name,
                                    status_label,
                                    posted_time: getRelativeTime(bidItem.createtime),
                                    avg_rating: parseFloat(average_rating.toFixed(1)),
                                    duration_type_labe: '1=days,2=month,3=year',
                                    check_hire_expert_id: check_hire_expert_id
                                });
                                processedCount++;
                                if (processedCount === bidResult.length) {
                                    bidsDataArray = finalBidResult;
                                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails, bidsDataArray: bidsDataArray, bidcount: bidResult.length });
                                }
                            });
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
    let {
        user_id, title, category, sub_category,
        max_price, min_price, duration, description,
        duration_type, nda_status, file, email
    } = request.body;

    if (!user_id || !title || !category || !sub_category || !max_price || !min_price || !duration || !description || !duration_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }

    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type = 1";
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

            const checkNda = 'SELECT price FROM nda_price_master WHERE delete_flag = 0';
            connection.query(checkNda, async (infoErr, infoRes) => {
                if (infoErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: infoErr.message });
                }

                var nda_price = infoRes[0].price;
                const wallet_amount = await getUserTotalWallet(user_id);

                if (nda_status == 1 && wallet_amount < nda_price) {
                    return response.status(200).json({ success: false, msg: languageMessage.NdaAmountErr });
                }



                const newUserQuery = `
                    INSERT INTO job_post_master 
                    (user_id, title, category, sub_category, max_price, min_price, duration, description, duration_type, nda_status, email, createtime, updatetime)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                `;
                const values = [user_id, title, category, sub_category, max_price, min_price, duration, description, duration_type, nda_status, email];

                connection.query(newUserQuery, values, async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.jobPostCreatedError, key: err });
                    }

                    // Handle file insertion
                    if (file) {
                        const fileArray = Array.isArray(file) ? file : file.split(",");
                        const filePromises = fileArray.map((fileName) => {
                            return new Promise((resolve, reject) => {
                                const fileInsertQuery = `
                                    INSERT INTO job_file_master (file_name, delete_flag, createtime, updatetime, job_id) 
                                    VALUES (?, 0, NOW(), NOW(), ?)
                                `;
                                connection.query(fileInsertQuery, [fileName.trim(), result.insertId], (err, res) => {
                                    if (err) reject(err);
                                    else resolve(fileName.trim());
                                });
                            });
                        });

                        try {
                            await Promise.all(filePromises);
                        } catch (error) {
                            console.error("Error inserting files:", error);
                        }
                    }
                    const now = new Date();
                    if (nda_status == 1) {
                        const debitWallet = 'INSERT INTO wallet_master (user_id, amount, status, type, createtime, updatetime) VALUES(?, ?, 1,2,?,?)';
                        connection.query(debitWallet, [user_id, nda_price, now, now], async (walletErr, walletRes) => {
                            if (walletErr) {
                                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: walletErr.message });
                            }
                        });
                    }

                    const jobDetailQuery = `
                        SELECT jm.job_post_id, jm.title, jm.category, jm.sub_category, jm.max_price, jm.min_price, 
                               jm.duration, jm.description, jm.duration_type, jm.nda_status, jm.createtime, jm.email 
                        FROM job_post_master jm 
                        WHERE jm.job_post_id = ? AND jm.delete_flag = 0
                    `;
                    connection.query(jobDetailQuery, [result.insertId], (err, result1) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.dataNotFound, key: err.message });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.jobPostCreated, jobPostDataArray: result1[0] });
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.jobPostCreatedError, key: err.message });
    }
};

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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            // Prepare query for experts
            let query2 = `
                SELECT user_id as expert_id 
                FROM user_master 
                WHERE delete_flag = 0 AND active_flag = 1 AND user_type = 2 and expert_status=1`;
            // let query2 = `
            // SELECT um.user_id AS expert_id
            // FROM user_master um
            // JOIN expert_subscription_master esm ON um.user_id = esm.expert_id
            // JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id
            // WHERE 
            //     um.delete_flag = 0 
            //     AND um.user_type = 2 
            //     AND um.active_flag = 1 
            //     AND um.expert_status = 1
            //     AND esm.delete_flag = 0
            //     AND sm.delete_flag = 0
            //     AND DATE_ADD(esm.createtime, INTERVAL sm.duration DAY) >= NOW()
            // GROUP BY um.user_id
            // `;
            let value2 = [];
            if (state) {
                query2 += " AND state = ?";
                value2.push((state));
            }
            if (city) {
                query2 += " AND city = ?";
                value2.push((city));
            }
            if (category) {
                query2 += " AND category = ?";
                value2.push((category));
            }
            if (sub_category) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
    let { user_id, recharge_amount, transaction_id } = request.body;
    if (!user_id || !recharge_amount || !transaction_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    const type = 1;
    const status = 0;

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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            let finalWallet;
            if (type == 0) {
                finalWallet = parseFloat(result[0].wallet_balance) + parseFloat(recharge_amount);
            }
            else if (type == 1) {
                finalWallet = parseFloat(result[0].wallet_balance) - parseFloat(recharge_amount);
            }

            const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

            const newUserQuery = `
            INSERT INTO wallet_master (user_id,type,amount,wallet_balance,createtime,status,payment_transaction_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
            const values = [user_id, type, recharge_amount, finalWallet, now, status, transaction_id]
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

                        const userDetails = await getUserDetails(user_id);
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            let wallet = [];
            const userDetails = await getUserDetails(user_id);
            const query2 = "SELECT transition_id, payment_transaction_id, expert_id, amount, createtime, status, type, user_id FROM wallet_master WHERE user_id = ? AND delete_flag = 0 ORDER BY createtime DESC";
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
                            if (err || result.length == 0) {
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
                        // posted_time: moment(Item.createtime).format("MMM DD YYYY hh:mm A"),
                        // time: moment(Item.createtime).format("hh:mm A"),
                        posted_time: moment(Item.createtime).add(5, 'hours').add(30, 'minutes').format("MMM DD YYYY hh:mm A"),
                        time: moment(Item.createtime).add(5, 'hours').add(30, 'minutes').format("hh:mm A"),
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
    let { user_id, job_post_id, expert_id, bid_id } = request.body;
    if (!user_id || !job_post_id || !expert_id || !bid_id) {
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const checkJob = "SELECT job_post_id FROM job_post_master WHERE user_id = ? AND delete_flag = 0 AND job_post_id=?";
            const jobvalues = [user_id, job_post_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }

                const newUserQuery = `UPDATE job_post_master  SET assign_expert_id = ?, status = 1,updatetime=NOW() WHERE job_post_id = ? and user_id=?`;
                connection.query(newUserQuery, [expert_id, job_post_id, user_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.expertHireUnsuccess, key: err });
                    }
                    if (result.affectedRows > 0) {
                        const checkJobbid = "SELECT bid_id FROM bid_master WHERE delete_flag = 0 AND job_post_id=? and expert_id=? and bid_id=?";
                        const jobbidvalues = [job_post_id, expert_id, bid_id];
                        connection.query(checkJobbid, jobbidvalues, (err, bidResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.jobBidNotFound, key: err.message });
                            }
                            if (bidResult.length === 0) {
                                return response.status(404).json({ success: false, msg: languageMessage.jobBidNotFound });
                            }
                            const bidQuery = `UPDATE bid_master  SET status = 1,updatetime=NOW() WHERE job_post_id = ? and bid_id=? and expert_id=?`;
                            connection.query(bidQuery, [job_post_id, bid_id, expert_id], async (err, resultbid) => {
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
                                    const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                                    await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                                        let notification_arr_check_new = [notification_arr_check];

                                        if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                            const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                                        } else {
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const chatSql = 'DELETE FROM chat_status_master WHERE user_id = ? '
            connection.query(chatSql, [user_id], async (chatErr, chatRes) => {
                if (chatErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: chatErr.message });
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
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, total_expert_earning: total_expert_earning.toString() });
                    });
                });
            });
        })
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//end
//make withdraw request
const withdrawRequest = async (request, response) => {
    let { user_id, withdraw_amount, withdraw_message } = request.body;
    if (!user_id || !withdraw_amount) {
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
            const sqlQuery = 'SELECT mini_withdrawal_amt FROM commission_master WHERE delete_flag = 0';
            connection.query(sqlQuery, async (infoErr, infoRes) => {
                if (infoErr) {
                    return response.status(200).json({ success: fasle, msg: languageMessage.internalServerError, error: infoErr.message });
                }
                let minimum_amount = parseInt(infoRes[0].mini_withdrawal_amt);

                const query2 = `SELECT SUM(expert_earning) AS partial_expert_earning FROM expert_earning_master WHERE expert_id = ?`;
                connection.query(query2, [user_id], async (err1, result1) => {
                    if (err1) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err1.message });
                    }
                    const partialEarning = result1[0]?.partial_expert_earning;
                    const query3 = `SELECT SUM(withdraw_amount) AS total_withdraw_amount FROM expert_withdraw_master WHERE expert_id = ? AND withdraw_status=1 AND delete_flag = 0`;
                    connection.query(query3, [user_id], async (err2, result2) => {
                        if (err2) {
                            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err2.message });
                        }
                        const withdraws = result2[0]?.total_withdraw_amount;
                        const total_expert_earning = parseInt(partialEarning - withdraws);
                        // return response.status(200).json({ success: false, msg: languageMessage.internalServerError, partialEarning,  withdraws, total_expert_earning, });

                        // if (total_expert_earning >= 10000) {
                        if (withdraw_amount == minimum_amount) {
                            const newUserQuery = `INSERT INTO expert_withdraw_master (expert_id,withdraw_amount,withdraw_message,createtime,updatetime)VALUES (?,?,?,NOW(),NOW())`;
                            const values = [user_id, withdraw_amount, withdraw_message]
                            connection.query(newUserQuery, values, async (err, requestresult) => {
                                if (err) {
                                    return response.status(200).json({ success: false, msg: languageMessage.withdrawSendError, key: err });
                                }
                                const userDetails = await getUserDetails(user_id);
                                return response.status(200).json({ success: true, msg: languageMessage.withdrawSend, userDetails: userDetails });
                            });
                        }
                        else {
                            return response.status(200).json({ success: false, msg: [`${languageMessage.MinimumWithdrawalAmount} ₹ ${minimum_amount}`] });
                        }
                        // }
                        // else {
                        //     return response.status(200).json({ success: false, msg: languageMessage.CannotWithdraw })
                        // }
                    });
                })
            })
        })
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT expert_withdraw_id, expert_id, withdraw_status, withdraw_amount, total_earning_amount, withdraw_message, earning_after_withdraw,createtime, reason FROM expert_withdraw_master WHERE expert_id = ? order by expert_withdraw_id desc";
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
                        // posted_time: moment(Item.createtime).format("MMM DD YYYY"),
                        // time: moment(Item.createtime).format("hh:mm A"),
                        posted_time: moment(Item.createtime).add(5, 'hours').add(30, 'minutes').format("MMM DD YYYY"),
                        time: moment(Item.createtime).add(5, 'hours').add(30, 'minutes').format("hh:mm A"),
                        status_label: '	0=pending 1=approved 2=reject',
                    };
                }));
                if (finalBidResult.length === 0) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query1 = "SELECT expert_earning_id, total_amount, admin_commission_amount, commission_percentage, expert_earning, invoice_url, transition_id, createtime,type,user_id FROM expert_earning_master WHERE expert_id = ?  ORDER BY createtime DESC";
            const values1 = [user_id];

            connection.query(query1, values1, async (err, earningresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (earningresult.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, earning_history: 'NA' });
                }

                const query2 = `SELECT SUM(expert_earning) AS partial_expert_earning FROM expert_earning_master WHERE expert_id = ?`;
                connection.query(query2, [user_id], async (err2, result2) => {
                    if (err2) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    const partialEarning = result2[0]?.partial_expert_earning;
                    const query2 = `SELECT SUM(withdraw_amount) AS total_withdraw_amount FROM expert_withdraw_master WHERE expert_id = ? AND withdraw_status=1`;
                    connection.query(query2, [user_id], async (err3, result3) => {
                        if (err3) {
                            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err3.message });
                        }
                        const withdraws = result3[0]?.total_withdraw_amount;
                        const total_expert_earning = partialEarning - withdraws;

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
                                // posted_time: moment(Item.createtime).format("MMM DD YYYY hh:mm A"),
                                // time: moment(Item.createtime).format("hh:mm A"),
                                posted_time: moment(Item.createtime).add(5, 'hours').add(30, 'minutes').format("MMM DD YYYY hh:mm A"),
                                time: moment(Item.createtime).add(5, 'hours').add(30, 'minutes').format("hh:mm A"),
                                type_label: "0=milestone,1=consultant,2=subscription",
                                user_name: userDetails.name,
                                user_image: userDetails.image,
                            };
                        }));
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, total_expert_earning: total_expert_earning.toString(), earning_history: finalBidResult, });
                    });
                });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
        const query1 = `SELECT mobile, active_flag, image FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type = 2`;
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
            const expert_image = result[0].image ? result[0].image : "NA";
            const rating_bar = await getRatingBarAvg(user_id);
            const query2 = `SELECT rating_id, user_id, rating, review, createtime FROM rating_master WHERE expert_id = ? AND delete_flag = 0 ORDER BY createtime DESC`;
            connection.query(query2, [user_id], (err, historyPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (historyPosts.length === 0) {
                    //return response.status(200).json({ success: true, msg: languageMessage.dataFound });
                    var rating_bar_new = [
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
                    var total_review_count = 0;
                    var avg_rating = "0.0";
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, historyPosts: 'NA', rating_bar: rating_bar_new, total_review_count, avg_rating: avg_rating, expert_image });
                }
                var total_review_count = 0;
                var avg_rating = 0;
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
                                    resolve(results); // Return the first reply
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
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, historyPosts: combinedHistoryPosts, rating_bar, total_review_count, avg_rating: get_avg_rating.toFixed(1), expert_image });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            // const checkSubscription = `SELECT esm.createtime, sm.duration FROM expert_subscription_master esm JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id WHERE esm.expert_id = ? AND sm.delete_flag = 0 AND esm.delete_flag = 0 ORDER BY esm.createtime DESC LIMIT 1`;

            // connection.query(checkSubscription, [user_id], async (subErr, subRes) => {
            //     if (subErr) {
            //         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: subErr.message });
            //     }

            //     if (subRes.length > 0) {
            //         const { createtime, duration } = subRes[0];

            //         const expiryDate = new Date(createtime);
            //         expiryDate.setDate(expiryDate.getDate() + duration);

            //         const now = new Date();
            //         if (now > expiryDate) {
            //             return response.status(200).json({ success: false, msg: languageMessage.SubscriptionExpired });
            //         }
            //     }

            const query2 = `
                SELECT job_post_id, user_id,assign_expert_id, title, category, sub_category, max_price, min_price, duration, duration_type, status, updatetime
                ,createtime FROM job_post_master 
                WHERE assign_expert_id = ? AND delete_flag = 0 ORDER BY createtime DESC`;
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
                            duration_type_label: '1=days,2=month,3=year',
                            user_name: userNameQuery,
                            user_image: userimageQuery,
                        };
                    })
                );
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: jobPostDetails });
            });
        });
        // })
    } catch (err) {
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
        const userQuery = `
            SELECT mobile, active_flag FROM user_master 
            WHERE user_id = ? AND delete_flag = 0 AND user_type = 2
        `;
        connection.query(userQuery, [user_id], (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            // Check if the free subscription was already used and expired
            const checkFreeSubscription = `
                SELECT esm.createtime, sm.duration 
                FROM expert_subscription_master esm 
                JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id 
                WHERE esm.expert_id = ? AND sm.plan_type = 0 AND esm.delete_flag = 0
                ORDER BY esm.createtime DESC LIMIT 1
            `;

            connection.query(checkFreeSubscription, [user_id], (freeErr, freeResult) => {
                let excludeFree = false;

                if (freeErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: freeErr.message });
                }

                if (freeResult.length > 0) {
                    // const { createtime, duration } = freeResult[0];
                    // const expiryDate = new Date(createtime);
                    // expiryDate.setDate(expiryDate.getDate() + duration);

                    // if (new Date() > expiryDate) {
                    excludeFree = true; // free plan expired, so exclude it
                    // }
                }

                // Now fetch all subscription plans, optionally excluding free one
                const planQuery = excludeFree
                    ? `SELECT subscription_id, amount, description, duration, plan_type, createtime 
                       FROM subscription_master 
                       WHERE delete_flag = 0 AND plan_type != 0 
                       ORDER BY plan_type ASC`
                    : `SELECT subscription_id, amount, description, duration, plan_type, createtime 
                       FROM subscription_master 
                       WHERE delete_flag = 0 
                       ORDER BY plan_type ASC`;

                connection.query(planQuery, (planErr, plans) => {
                    if (planErr) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: planErr.message });
                    }
                    if (plans.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.dataNotFound, subscriptionPlanDetails: 'NA' });
                    }

                    return response.status(200).json({
                        success: true,
                        msg: languageMessage.dataFound,
                        subscriptionPlanDetails: plans,
                        plan_type_label: '0=free, 1=premium, 2=standard',
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};



const buySubscription = (request, response) => {
    let { user_id, subscription_id, transaction_id } = request.body;
    if (!user_id || !subscription_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (!transaction_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'transaction_id' });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                // const transaction_id = '123456';
                const status = 1;
                const amount = subscriptions[0].amount;
                const duration = subscriptions[0].duration;
                const plan_type = subscriptions[0].plan_type;
                enddate.setMonth(startdate.getMonth() + subscriptions[0].duration);
                const subscriptionQuery = `INSERT INTO expert_subscription_master(expert_id,subscription_id,amount,start_date,end_date,transaction_id,status,duration,plan_type,createtime,updatetime)
                VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())`;
                const values = [user_id, subscription_id, amount, startdate, enddate, transaction_id, status, duration, plan_type]
                connection.query(subscriptionQuery, values, async (err, buyresult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.buySubscriptionUnsuccess, key: err });
                    }
                    if (buyresult.affectedRows > 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.buySubscriptionSuccess });
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
    let { user_id, rating_id, message } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!rating_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'rating_id' });
    }
    if (!message) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'message' });
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
            const newUserQuery = `INSERT INTO rating_reply_master (expert_id,rating_id,reply_message,createtime,updatetime)
            VALUES (?, ?, ?, NOW(),NOW())`;
            const values = [user_id, rating_id, message]
            connection.query(newUserQuery, values, async (err, result) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err });
                }
                return response.status(200).json({ success: true, msg: languageMessage.replySentSuccess });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.replySentUnsuccess, key: err.message });
    }
}
//end
//rate now expert
const rateExpert = async (request, response) => {
    let { user_id, expert_id, rating, review } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!expert_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'expert_id' });
    }
    if (!rating) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'rating' });
    }
    if (!review) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'review' });
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const user_name = result[0].name ? result[0].name : "NA";
            const newUserQuery = `INSERT INTO rating_master(user_id,expert_id,rating,review,createtime,updatetime)
            VALUES (?, ?, ?,?, NOW(),NOW())`;
            const values = [user_id, expert_id, rating, review]
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
                const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                    let notification_arr_check_new = [notification_arr_check];

                    if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                        const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                    } else {
                        console.log("Notification array is empty");
                    }

                });
                return response.status(200).json({ success: true, msg: languageMessage.ratingSentSuccess });
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                            // const formattedTime = moment(record.createtime).format("MMM DD YYYY hh:mm A");
                            const formattedTime = moment(record.createtime)
                                .add(5, 'hours')
                                .add(30, 'minutes')
                                .format("MMM DD YYYY hh:mm A");
                            call_history.push({
                                ...record,
                                createtime: formattedTime,
                                type_label: '1=video, 2=voice',
                                status_label: '0-pending,1-start,2-completed,3=rejected',
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                            const formattedTime = moment(record.createtime)
                                .add(5, 'hours')
                                .add(30, 'minutes')
                                .format("MMM DD YYYY hh:mm A");

                            call_history.push({
                                ...record,
                                createtime: formattedTime,
                                type_label: '1=video,2=voice',
                                status_label: '0-pending,1-start,2-completed,3=rejected',
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
    } catch (err) {
        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// exper bid on job
const ExpertBidJob = async (request, response) => {
    let { user_id, job_post_id, duration, price, duration_type, pdf_file, nda_file } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!job_post_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'job_post_id' });
    }
    if (!duration) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'duration' });
    }
    if (!price) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'price' });
    }
    if (!duration_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'duration_type' });
    }
    // let pdf_file = null;
    // let nda_file = null;
    // if (request.files && request.files['pdf_file']) {
    //     pdf_file = request.files['pdf_file'][0].filename;
    // }
    // if (request.files && request.files['nda_file']) {
    //     nda_file = request.files['nda_file'][0].filename;
    // }

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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                VALUES (?,?,?,?,?,?,?,NOW(),NOW())`;
                const values = [job_post_id, user_id, price, duration, pdf_file, nda_file, duration_type]
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
                    const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                    await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                        let notification_arr_check_new = [notification_arr_check];

                        if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                            const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                        } else {
                            console.log("Notification array is empty");
                        }

                    });
                    return response.status(200).json({ success: true, msg: languageMessage.bidSentSuccess });
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
        const query1 = "SELECT mobile, active_flag, expert_status FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
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
            if (result[0].expert_status === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.ExpertRequestNotApproved })
            }

            if (result[0].expert_status === 2) {
                return response.status(200).json({ success: false, msg: languageMessage.ExpertRejected });
            }

            const checkSubscription = `
SELECT esm.createtime, sm.duration 
FROM expert_subscription_master esm 
JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id 
WHERE esm.expert_id = ? AND sm.delete_flag = 0 AND esm.delete_flag = 0
ORDER BY esm.createtime DESC LIMIT 1
`;
            connection.query(checkSubscription, [user_id], async (subErr, subRes) => {
                if (subErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: subErr.message });
                }

                // if (subRes.length > 0) {
                //     const { createtime, duration } = subRes[0];
                //     const expiryDate = new Date(createtime);
                //     expiryDate.setDate(expiryDate.getDate() + duration);

                //     const now = new Date();
                //     if (now >= expiryDate) {
                //         return response.status(200).json({ success: false, msg: languageMessage.SubscriptionExpired });
                //     }
                // }
                if (subRes.length > 0) {
                    const { createtime, duration } = subRes[0]; // duration is in days
                    const createdAt = new Date(createtime);
                    const expiryDate = new Date(createdAt.getTime() + duration * 24 * 60 * 60 * 1000); // Add full days in milliseconds

                    const now = new Date();
                    if (now > expiryDate) {
                        return response.status(200).json({ success: false, msg: languageMessage.SubscriptionExpired });
                    }
                }
                const jobPostDetails = await getHomeExpertJob(user_id);
                const completedJobDetails = await getHomeExpertCompletedJob(user_id);
                const userjobPost = await getHomeExpertUserJob(user_id);
                const userjobPostCount = await getHomeUserJobCount();
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: jobPostDetails, userjobPost: userjobPost, userjobPostCount: userjobPostCount, completedJobDetails: completedJobDetails })

            });
        })
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//book mark job
const bookMarkJob = async (request, response) => {
    let { user_id, job_post_id, type } = request.body;
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                if (type == 0) {
                    const bookMarkQuery = `INSERT INTO job_bookmark_master(expert_id,job_post_id,createtime,updatetime)
                    VALUES (?,?,NOW(),NOW())`;
                    connection.query(bookMarkQuery, [user_id, job_post_id], async (err, result) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.bookMarkUnsuccess, key: err });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.bookMarkSuccess });
                    });
                } else {
                    const bookMarkQuery = `DELETE FROM job_bookmark_master WHERE expert_id=? and job_post_id=?`;
                    connection.query(bookMarkQuery, [user_id, job_post_id], async (err, result) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.jobUnsaveUnsuccess, key: err });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.jobSaveSuccess });
                    });
                }

            });
        });
    } catch (err) {
        if (type == 0) {
            return response.status(200).json({ success: false, msg: languageMessage.bookMarkUnsuccess, key: err.message });
        } else {
            return response.status(200).json({ success: false, msg: languageMessage.jobUnsaveUnsuccess, key: err.message });
        }

    }
}
//report on job
const reportOnJob = async (request, response) => {
    let { user_id, job_post_id, reason } = request.body;
    if (!user_id || !job_post_id || !reason) {
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
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
                VALUES (?,?,?,?,NOW(),NOW())`;
                connection.query(bookMarkQuery, [user_id, job_post_id, 0, reason], async (err, result) => {
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
    const { user_id, category, sub_category } = request.body;
    if (!user_id || !category || !sub_category) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }


            const userjobPost = await getCustomerJobFilter(user_id, category, sub_category);

            return response.status(200).json({ success: true, msg: languageMessage.dataFound, userjobPost: userjobPost })

        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//get expert job fiter
const expertJobFilter = (request, response) => {
    const { user_id, category, sub_category } = request.body;
    if (!user_id || !category || !sub_category) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }


            const userjobPost = await getExpertJobFilter(user_id, category, sub_category);

            return response.status(200).json({ success: true, msg: languageMessage.dataFound, userjobPost: userjobPost })

        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//create Job Cost
const createJobCost = async (request, response) => {
    let { user_id, job_post_id, project_cost } = request.body;
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            const checkJob = "SELECT job_post_id FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and user_id = ? and assign_expert_id!=0";
            const jobvalues = [job_post_id, user_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                const bookMarkQuery = `UPDATE job_post_master SET project_cost = ?, updatetime = NOW(),status=2 WHERE job_post_id=? and user_id = ?`;
                connection.query(bookMarkQuery, [project_cost, job_post_id, user_id], async (err, result) => {
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
    let { user_id, job_post_id, title, amount, duration, description, duration_type, pdf_file } = request.body;
    // return response.status(200).json({ "check": request.body})
    if (!user_id || !job_post_id || !title || !description || !amount || !duration || !duration_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }


    try {
        const query1 = "SELECT name,mobile, active_flag, wallet_balance FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, async (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const user_name = userResult[0].name;
            const checkJob = "SELECT job_post_id,title,assign_expert_id FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and user_id = ? and assign_expert_id!=0";
            const jobvalues = [job_post_id, user_id];
            connection.query(checkJob, jobvalues, async (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }
                const project_title = jobResult[0].title;
                const other_user_id = jobResult[0].assign_expert_id;
                let milestone_number = await generateOTP(4);
                const wallet_amount = await getUserTotalWallet(user_id);

                if (wallet_amount < amount) {
                    return response.status(200).json({ success: false, msg: languageMessage.WalletbalanceInvalid })
                }

                const bookMarkQuery = `INSERT INTO milestone_master(job_post_id,price,duration,description,file,title,duration_type, milestone_number, createtime,updatetime)
                VALUES (?,?,?,?,?,?,?,?,NOW(),NOW())`;
                connection.query(bookMarkQuery, [job_post_id, amount, duration, description, pdf_file, title, duration_type, milestone_number], async (err, result) => {
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
                    const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                    await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                        let notification_arr_check_new = [notification_arr_check];

                        if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                            const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                        } else {
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
    const { user_id, job_post_id } = request.query;
    if (!user_id || !job_post_id) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const jobMilestone = await getJobMilestone(job_post_id);
            const jobWorkSpace = await getJobWorkSpace(job_post_id);
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobWorkSpace: jobWorkSpace, jobMilestone: jobMilestone });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}

//update 
const acceptRejectMilestone = async (request, response) => {
    let { user_id, milestone_id, type, reject_reason } = request.body;
    if (!user_id || !milestone_id || !type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (type == 2) {
        if (!reject_reason) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, reject_reason: 'reject_reason' });
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const user_name = userResult[0].name;
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
                const jobvalues = [milestoneResult[0].job_post_id, user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                    }
                    const project_title = jobResult[0].title;
                    let updateMilestone;
                    let updateValue;
                    if (type == 1) {
                        updateMilestone = `UPDATE milestone_master SET milestone_status=?,updatetime = NOW() WHERE milestone_id=?`;
                        updateValue = [type, milestone_id];
                    } else {
                        updateMilestone = `UPDATE milestone_master SET milestone_status=?,reject_reason=?,updatetime = NOW() WHERE milestone_id=?`;
                        updateValue = [type, reject_reason, milestone_id];
                    }
                    connection.query(updateMilestone, updateValue, async (err, updateResult) => {
                        if (err) {
                            if (type == 1) {
                                return response.status(200).json({ success: false, msg: languageMessage.WorkAcceptUnsuccess, key: err });
                            } else {
                                return response.status(200).json({ success: false, msg: languageMessage.WorkRejectUnsuccess, key: err });
                            }

                        }
                        const user_id_notification = user_id;
                        const other_user_id_notification = jobResult[0].user_id;
                        const action_id = milestone_id;
                        let action;
                        let title;
                        let messages;
                        if (type == 1) {
                            action = "accept_milestone";
                            title = "Milestone Accepted";
                            messages = `${user_name} has accepted work space for the project ${project_title}`;
                        } else {
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
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];

                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                            } else {
                                console.log("Notification array is empty");
                            }

                        });
                        if (type == 1) {
                            return response.status(200).json({ success: true, msg: languageMessage.WorkAcceptSuccess });
                        } else {
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
    let { user_id, milestone_id } = request.body;
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const user_name = userResult[0].name;
            const checkMilestone = "SELECT job_post_id FROM milestone_master WHERE delete_flag = 0 AND milestone_id=? and milestone_status=7";
            const milestonevalues = [milestone_id];
            connection.query(checkMilestone, milestonevalues, (err, milestoneResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.WorkSpaceNotFound, key: err.message });
                }
                if (milestoneResult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.WorkSpaceNotFound });
                }
                const checkJob = "SELECT user_id,title FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and assign_expert_id=?";
                const jobvalues = [milestoneResult[0].job_post_id, user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.jobNotFound });
                    }
                    const project_title = jobResult[0].title;

                    const updateMilestone = `UPDATE milestone_master SET milestone_status=3,updatetime = NOW() WHERE milestone_id=?`;
                    const updateValue = [milestone_id];

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
                        const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                        await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                            let notification_arr_check_new = [notification_arr_check];

                            if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                            } else {
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
    let { user_id, milestone_id, type, cancel_reason, dispute_title, dispute_description, dispute_amount, dispute_file } = request.body;
    if (!user_id || !milestone_id || !type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    if (type == 6) {
        if (!cancel_reason) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'cancel_reason' });
        }
    }
    if (type == 5) {
        if (!dispute_title) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'dispute_title' });
        }
        if (!dispute_description) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'dispute_description' });
        }
        if (!dispute_amount) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'dispute_amount' });
        }
        if (!dispute_file) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'dispute_file' });
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const user_name = userResult[0].name;
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
                const jobvalues = [milestoneResult[0].job_post_id, user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                    }

                    const project_title = jobResult[0].title;
                    var expert_id = jobResult[0].assign_expert_id
                    const sql = 'SELECT price FROM milestone_master WHERE milestone_id = ? AND delete_flag = 0';
                    connection.query(sql, [milestone_id], async (err, res) => {
                        var milestone_price = res[0].price;
                        const wallet_amount = await getUserTotalWallet(user_id);

                        let updateMilestone;
                        let updateValue;
                        if (type == 4) {

                            if (wallet_amount < milestone_price) {
                                return response.status(200).json({ success: false, msg: languageMessage.WalletbalanceInvalid });
                            } else {
                                updateMilestone = `UPDATE milestone_master SET milestone_status=?,updatetime = now() WHERE milestone_id=?`;
                                updateValue = [type, milestone_id];
                            }


                        }
                        if (type == 5) {
                            updateMilestone = `UPDATE milestone_master SET milestone_status=?,dispute_title=?,dispute_description=?,dispute_amount=?,dispute_file=?,updatetime = now() WHERE milestone_id=?`;
                            updateValue = [type, dispute_title, dispute_description, dispute_amount, dispute_file, milestone_id];
                        }
                        if (type == 6) {
                            updateMilestone = `UPDATE milestone_master SET milestone_status=?,reject_reason=?,updatetime = now() WHERE milestone_id=?`;
                            updateValue = [type, cancel_reason, milestone_id];
                        }
                        connection.query(updateMilestone, updateValue, async (err, updateResult) => {
                            if (err) {
                                if (type == 4) {
                                    return response.status(200).json({ success: false, msg: languageMessage.milestoneReleaseUnsuccess, key: err.message });
                                }
                                if (type == 5) {
                                    return response.status(200).json({ success: false, msg: languageMessage.milestoneDisputeUnsuccess, key: err });
                                }
                                if (type == 6) {
                                    return response.status(200).json({ success: false, msg: languageMessage.milestoneCancelUnsuccess, key: err });
                                }

                            }
                            const user_id_notification = user_id;
                            const other_user_id_notification = jobResult[0].assign_expert_id;
                            const action_id = milestone_id;
                            let action;
                            let title;
                            let messages;
                            if (type == 4) {
                                action = "milestone_release";
                                title = "Milestone Release";
                                messages = `${user_name} has release milestone for the project ${project_title}`;
                            } if (type == 5) {
                                action = "milestone_dipute";
                                title = "Milestone Dispute";
                                messages = `${user_name} has dipute milestone for the project ${project_title}`;
                            }
                            if (type == 6) {
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
                            const action_data = { user_id: user_id_notification, other_user_id: other_user_id_notification, action_id: action_id, action: action };
                            await getNotificationArrSingle(user_id_notification, other_user_id_notification, action, action_id, title, title_2, title_3, title_4, messages, message_2, message_3, message_4, action_data, async (notification_arr_check) => {
                                let notification_arr_check_new = [notification_arr_check];

                                if (notification_arr_check_new && notification_arr_check_new.length !== 0 && notification_arr_check_new != '') {
                                    const notiSendStatus = await oneSignalNotificationSendCall(notification_arr_check_new);

                                } else {
                                    console.log("Notification array is empty");
                                }
                            });
                            if (type == 4) {

                                const fileInsertQuery = `INSERT INTO wallet_master(user_id, expert_id, amount,status,type, createtime,updatetime) VALUES (?,?,?, 1, 2, NOW(),NOW())`;
                                connection.query(fileInsertQuery, [user_id, expert_id, milestone_price], async (err, result1) => {
                                    if (err) {
                                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                                    }

                                    var expert_earning = await getExpertEarningg(milestone_id, user_id);
                                    return response.status(200).json({ success: true, msg: languageMessage.milestoneReleaseSuccess, expert_earning_id: expert_earning });
                                })
                            }
                            if (type == 5) {
                                return response.status(200).json({ success: true, msg: languageMessage.milestoneDisputeSuccess });
                            }
                            if (type == 6) {
                                return response.status(200).json({ success: true, msg: languageMessage.milestoneCancelSuccess });
                            }
                        });
                    });
                });
            });
        })
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            let check_hire_expert_id = 0;
            const query2 = `SELECT job_post_id, user_id, status, assign_expert_id, title, category, sub_category, max_price, min_price, duration, status, createtime, updatetime,description, duration_type,project_cost, email FROM job_post_master WHERE job_post_id = ? AND delete_flag = 0`;
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
                        let subCategory = 'NA';
                        const subCategoryQuery = "SELECT sub_category_name FROM sub_categories_master WHERE sub_category_id = ? AND delete_flag = 0";
                        subCategory = await new Promise((resolve) => {
                            connection.query(subCategoryQuery, [job.sub_category], (err, subresult) => {
                                if (err || !subresult || subresult.length === 0) {
                                    resolve('NA');
                                } else {
                                    resolve(subresult[0].sub_category_name);
                                }
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
                        const cityQuery = "SELECT city_name FROM city_master WHERE city_id = ? AND delete_flag = 0";
                        const city = await new Promise((resolve) => {
                            connection.query(cityQuery, [job.city], (err, cityresult) => {
                                resolve(err ? null : cityresult[0]?.city_name);
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
                        check_hire_expert_id = job.assign_expert_id;
                        let jobstatus = job.status <= 2 ? true : false;
                        return {

                            ...job, jobstatus,
                            sub_category: subCategory,
                            category: category,
                            city: city,
                            userName: userName,
                            userimage: userimage,
                            posted_time: getRelativeTime(job.createtime),
                            duration_type_labe: '1=days,2=month,3=year',
                            file_name: jobdocument,
                            // status: status,

                        };
                    })
                );
                // Fetch expert bid data
                let querybid;
                let bidValues;

                querybid = "SELECT bid_id, expert_id, price, duration, files, createtime,status,duration_type FROM bid_master WHERE job_post_id = ? AND delete_flag = 0 and expert_id=?";
                bidValues = [job_post_id, user_id];

                connection.query(querybid, bidValues, (err, bidResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    let bidsDataArray = 'NA';
                    if (bidResult.length === 0) {
                        return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails, bidsDataArray: bidsDataArray, bidcount: bidResult.length });
                    }
                    let finalBidResult = [];
                    let processedCount = 0;
                    bidResult.forEach((bidItem) => {
                        const expertQuery = "SELECT user_id, name, image FROM user_master WHERE delete_flag = 0 AND user_id = ?";
                        connection.query(expertQuery, [bidItem.expert_id], async (err, expertResult) => {
                            if (err) {
                                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                            }
                            const expertbidDetails = expertResult.length > 0 ? expertResult[0] : null;
                            const expert_name = expertResult[0].name;
                            const status_label = '0=pending,1=hired';
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
                                duration_type_labe: '1=days,2=month,3=year',
                                check_hire_expert_id: check_hire_expert_id
                            });
                            processedCount++;
                            if (processedCount === bidResult.length) {
                                bidsDataArray = finalBidResult;
                                return response.status(200).json({ success: true, msg: languageMessage.dataFound, expertDetails: jobPostDetails, bidsDataArray: bidsDataArray });
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
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
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


            const userDetails = await getUserDetails(user_id);

            return response.status(200).json({ success: true, msg: languageMessage.dataFound, userDetails: userDetails })

        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
const downloadApp = async (request, response) => {
    response.send(
        `
    <!DOCTYPE html>
    <html lang="en-US">
    <head>
        <title>XpertNow</title>
        <meta http-equiv="content-type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <section>
            <div class="btn-holder">
                <a class="btn" href="https://www.apple.com/in/app-store/" style="padding-left: 0;">
                    <img alt="" src="https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743657529575-appstore.png">
                </a>
                <a class="btn" href="https://play.google.com/store/apps">
                    <img alt="" src="https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743657283582-googleplay.png">
                </a>
            </div>
        </section>
    </body>
    </html>
  `
    );
};
const deepLink = async (request, response) => {
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
               launchApp: function(){
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
    const { user_id, state, city, category, sub_category, sub_category_level, experience, rating, sub_two_level_category_id, sub_three_level_category_id } = request.body;
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            // Prepare query for experts
            // let query2 = `SELECT user_id as expert_id FROM user_master WHERE delete_flag = 0 AND active_flag = 1 AND user_type = 2 and expert_status=1`;
            let query2 = `
            SELECT um.user_id AS expert_id
            FROM user_master um
            JOIN expert_subscription_master esm ON um.user_id = esm.expert_id
            JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id
            WHERE 
                um.delete_flag = 0 
                AND um.user_type = 2 
                AND um.active_flag = 1 
                AND um.expert_status = 1
                AND esm.delete_flag = 0
                AND sm.delete_flag = 0
                AND um.delete_flag = 0
                AND DATE_ADD(esm.createtime, INTERVAL sm.duration DAY) >= NOW()
            GROUP BY um.user_id
        `;
            let value2 = [];
            if (state) {
                query2 += " AND state = ?";
                value2.push((state));
            }
            if (city) {
                query2 += " AND city = ?";
                value2.push((city));
            }
            if (category) {
                query2 += " AND category = ?";
                value2.push((category));
            }
            if (sub_category) {
                query2 += " AND sub_category = ?";
                value2.push((sub_category));
            }
            if (sub_category_level) {
                query2 += " AND FIND_IN_SET(?, sub_category_level)";
                value2.push((sub_category_level));
            }
            if (experience) {
                query2 += " AND experience >= ? AND experience < ?";
                value2.push(Number(experience), Number(experience) + 1);
            }
            if (sub_two_level_category_id) {
                query2 += " AND sub_two_level_category_id = ?";
                value2.push((sub_two_level_category_id));
            }
            if (sub_three_level_category_id) {
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
    const { user_id } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
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


            const delete_query = "DELETE FROM `user_notification` WHERE user_id = ? AND delete_flag = 0";
            const delete_values = [user_id];
            connection.query(delete_query, delete_values, async (err, delete_result) => {
                return response.status(200).json({ success: true, msg: languageMessage.logOutSuccess });
            });

        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}
//chat file upload
const chatFileUpload = async (request, response) => {
    let { user_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (request.files && request.files['image']) {
        let files = Array.isArray(request.files['image']) ? request.files['image'] : [request.files['image']];
        const filePromises = files.map((f) => {
            return new Promise((resolve, reject) => {
                const fileInsertQuery = `INSERT INTO chat_file_master (file, createtime, updatetime) VALUES (?, NOW(), NOW())`;

                connection.query(fileInsertQuery, [f.filename], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(f.filename);
                    }
                });
            });
        });
        try {
            await Promise.all(filePromises);
            return response.status(200).json({ success: true, msg: languageMessage.fileUploadedSuccess });
        } catch (err) {
            return response.status(500).json({ success: false, msg: languageMessage.fileUploadedError, key: err.message });
        }
    } else {
        return response.status(400).json({ success: false, msg: "No files uploaded", key: 'image' });
    }
};
//end
// get expert completed job
const getExpertCompletedJobs = async (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const query2 = `
                SELECT job_post_id,user_id,title,category,sub_category,max_price,min_price,duration,duration_type,status, updatetime,createtime FROM job_post_master WHERE user_id = ? AND delete_flag = 0 AND status=3`;
            connection.query(query2, [user_id], async (err, jobPosts) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (jobPosts.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, jobPostDetails: 'NA' });
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
                            subcategory_id: job.sub_category,
                            sub_category: subCategory,
                            category_id: job.category,
                            category: category,
                            duration_type_label: '1=days,2=month,3=year',
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
// ADD Availability
const add_availability = (req, res) => {
    const { user_id, day, status } = req.body;
    if (!user_id) {
        return res.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "user_id" });
    }
    if (!day) {
        return res.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "day" });
    }
    if (!status) {
        return res.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "status" });
    }
    const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
    const values1 = [user_id];
    connection.query(query1, values1, async (err, result) => {
        if (err) {
            return res.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
        }
        if (result.length === 0) {
            return res.status(200).json({ success: false, msg: languageMessage.userNotFound });
        }
        if (result[0]?.active_flag === 0) {
            return res.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
        }
        const days = day.split(',').map(Number);
        const statuses = status.split(',').map(Number);
        const queries = days.map((day, index) => {
            return new Promise((resolve, reject) => {
                const currentStatus = statuses[index];
                const checkQuery = `SELECT availability_id FROM availability_master WHERE user_id = ? AND day = ?`;
                connection.query(checkQuery, [user_id, day], (err, results) => {
                    if (err) return reject(err);
                    const availabilityId = results.length > 0 ? results[0].availability_id : null;
                    if (availabilityId) {
                        // Update existing availability
                        const updateQuery = `UPDATE availability_master SET status = ?, updatetime = NOW() WHERE availability_id = ?`;
                        connection.query(updateQuery, [currentStatus, availabilityId], (updateErr) => {
                            if (updateErr) return reject(updateErr);
                            // Delete old slots only if status is 0
                            if (currentStatus === 0) {
                                const deleteSlotsQuery = `DELETE FROM slot_master WHERE availability_id = ?`;
                                connection.query(deleteSlotsQuery, [availabilityId], (deleteErr) => {
                                    if (deleteErr) return reject(deleteErr);
                                    insertSlots(availabilityId, req.body, day, resolve, reject);
                                });
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        // Insert new availability
                        const insertQuery = `INSERT INTO availability_master (user_id, day, status, createtime,updatetime) VALUES (?, ?, ?, NOW(),NOW())`;
                        connection.query(insertQuery, [user_id, day, currentStatus], (insertErr, insertResult) => {
                            if (insertErr) return reject(insertErr);
                            if (currentStatus === 0) {
                                insertSlots(insertResult.insertId, req.body, day, resolve, reject);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        });
        Promise.all(queries)
            // Promise.all(queries)
            .then(async () => {
                try {
                    // const updateAvailabilityStatus = `UPDATE user_master SET availability_status = 1,updatetime=NOW() WHERE user_id = ?`;
                    // // Convert connection.query to a Promise
                    // await new Promise((resolve, reject) => {
                    //     connection.query(updateAvailabilityStatus, [user_id], (updateErr) => {
                    //         if (updateErr) return reject(updateErr);
                    //         resolve();
                    //     });
                    // });
                    // // Fetch user data after updating
                    // const userDetails = await getUserDetails(user_id);
                    // Send response with updated user data
                    res.status(200).json({ success: true, msg: languageMessage.AvailibilityCreated });
                } catch (err) {
                    console.error("Error updating availability status:", err);
                    res.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
                }
            })
            .catch((err) => {
                console.error("Error:", err);
                res.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            });
    });
};


// function insertSlots(availabilityId, body, day, resolve, reject) {
//     const startTimes = body[`start_time_${day}`]?.split(",") || [];
//     const endTimes = body[`end_time_${day}`]?.split(",") || [];
//     const slotQueries = startTimes.map((start_time, index) => {
//         const end_time = endTimes[index];
//         if (start_time && end_time) {
//             const slotInsertQuery = `INSERT INTO slot_master(availability_id, start_time, end_time, updatetime,createtime) VALUES (?, ?, ?, NOW(),NOW())`;
//             return new Promise((slotResolve, slotReject) => {
//                 connection.query(slotInsertQuery, [availabilityId, start_time.trim(), end_time.trim()], (err) => {
//                     if (err) return slotReject(err);
//                     slotResolve();
//                 });
//             });
//         }
//     });
//     Promise.all(slotQueries).then(resolve).catch(reject);
// }








// new code updated
function insertSlots(availabilityId, body, day, resolve, reject) {
    const startTimes = body[`start_time_${day}`]?.split(",") || [];
    const endTimes = body[`end_time_${day}`]?.split(",") || [];

    const slotQueries = startTimes.map((start_time, index) => {
        const end_time = endTimes[index];

        if (start_time && end_time) {
            // Convert AM/PM to 24-hour format
            const convertTo24Hour = (timeStr) => {
                timeStr = timeStr.trim().toUpperCase();

                // Handle cases like "9:00AM" or "9:00 AM"
                timeStr = timeStr.replace(/(\d)(AM|PM)/i, '$1 $2');

                // Parse the time
                const [time, period] = timeStr.split(' ');
                let [hours, minutes] = time.split(':');

                hours = parseInt(hours, 10);
                minutes = minutes ? parseInt(minutes, 10) : 0;

                if (period === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (period === 'AM' && hours === 12) {
                    hours = 0;
                }

                // Format as HH:MM:SS
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
            };

            const start24 = convertTo24Hour(start_time);
            const end24 = convertTo24Hour(end_time);

            const slotInsertQuery = `INSERT INTO slot_master(availability_id, start_time, end_time, updatetime, createtime) 
                                   VALUES (?, ?, ?, NOW(), NOW())`;

            return new Promise((slotResolve, slotReject) => {
                connection.query(slotInsertQuery,
                    [availabilityId, start24, end24],
                    (err) => {
                        if (err) return slotReject(err);
                        slotResolve();
                    });
            });
        }
        return Promise.resolve();
    });

    Promise.all(slotQueries).then(resolve).catch(reject);
}




// EDIT Availability
const edit_availability = (req, res) => {
    const { user_id, day, status } = req.body;
    // Validate required fields
    if (!user_id) {
        return res.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "user_id" });
    }
    if (!day) {
        return res.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "day" });
    }
    if (!status) {
        return res.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "status" });
    }
    // Check if influencer exists and is active
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
            return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
        }
        // Parse days and statuses
        const days = day.split(',').map(Number);
        const statuses = status.split(',').map(Number);
        const createtime = new Date();
        // Collect promises for all DB operations
        const updatePromises = days.map((day, index) => {
            const currentStatus = statuses[index];
            return new Promise((resolve, reject) => {
                // Check if availability already exists
                const checkQuery = `SELECT availability_id FROM availability_master WHERE user_id = ? AND day = ?`;
                connection.query(checkQuery, [user_id, day], (err, results) => {
                    if (err) return reject(err);
                    if (results.length > 0) {
                        // Update existing availability
                        const availabilityId = results[0].availability_id;
                        const updateQuery = `UPDATE availability_master SET status = ?, updatetime = NOW() WHERE availability_id = ?`;
                        connection.query(updateQuery, [currentStatus, availabilityId], (updateErr) => {
                            if (updateErr) return reject(updateErr);
                            // If status is 0, update slots; otherwise, clear them
                            if (currentStatus === 0) {
                                clearAndInsertSlots(availabilityId, req.body, day).then(resolve).catch(reject);
                            } else {
                                clearSlots(availabilityId).then(resolve).catch(reject);
                            }
                        });
                    }
                    else {
                        // Insert new availability
                        const insertQuery = `INSERT INTO availability_master (user_id, day, status, createtime,updatetime) VALUES (?, ?, ?,NOW(),NOW())`;
                        connection.query(insertQuery, [user_id, day, currentStatus], (insertErr, insertResult) => {
                            if (insertErr) return reject(insertErr);
                            if (currentStatus === 0) {
                                clearAndInsertSlots(insertResult.insertId, req.body, day).then(resolve).catch(reject);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        });
        // Wait for all queries to complete
        Promise.all(updatePromises)
            .then(() => res.status(200).json({ success: true, msg: languageMessage.availabilityUpdated }))
            .catch((error) => {
                console.error("Error updating availability:", error);
                res.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
            });
    });
};


// function clearAndInsertSlots(availabilityId, body, day) {
//     return new Promise((resolve, reject) => {
//         clearSlots(availabilityId)
//             .then(() => {
//                 const startTimes = body[`start_time_${day}`]?.split(",") || [];
//                 const endTimes = body[`end_time_${day}`]?.split(",") || [];
//                 const createtime = new Date();
//                 const insertPromises = startTimes.map((start_time, index) => {
//                     const end_time = endTimes[index];
//                     if (start_time && end_time) {
//                         return new Promise((slotResolve, slotReject) => {
//                             const insertSlotQuery = `INSERT INTO slot_master (availability_id, start_time, end_time, createtime,updatetime) VALUES (?, ?, ?, NOW(),NOW())`;
//                             connection.query(insertSlotQuery, [availabilityId, start_time.trim(), end_time.trim()], (err) => {
//                                 if (err) return slotReject(err);
//                                 slotResolve();
//                             });
//                         });
//                     }
//                 });
//                 Promise.all(insertPromises).then(resolve).catch(reject);
//             })
//             .catch(reject);
//     });
// }

function clearSlots(availabilityId) {
    return new Promise((resolve, reject) => {
        const deleteSlotsQuery = `DELETE FROM slot_master WHERE availability_id = ?`;
        connection.query(deleteSlotsQuery, [availabilityId], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}


// new functions for clear and insert slots for 24 hour format ....
// function clearAndInsertSlots(availabilityId, body, day) {
//     return new Promise((resolve, reject) => {
//         clearSlots(availabilityId)
//             .then(() => {
//                 const startTimes = body[`start_time_${day}`]?.split(",") || [];
//                 const endTimes = body[`end_time_${day}`]?.split(",") || [];

//                 const insertPromises = startTimes.map((start_time, index) => {
//                     const end_time = endTimes[index];

//                     if (start_time && end_time) {
//                         return new Promise((slotResolve, slotReject) => {
//                             // Convert AM/PM to 24-hour format
//                             const convertTo24Hour = (timeStr) => {
//                                 timeStr = timeStr.trim().toUpperCase();

//                                 // Handle cases like "9:00AM" or "9:00 AM"
//                                 timeStr = timeStr.replace(/(\d)(AM|PM)/i, '$1 $2');

//                                 // Parse the time
//                                 const [time, period] = timeStr.split(' ');
//                                 let [hours, minutes] = time.split(':');

//                                 hours = parseInt(hours, 10);
//                                 minutes = minutes ? parseInt(minutes, 10) : 0;

//                                 if (period === 'PM' && hours !== 12) {
//                                     hours += 12;
//                                 } else if (period === 'AM' && hours === 12) {
//                                     hours = 0;
//                                 }

//                                 // Format as HH:MM
//                                 return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//                             };

//                             try {
//                                 const start24 = convertTo24Hour(start_time);
//                                 const end24 = convertTo24Hour(end_time);

//                                 const insertSlotQuery = `INSERT INTO slot_master 
//                                     (availability_id, start_time, end_time, createtime, updatetime) 
//                                     VALUES (?, ?, ?, NOW(), NOW())`;
//                                 connection.query(insertSlotQuery,
//                                     [availabilityId, start24, end24],
//                                     (err) => {
//                                         if (err) return slotReject(err);
//                                         slotResolve();
//                                     }
//                                 );
//                             } catch (err) {
//                                 slotReject(err);
//                             }
//                         });
//                     }
//                     return Promise.resolve();
//                 });

//                 Promise.all(insertPromises)
//                     .then(resolve)
//                     .catch(reject);
//             })
//             .catch(reject);
//     });
// }




//  new functioin for not rmeoving other slots 
function clearAndInsertSlots(availabilityId, body, day) {
    return new Promise((resolve, reject) => {
        const startTimes = body[`start_time_${day}`]?.split(",") || [];
        const endTimes = body[`end_time_${day}`]?.split(",") || [];

        const insertPromises = startTimes.map((start_time, index) => {
            const end_time = endTimes[index];

            if (start_time && end_time) {
                return new Promise((slotResolve, slotReject) => {
                    // Convert AM/PM to 24-hour format
                    const convertTo24Hour = (timeStr) => {
                        timeStr = timeStr.trim().toUpperCase();

                        // Handle cases like "9:00AM" or "9:00 AM"
                        timeStr = timeStr.replace(/(\d)(AM|PM)/i, '$1 $2');

                        // Parse the time
                        const [time, period] = timeStr.split(' ');
                        let [hours, minutes] = time.split(':');

                        hours = parseInt(hours, 10);
                        minutes = minutes ? parseInt(minutes, 10) : 0;

                        if (period === 'PM' && hours !== 12) {
                            hours += 12;
                        } else if (period === 'AM' && hours === 12) {
                            hours = 0;
                        }

                        // Format as HH:MM
                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    };

                    try {
                        const start24 = convertTo24Hour(start_time);
                        const end24 = convertTo24Hour(end_time);

                        const insertSlotQuery = `INSERT INTO slot_master 
                            (availability_id, start_time, end_time, createtime, updatetime) 
                            VALUES (?, ?, ?, NOW(), NOW())`;
                        connection.query(insertSlotQuery,
                            [availabilityId, start24, end24],
                            (err) => {
                                if (err) return slotReject(err);
                                slotResolve();
                            }
                        );
                    } catch (err) {
                        slotReject(err);
                    }
                });
            }
            return Promise.resolve();
        });

        Promise.all(insertPromises)
            .then(resolve)
            .catch(reject);
    });
}



















// get available slots
// const get_available_slots = (request, response) => {
//     const { user_id } = request.query;
//     try {
//         if (!user_id) {
//             return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "user_id" });
//         }
//         const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
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
//             const getAvailableSlotsQuery = `SELECT a.availability_id,a.day, a.status,s.slot_id, s.start_time, s.end_time FROM availability_master AS a LEFT JOIN slot_master AS s ON s.availability_id = a.availability_id WHERE a.user_id = ? AND a.delete_flag = 0`;
//             connection.query(getAvailableSlotsQuery, [user_id], (err, slots) => {
//                 if (err) {
//                     return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
//                 }
//                 if (slots.length === 0) {
//                     const dateList = [
//                         {
//                             "id": 0,
//                             "day": "Mo",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                         {
//                             "id": 1,
//                             "day": "Tu",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                         {
//                             "id": 2,
//                             "day": "We",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                         {
//                             "id": 3,
//                             "day": "Th",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                         {
//                             "id": 4,
//                             "day": "Fr",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                         {
//                             "id": 5,
//                             "day": "Sa",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                         {
//                             "id": 6,
//                             "day": "Su",
//                             "addtime": [],
//                             "status": "1",
//                         },
//                     ];
//                     return response.status(200).json({ success: true, msg: languageMessage.dataFound, available_slots: dateList });
//                 }
//                 // Format the response to group slots by day
//                 const available_slots = slots.reduce((acc, slot) => {
//                     const { availability_id, day, status, slot_id, start_time, end_time } = slot;
//                     let dayEntry = acc.find(item => item.id === day);

//                     const dayMap = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
//                     const dayAbbreviation = dayMap[day];

//                     // Function to get the next occurrence of a specific weekday (0 = Monday, ..., 6 = Sunday)
//                     const getNextDate = (targetDay) => {
//                         const today = new Date();
//                         let currentDay = today.getDay(); // JS: Sunday = 0, Monday = 1, ..., Saturday = 6

//                         // Convert JavaScript's day format to match your format (0 = Monday, ..., 6 = Sunday)
//                         currentDay = (currentDay + 6) % 7; // Shifts Sunday (0) to (6), Monday (1) to (0), etc.

//                         let daysToAdd = targetDay - currentDay;
//                         if (daysToAdd < 0) daysToAdd += 7; // If day has passed, move to next week's occurrence

//                         const nextDate = new Date();
//                         nextDate.setDate(today.getDate() + daysToAdd);
//                         return nextDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
//                     };

//                     const date = getNextDate(day);

//                     if (!dayEntry) {
//                         dayEntry = { availability_id: availability_id, id: day, day: dayAbbreviation, date, addtime: [], status: status.toString() };
//                         acc.push(dayEntry);
//                     }

//                     if (status === 0 && start_time && end_time) {
//                         dayEntry.addtime.push({ slot_id, start_time, end_time });
//                     }

//                     return acc;
//                 }, []);


//                 return response.status(200).json({ success: true, msg: languageMessage.dataFound, available_slots });
//             });
//         });
//     } catch (error) {
//         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
//     }
// };




//  new get available slots api
const get_available_slots = (request, response) => {
    const { user_id } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "user_id" });
        }
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const getAvailableSlotsQuery = `SELECT a.availability_id,a.day, a.status,s.slot_id, s.start_time, s.end_time FROM availability_master AS a LEFT JOIN slot_master AS s ON s.availability_id = a.availability_id WHERE a.user_id = ? AND a.delete_flag = 0`;
            connection.query(getAvailableSlotsQuery, [user_id], (err, slots) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
                }
                if (slots.length === 0) {
                    const dateList = [
                        {
                            "id": 0,
                            "day": "Mo",
                            "addtime": [],
                            "status": "1",
                        },
                        // ... (rest of the default date list)
                    ];
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, available_slots: dateList });
                }

                // Format the response to group slots by day
                const available_slots = slots.reduce((acc, slot) => {
                    const { availability_id, day, status, slot_id, start_time, end_time } = slot;
                    let dayEntry = acc.find(item => item.id === day);

                    const dayMap = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
                    const dayAbbreviation = dayMap[day];

                    // Function to get the next occurrence of a specific weekday
                    const getNextDate = (targetDay) => {
                        const today = new Date();
                        let currentDay = today.getDay();
                        currentDay = (currentDay + 6) % 7;
                        let daysToAdd = targetDay - currentDay;
                        if (daysToAdd < 0) daysToAdd += 7;
                        const nextDate = new Date();
                        nextDate.setDate(today.getDate() + daysToAdd);
                        return nextDate.toISOString().split('T')[0];
                    };

                    const date = getNextDate(day);

                    if (!dayEntry) {
                        dayEntry = {
                            availability_id: availability_id,
                            id: day,
                            day: dayAbbreviation,
                            date,
                            addtime: [],
                            status: status.toString()
                        };
                        acc.push(dayEntry);
                    }

                    // Convert 24-hour format to AM/PM
                    const formatTimeToAMPM = (time24) => {
                        if (!time24) return '';

                        // Handle cases where time might be a full datetime string
                        const timeStr = typeof time24 === 'string' ? time24 : time24.toISOString();

                        // Extract just the time part (HH:MM:SS)
                        const timePart = timeStr.includes(' ')
                            ? timeStr.split(' ')[1]
                            : timeStr.includes('T')
                                ? timeStr.split('T')[1]
                                : timeStr;

                        const [hours, minutes] = timePart.split(':');
                        const hourInt = parseInt(hours, 10);

                        const period = hourInt >= 12 ? 'PM' : 'AM';
                        const hour12 = hourInt % 12 || 12; // Convert 0 to 12 for 12 AM

                        return `${hour12}:${minutes} ${period}`;
                    };

                    if (status === 0 && start_time && end_time) {
                        dayEntry.addtime.push({
                            slot_id,
                            start_time: formatTimeToAMPM(start_time),
                            end_time: formatTimeToAMPM(end_time)
                        });
                    }

                    return acc;
                }, []);

                // Ensure all 7 days are present in the response
                const dayMap = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
                const completeAvailableSlots = Array.from({ length: 7 }, (_, i) => {
                    const existingDay = available_slots.find(day => day.id === i);
                    return existingDay || {
                        id: i,
                        day: dayMap[i],
                        addtime: [],
                        status: "1"
                    };
                });

                return response.status(200).json({
                    success: true,
                    msg: languageMessage.dataFound,
                    available_slots: completeAvailableSlots
                });
            });
        });
    } catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
};





//book slot
const userBookSlot = async (request, response) => {
    let { user_id, expert_id, availability_id, slot_id, day, date, type } = request.body;

    if (!user_id || !expert_id || !availability_id || !slot_id || !day || !date) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query = "SELECT mobile, name, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=1";
        const values = [user_id];
        connection.query(query, values, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (result[0]?.active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            const user_name = result[0].name;
            //----------------------check availability---------------------------
            const availabilityquery = "SELECT status FROM availability_master WHERE user_id = ? AND delete_flag = 0 AND availability_id=?";
            const availabilityvalues = [expert_id, availability_id];
            connection.query(availabilityquery, availabilityvalues, async (err, availabilityresult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (availabilityresult.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.AvailibilityNotFound });
                }
                //----------------------check slot---------------------------
                const slotquery = "SELECT slot_id FROM slot_master WHERE slot_id = ? AND delete_flag = 0 AND availability_id=?";
                const slotvalues = [slot_id, availability_id];
                connection.query(slotquery, slotvalues, async (err, slotresult) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                    }
                    if (slotresult.length === 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.SlotNotFound });
                    }
                    //-------------------book slot----------------------------
                    const bookQuery = `INSERT INTO slot_schedule_master (availability_id,user_id,expert_id,slot_id,day,date,type,createtime,updatetime) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(),NOW())`;
                    const bookvalues = [availability_id, user_id, expert_id, slot_id, day, date, type]
                    connection.query(bookQuery, bookvalues, async (err, bookresult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.Slotbookerror, key: err });
                        }

                        let type_label = type == 0 ? 'voice' : 'video '

                        const user_id_notification = user_id;
                        const other_user_id_notification = expert_id;
                        const action_id = slot_id;
                        const action = "Call Schedule";
                        const title = "Call Schedule";
                        const messages = `${user_name} has scheduled a ${type_label} call`;
                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
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
                        return response.status(200).json({ success: true, msg: languageMessage.CallScheduled });
                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.Slotbookerror, key: err.message });
    }
}

const getExpertScheduleSlot = (request, response) => {
    const { user_id } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: "user_id" });
        }
        const current_date = new Date().toISOString().split('T')[0];
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            const getAvailableSlotsQuery = `SELECT s.slot_schedule_id,s.availability_id,s.user_id,s.expert_id,s.slot_id,s.day,DATE_FORMAT(s.date, '%Y-%m-%d') AS date,s.type,s.status,u.name,COALESCE(u.image, 'NA') AS image,u.mobile,sm.start_time,sm.end_time FROM slot_schedule_master s LEFT JOIN user_master u ON s.user_id = u.user_id LEFT JOIN slot_master sm ON s.slot_id = sm.slot_id WHERE s.delete_flag = 0 AND s.date >= ? AND s.expert_id = ? order by s.date asc`;
            connection.query(getAvailableSlotsQuery, [current_date, user_id], (err, slots) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
                }
                if (slots.length === 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, schedule_slot: 'NA' });
                }
                slots.map(item => {
                    item.start_time = moment(item.start_time, "HH:mm:ss").format("hh:mm A");
                    item.end_time = moment(item.end_time, "HH:mm:ss").format("hh:mm A");
                })
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, schedule_slot: slots });
            });
        });
    } catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
};
//--------------------------convert task to milestone--------------------------
const convertIntoMilestone = async (request, response) => {
    let { user_id, milestone_id } = request.body;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'user_id' });
    }
    if (!milestone_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'milestone_id' });
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
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const user_name = userResult[0].name;
            const checkMilestone = "SELECT job_post_id FROM milestone_master WHERE delete_flag = 0 AND milestone_id=? and milestone_status=1";
            const milestonevalues = [milestone_id];
            connection.query(checkMilestone, milestonevalues, (err, milestoneResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.WorkSpaceNotFound, key: err.message });
                }
                if (milestoneResult.length === 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.WorkSpaceNotFound });
                }
                const checkJob = "SELECT assign_expert_id,title FROM job_post_master WHERE delete_flag = 0 AND job_post_id=? and user_id=?";
                const jobvalues = [milestoneResult[0].job_post_id, user_id];
                connection.query(checkJob, jobvalues, (err, jobResult) => {
                    if (err) {
                        return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                    }
                    if (jobResult.length === 0) {
                        return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                    }
                    const project_title = jobResult[0].title;
                    const updateMilestone = `UPDATE milestone_master SET milestone_convert_status=1,milestone_status=7,updatetime = NOW() WHERE milestone_id=?`;
                    const updateValue = [milestone_id];
                    connection.query(updateMilestone, updateValue, async (err, updateResult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.convertMilestoneError, key: err });
                        }
                        const user_id_notification = user_id;
                        const other_user_id_notification = jobResult[0].assign_expert_id;
                        const action_id = milestone_id;

                        const action = "milestone_convert";
                        const title = "Milestone Converted";
                        const messages = `${user_name} has converted work space to milestone ${project_title}`;

                        const title_2 = title;
                        const title_3 = title;
                        const title_4 = title;
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

                        return response.status(200).json({ success: true, msg: languageMessage.convertMilestoneSuccess });

                    });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}

//update Job milestone
const updateJobMilestone = async (request, response) => {
    let { user_id, milestone_id, title, amount, duration, description, duration_type, pdf_file } = request.body;

    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'user_id' });
    }
    if (!milestone_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'milestone_id' });
    }
    if (!title) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'title' });
    }
    if (!description) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'description' });
    }
    if (!amount) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'amount' });
    }
    if (!duration) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'duration' });
    }
    if (!duration_type) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'duration_type' });
    }

    try {
        const query1 = "SELECT name,active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        const values1 = [user_id];
        connection.query(query1, values1, (err, userResult) => {
            if (err) {
                return response.status(500).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (userResult.length === 0) {
                return response.status(404).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userResult[0]?.active_flag === 0) {
                return response.status(403).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            const checkJob = "SELECT job_post_id FROM milestone_master WHERE delete_flag = 0 AND milestone_id=?";
            const jobvalues = [milestone_id];
            connection.query(checkJob, jobvalues, (err, jobResult) => {
                if (err) {
                    return response.status(500).json({ success: false, msg: languageMessage.jobNotFound, key: err.message });
                }
                if (jobResult.length == 0) {
                    return response.status(404).json({ success: false, msg: languageMessage.jobNotFound });
                }

                const bookMarkQuery = `UPDATE milestone_master SET price=?,duration=?,description=?,title=?,duration_type=?,updatetime=NOW(),file=? WHERE delete_flag=0 AND milestone_id=?`;
                connection.query(bookMarkQuery, [amount, duration, description, title, duration_type, pdf_file, milestone_id], async (err, result) => {
                    if (err) {
                        return response.status(200).json({ success: false, msg: languageMessage.milestoneUpdatedUnsuccess, key: err });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.milestoneUpdatedSuccess });
                });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.milestoneUpdatedUnsuccess, key: err.message });
    }
}


// get wallet amount
const getWalletAmount = async (request, response) => {
    const { user_id } = request.query;
    if (!user_id) {
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
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            walletResult = await getUserTotalWallet(user_id);
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, walletResult: walletResult });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
// check wallet amount
const checkWalletAmount = async (request, response) => {
    const { user_id, other_user_id, call_type } = request.query;
    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'user_id' });
    }
    if (!other_user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, 'key': 'other_user_id' });
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
            const query2 = "SELECT call_charge,video_call_charge FROM user_master WHERE user_id = ? AND delete_flag = 0 AND user_type=2";
            const values2 = [other_user_id];
            connection.query(query2, values2, async (err, result1) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                if (result1.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.expertNotFound });
                }
                const walletResult = await getUserTotalWallet(user_id);
                const call_charge = result1[0]?.call_charge;
                const video_call_charge = result1[0]?.video_call_charge;
                let status;
                if (call_type == 0) {
                    if (walletResult >= call_charge) {
                        status = true;
                    } else {
                        status = false;
                    }
                } else {
                    if (walletResult >= video_call_charge) {
                        status = true;
                    } else {
                        status = false;
                    }
                }
                return response.status(200).json({ success: status, msg: languageMessage.dataFound, walletResult, call_charge: call_charge, video_call_charge: video_call_charge });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
};
//end
//debitWalletAmount
// const debitWalletAmount = async (request, response) => {
//     const { user_id, amount, expert_id } = request.body;
//     if (!user_id) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
//     }
//     if (!amount) {
//         return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'amount' });
//     }
//     try {
//         const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
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
//             const status = 1;
//             const type = 3;
//             const now = new Date();
//             const fileInsertQuery = `INSERT INTO wallet_master(user_id, expert_id, amount,status,type, createtime,updatetime) VALUES (?,?,?,?,?,?,?)`;
//             connection.query(fileInsertQuery, [user_id, expert_id, amount, status, type, now, now], (err, result1) => {
//                 if (err) {
//                     return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
//                 }
//                 return response.status(200).json({ success: true, msg: languageMessage.walletDebitUpdate });
//             });
//         });
//     } catch (err) {
//         return response.status(500).json({ success: false, msg: languageMessage.fileUploadedError, key: err.message });
//     }
// };

const debitWalletAmount = async (request, response) => {
    const { user_id, amount, expert_id, call_id } = request.body;

    if (!user_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
    }
    if (!amount) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'amount' });
    }
    try {
        const query1 = "SELECT mobile, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0";
        connection.query(query1, [user_id], async (err, result) => {
            if (err) return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });

            if (result.length === 0) return response.status(200).json({ success: false, msg: languageMessage.userNotFound });

            if (result[0]?.active_flag === 0)
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });

            const now = new Date()

            // Check if wallet entry already exists for this call
            const checkQuery = `SELECT transition_id, amount FROM wallet_master WHERE user_id = ? AND call_id = ? AND delete_flag = 0 LIMIT 1`;
            connection.query(checkQuery, [user_id, call_id], async (err, checkResult) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }

                if (checkResult.length > 0) {
                    // Entry exists, update amount
                    const existingId = checkResult[0].transition_id;

                    const newAmount = parseFloat(checkResult[0].amount) + parseFloat(amount);
                    const updateQuery = `UPDATE wallet_master SET amount = ?, updatetime = ? WHERE transition_id = ?`;
                    connection.query(updateQuery, [newAmount, now, existingId], (err, updateResult) => {
                        if (err) {
                            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                        }
                        return response.status(200).json({ success: true, msg: languageMessage.walletDebitUpdate, });
                    });
                } else {
                    // No existing entry, insert new
                    const insertQuery = `
                        INSERT INTO wallet_master(user_id, expert_id, amount, status, type, call_id, createtime, updatetime) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                    connection.query(insertQuery, [user_id, expert_id, amount, 1, 3, call_id, now, now], async (err, insertResult) => {
                        if (err) return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                        let transition_id = insertResult.insertId;
                        const userWalletbalance = await getUserTotalWallet(user_id);
                        const updatebalance = 'UPDATE wallet_master SET wallet_balance = ?, updatetime = NOW() WHERE transition_id = ? AND delete_flag = 0';
                        connection.query(updatebalance, [userWalletbalance, transition_id], async (updateErr, updateRes) => {
                            if (updateErr) {
                                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: updateErr.message });
                            }

                            return response.status(200).json({ success: true, msg: languageMessage.walletDebitUpdate, });
                        });
                    })
                }
            });
        });
    } catch (err) {
        return response.status(500).json({ success: false, msg: languageMessage.fileUploadedError, key: err.message });
    }
};

//end

// Generate unique id
const generateUniqueId = async (request, response) => {
    const { user_id } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        const checkUser = 'SELECT user_id , active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
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
            const unique_id = await generateid(10);
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, unique_id: unique_id });
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}
async function generateid(limit) {
    var digits = 'ABCD0123456789';
    let OTP = '';
    for (let i = 0; i < limit; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
// end


// get token varible
const getTokenVariable = async (request, response) => {
    try {
        const sql = 'SELECT token, variable FROM token_variable_master WHERE delete_flag = 0';
        connection.query(sql, async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (res.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }
            let data = {
                token: res[0].token,
                variable: res[0].variable.toString(),
            }
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, data: data });
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}
// end



// Get expert earning..
async function getExpertEarningg(milestone_id, user_id) {

    return new Promise((resolve, reject) => {
        const sql = `
      SELECT mm.job_post_id, mm.price, jm.assign_expert_id, um.gst_number  
      FROM milestone_master mm 
      JOIN job_post_master jm ON mm.job_post_id = jm.job_post_id 
      JOIN user_master um ON jm.assign_expert_id = um.user_id 
      WHERE mm.milestone_id = ? AND mm.delete_flag = 0 AND jm.delete_flag = 0
  `;
        connection.query(sql, [milestone_id], async (err, result) => {
            if (err) {
                reject(err);
            }

            if (result.length == 0) {
                resolve('NA')
            }

            const sql1 = 'SELECT gst, tds, tcs, platform_fee, commission_percentage FROM commission_master WHERE delete_flag = 0';
            connection.query(sql1, async (err1, res1) => {
                if (err1) {
                    reject(err1);
                }
                if (res1.length === 0) {
                    resolve('NA')
                }

                let data = res1[0];
                let gst = data.gst;
                let tcs = data.tcs;
                let tds = data.tds;
                let platform_fee = data.platform_fee;
                let commission_percentage = data.commission_percentage;

                let info = result[0];
                let expert_id = info.assign_expert_id;
                let received_amount = info.price;


                let admin_commission_amount = parseFloat((received_amount * commission_percentage / 100).toFixed(2));
                let expert_earning = parseFloat((received_amount - admin_commission_amount).toFixed(2));
                let platform_fee_amount = 0;
                let platform_fee_gst_amount = 0;

                let grand_total_earning = 0;
                let net_amount = 0;
                let gst_amount = 0;
                let tds_amount = 0;
                let tcs_amount = 0;

                // If GST is registered
                if (info.gst_number > 0) {
                    gst_amount = parseFloat(((received_amount * gst) / (100 + gst)).toFixed(2));
                    net_amount = parseFloat((received_amount - gst_amount).toFixed(2));

                    platform_fee_amount = parseFloat((net_amount * platform_fee / 100).toFixed(2));
                    platform_fee_gst_amount = parseFloat((platform_fee_amount * gst / 100).toFixed(2));

                    tds_amount = parseFloat((net_amount * tds / 100).toFixed(2));
                    tcs_amount = parseFloat((net_amount * tcs / 100).toFixed(2));

                    grand_total_earning = parseFloat((platform_fee_amount + platform_fee_gst_amount - (tds_amount + tcs_amount)).toFixed(2));
                    const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

                    const sqlQuery = `
                  INSERT INTO expert_earning_master 
                  (type, user_id, expert_id, milestone_id, total_amount, commission_percentage, admin_commission_amount, expert_earning, expert_type, gst_per, gst_amt, net_expert_earning, tds_per, tds_amt, tcs_per, tcs_amt, platform_fees, platform_fees_gst_amt, grand_total_expert_earning, createtime, updatetime) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

                    connection.query(sqlQuery, [0, user_id, expert_id, milestone_id, received_amount, commission_percentage, admin_commission_amount, grand_total_earning, 1, gst, gst_amount, net_amount, tds, tds_amount, tcs, tcs_amount, platform_fee_amount, platform_fee_gst_amount, grand_total_earning, now, now], (insertErr, insertRes) => {
                        if (insertErr) {
                            reject(insertErr);
                        }
                        if (insertRes.affectedRows == 0) {
                            resolve('NA')
                        }

                        let expert_earning_id = insertRes.insertId;

                        resolve(expert_earning_id);
                    });

                } else {
                    // If GST is not registered
                    net_amount = received_amount;
                    platform_fee_amount = parseFloat((net_amount * platform_fee / 100).toFixed(2));
                    let apply_gst_amount = parseFloat((platform_fee_amount * gst / 100).toFixed(2));
                    let net_apply_gst_amount = apply_gst_amount / 2;
                    grand_total_earning = parseFloat((platform_fee_amount - net_apply_gst_amount).toFixed(2));
                    const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

                    const insert = `
                  INSERT INTO expert_earning_master 
                  (type, user_id, expert_id, milestone_id, total_amount, commission_percentage, admin_commission_amount, expert_earning, expert_type, gst_per, gst_amt, net_expert_earning, tds_per, tds_amt, tcs_per, tcs_amt, platform_fees, platform_fees_gst_amt, grand_total_expert_earning, createtime, updatetime) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

                    connection.query(insert, [0, user_id, expert_id, milestone_id, received_amount, commission_percentage, admin_commission_amount, grand_total_earning, 0, gst, net_apply_gst_amount, net_amount, 0, 0, 0, 0, platform_fee_amount, platform_fee_amount, grand_total_earning, now, now], (err3, res3) => {
                        if (err3) {
                            reject(err3);
                        }
                        if (res3.affectedRows === 0) {
                            resolve('NA')
                        }
                        let expert_earning_id = res3.insertId;
                        resolve(expert_earning_id);
                    });
                }
            });
        });
    })
};




// complete job status 
const completeJob = async (request, response) => {
    const { user_id, job_post_id } = request.body;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        if (!job_post_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'job_post_id' });
        }

        const checkUser = 'SELECT user_id, active_flag, email, name FROM user_master WHERE user_id = ? AND delete_flag = 0';
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
            const jobSql = 'SELECT title FROM job_post_master WHERE job_post_id = ? AND delete_flag = 0';
            connection.query(jobSql, [job_post_id], async (jobErr, jobRes) => {
                if (jobErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: jobErr.message });
                }
                if (jobRes.length == 0) {
                    return response.status(200).json({ sucesss: false, msg: languageMessage.jobNotFound });
                }

                let job_name = jobRes[0].title;

                const sql = 'UPDATE job_post_master SET status = 3, updatetime = NOW() WHERE job_post_id = ? AND delete_flag = 0';
                connection.query(sql, [job_post_id], async (err1, res1) => {
                    if (err1) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                    }
                    if (res1.affectedRows == 0) {
                        return response.status(200).json({ success: false, msg: languageMessage.updateErr });
                    }
                    //    const user_email = res[0].email;

                    // const fromName = res[0].name;

                    // const app_name = 'Team Xpertnow';

                    // const message = `We are pleased to inform you that the job you created- <b> ${job_name} </b> has been successfully completed. We appreciate your engagement and look forward to assisting you with future tasks. <br> If you have any questions or need further support, please do not hesitate to contact us.`;

                    // const title = "Job Completion Confirmation";

                    // const subject = "Job Completion Confirmation";

                    // const app_logo = "https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png";

                    // await JobcompleteMailer(user_email, fromName, app_name, message, title, subject, app_logo).then(data => {

                    //     if (data.status === 'yes') {

                    return response.status(200).json({ success: true, msg: languageMessage.JobCompleted });
                    // }
                    // });
                });
            })
        })
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}


// get expert earning pdf function
// const getExpertEarningPdf = async (request, response) => {
//     const { expert_earning_id } = request.query;

//     try {
//         if (!expert_earning_id) {
//             return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'expert_earning_id' });
//         }

//         const sql = `SELECT em.milestone_id, em.total_amount, em.expert_id, em.commission_percentage, 
//             em.admin_commission_amount, em.expert_earning, em.expert_type, em.gst_amt, em.gst_per, 
//             em.net_expert_earning, em.tds_per, em.tds_amt, em.tcs_per, em.tcs_amt, em.platform_fees, 
//             em.platform_fees_gst_amt, em.grand_total_expert_earning, em.createtime, em.user_id, mm.milestone_number, um.name, um.email, um.address, um.city, cm.city_name, umm.name AS user_name, umm.email AS user_email, umm.address AS user_address, umm.city AS user_city	 
//             FROM expert_earning_master em 
//             JOIN milestone_master mm ON em.milestone_id = mm.milestone_id 
//             JOIN user_master um ON em.expert_id = um.user_id 
//             JOIN user_master umm ON em.user_id = umm.user_id
//             JOIN city_master cm ON um.city = cm.city_id
//             WHERE em.type = 0 AND em.expert_earning_id = ? AND em.delete_flag = 0`;

//         connection.query(sql, [expert_earning_id], async (err, res) => {
//             if (err) {
//                 return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
//             }

//             if (res.length === 0) {
//                 return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
//             }

//             let info = res[0];
//             let gst_amount;

//             if (info.expert_type == 0) {
//                 gst_amount = info.platform_fees
//             }

//             else {
//                 gst_amount = info.gst_amt
//             }

//             let earning_data;
//             let customer_address = '';
//             if (info.user_address == null) {
//                 customer_address = ''
//             }
//             else {
//                 customer_address = info.user_address
//             }
//             earning_data = {
//                 total_amount: info.total_amount,
//                 expert_earning: info.expert_earning,
//                 gst_amount: gst_amount,
//                 gst_per: info.gst_per,
//                 gst_amt: info.gst_amt,
//                 platform_fees_gst_amt: info.platform_fees_gst_amt,
//                 platform_fees: info.platform_fees,
//                 tds_per: info.tds_per,
//                 tds_amt: info.tds_amt,
//                 tcs_per: info.tcs_per,
//                 tcs_amt: info.tcs_amt,
//                 grand_total_expert_earning: info.grand_total_expert_earning,
//                 createtime: info.createtime,
//                 milestone_number: info.milestone_number,
//                 name: info.name,
//                 email: info.email,
//                 address: info.address,
//                 city_name: info.city_name,
//                 user_name: info.user_name,
//                 user_city: info.user_city,
//                 // user_city_name : info.user_city_name,
//                 user_email: info.user_email,
//                 user_address: customer_address

//             }
//             try {
//                 const filename = await generateInvoicePdf(earning_data, expert_earning_id);

//                 const invoiceUrl = filename;
//                 console.log('Invoice created at:', invoiceUrl);
//                 const updateSql = 'UPDATE expert_earning_master SET invoice_url = ? WHERE expert_earning_id = ?';
//                 connection.query(updateSql, [invoiceUrl, expert_earning_id], (updateErr) => {
//                     if (updateErr) {
//                         return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingUrl, error: updateErr.message });
//                     }
//                     return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });
//                 });
//             } catch (pdfError) {
//                 console.error('Invoice generation failed:', pdfError);
//                 return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
//             }
//         });
//     } catch (error) {
//         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
//     }
// };

// // generate pdf 
// const AWS = require('aws-sdk');
// const fs = require('fs');
// const PDFDocument = require('pdfkit');
// const path = require('path');


// const s3 = new AWS.S3({
//     accessKeyId: "AKIAUGO4KNQULGJQFZIA",
//     secretAccessKey: "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",
//     region: "ap-south-1",
// });

// const BUCKET_NAME = "xpertnowbucket";
// const BASE_S3_URL = 'https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/';

// function generateUniqueFilename(prefix = 'invoice') {
//     const timestamp = Date.NOW();
//     const random = Math.floor(Math.random() * 100000);
//     return `${prefix}-${timestamp}-${random}.pdf`;
// }

// // // ... (same AWS & imports as before)
// // async function generateInvoicePdf(invoiceData) {
// //     return new Promise(async (resolve, reject) => {
// //       const fileName = generateUniqueFilename();

// //       const doc = new PDFDocument({ size: 'A4', margin: 50 });
// //       const buffers = [];

// //       doc.on('data', buffers.push.bind(buffers));
// //       doc.on('end', async () => {
// //         const pdfBuffer = Buffer.concat(buffers);

// //         const s3Key = `uploads/${fileName}`;
// //         const uploadParams = {
// //           Bucket: BUCKET_NAME,
// //           Key: s3Key,
// //           Body: pdfBuffer,
// //           ContentType: 'application/pdf',
// //           ACL: 'public-read',
// //         };

// //         try {
// //           await s3.upload(uploadParams).promise();
// //           resolve(`${BASE_S3_URL}${fileName}`);
// //         } catch (err) {
// //           reject(err);
// //         }
// //       });
// const { PassThrough } = require('stream');
// async function generateInvoicePdf(invoiceData) {
//     return new Promise((resolve, reject) => {
//         const fileName = generateUniqueFilename();
//         const s3Key = `uploads/${fileName}`;

//         const doc = new PDFDocument({ size: 'A4', margin: 50 });
//         const passThroughStream = new PassThrough();

//         // Prepare S3 upload as stream
//         const uploadParams = {
//             Bucket: BUCKET_NAME,
//             Key: s3Key,
//             Body: passThroughStream,
//             ContentType: 'application/pdf',
//             ACL: 'public-read',
//         };

//         s3.upload(uploadParams, (err, data) => {
//             if (err) {
//                 console.error('S3 Upload Error:', err);
//                 return reject(err);
//             }
//             console.log('PDF uploaded successfully:', data.Location);
//             return resolve(`${BASE_S3_URL}${fileName}`);
//         });

//         // Pipe the PDF doc to S3 upload stream
//         doc.pipe(passThroughStream);

//         try {
//             // const imageUrl = 'https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png';
//             // const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//             // const imageBuffer = Buffer.from(imageResponse.data, 'binary');

//             // // Add Logo
//             // doc.image(imageBuffer, doc.page.width / 2 - 75, 30, { width: 150 });
//             //     const logoPath = path.join(__dirname, '..', 'assets', 'xpertlogo.png');
//             //     if (fs.existsSync(logoPath)) {
//             //       doc.image(logoPath, doc.page.width / 2 - 75, 30, { width: 150 });
//             //     }

//             // console.log(logoPath);
//             //     doc.moveDown(5);

//             // Title
//             doc
//                 .font('Helvetica-Bold')
//                 .fontSize(26)
//                 .text('', { align: 'center' });

//             doc.moveDown(3);

//             // Greeting & Intro
//             doc
//                 .font('Helvetica')
//                 .fontSize(16)
//                 .text(`Hey ${invoiceData.name},`)
//                 .moveDown(0.5)
//                 .text(`This is the receipt for a payment of Rs ${invoiceData.grand_total_expert_earning} you made to milestone.`)
//                 .moveDown(2);

//             // Milestone Number
//             doc
//                 .fontSize(14)
//                 .font('Helvetica-Bold')
//                 .text('Milestone Number:')
//                 .font('Helvetica')
//                 .text(invoiceData.milestone_number)
//                 .moveDown(1);

//             // Payment Date
//             doc
//                 .font('Helvetica-Bold')
//                 .text('Payment Date:')
//                 .font('Helvetica')
//                 .text(moment(invoiceData.createtime).format("MMM DD, YYYY"))
//                 .moveDown(1);

//             // Client
//             doc
//                 .fontSize(14)
//                 .font('Helvetica-Bold')
//                 .text('Client:')
//                 .font('Helvetica')
//                 .text(invoiceData.user_name)
//                 .text(`${invoiceData.user_address},`)
//                 .text(invoiceData.user_email)
//                 .moveDown(1);

//             // Payment To
//             doc
//                 .font('Helvetica-Bold')
//                 .text('Payment To:')
//                 .font('Helvetica')
//                 .text(invoiceData.name)
//                 .text(`${invoiceData.address}, ${invoiceData.city_name}`)
//                 .text(invoiceData.email)
//                 .moveDown(2);

//             // Charges Table
//             const tableData = [
//                 ['Total Amount', invoiceData.total_amount],
//                 ['Platform Fee', invoiceData.platform_fees],
//                 ['GST (18%)', invoiceData.gst_amt],
//                 [`TCS (${invoiceData.tcs_per}%)`, invoiceData.tcs_amt],
//                 [`TDS (${invoiceData.tds_per}%)`, invoiceData.tds_amt],
//             ];

//             const startX = 50;
//             let startY = doc.y;

//             doc.fontSize(14).font('Helvetica-Bold');
//             doc.text('Description', startX, startY);
//             doc.text('Amount (Rs)', 400, startY, { align: 'right' });
//             doc.font('Helvetica');
//             doc.moveDown(0.8);

//             for (let i = 0; i < tableData.length; i++) {
//                 const y = doc.y;
//                 doc.text(tableData[i][0], startX, y);
//                 doc.text(`${tableData[i][1]}`, 400, y, { align: 'right' });
//                 doc.moveDown(0.8);
//             }

//             // doc.moveDown(1.5);

//             // Grand Total
//             doc.font('Helvetica-Bold').fontSize(12);
//             doc.text(`Grand Total: Rs ${invoiceData.grand_total_expert_earning}`, { align: 'right' });
//             doc.end();

//         } catch (error) {
//             reject(`Error generating PDF: ${error.message}`);
//         }
//     });
// }

const getExpertEarningPdf = async (request, response) => {
    const { expert_earning_id } = request.query;

    try {
        if (!expert_earning_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'expert_earning_id' });
        }

        const sql = `SELECT em.milestone_id, em.total_amount, em.expert_id, em.commission_percentage, 
            em.admin_commission_amount, em.expert_earning, em.expert_type, em.gst_amt, em.gst_per, 
            em.net_expert_earning, em.tds_per, em.tds_amt, em.tcs_per, em.tcs_amt, em.platform_fees, 
            em.platform_fees_gst_amt, em.grand_total_expert_earning, em.createtime, em.user_id, mm.milestone_number, um.name, um.email, um.address, um.city, cm.city_name, umm.name AS user_name, umm.email AS user_email, umm.address AS user_address, umm.city AS user_city
            FROM expert_earning_master em 
            JOIN milestone_master mm ON em.milestone_id = mm.milestone_id 
            JOIN user_master um ON em.expert_id = um.user_id 
            JOIN user_master umm ON em.user_id = umm.user_id
            JOIN city_master cm ON um.city = cm.city_id
            WHERE em.type = 0 AND em.expert_earning_id = ? AND em.delete_flag = 0`;

        connection.query(sql, [expert_earning_id], async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }

            if (res.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }

            let info = res[0];
            let gst_amount;

            if (info.expert_type == 0) {
                gst_amount = info.platform_fees
            }

            else {
                gst_amount = info.gst_amt
            }

            let earning_data;
            let customer_address = '';
            if (info.user_address == null) {
                customer_address = ''
            }
            else {
                customer_address = info.user_address
            }
            earning_data = {
                total_amount: info.total_amount,
                expert_earning: info.expert_earning,
                gst_amount: gst_amount,
                gst_per: info.gst_per,
                gst_amt: info.gst_amt,
                platform_fees_gst_amt: info.platform_fees_gst_amt,
                platform_fees: info.platform_fees,
                tds_per: info.tds_per,
                tds_amt: info.tds_amt,
                tcs_per: info.tcs_per,
                tcs_amt: info.tcs_amt,
                grand_total_expert_earning: info.grand_total_expert_earning,
                createtime: info.createtime,
                milestone_number: info.milestone_number,
                name: info.name,
                email: info.email,
                address: info.address,
                city_name: info.city_name,
                user_name: info.user_name,
                user_city: info.user_city,
                user_city_name: info.user_city_name,
                user_email: info.user_email,
                user_address: customer_address

            }
            try {
                const filename = await generateInvoicePdf(earning_data, expert_earning_id);

                const invoiceUrl = filename;
                const updateSql = 'UPDATE expert_earning_master SET invoice_url = ? WHERE expert_earning_id = ?';
                connection.query(updateSql, [invoiceUrl, expert_earning_id], (updateErr) => {
                    if (updateErr) {
                        return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingUrl, error: updateErr.message });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });
                });
            } catch (pdfError) {
                return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
            }
        });
    } catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
};



// AWS S3 Configuration
const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path');
const { response } = require('express');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: "AKIAUGO4KNQULGJQFZIA",
    secretAccessKey: "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",
    region: "ap-south-1",
});

// Generate Expert earning Invoice PDF and Upload to S3
const generateInvoicePdf = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            // Generate a unique filename
            const randomSuffix = Math.floor(Math.random() * 1000);
            const filename = `invoice_${Date.now()}_${randomSuffix}.pdf`;

            // HTML Content
            const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <title>Payment Receipt</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
              <style>
                body {
                  background: #f8f9fa;
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  color: #333;
                }
                .invoice-container {
                  max-width: 700px;
                  margin: 20px auto;
                  background: #fff;
                  padding: 25px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.05);
                  page-break-inside: avoid;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .logo {
                  max-width: 140px;
                  margin-bottom: 10px;
                }
                h4 {
                  margin: 0;
                  font-size: 1.4rem;
                  font-weight: bold;
                }
                p {
                  margin-bottom: 10px;
                  font-size: 1rem;
                }
                .section {
                  margin-bottom: 15px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  flex-wrap: wrap;
                  margin-bottom: 10px;
                }
                .info-block {
                  width: 48%;
                  font-size: 0.95rem;
                }
                .text-muted {
                  color: #666;
                  font-size: 0.85rem;
                }
                table {
                  width: 100%;
                  font-size: 0.95rem;
                  margin-top: 10px;
                }
                th, td {
                  padding: 8px 0;
                }
                th {
                  border-bottom: 2px solid #ccc;
                }
                td {
                  border-bottom: 1px solid #e1e1e1;
                }
                .amount {
                  text-align: right;
                }
                .total-section {
                  text-align: right;
                  font-weight: bold;
                  font-size: 1rem;
                  margin-top: 15px;
                }
                .footer {
                  text-align: center;
                  color: #888;
                  font-size: 0.85rem;
                  margin-top: 20px;
                }
                @media (max-width: 480px) {
                  .info-row {
                    flex-direction: column;
                  }
                  .info-block {
                    width: 100%;
                    margin-bottom: 10px;
                  }
                  .invoice-container {
                    padding: 15px;
                  }
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="header">
                  <img src="https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png" alt="Xpertnow logo" class="logo">
                  <h4>Payment Receipt</h4>
                </div>
            
                <p>Hey ${invoiceData.name},</p>
                <p>This is the receipt for a payment of <strong>₹${invoiceData.grand_total_expert_earning}</strong> you made to milestone.</p>
            
                <div class="section">
                  <div class="info-row">
                    <div class="info-block">
                      <div class="text-muted">Milestone Number</div>
                      <div><strong>${invoiceData.milestone_number}</strong></div>
                    </div>
                    <div class="info-block">
                      <div class="text-muted">Payment Date</div>
                      <div><strong>${moment(invoiceData.createtime).format("MMM DD, YYYY")}</strong></div>
                    </div>
                  </div>
                </div>
            
                <div class="section">
                  <div class="info-row">
                    <div class="info-block">
                      <div class="text-muted">Client</div>
                      <div><strong>${invoiceData.user_name} </strong></div>
                      <div>${invoiceData.user_address}</div>
                      <div><a href="mailto:${invoiceData.user_email}">${invoiceData.user_email}</a></div>
                    </div>
                    <div class="info-block">
                      <div class="text-muted">Payment to</div>
                      <div><strong>${invoiceData.name}</strong></div>
                      <div>${invoiceData.address}, ${invoiceData.city_name}</div>
                      <div><a href="mailto:${invoiceData.email}">${invoiceData.email}</a></div>
                    </div>
                  </div>
                </div>
            
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th class="amount">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total Amount</td>
                      <td class="amount">₹${invoiceData.total_amount}</td>
                    </tr>
                    <tr>
                      <td>Platform fee</td>
                      <td class="amount">₹${invoiceData.platform_fees}</td>
                    </tr>
                    <tr>
                      <td>GST (${invoiceData.gst_per})</td>
                      <td class="amount">₹${invoiceData.gst_amt}</td>
                    </tr>
                    <tr>
                      <td>TCS (${invoiceData.tcs_per}%)</td>
                      <td class="amount">₹${invoiceData.tcs_amt}</td>
                    </tr>
                    <tr>
                      <td>TDS (${invoiceData.tds_per}%)</td>
                      <td class="amount">₹${invoiceData.tds_amt}</td>
                    </tr>
                  </tbody>
                </table>
            
                <div class="total-section">
                  Grand Total: ₹${invoiceData.grand_total_expert_earning}
                </div>
              </div>
            </body>
            </html>
            `;



            // Generate PDF Buffer
            pdf.create(htmlContent, { format: 'A4' }).toBuffer(async (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Upload to S3
                const params = {
                    Bucket: "xpertnowbucket",
                    Key: `uploads/${filename}`,
                    Body: buffer,
                    ContentType: 'application/pdf',
                    ACL: 'public-read',
                };

                try {
                    const s3Data = await s3.upload(params).promise();
                    resolve(s3Data.Location); // Return the S3 file URL
                } catch (uploadError) {
                    reject(uploadError);
                }
            });

        } catch (error) {
            reject(error);
        }
    });
};







// get wallet pdf
// const getWalletPdf = async (request, response) => {
//     const { transition_id } = request.query;
//     try {
//         if (!transition_id) {
//             return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'tranisition_id' });
//         }
//         const sql = 'SELECT wm.user_id, wm.expert_id, wm.amount, wm.wallet_balance, wm.status, wm.type, um.name, wm.createtime, wm.payment_transaction_id, um.email, um.address FROM wallet_master wm JOIN user_master um ON wm.user_id = um.user_id WHERE wm.transition_id = ? AND wm.delete_flag = 0';
//         connection.query(sql, [transition_id], async (err, res) => {
//             if (err) {
//                 return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
//             }
//             if (res.length == 0) {
//                 return response.status(200).json({ success: false, msg: languageMessage.dataFound });
//             }
//             try {
//                 let type_label = res[0].type === 1 ? 'recharge' : res[0].type === 2 ? 'job' : 'consultation'
//                 const filename = await generateWalletInvoice(res[0], type_label);

//                 const invoiceUrl = filename;
//                 const updateSql = 'UPDATE wallet_master SET invoice_url = ? WHERE transition_id = ?';
//                 connection.query(updateSql, [invoiceUrl, transition_id], (updateErr) => {
//                     if (updateErr) {
//                         return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingUrl, error: updateErr.message });
//                     }
//                     return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });
//                 });
//             } catch (pdfError) {
//                 return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
//             }
//         });
//     }
//     catch (error) {
//         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
//     }
// }
// // generate wallet invoice
// const generateWalletInvoice = async (invoiceData, type_label) => {
//     return new Promise(async (resolve, reject) => {
//         const fileName = `invoice_${Date.NOW()}_${Math.floor(Math.random() * 1000)}.pdf`;

//         const doc = new PDFDocument({ size: 'A4', margin: 50 });
//         const buffers = [];

//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', async () => {
//             const pdfBuffer = Buffer.concat(buffers);
//             const uploadParams = {
//                 Bucket: BUCKET_NAME,
//                 Key: `uploads/${fileName}`,
//                 Body: pdfBuffer,
//                 ContentType: 'application/pdf',
//                 ACL: 'public-read',
//             };

//             try {
//                 const s3Data = await s3.upload(uploadParams).promise();
//                 resolve(s3Data.Location);
//             } catch (err) {
//                 reject(err);
//             }
//         });

//         try {
//             // Fetch logo
//             const logoPath = path.join(__dirname, '..', 'assets', 'xpertlogo.png');
//             if (fs.existsSync(logoPath)) {
//                 doc.image(logoPath, doc.page.width / 2 - 75, 30, { width: 150 });
//             }


//             // Move below image for greeting
//             doc.moveDown(5);


//             doc
//                 .font('Helvetica-Bold')
//                 .fontSize(26)
//                 .text('', { align: 'center' });

//             doc.moveDown(4);

//             // Greeting & Intro
//             doc
//                 .font('Helvetica')
//                 .fontSize(16)
//                 .text(`Hey ${invoiceData.name},`)
//                 .moveDown(0.5)
//                 .text(`This is the receipt for a payment of Rs ${invoiceData.amount} you made to ${type_label}.`)
//                 .moveDown(2);

//             // Payment Info
//             doc.fontSize(14).font('Helvetica-Bold').text('Payment Date:');
//             doc.font('Helvetica').text(moment(invoiceData.createtime).format("MMM DD, YYYY"));
//             doc.moveDown(2);


//             const startX = 50;
//             let startY = doc.y;

//             doc.fontSize(14).font('Helvetica-Bold');
//             doc.text('Description', startX, startY);
//             doc.text('Amount (Rs)', 400, startY, { align: 'right' });
//             doc.font('Helvetica');
//             doc.moveDown(0.8);


//             const y = doc.y;
//             doc.text(type_label, startX, y);
//             doc.text(`Rs ${invoiceData.amount}`, 400, y, { align: 'right' });
//             doc.moveDown(0.8);

//             // Total
//             doc.font('Helvetica-Bold').fontSize(14);
//             doc.text(`Total Amount: Rs ${invoiceData.amount}`, { align: 'right' });

//             doc.end();

//         } catch (error) {
//             reject(`Error generating PDF: ${error.message}`);
//         }
//     });
// };


// get wallet pdf
const getWalletPdf = async (request, response) => {
    const { transition_id } = request.query;
    try {
        if (!transition_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'tranisition_id' });
        }
        const sql = 'SELECT wm.user_id, wm.expert_id, wm.amount, wm.wallet_balance, wm.status, wm.type, um.name, wm.createtime, wm.payment_transaction_id, um.email, um.address FROM wallet_master wm JOIN user_master um ON wm.user_id = um.user_id WHERE wm.transition_id = ? AND wm.delete_flag = 0';
        connection.query(sql, [transition_id], async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (res.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataFound });
            }
            try {
                let type_label = res[0].type === 1 ? 'recharge' : res[0].type === 2 ? 'job' : 'consultation'
                const filename = await generateWalletInvoice(res[0], type_label);

                const invoiceUrl = filename;
                const updateSql = 'UPDATE wallet_master SET invoice_url = ? WHERE transition_id = ?';
                connection.query(updateSql, [invoiceUrl, transition_id], (updateErr) => {
                    if (updateErr) {
                        return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingUrl, error: updateErr.message });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });
                });
            } catch (pdfError) {
                return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
            }
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}
// generate wallet invoice
const generateWalletInvoice = async (invoiceData, type_label) => {
    return new Promise((resolve, reject) => {
        try {
            // Generate a unique filename
            const randomSuffix = Math.floor(Math.random() * 1000);
            const filename = `invoice_${Date.now()}_${randomSuffix}.pdf`;

            // HTML Template
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Payment Receipt</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: #f8f9fa;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .invoice-container {
      width: 100%;
      max-width: 700px;
      margin: 0 auto;
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 10px;
    }
    h4 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: bold;
    }
    p {
      margin-bottom: 10px;
      font-size: 1rem;
    }
    .section {
      margin-bottom: 20px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .info-block {
      width: 48%;
    }
    .info-block div {
      font-size: 1rem;
    }
    .text-muted {
      color: #666;
      font-size: 0.9rem;
    }
    .amount {
      text-align: right;
      font-size: 1rem;
    }
    .total-section {
      text-align: right;
      font-weight: bold;
      font-size: 1.1rem;
      margin-top: 20px;
    }
    .pay-btn {
      display: block;
      width: 100%;
      padding: 10px;
      background: #1e2e50;
      color: white;
      text-align: center;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: 0.9rem;
      border: none;
      cursor: pointer;
      margin-top: 25px;
    }
    @media (max-width: 480px) {
      .info-row {
        flex-direction: column;
      }
      .info-block {
        width: 100%;
        margin-bottom: 15px;
      }
      .invoice-container {
        padding: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <img src="https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png" alt="Xpertnow logo" class="logo">
      <h4>Payment Receipt</h4>
    </div>

    <p>Hey ${invoiceData.name},</p>
    <p>This is the receipt for a payment of <strong>₹${invoiceData.amount}</strong> you made to ${type_label}.</p>

    <div class="section">
      <div class="info-row">
        <div class="info-block">
          <div class="text-muted">Payment Date</div>
          <div><strong>${moment(invoiceData.createtime).format("MMM DD, YYYY")}</strong></div>
        </div>
      </div>
    </div>

    <table style="width: 100%; margin-bottom: 20px;">
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${type_label}</td>
          <td class="amount">₹${invoiceData.amount}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-section">
      <div>Total Amount: ₹${invoiceData.amount}</div>
    </div>

    <div class="footer" style="text-align: center; margin-top: 20px; color: #888;">
    
    </div>
  </div>
</body>
</html>
`
            // Generate PDF Buffer
            pdf.create(htmlContent, { format: 'A4' }).toBuffer(async (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Upload to S3
                const params = {
                    Bucket: "xpertnowbucket",
                    Key: `uploads/${filename}`,
                    Body: buffer,
                    ContentType: 'application/pdf',
                    ACL: 'public-read',
                };

                try {
                    const s3Data = await s3.upload(params).promise();
                    resolve(s3Data.Location); // Return the S3 file URL
                } catch (uploadError) {
                    reject(uploadError);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};







// get expert all earning
// const getExpertAllEarningPdf = async (request, response) => {
//     const { expert_earning_id } = request.query;
//     try {
//         if (!expert_earning_id) {
//             return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'expert_earning_id' });
//         }
//         const sql = 'SELECT em.type,  em.expert_earning, em.createtime, um.name FROM expert_earning_master em JOIN user_master um ON em.expert_id = um.user_id WHERE em.expert_earning_id = ? AND em.delete_flag = 0';
//         connection.query(sql, [expert_earning_id], async (err, res) => {
//             if (err) {
//                 return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
//             }
//             if (res.length == 0) {
//                 return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
//             }
//             try {
//                 let type_label = res[0].type === 1 ? 'consultant' : 'Subscription'
//                 const filename = await generateExpertAllEarningPdf(res[0], type_label);

//                 const invoiceUrl = filename;
//                 const updateSql = 'UPDATE expert_earning_master SET invoice_url = ? WHERE expert_earning_id = ?';
//                 connection.query(updateSql, [invoiceUrl, expert_earning_id], (updateErr) => {
//                     if (updateErr) {
//                         return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingUrl, error: updateErr.message });
//                     }
//                     return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });
//                 });
//             } catch (pdfError) {
//                 return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
//             }
//         });
//     }
//     catch (error) {
//         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
//     }
// }
// // get expert all earnings
// const generateExpertAllEarningPdf = async (invoiceData, type_label) => {
//     return new Promise(async (resolve, reject) => {
//         const fileName = `invoice_${Date.NOW()}_${Math.floor(Math.random() * 1000)}.pdf`;

//         const doc = new PDFDocument({ size: 'A4', margin: 50 });
//         const buffers = [];

//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', async () => {
//             const pdfBuffer = Buffer.concat(buffers);
//             const uploadParams = {
//                 Bucket: BUCKET_NAME,
//                 Key: `uploads/${fileName}`,
//                 Body: pdfBuffer,
//                 ContentType: 'application/pdf',
//                 ACL: 'public-read',
//             };

//             try {
//                 const s3Data = await s3.upload(uploadParams).promise();
//                 resolve(s3Data.Location);
//             } catch (err) {
//                 reject(err);
//             }
//         });

//         try {
//             // Fetch logo
//             const logoPath = path.join(__dirname, '..', 'assets', 'xpertlogo.png');
//             if (fs.existsSync(logoPath)) {
//                 doc.image(logoPath, doc.page.width / 2 - 75, 30, { width: 150 });
//             }

//             // Move below image for greeting
//             doc.moveDown(5);


//             doc
//                 .font('Helvetica-Bold')
//                 .fontSize(26)
//                 .text('', { align: 'center' });

//             doc.moveDown(4);

//             // Greeting & Intro
//             doc
//                 .font('Helvetica')
//                 .fontSize(16)
//                 .text(`Hey ${invoiceData.name},`)
//                 .moveDown(0.5)
//                 .text(`This is the receipt for a payment of Rs ${invoiceData.expert_earning} you made to ${type_label}.`)
//                 .moveDown(2);

//             // Payment Info
//             doc.fontSize(14).font('Helvetica-Bold').text('Payment Date:');
//             doc.font('Helvetica').text(moment(invoiceData.createtime).format("MMM DD, YYYY"));
//             doc.moveDown(2);


//             const startX = 50;
//             let startY = doc.y;

//             doc.fontSize(14).font('Helvetica-Bold');
//             doc.text('Description', startX, startY);
//             doc.text('Amount (Rs)', 400, startY, { align: 'right' });
//             doc.font('Helvetica');
//             doc.moveDown(0.8);


//             const y = doc.y;
//             doc.text(type_label, startX, y);
//             doc.text(`Rs ${invoiceData.expert_earning}`, 400, y, { align: 'right' });
//             doc.moveDown(0.8);

//             // Total
//             doc.font('Helvetica-Bold').fontSize(14);
//             doc.text(`Total Amount: Rs ${invoiceData.expert_earning}`, { align: 'right' });

//             doc.end();

//         } catch (error) {
//             reject(`Error generating PDF: ${error.message}`);
//         }
//     });
// };





// get expert all earning
const getExpertAllEarningPdf = async (request, response) => {
    const { expert_earning_id } = request.query;
    try {
        if (!expert_earning_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'expert_earning_id' });
        }
        const sql = 'SELECT em.type,  em.expert_earning, em.createtime, um.name FROM expert_earning_master em JOIN user_master um ON em.expert_id = um.user_id WHERE em.expert_earning_id = ? AND em.delete_flag = 0';
        connection.query(sql, [expert_earning_id], async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (res.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }
            try {
                let type_label = res[0].type === 1 ? 'Consultant' : 'Subscription'
                const filename = await generateExpertAllEarningPdf(res[0], type_label);

                const invoiceUrl = filename;
                const updateSql = 'UPDATE expert_earning_master SET invoice_url = ? WHERE expert_earning_id = ?';
                connection.query(updateSql, [invoiceUrl, expert_earning_id], (updateErr) => {
                    if (updateErr) {
                        return response.status(200).json({ success: false, msg: languageMessage.ErrorUpdatingUrl, error: updateErr.message });
                    }
                    return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });
                });
            } catch (pdfError) {
                return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
            }
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}
//  expert all earning pdgf
const generateExpertAllEarningPdf = async (invoiceData, type_label) => {
    return new Promise((resolve, reject) => {
        try {
            // Generate a unique filename
            const randomSuffix = Math.floor(Math.random() * 1000);
            const filename = `invoice_${Date.now()}_${randomSuffix}.pdf`;

            // HTML Template
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Payment Receipt</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: #f8f9fa;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .invoice-container {
      width: 100%;
      max-width: 800px;
      background: #fff;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .logo {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo img {
      max-width: 120px;
      height: auto;
    }

    .header, .section {
      margin-bottom: 25px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .info-block {
      width: 48%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    th {
      text-transform: uppercase;
      font-size: 0.9rem;
      color: #666;
    }

    .amount {
      text-align: right;
    }

    .total-section {
      text-align: right;
      font-weight: bold;
    }

    .text-muted {
      color: #666;
      font-size: 0.9rem;
    }

    .text-success {
      color: #28a745;
    }

    .footer {
      margin-top: auto;
      text-align: center;
      font-size: 0.85rem;
      color: #888;
      padding: 10px;
    }

    @media (max-width: 768px) {
      .info-row {
        flex-direction: column;
      }

      .info-block {
        width: 100%;
        margin-bottom: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="logo">
      <img src="https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png" alt="Xpertnow logo">
    </div>
    <div class="header">
      <h4>Hey ${invoiceData.name},</h4>
      <p>This is the receipt for a payment of <strong>₹${invoiceData.expert_earning}</strong> you made to ${type_label}.</p>
    </div>
    <div class="section">
      <div class="info-row">
        <div class="info-block">
          <div class="text-muted">Payment Date</div>
          <div><strong>${moment(invoiceData.createtime).format("MMM DD, YYYY")}</strong></div>
        </div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${type_label}</td>
          <td class="amount">₹${invoiceData.expert_earning}</td>
        </tr>
      </tbody>
    </table>
    <div class="total-section">
      <div>Total Amount: ₹${invoiceData.expert_earning}</div>
    </div>
    <div class="footer">
    </div>
  </div>
</body>
</html>
 `
            // Generate PDF Buffer
            pdf.create(htmlContent, { format: 'A4' }).toBuffer(async (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Upload to S3
                const params = {
                    Bucket: "xpertnowbucket",
                    Key: `uploads/${filename}`,
                    Body: buffer,
                    ContentType: 'application/pdf',
                    ACL: 'public-read',
                };

                try {
                    const s3Data = await s3.upload(params).promise();
                    resolve(s3Data.Location); // Return the S3 file URL
                } catch (uploadError) {
                    reject(uploadError);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};







// // get customer milestone charge
// const getCustomerMilestoneCharge = async (request, response) => {
//     const { milestone_id } = request.query;
//     try {
//         if (!milestone_id) {
//             return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'milestone_id' });
//         }
//         const sql = 'SELECT em.grand_total_expert_earning, em.createtime, em.milestone_id, mm.milestone_number, em.expert_id, em.user_id AS customer_id, um.name, umm.name AS cust_name,  um.email, um.address, um.city FROM expert_earning_master em JOIN milestone_master mm ON em.milestone_id = mm.milestone_id JOIN user_master um ON em.expert_id = um.user_id JOIN city_master cm ON um.city = cm.city_id JOIN user_master umm ON em.user_id = umm.user_id WHERE em.milestone_id = ? AND em.delete_flag = 0';
//         connection.query(sql, [milestone_id], async (err, res) => {
//             if (err) {
//                 return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
//             }

//             if (res.length == 0) {
//                 return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
//             }

//             try {
//                 const filename = await generateCustMilestonePdf(res[0]);
//                 const invoiceUrl = filename;
//                 return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });

//             } catch (pdfError) {
//                 return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
//             }
//         });
//     }
//     catch (error) {
//         return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
//     }
// }
// // get customer milestone pdf
// const generateCustMilestonePdf = async (invoiceData) => {
//     return new Promise(async (resolve, reject) => {
//         const fileName = `invoice_${Date.NOW()}_${Math.floor(Math.random() * 1000)}.pdf`;

//         const doc = new PDFDocument({ size: 'A4', margin: 50 });
//         const buffers = [];

//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', async () => {
//             const pdfBuffer = Buffer.concat(buffers);
//             const uploadParams = {
//                 Bucket: BUCKET_NAME,
//                 Key: `uploads/${fileName}`,
//                 Body: pdfBuffer,
//                 ContentType: 'application/pdf',
//                 ACL: 'public-read',
//             };

//             try {
//                 const s3Data = await s3.upload(uploadParams).promise();
//                 resolve(s3Data.Location);
//             } catch (err) {
//                 reject(err);
//             }
//         });

//         try {
//             // Fetch logo
//             const logoPath = path.join(__dirname, '..', 'assets', 'xpertlogo.png');
//             if (fs.existsSync(logoPath)) {
//                 doc.image(logoPath, doc.page.width / 2 - 75, 30, { width: 150 });
//             }

//             // Move below image for greeting
//             doc.moveDown(5);


//             doc
//                 .font('Helvetica-Bold')
//                 .fontSize(26)
//                 .text('', { align: 'center' });

//             doc.moveDown(4);

//             // Greeting & Intro
//             doc
//                 .font('Helvetica')
//                 .fontSize(16)
//                 .text(`Hey ${invoiceData.cust_name},`)
//                 .moveDown(0.5)
//                 .text(`This is the receipt for a payment of Rs ${invoiceData.grand_total_expert_earning} you paid to ${invoiceData.name}.`)
//                 .moveDown(2);

//             //  milestone number 
//             doc.fontSize(14).font('Helvetica-Bold').text('Milestone No.');
//             doc.font('Helvetica').text(invoiceData.milestone_number);
//             doc.moveDown(1);

//             // Payment Info
//             doc.fontSize(14).font('Helvetica-Bold').text('Payment Date:');
//             doc.font('Helvetica').text(moment(invoiceData.createtime).format("MMM DD, YYYY"));
//             doc.moveDown(2);


//             const startX = 50;
//             let startY = doc.y;

//             doc.fontSize(14).font('Helvetica-Bold');
//             doc.text('Description', startX, startY);
//             doc.text('Amount (Rs)', 400, startY, { align: 'right' });
//             doc.font('Helvetica');
//             doc.moveDown(0.8);


//             const y = doc.y;
//             doc.text('Milestone Payment', startX, y);
//             doc.text(` ${invoiceData.grand_total_expert_earning}`, 400, y, { align: 'right' });
//             doc.moveDown(0.8);

//             // Total
//             doc.font('Helvetica-Bold').fontSize(12);
//             doc.text(`Total Amount: Rs ${invoiceData.grand_total_expert_earning}`, { align: 'right' });

//             doc.end();

//         } catch (error) {
//             reject(`Error generating PDF: ${error.message}`);
//         }
//     });
// };



// get customer milestone charge
const getCustomerMilestoneCharge = async (request, response) => {
    const { milestone_id } = request.query;
    try {
        if (!milestone_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'milestone_id' });
        }
        const sql = 'SELECT em.grand_total_expert_earning, em.createtime, em.milestone_id, mm.milestone_number, em.expert_id, em.user_id AS customer_id, um.name, umm.name AS cust_name,  um.email, um.address, um.city FROM expert_earning_master em JOIN milestone_master mm ON em.milestone_id = mm.milestone_id JOIN user_master um ON em.expert_id = um.user_id JOIN city_master cm ON um.city = cm.city_id JOIN user_master umm ON em.user_id = umm.user_id WHERE em.milestone_id = ? AND em.delete_flag = 0';
        connection.query(sql, [milestone_id], async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }

            if (res.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }

            try {
                const filename = await generateCustMilestonePdf(res[0]);
                const invoiceUrl = filename;
                return response.status(200).json({ success: true, msg: languageMessage.PdfGeneratedSuccess, invoice_url: invoiceUrl });

            } catch (pdfError) {
                return response.status(200).json({ success: false, msg: languageMessage.ErrorGeneratingPdf, error: pdfError.message });
            }
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}
// get customer milestone pdf
const generateCustMilestonePdf = async (invoiceData) => {
    return new Promise((resolve, reject) => {
        try {
            // Generate a unique filename
            const randomSuffix = Math.floor(Math.random() * 1000);
            const filename = `invoice_${Date.now()}_${randomSuffix}.pdf`;

            // HTML Template
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Payment Receipt</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background: #f8f9fa;
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      height: 100%;
    }

    .invoice-container {
      width: 100%;
      height: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }

    .logo {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo img {
      max-width: 120px;
      height: auto;
    }

    .header, .section {
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .info-block {
      width: 48%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }

    th {
      text-transform: uppercase;
      font-size: 0.9rem;
      color: #666;
    }

    .amount {
      text-align: right;
    }

    .total-section {
      text-align: right;
      font-weight: bold;
    }

    .text-muted {
      color: #666;
      font-size: 0.9rem;
    }

    .text-success {
      color: #28a745;
    }

    .footer {
      margin-top: auto;
      text-align: center;
      font-size: 0.8rem;
      color: #888;
      padding: 10px;
    }

    @media (max-width: 768px) {
      .info-row {
        flex-direction: column;
      }

      .info-block {
        width: 100%;
        margin-bottom: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="logo">
      <img src="https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png" alt="Xpertnow logo">
    </div>
    <div class="header">
      <h4>Hey ${invoiceData.cust_name},</h4>
      <p>This is the receipt for a payment of <strong>₹${invoiceData.grand_total_expert_earning}</strong> you paid to ${invoiceData.name}.</p>
    </div>
    <div class="section">
      <div class="info-row">
        <div class="info-block">
          <div class="text-muted">Milestone No.</div>
          <div><strong>${invoiceData.milestone_number}</strong></div>
        </div>
        <div class="info-block">
          <div class="text-muted">Payment Date</div>
          <div><strong>${moment(invoiceData.createtime).format("MMM DD, YYYY")}</strong></div>
        </div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Milestone Payment</td>
          <td class="amount">₹${invoiceData.grand_total_expert_earning}</td>
        </tr>
      </tbody>
    </table>
    <div class="total-section">
      <div>Total Amount: ₹${invoiceData.grand_total_expert_earning}</div>
    </div>
    <div class="footer">
     
    </div>
  </div>
</body>
</html>

`
            // Generate PDF Buffer
            pdf.create(htmlContent, { format: 'A4' }).toBuffer(async (err, buffer) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Upload to S3
                const params = {
                    Bucket: "xpertnowbucket",
                    Key: `uploads/${filename}`,
                    Body: buffer,
                    ContentType: 'application/pdf',
                    ACL: 'public-read',
                };

                try {
                    const s3Data = await s3.upload(params).promise();
                    resolve(s3Data.Location); // Return the S3 file URL
                } catch (uploadError) {
                    reject(uploadError);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};








//get nda price
const getNdaPrice = async (request, response) => {
    const { user_id } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
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
            const sql = 'SELECT price, image FROM nda_price_master WHERE delete_flag = 0';
            connection.query(sql, async (err1, res1) => {
                if (err1) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                }
                if (res1.length == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }
                return response.status(200).json({
                    success: true, msg: languageMessage.dataFound, nda_price: res1[0].price.toString(),
                    image: res1[0].image
                });
            });
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}





// manage chat status
const userChatStatus = async (request, response) => {
    const { user_id, other_user_id } = request.body;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        if (!other_user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'other_user_id' });
        }
        const checkUserQuery = 'SELECT user_id, name, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
        connection.query(checkUserQuery, [user_id], async (err, userRes) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (userRes.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.msgUserNotFound });
            }
            if (userRes[0].active_flag == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const checkOtherUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ?  AND delete_flag = 0';
            connection.query(checkOtherUser, [other_user_id], async (err1, res1) => {
                if (err1) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                }
                if (res1.length == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }
                if (res1[0].active_flag == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
                }
                const check = 'SELECT * FROM chat_status_master WHERE user_id = ? AND delete_flag = 0';
                connection.query(check, [user_id], async (err2, res2) => {
                    if (err2) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err2.message })
                    }
                    if (res2.length > 0) {
                        const update = 'UPDATE chat_status_master SET other_user_id = ?, updatetime = NOW() WHERE user_id = ? AND delete_flag= 0';
                        connection.query(update, [other_user_id, user_id], async (updateErr, updateRes) => {
                            if (updateErr) {
                                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message })
                            }
                            if (updateRes.affectedRows > 0) {
                                return response.status(200).json({ success: true, msg: languageMessage.dataFound });
                            }
                        })
                    }
                    else {
                        const insert = 'INSERT INTO chat_status_master (user_id, other_user_id, createtime, updatetime) VALUES(?, ?, NOW(), NOW())';
                        connection.query(insert, [user_id, other_user_id], async (insertErr, insertRes) => {
                            if (insertErr) {
                                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: insertErr.message })
                            }
                            if (insertRes.affectedRows > 0) {
                                return response.status(200).json({ success: true, msg: languageMessage.dataFound })
                            }
                        });
                    }
                })
            })

        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}

// get user active status 
const getActiveStatus = async (request, response) => {
    const { user_id, other_user_id } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }
        if (!other_user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'other_user_id' });
        }
        const checkUserQuery = 'SELECT user_id, name, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
        connection.query(checkUserQuery, [user_id], async (err, userRes) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (userRes.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
            }
            if (userRes[0].active_flag == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const checkOtherUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ?  AND delete_flag = 0';
            connection.query(checkOtherUser, [other_user_id], async (err1, res1) => {
                if (err1) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                }
                if (res1.length == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.userNotFound });
                }
                if (res1[0].active_flag == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
                }
                const sql = 'SELECT chat_status_id FROM chat_status_master WHERE other_user_id =? AND user_id = ? AND delete_flag = 0';
                connection.query(sql, [user_id, other_user_id], async (err2, res2) => {
                    if (err2) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err2.message });
                    }
                    let status = res2.length > 0 ? true : false
                    return response.status(200).json({ success: true, msg: languageMessage.dataFound, status: status });
                });
            });
        });

    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}




// payU payment integration
const crypto = require('crypto');
// const { response } = require('express');.
const { error } = require('console');
const key = 'JrzqFr';
const salt = '3qjFQW3C5c2b1eZquRYJXLDgBB0qvpE4';
const PAYU_BASE_URL = 'https://secure.payu.in/_payment';

const initiatePayment = (req, res) => {
    const { amount, user_id } = req.query;
    //   firstname, email, phone 

    if (!amount) {
        return res.status(200).send('Missing amount');
    }
    if (!user_id) {
        return res.status(200).send('Please send data ')
    }
    const checkUser = 'SELECT email, mobile, name, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
    connection.query(checkUser, [user_id], async (err, result) => {
        if (err) {
            return res.status(200).send('Internal server error');
        }
        if (result[0].active_flag == 0) {
            return res.status(200).send('Account deactivated')
        }
        let data = result[0];

        const txnid = crypto.randomBytes(6).toString('hex'); // 12-character alphanumeric ID
        const productinfo = 'Test Product';
        const firstname = data.name;
        const email = data.email;
        const phone = data.mobile;
        const udf1 = '';
        const udf2 = '';
        const udf3 = '';
        const udf4 = '';
        const udf5 = '';
        const surl = `https://zqd422dn6n.ap-south-1.awsapprunner.com/payment_success?transaction_id=${txnid}`;
        const furl = 'https://zqd422dn6n.ap-south-1.awsapprunner.com/payment_failure';

        // Correct hash string format as per PayU's requirements
        const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');


        const htmlForm = `
    <!DOCTYPE html>
    <html>
      <head><title>Redirecting to PayU</title></head>
      <body onload="document.forms[0].submit();">
        <form action="${PAYU_BASE_URL}" method="post">
          <input type="hidden" name="key" value="${key}" />
          <input type="hidden" name="txnid" value="${txnid}" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="productinfo" value="${productinfo}" />
          <input type="hidden" name="firstname" value="${firstname}" />
          <input type="hidden" name="email" value="${email}" />
          <input type="hidden" name="phone" value="${phone}" />
             <input type="hidden" name="user_id" value="${user_id}" />  <!-- Pass user_id here -->
          <input type="hidden" name="surl" value="${surl}" />
          <input type="hidden" name="furl" value="${furl}" />
          <input type="hidden" name="hash" value="${hash}" />
          <input type="hidden" name="service_provider" value="payu_paisa" />
         
          <p>Redirecting to PayU...</p>
        </form>
      </body>
    </html>
  `;
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlForm);

    })
}



// Payment success API
const verifyHash = (body) => {
    const {
        key, txnid, amount, productinfo,
        firstname, email, status, hash, user_id
    } = body;

    // Hash sequence in reverse (as per PayU docs)
    const hashSequence = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');
    return hash === calculatedHash;
};



// Payment success api ...
const paymentSuccess = (req, res) => {
    const body = req.body;

    // Step 1: Verify the hash
    if (!verifyHash(body)) {
        return res.status(400).send('Hash verification failed');
    }

    // Step 2: Extract data
    const { txnid, status, amount, email, user_id } = body;

    // Step 3: Check if payment was successful
    if (status.toLowerCase() !== 'success') {
        return res.status(400).send('Payment failed or incomplete');
    }

    // Step 4: Send immediate response to user
    res.send({
        message: 'Payment Successful!',
        txnid,
        status,
    });
};

// Payment failure API
const paymentFailure = (req, res) => {
    const body = req.query;
    return res.send('Payment Failed. Please try again.');
};



// get subscription status
const getSubscriptionStatus = async (request, response) => {
    const { user_id } = request.query;

    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }

        const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
        connection.query(checkUser, [user_id], (err, userRes) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }

            if (userRes.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.UserNotFound });
            }

            if (userRes[0].active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }

            const checkSubscription = `
          SELECT esm.createtime, sm.duration 
          FROM expert_subscription_master esm 
          JOIN subscription_master sm ON esm.subscription_id = sm.subscription_id 
          WHERE esm.expert_id = ? AND sm.delete_flag = 0 AND esm.delete_flag = 0
          ORDER BY esm.createtime DESC 
          LIMIT 1
        `;

            connection.query(checkSubscription, [user_id], (subErr, subRes) => {
                if (subErr) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: subErr.message });
                }

                if (subRes.length === 0) {
                    return response.status(200).json({ success: true, subscription_status: 3, msg: 'No subscription found' }); // 3 = No subscription
                }

                // const { createtime, duration } = subRes[0];
                // const createdAt = new Date(createtime);
                // const expiryDate = new Date(createdAt.getTime() + duration * 24 * 60 * 60 * 1000); // Add full days in milliseconds

                // const now = new Date();
                const status_label = '1 = Active, 2 = Expired';

                // if (now < expiryDate) {
                //     return response.status(200).json({ success: true, msg: languageMessage.dataFound, subscription_status: 1, status_label }); // Active
                // } else {
                //     return response.status(200).json({ success: true, msg: languageMessage.dataFound, subscription_status: 2, status_label }); // Expired
                // }
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, subscription_status: 1, status_label })
            });
        });
    } catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
};



// Payment hide and show
const paymentHideShow = async (request, response) => {

    try {

        const sql = 'SELECT status FROM payment_master WHERE payment_id = 1 AND  delete_flag = 0';
        connection.query(sql, async (err, res) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (res.length == 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }
            let status = res[0].status;
            let status_label = '0 = hide, 1 = show';
            return response.status(200).json({ success: true, msg: languageMessage.dataFound, status, status_label })
        });
    }
    catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
}



// refund request
const refundRequest = async (request, response) => {
    const { user_id, name, email, mobile, request_title, description, amount } = request.body;
    try {
        if (!user_id) return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });

        if (!name) return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'name' });

        if (!email) return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'email' });

        if (!description) return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'description' });

        if (!request_title) return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'request_title' });

        if (!amount) return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'amount' });

        const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
        connection.query(checkUser, [user_id], async (err, userRes) => {
            try {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
                }
                if (userRes.length === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.UserNotFound });
                }
                if (userRes[0].active_flag === 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
                }

                const otp = await generateOTP(6);


                const sql = 'INSERT INTO refund_request_master(user_id, name, email,mobile, description, title, otp, refund_amount, createtime, updatetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
                connection.query(sql, [user_id, name, email, mobile, description, request_title, otp, amount], async (err1, res1) => {
                    try {
                        if (err1) {
                            return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                        }

                        if (res1.affectedRows > 0) {
                            let refund_id = res1.insertId;

                            // const user_details = await getUserDetails(user_id);



                            let refund_request_data = {
                                refund_id,
                                user_id,
                                name,
                                email,
                                mobile,
                                description,
                                amount: amount,
                                title: request_title,
                                otp,
                            };
                            return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, refund_id: refund_id, refund_request_data: refund_request_data });
                            // const useremail = email;
                            // const fromName = name;
                            // const message = "Your refund request otp is";
                            // const subject = 'Refund Request';
                            // const title = 'Refund Request';
                            // const app_logo = "https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png";
                            // const app_name = "Team Xpertnow";

                            // await refundmailer(useremail, fromName, app_name, message, subject, title, app_logo, otp)
                            //     .then((data) => {
                            //         if (data.status === 'yes') {
                            //             return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, data: refund_request_data });
                            //         } else {
                            //             return response.status(200).json({ success: false, msg: 'Failed to send refund OTP email.' });
                            //         }
                            //     })
                            //     .catch((mailErr) => {
                            //         return response.status(200).json({ success: false, msg: 'Error sending email.', error: mailErr.message });
                            //     });
                        } else {
                            return response.status(200).json({ success: false, msg: languageMessage.RefundRequestNotSent });
                        }
                    } catch (e1) {
                        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: e1.message });
                    }
                });
            } catch (e2) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: e2.message });
            }
        });
    } catch (error) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: error.message });
    }
};


//  refund request otp verify 
const refundOtpVerify = async (request, response) => {
    let { refund_id, otp } = request.body;
    if (!refund_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'refund_id' });
    }
    if (!otp) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }
    try {
        const query1 = "SELECT * FROM refund_request_master WHERE refund_id = ? AND delete_flag= 0";
        const values1 = [refund_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }
            let data = result[0];
            const refundOtp = data.otp;
            if (refundOtp !== otp) {
                return response.status(200).json({ success: false, msg: languageMessage.invalidOtp });
            }
            const verifyOtp = `UPDATE refund_request_master SET otp_verify = 1  WHERE refund_id = ? `;
            connection.query(verifyOtp, [refund_id], async (err) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }
                let new_data = {
                    refund_id: data.refund_id,
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    title: data.title,
                    description: data.description,
                    refund_status: data.refund_status,
                    status_label: '0 = pending, 1 = accepted, 2 = rejected',
                    amount: data.refund_amount,
                    otp: data.otp,
                    otp_verify: data.otp_verify
                }
                return response.status(200).json({ success: true, msg: languageMessage.otpVerifiedSuccess, new_data: new_data });
            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}

// request otp resend 
const refundOtpResend = async (request, response) => {
    let { refund_id } = request.body;
    if (!refund_id) {
        return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    }

    // if (!mobile) {
    //     return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param });
    // }

    try {
        const query1 = "SELECT * FROM refund_request_master WHERE refund_id = ? AND delete_flag=0";
        const values1 = [refund_id];
        connection.query(query1, values1, async (err, result) => {
            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
            }
            if (result.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
            }
            let data = result[0];

            const otp = await generateOTP(6);
            let new_data = {
                refund_id: data.refund_id,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                title: data.title,
                description: data.description,
                amount: data.refund_amount,
                refund_status: data.refund_status,
                status_label: '0 = pending, 1 = accepted, 2 = rejected',
                otp: otp,
                // otp_verify: data.otp_verify
            }

            const clearOtpQuery = `UPDATE refund_request_master SET otp = ? WHERE refund_id = ?`
            connection.query(clearOtpQuery, [otp, refund_id], async (err, res2) => {
                if (err) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
                }

                if (res2.affectedRows > 0) {
                    return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, new_data: new_data });
                }
                else {
                    return response.status(200).json({ success: false, msg: languageMessage.msgDataNotFound });
                }
                //     const useremail = data.email;
                //     const fromName = data.name;
                //     const message = "Your refund request otp is";
                //     const subject = 'Refund Request';
                //     const title = 'Refund Request';
                //     const app_logo = "https://xpertnowbucket.s3.ap-south-1.amazonaws.com/uploads/1743577170167-xpertlog.png";
                //     const app_name = "Xpertnow App";

                //     await refundmailer(useremail, fromName, app_name, message, subject, title, app_logo, otp)
                //         .then((data) => {
                //             if (data.status === 'yes') {
                //                 return response.status(200).json({ success: true, msg: languageMessage.otpSuccess, new_data: new_data });
                //             } else {
                //                 return response.status(200).json({ success: false, msg: 'Failed to send refund OTP email.' });
                //             }
                //         })

            });
        });
    } catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}

// get request status 
const getRefundStatus = async (request, response) => {
    const { user_id } = request.query;
    try {
        if (!user_id) {
            return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'user_id' });
        }

        // if (!refund_id) {
        //     return response.status(200).json({ success: false, msg: languageMessage.msg_empty_param, key: 'refund_id' })
        // }

        const checkUser = 'SELECT user_id, active_flag FROM user_master WHERE user_id = ? AND delete_flag = 0';
        connection.query(checkUser, [user_id], async (err, userRes) => {

            if (err) {
                return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err.message });
            }
            if (userRes.length === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.UserNotFound });
            }
            if (userRes[0].active_flag === 0) {
                return response.status(200).json({ success: false, msg: languageMessage.accountdeactivated, active_status: 0 });
            }
            const check = 'SELECT refund_id, title, description, refund_status, transaction_id , refund_amount, createtime FROM refund_request_master WHERE user_id = ? AND delete_flag= 0 AND otp_verify= 1 ORDER BY createtime DESC';
            connection.query(check, [user_id], async (err1, res1) => {
                if (err1) {
                    return response.status(200).json({ success: false, msg: languageMessage.internalServerError, error: err1.message });
                }

                if (res1.length == 0) {
                    return response.status(200).json({ success: false, msg: languageMessage.dataNotFound });
                }

                // let refund_status = res1[0].refund_status;

                // let status_label = '0 = pending, 1 = accepted, 2 = rejected';
                let status_arr = [];
                for (let data of res1) {
                    status_arr.push({
                        refund_id: data.refund_id,
                        title: data.title,
                        description: data.description,
                        amount: data.refund_amount,
                        refund_status: data.refund_status,
                        status_label: '0 = pending, 1 = accepted, 2 = rejected',
                        transaction_id: data.transaction_id ? data.transaction_id : 'NA',
                        // createtime: moment(data.createtime).format("MMM DD YYYY hh:mm A")
                        createtime: moment(data.createtime).add(5, 'hours').add(30, 'minutes').format("MMM DD YYYY hh:mm A")
                    })
                }
                return response.status(200).json({ success: true, msg: languageMessage.dataFound, status_arr: status_arr, })
            });
        });
    }

    catch (err) {
        return response.status(200).json({ success: false, msg: languageMessage.internalServerError, key: err.message });
    }
}

//  send upcoming call notifications 
const sendUpcomingCallNotifications = async (request, response) => {
    try {
        const today = moment().format("YYYY-MM-DD");

        const getScheduleQuery = `
            SELECT 
                ss.slot_schedule_id, 
                ss.user_id, 
                ss.expert_id, 
                ss.slot_id, 
                ss.type, 
                sm.start_time,  
                ss.date       
            FROM slot_schedule_master ss 
            JOIN slot_master sm ON ss.slot_id = sm.slot_id 
            WHERE ss.date = ? AND ss.status = 0 AND ss.delete_flag = 0
        `;

        connection.query(getScheduleQuery, today, async (err, res) => {
            if (err) {
                return response.status(200).json({
                    success: false,
                    msg: languageMessage.internalServerError,
                    error: err.message
                });
            }

            for (let data of res) {
                const slot_time = data.start_time;
                const scheduledDateTime = moment(`${today} ${slot_time}`, "YYYY-MM-DD HH:mm:ss");
                const oneHourBefore = scheduledDateTime.clone().subtract(1, 'hours').format("YYYY-MM-DD HH:mm");


                const indianTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                const currentTime = moment(indianTime).format("YYYY-MM-DD HH:mm");


                // send notifications 
                if (oneHourBefore === currentTime) {
                    const user_id_notification = 1;
                    const other_user_id_notification = data.expert_id;
                    const action_id = data.slot_id;

                    const action = data.type == 1 ? 'video_call_reminder' : 'voice_call_reminder';
                    const title = data.type == 1 ? 'Video Call Reminder' : 'Voice Call Reminder';
                    const messages = data.type == 1
                        ? `You have a video call scheduled in next hour`
                        : `You have a voice call scheduled in next hour`;

                    const action_data = {
                        user_id: user_id_notification,
                        other_user_id: other_user_id_notification,
                        action_id: action_id,
                        action: action
                    };

                    await getNotificationArrSingle(
                        user_id_notification,
                        other_user_id_notification,
                        action,
                        action_id,
                        title, title, title, title,
                        messages, messages, messages, messages,
                        action_data,
                        async (notification_arr_check) => {
                            const notification_arr_check_new = [notification_arr_check];
                            if (notification_arr_check_new && notification_arr_check_new.length > 0) {
                                await oneSignalNotificationSendCall(notification_arr_check_new);
                            } else {
                                console.log("Notification array is empty");
                            }
                        }
                    );
                }
            }

            return response.status(200).json({ success: true, msg: "Notifications processed" });
        });
    } catch (error) {
        console.error("Error in sendUpcomingCallNotifications:", error);
        return response.status(500).json({
            success: false,
            msg: languageMessage.internalServerError,
            error: error.message
        });
    }
};







module.exports = { getExpertDetails, getExpertDetailsById, getExpertByRating, getMyJobs, getJobPostDetails, createJobPost, chatConsultationHistory, chatJobsHistory, callConsultationHistory, callJobsHistory, getExpertByFilter, walletRecharge, walletHistory, getExpertByName, getExpertEarning, withdrawRequest, withdrawHistory, expertCallConsultationHistory, expertCallJobsHistory, getJobPostsForExpert, getExpertEarningHistory, expertChatConsultationHistory, expertChatJobsHistory, getReviewsOfExpert, getExpertMyJobs, getBidsOfJobPost, hireTheExpert, createProjectCost, getSubscriptionPlans, buySubscription, reviewReply, rateExpert, ExpertBidJob, CustomerCallHistory, ExpertCallHistory, getExpertHomeJobs, bookMarkJob, reportOnJob, customerJobFilter, expertJobFilter, createJobCost, createJobMilestone, getJobWorkMilestone, acceptRejectMilestone, sentMilestoneRequest, checkMilestoneRequest, getExpertJobDetails, getUserProfile, downloadApp, deepLink, getExpertByFilterSubLabel, logOut, chatFileUpload, getExpertCompletedJobs, add_availability, edit_availability, get_available_slots, userBookSlot, getExpertScheduleSlot, convertIntoMilestone, updateJobMilestone, getWalletAmount, checkWalletAmount, debitWalletAmount, generateUniqueId, getTokenVariable, completeJob, getExpertEarningPdf, getWalletPdf, getExpertAllEarningPdf, getCustomerMilestoneCharge, getNdaPrice, userChatStatus, getActiveStatus, paymentFailure, initiatePayment, paymentSuccess, getSubscriptionStatus, paymentHideShow, refundRequest, refundOtpVerify, refundOtpResend, getRefundStatus, sendUpcomingCallNotifications };