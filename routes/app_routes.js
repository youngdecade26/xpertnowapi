const express = require('express');
const upload = require('../middleware/multer');
const { authenticateToken } = require('../shared functions/functions');
const { signUp_1, signUp_2, getStates, getCities, getDegree, getCategoryDetails, getExpertLanguages, updateBankDetails, otpVerify, resendOtp, getSubCategoryDetails, getSubCategoryLevelDetails, getContent, usersignUp_1, userOtpVerify, userResendOtp, usersignUp_2, getExpertiseCategory, getSubExpertiseCategoryLevel, managePrivacy, deleteAccount, editProfile, getUserNotification, getCustomerSupport, getAllContentUrl, editCallCharge, editExpertiseAndExperience, editProfessionalDetails, editDocNumber, editProfileDetails, getExpertNotification, getExpertEye, deleteExpertAccount,getExpertByCatSubCat,deleteSingleNotification,deleteAllNotification,getSubLevelTwoCategory,getSubLevelThreeCategory } = require('../controller/user_controller');

const {getExpertDetails,getExpertDetailsById,createJobPost,walletRecharge,getExpertByRating,getMyJobs,getJobPostDetails,chatConsultationHistory,chatJobsHistory,callConsultationHistory,callJobsHistory,getExpertByFilter,getExpertByName,walletHistory,getExpertEarning,withdrawRequest,withdrawHistory,expertCallConsultationHistory,expertCallJobsHistory,getJobPostsForExpert,getExpertEarningHistory,expertChatConsultationHistory,
expertChatJobsHistory,getReviewsOfExpert,getExpertMyJobs,getBidsOfJobPost,hireTheExpert,createProjectCost,getSubscriptionPlans,buySubscription,
reviewReply,rateExpert,CustomerCallHistory,ExpertCallHistory,ExpertBidJob,getExpertHomeJobs,bookMarkJob,reportOnJob,customerJobFilter,expertJobFilter,createJobCost,createJobMilestone,getJobWorkMilestone,updateMilestoneStatus,acceptRejectMilestone,sentMilestoneRequest,checkMilestoneRequest,getExpertJobDetails,getUserProfile,downloadApp,deepLink,getExpertByFilterSubLabel,logOut,chatFileUpload,getExpertCompletedJobs,add_availability,edit_availability,get_available_slots,userBookSlot,getExpertScheduleSlot,convertIntoMilestone,updateJobMilestone,getWalletAmount,checkWalletAmount,debitWalletAmount, generateUniqueId, getTokenVariable, completeJob, getExpertEarningPdf,getWalletPdf, getExpertAllEarningPdf, getCustomerMilestoneCharge } = require("../controller/app_controller");

const {generateVideocallToken,VideoVoiceCallStart,VideoVoiceCallJoin,generateTokenByChannelName,VideoVoiceCallEnd,VideoVoiceCallReject,generatecallResourceId,startRecording,endRecording,getRecordingDetails,checkRecordingStatus} = require('../controller/call_controller');
const router = express.Router();

//Starting customer routes
router.post('/sign_up_1', upload.none(), usersignUp_1);
router.post('/verifyotp',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  userOtpVerify);

router.post('/resendotp', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), userResendOtp);

router.post('/sign_up_2', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  usersignUp_2);    //image

router.post('/get_expertbycategory',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertDetails);

router.post('/get_expertbyid',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertDetailsById);

router.post('/manage_privacy',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  managePrivacy);

router.post('/delete_account',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  deleteAccount);

router.post('/edit_user_profile',async (req, res, next) => {
  await authenticateToken(req, res, next); 
}, upload.none(),  editProfile);

router.post('/create_job_post',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  createJobPost);  //multiple images

router.post('/wallet_recharge',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  walletRecharge);

router.post('/edit_call_charge',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  editCallCharge);

