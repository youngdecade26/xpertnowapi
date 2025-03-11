const express = require('express');
const upload = require('../middleware/multer');
const { authenticateToken } = require('../shared functions/functions');
const { signUp_1, signUp_2, getStates, getCities, getDegree, getCategoryDetails, getExpertLanguages, updateBankDetails, otpVerify, resendOtp, getSubCategoryDetails, getSubCategoryLevelDetails, getContent, usersignUp_1, userOtpVerify, userResendOtp, usersignUp_2, getExpertiseCategory, getSubExpertiseCategoryLevel, managePrivacy, deleteAccount, editProfile, getUserNotification, getCustomerSupport, getAllContentUrl, editCallCharge, editExpertiseAndExperience, editProfessionalDetails, editDocNumber, editProfileDetails, getExpertNotification, getExpertEye, deleteExpertAccount,getExpertByCatSubCat,deleteSingleNotification,deleteAllNotification,getSubLevelTwoCategory,getSubLevelThreeCategory } = require('../controller/user_controller');
const {getExpertDetails,getExpertDetailsById,createJobPost,walletRecharge,getExpertByRating,getMyJobs,getJobPostDetails,chatConsultationHistory,chatJobsHistory,callConsultationHistory,callJobsHistory,getExpertByFilter,getExpertByName,walletHistory,getExpertEarning,withdrawRequest,withdrawHistory,expertCallConsultationHistory,expertCallJobsHistory,getJobPostsForExpert,getExpertEarningHistory,expertChatConsultationHistory,
expertChatJobsHistory,getReviewsOfExpert,getExpertMyJobs,getBidsOfJobPost,hireTheExpert,createProjectCost,getSubscriptionPlans,buySubscription,
reviewReply,rateExpert,CustomerCallHistory,ExpertCallHistory,ExpertBidJob,getExpertHomeJobs,bookMarkJob,reportOnJob,customerJobFilter,expertJobFilter,createJobCost,createJobMilestone,getJobWorkMilestone,updateMilestoneStatus,acceptRejectMilestone,sentMilestoneRequest,checkMilestoneRequest,getExpertJobDetails,getUserProfile,downloadApp,deepLink,getExpertByFilterSubLabel,logOut,AddAvailibility,EditAvailibility,
getAvailiblityDetailsById} = require("../controller/app_controller");
const {generateVideocallToken,VideoVoiceCallStart,VideoVoiceCallJoin,generateTokenByChannelName,VideoVoiceCallEnd,VideoVoiceCallReject} = require('../controller/call_controller');
const router = express.Router();