router.post('/edit_professional_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  editProfessionalDetails); 

router.post('/edit_expertise',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  editExpertiseAndExperience);

router.post('/edit_document',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  editDocNumber);

router.post('/edit_personal_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  editProfileDetails); 

router.post('/withdraw_request',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  withdrawRequest);

router.post('/create_project_cost',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  createProjectCost);

router.get('/get_customer_support',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getCustomerSupport);

router.get('/get_expertcategories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertiseCategory);

router.get('/get_sub_expertcategories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubCategoryDetails);

router.get('/get_sub_levelexpertcategories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubExpertiseCategoryLevel);

router.get('/get_expert_byrating', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), getExpertByRating);

router.get('/get_myjobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getMyJobs);

router.get('/get_job_details', upload.none(),  getJobPostDetails);   //async (req, res, next) => {await authenticateToken(req, res, next);},

router.get('/get_chat_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  chatConsultationHistory);

router.get('/get_chat_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  chatJobsHistory);

router.get('/get_call_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  callConsultationHistory);

router.get('/get_call_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  callJobsHistory);

router.post('/get_expert_by_filter',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertByFilter);

router.post('/get_expert_by_filter_sub_label', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertByFilterSubLabel);

router.post('/get_expert_cat_subcat',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertByCatSubCat);

router.get('/get_expert_by_name',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertByName);

router.get('/get_wallet_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  walletHistory);

router.get('/get_bids_of_jobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getBidsOfJobPost);

//Starting Expert routes
router.post('/expert_sign_up_1',upload.none(),  signUp_1);

router.post('/expert_verifyotp',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  otpVerify);


router.post('/expert_resendotp',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  resendOtp);


router.post('/expert_sign_up_2',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  signUp_2); //image

router.post('/expert_update_bank',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  updateBankDetails);

router.post('/delete_expert_account',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  deleteExpertAccount);

router.get('/get_content',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getContent);

router.get('/get_all_content_url',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getAllContentUrl);//

router.get('/get_expert_cat_subcat',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertByCatSubCat);

router.get('/expert_get_states',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getStates);

router.get('/expert_get_cities',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getCities);

router.get('/expert_get_degree',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getDegree);

router.get('/expert_get_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getCategoryDetails);

router.get('/expert_get_sub_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubCategoryDetails);

router.get('/expert_get_sub_level_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubCategoryLevelDetails);

router.get('/expert_get_languages',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertLanguages);

router.get('/get_expert_earning',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertEarning);

router.get('/get_withdraw_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  withdrawHistory);

router.get('/get_expert_call_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  expertCallConsultationHistory);

router.get('/get_expert_call_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  expertCallJobsHistory);

router.get('/get_expert_jobpost',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getJobPostsForExpert);

router.get('/get_expert_earning_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertEarningHistory);

router.get('/get_expert_chat_consult_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  expertChatConsultationHistory);

router.get('/get_expert_chat_jobs_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  expertChatJobsHistory);

router.get('/get_expert_my_reviews',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getReviewsOfExpert);

router.get('/get_expert_eye',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertEye);
//-------------------start 100 % api--------------------------//
router.post('/review_reply',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  reviewReply);

router.post('/rate_expert',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  rateExpert);

router.post('/bid_on_job',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  ExpertBidJob);   //image

router.get('/customer_call_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  CustomerCallHistory);

router.get('/expert_call_history',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  ExpertCallHistory);

router.post('/hire_expert',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  hireTheExpert);

router.get('/get_notifications',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getUserNotification);

router.get('/get_expert_notifications',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertNotification);

router.post('/delete_single_notification',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  deleteSingleNotification);

router.post('/delete_all_notification',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  deleteAllNotification);

router.get('/get_subscription_plans',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubscriptionPlans);


router.post('/buy_subscription',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  buySubscription);

router.get('/get_expert_myjobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertMyJobs);

router.get('/expert_home_jobs',  upload.none(),  getExpertHomeJobs);

router.post('/bookmark_job',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  bookMarkJob);

router.post('/report_on_job',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  reportOnJob);

router.post('/customer_job_filter',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  customerJobFilter);

router.post('/expert_job_filter',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  expertJobFilter);

router.post('/create_job_cost',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  createJobCost);  //image 

router.post('/create_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),   createJobMilestone);  //image for pdf

router.post('/update_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),updateJobMilestone);

router.post('/convert_into_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),convertIntoMilestone);

router.get('/get_job_work_milestone', async (req, res, next) => { 
  await authenticateToken(req, res, next);
}, upload.none(),  getJobWorkMilestone);


router.post('/accept_reject_milestone',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  acceptRejectMilestone);

router.post('/sent_milestone_request',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  sentMilestoneRequest);

router.post('/check_milestone_request',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  checkMilestoneRequest);

router.get('/get_expert_job_details',upload.none(),  getExpertJobDetails);  // async (req, res, next) => { await authenticateToken(req, res, next);}, 

router.get('/get_user_details',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getUserProfile);

router.get('/downloadApp',downloadApp);

router.get('/deepLink',deepLink);

router.get('/logout',logOut);
//--------------start video/voice call apis-----------------------------//
router.post('/generate_token',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  generateVideocallToken);
router.post('/generate_resourceid',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  generatecallResourceId);
router.post('/start_recording',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  startRecording);
router.post('/end_recording',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  endRecording);
router.post('/get_recording',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getRecordingDetails);
router.post('/check_recording',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  checkRecordingStatus);

router.post('/generate_token_by_channel_name',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  generateTokenByChannelName);

router.post('/video_voice_call_start',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  VideoVoiceCallStart);

router.post('/video_voice_call_join', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), VideoVoiceCallJoin);

router.post('/video_voice_call_ended',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  VideoVoiceCallEnd);

router.post('/video_voice_call_reject',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  VideoVoiceCallReject);

//--------------- add availibility api-------------------------------//
router.post('/add_availability' ,async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), add_availability);
router.post('/edit_availability' ,async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), edit_availability);
router.get('/get_available_slots',async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.none(), get_available_slots);
router.post('/user_book_slot' ,async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), userBookSlot);
router.get('/get_expert_schedule_slot',async (req, res, next) => {
  await authenticateToken(req, res, next);
},upload.none(), getExpertScheduleSlot);

router.get('/get_sub_level_two_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubLevelTwoCategory);

router.get('/get_sub_level_three_categories',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getSubLevelThreeCategory);

router.post('/chat_file_upload', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.fields([{ name: 'image', maxCount: 1 }]), chatFileUpload);   

router.get('/get_expert_completed_jobs',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getExpertCompletedJobs);

router.get('/get_wallet_amount',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),  getWalletAmount);

router.get('/check_wallet_amount',async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(),checkWalletAmount);

router.post('/debit_wallet_amount', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), debitWalletAmount);

router.get('/generate_unique_id', upload.none(), generateUniqueId);

router.get('/get_token_variable', upload.none(), getTokenVariable);

router.post('/complete_job', async (req, res, next) => {
  await authenticateToken(req, res, next);
}, upload.none(), completeJob);

router.get('/get_expert_milestone_pdf', getExpertEarningPdf);

router.get('/get_wallet_pdf', upload.none(), getWalletPdf);

router.get('/get_expert_earning_pdf', upload.none(), getExpertAllEarningPdf);

router.get('/get_customer_pdf', upload.none(), getCustomerMilestoneCharge);



// endd
module.exports = router;