//Starting customer routes
router.post('/sign_up_1', upload.none(), usersignUp_1);
router.post('/verifyotp',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), userOtpVerify);
router.post('/resendotp', async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.none(), userResendOtp);
router.post('/sign_up_2', async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.fields([{ name: 'image', maxCount: 1 },{ name: 'pancard_front_image', maxCount: 1 },{ name: 'pancard_back_image', maxCount: 1 },{ name: 'adharcard_front_image', maxCount: 1 },{ name: 'adharcard_back_image', maxCount: 1 },{ name: 'gst_image', maxCount: 1 }]), usersignUp_2);
router.post('/get_expertbycategory',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertDetails);
router.post('/get_expertbyid',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertDetailsById);
router.post('/manage_privacy',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), managePrivacy);
router.post('/delete_account',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), deleteAccount);
router.post('/edit_user_profile',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'image', maxCount: 1 },{ name: 'pancard_front_image', maxCount: 1 },{ name: 'pancard_back_image', maxCount: 1 },{ name: 'adharcard_front_image', maxCount: 1 },{ name: 'adharcard_back_image', maxCount: 1 },{ name: 'gst_image', maxCount: 1 }]), editProfile);
router.post('/create_job_post',async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.fields([{ name: 'file', maxCount: 10 }]), createJobPost);
router.post('/wallet_recharge',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), walletRecharge);
router.post('/edit_call_charge',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), editCallCharge);
router.post('/edit_professional_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'file', maxCount: 10 },{ name: 'degree_file', maxCount: 10 }]), editProfessionalDetails);
router.post('/edit_expertise',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), editExpertiseAndExperience);
router.post('/edit_document',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'pancard_front_image', maxCount: 1 },{ name: 'pancard_back_image', maxCount: 1 },{ name: 'adharcard_front_image', maxCount: 1 },{ name: 'adharcard_back_image', maxCount: 1 },{ name: 'gst_image', maxCount: 1 }]), editDocNumber);
router.post('/edit_personal_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'image', maxCount: 1 }]), editProfileDetails);
router.post('/withdraw_request',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), withdrawRequest);
router.post('/create_project_cost',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), createProjectCost);
router.get('/get_customer_support',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getCustomerSupport);
router.get('/get_expertcategories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertiseCategory);
router.get('/get_sub_expertcategories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubCategoryDetails);
router.get('/get_sub_levelexpertcategories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubExpertiseCategoryLevel);
router.get('/get_expert_byrating', async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.none(), getExpertByRating);
router.get('/get_myjobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getMyJobs);
router.get('/get_job_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getJobPostDetails);
router.get('/get_chat_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), chatConsultationHistory);
router.get('/get_chat_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), chatJobsHistory);
router.get('/get_call_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), callConsultationHistory);
router.get('/get_call_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), callJobsHistory);
router.post('/get_expert_by_filter',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertByFilter);
router.post('/get_expert_by_filter_sub_label', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertByFilterSubLabel);
router.post('/get_expert_cat_subcat',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertByCatSubCat);
router.get('/get_expert_by_name',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertByName);
router.get('/get_wallet_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), walletHistory);
router.get('/get_bids_of_jobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getBidsOfJobPost);
//Starting Expert routes
router.post('/expert_sign_up_1', upload.none(), signUp_1);
router.post('/expert_verifyotp',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), otpVerify);
router.post('/expert_resendotp',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), resendOtp);
router.post('/expert_sign_up_2',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'file', maxCount: 10 },{ name: 'degree_file', maxCount: 10 },{ name: 'image', maxCount: 1 },{ name: 'pancard_front_image', maxCount: 1 },{ name: 'pancard_back_image', maxCount: 1 },{ name: 'adharcard_front_image', maxCount: 1 },{ name: 'adharcard_back_image', maxCount: 1 },{ name: 'gst_image', maxCount: 1 }]), signUp_2);
router.post('/expert_update_bank',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), updateBankDetails);
router.post('/delete_expert_account',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), deleteExpertAccount);
router.get('/get_content',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getContent);
router.get('/get_all_content_url',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getAllContentUrl);//
router.get('/get_expert_cat_subcat',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertByCatSubCat);
router.get('/expert_get_states',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getStates);
router.get('/expert_get_cities',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getCities);
router.get('/expert_get_degree',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getDegree);
router.get('/expert_get_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getCategoryDetails);
router.get('/expert_get_sub_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubCategoryDetails);
router.get('/expert_get_sub_level_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubCategoryLevelDetails);
router.get('/expert_get_languages',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertLanguages);
router.get('/get_expert_earning',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertEarning);
router.get('/get_withdraw_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), withdrawHistory);
router.get('/get_expert_call_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), expertCallConsultationHistory);
router.get('/get_expert_call_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), expertCallJobsHistory);
router.get('/get_expert_jobpost',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getJobPostsForExpert);
router.get('/get_expert_earning_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertEarningHistory);
router.get('/get_expert_chat_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), expertChatConsultationHistory);
router.get('/get_expert_chat_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), expertChatJobsHistory);
router.get('/get_expert_my_reviews',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getReviewsOfExpert);
router.get('/get_expert_eye',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertEye);
//-------------------start 100 % api--------------------------//
router.post('/review_reply',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), reviewReply);
router.post('/rate_expert',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), rateExpert);
router.post('/bid_on_job',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'pdf_file', maxCount: 1 },{ name: 'nda_file', maxCount: 1 }]), ExpertBidJob);
router.get('/customer_call_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), CustomerCallHistory);
router.get('/expert_call_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), ExpertCallHistory);
router.post('/hire_expert',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), hireTheExpert);
router.get('/get_notifications',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getUserNotification);
router.get('/get_expert_notifications',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertNotification);
router.post('/delete_single_notification',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), deleteSingleNotification);
router.post('/delete_all_notification',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), deleteAllNotification);
router.get('/get_subscription_plans',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubscriptionPlans);
router.post('/buy_subscription',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), buySubscription);
router.get('/get_expert_myjobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertMyJobs);
router.get('/expert_home_jobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertHomeJobs);
router.post('/bookmark_job',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), bookMarkJob);
router.post('/report_on_job',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), reportOnJob);
router.post('/customer_job_filter',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), customerJobFilter);
router.post('/expert_job_filter',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), expertJobFilter);
router.post('/create_job_cost',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), createJobCost);
router.post('/create_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'pdf_file', maxCount: 1 }]), createJobMilestone);
router.get('/get_job_work_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getJobWorkMilestone);
router.post('/accept_reject_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), acceptRejectMilestone);
router.post('/sent_milestone_request',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), sentMilestoneRequest);
router.post('/check_milestone_request',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), checkMilestoneRequest);
router.get('/get_expert_job_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertJobDetails);
router.get('/get_user_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getUserProfile);
router.get('/downloadApp',upload.none(),downloadApp);
router.get('/deepLink',upload.none(),deepLink);
router.get('/logout',upload.none(),logOut);
//--------------start video/voice call apis-----------------------------//
router.post('/generate_token',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), generateVideocallToken);
router.post('/generate_token_by_channel_name',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), generateTokenByChannelName);
router.post('/video_voice_call_start',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), VideoVoiceCallStart);
router.post('/video_voice_call_join', async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.none(), VideoVoiceCallJoin);
router.post('/video_voice_call_ended',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), VideoVoiceCallEnd);
router.post('/video_voice_call_reject',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), VideoVoiceCallReject);
//--------------- add availibility api-------------------------------//
router.post("/add_availibility",async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), AddAvailibility);
router.post("/edit_availibility",async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), EditAvailibility);
router.get("/get_availibility",async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getAvailiblityDetailsById);
router.get('/get_sub_level_two_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubLevelTwoCategory);
router.get('/get_sub_level_three_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getSubLevelThreeCategory);
//end
module.exports = router;