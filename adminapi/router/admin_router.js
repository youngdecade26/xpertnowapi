const express = require("express");
const router = express.Router();
const upload = require("../controller/multer");
const {
  FetchUser,
  FetchDeactiveUser,
  FetchExpert,
  FetchDeactiveExpert,
  fetchuserDate,
  ViewUser,
  ViewSubAdminUser,
  SocialLinks,
  DeleteUser,
  FetchDeleteUser,
  FetchPostDetails,
  ViewPost,
  DeletePost,
  FetchCategory,
  AddCategory,
  DeleteCategory,
  DeleteSubCategory,
  DeleteSubLevelCategory,
  DeleteSubTwoLevelCategory,
  DeleteSubThreeLevelCategory,
  UpdateCategory,
  FetchAllSubscriptions,
  DeleteSubscription,
  DeleteSubAdmin,
  DeleteJobPost,
  EditSubscription,
  EditSubAdmin,
  FetchSubscribedUsers,
  FetchReportedContent,
  EditReportedContent,
  fetchaboutcontent,
  updateContent,
  FetchContactUs,
  updateStatus,
  ViewReplymsg,
  BroadcastAll,
  Users,
  FetchSubscribedUsersByDate,
  AdminData,
  UpdateAdminPassword,
  fetchSubscriptionById,
  fetchpostdetailsById,
  UpdateAdminProfile,
  UserCount,
  Adminlogin,
  AdminForgetPassword,
  AdminForgetNewPassword,
  CheckAdminEmail,
  getCount,
  getSubscriptionCount,
  getEarningCount,
  getContactCount,
  ActivateDeactivate,
  AcceptRejectExpert,
  postAnalyticalreport,
  send_notification,
  getExportDetails,
  FetchDeleteExperts,
  FetchSubCategory,
  getCatgoryAll,
  getSubCatgoryAll,
  getSubOneCatgoryAll,
  getSubTwoCatgoryAll,
  AddSubCategory,
  UpdateSubCategory,
  FetchSubLevelCategory,
  FetchSubTwoLevelCategory,
  FetchSubThreeLevelCategory,
  UpdateSubLevelCategory,
  UpdateSubTwoLevelCategory,
  UpdateSubThreeLevelCategory,
  AddSubLevelCategory,
  AddSubTwoLevelCategory,
  AddSubThreeLevelCategory,
  FetchDegree,
  AddDegree,
  EditDegree,
  DeleteDegree,
  FetchLanguage,
  AddLanguage,
  EditLanguage,
  DeleteLanguage,
  FetchSubscription,
  AddSubscription,
  ViewSubscription,
  GetSubadminData,
  ManageSubAdmin,
  FetchFAQ,
  AddFAQ,
  EditFAQ,
  DeleteFaq,
  ViewFAQById,
  UpdateCallCharge,
  EditCallCharge,
  FetchCommission,
  EditExpertCallCharge,
  EditCommission, EditTax,
  EditMiniWithdrawalAmt,
  ManagePost,
  ViewPostById,
  getStateAll,
  getCityAll,
  AddCity,
  DeleteCity,
  DeleteRating,
  EditCity,
  getWithdrawalRequest,
  getWithdrawalRequestById,
  getRefundRequestById,
  FetchSubscribedExpert,
  ViewSubExpert,
  viewExpertEye,
  updateExpertEye,
  getRating,
  getUserRating,
  getUserPost,
  getPostMilestone,
  getExpertRating,
  getConsultationById,
  getEarningById,
  getUserConsultationById,
  getUserWalletDetailsId,
  getExpertPost,
  FetchNdaPrice,
  EditNdaPrice,
  getUserTabularReport,
  getInactiveUserTabularReport,
  getActiveUserTabularReport,
  getExpertTabularReport,
  getInactiveExpertTabularReport,
  getJobPostTabularReport,
  getUserAnalyticalReport,
  getExpertAnalyticalReport,
  getPostAnalyticalReport,
  ManageEarnings,
  getEarningTabularReport,
  getEarningAnalyticalReport,
  AcceptWithdrawRequest,
  MarkAsResolved,
  RejectWithdrawRequest,
  getContactUs,
  sendReplyController,
  getEarningDetailsById,
  getRefundRequest,
  sendMailController,
  sendInactiveMailController,
  AddSubAdmin,
  FetchInactiveExpert,
  FetchInactiveUser,
  updateAdminDetails,
  adminDetails,
  GetDetailsUpdateRequests,
  UpdateDetailsRequestStatus,
  getAllRefundRequests,
} = require("../controller/admin_controller");
router.post("/send_notification", upload.none(), send_notification);
router.get("/get_manage_inactive_users", upload.none(), FetchInactiveUser);
router.get("/get_manage_inactive_expert", upload.none(), FetchInactiveExpert);
router.get("/get_manage_users", upload.none(), FetchUser);
router.get("/get_manage_deactive_users", upload.none(), FetchDeactiveUser);
router.get("/get_manage_expert", upload.none(), FetchExpert);
router.get("/get_deactive_manage_expert", upload.none(), FetchDeactiveExpert);
router.get("/fetchuserDate", upload.none(), fetchuserDate);
router.get(
  "/FetchSubscribedUsersByDate",
  upload.none(),
  FetchSubscribedUsersByDate
);
router.get("/viewuser/:user_id", ViewUser);
router.get("/viewsubexpert/:expert_subscription_id", ViewSubExpert);
router.get("/SocialLinks", SocialLinks);
router.post("/deleteUser", upload.none(), DeleteUser);
router.post("/ActivateDeactivate", upload.none(), ActivateDeactivate);
router.post("/AcceptRejectExpert", upload.none(), AcceptRejectExpert);
router.get("/get_deleted_users", upload.none(), FetchDeleteUser);
router.get("/get_deleted_experts", upload.none(), FetchDeleteExperts);
router.get("/fetchpostdetails", upload.none(), FetchPostDetails);
router.get("/viewpost", ViewPost);
router.post("/deletepost", upload.none(), DeletePost);
router.post("/deletecategory", upload.none(), DeleteCategory);
router.post("/editCategory", upload.none(), UpdateCategory);
router.get("/getAllSubscription", upload.none(), FetchAllSubscriptions);
router.get("/FetchSubscribedUsers", upload.none(), FetchSubscribedUsers);
router.get("/FetchReportedContent", upload.none(), FetchReportedContent);
router.post("/EditReportedContent", upload.none(), EditReportedContent);
router.get("/fetchaboutcontent", upload.none(), fetchaboutcontent);
router.post("/updateContent", upload.none(), updateContent);
router.get("/FetchContactUs", upload.none(), FetchContactUs);
router.post("/updateStatus", upload.none(), updateStatus);
router.post("/ViewReplymsg", upload.none(), ViewReplymsg);
router.post("/BroadcastAll", upload.none(), BroadcastAll);
router.post("/get_admin_details", upload.none(), AdminData);
router.post("/UpdateAdminProfile", UpdateAdminProfile);
router.post("/update_admin_profile", upload.none(), updateAdminDetails);
router.post("/UpdateAdminPassword", upload.none(), UpdateAdminPassword);
router.get("/fetchSubscriptionById/:user_id", fetchSubscriptionById);
router.get("/fetchpostdetailsById/:user_id", fetchpostdetailsById);
router.get("/UserCount", upload.none(), UserCount);
// fetchuser
router.get("/users", upload.none(), Users);
router.post("/sign_in", upload.none(), Adminlogin);
router.post("/forgot_password", upload.none(), AdminForgetPassword);
router.post(
  "/forgot_password_change_password",
  upload.none(),
  AdminForgetNewPassword
);
router.post("/CheckAdminEmail", upload.none(), CheckAdminEmail);
// Dashboard count all the data
router.get("/get_count", upload.none(), getCount);
router.get("/getSubscriptionCount", upload.none(), getSubscriptionCount);
router.get("/getEarningCount", upload.none(), getEarningCount);
router.get("/getContactCount", upload.none(), getContactCount);
router.get("/postAnalyticalreport", upload.none(), postAnalyticalreport);
router.get("/get_export_By_Id/:expert_id", getExportDetails);
//Add category
router.post("/add_category", AddCategory);
router.get("/manage_category", upload.none(), FetchCategory);
router.get("/manage_subcategory", upload.none(), FetchSubCategory);
router.post("/deletesubcategory", upload.none(), DeleteSubCategory);
router.get("/fetch_category_all", getCatgoryAll);
router.post("/add_subcategory", upload.none(), AddSubCategory);
router.post("/editSubCategory", upload.none(), UpdateSubCategory);
router.get("/manage_sublevelcategory", upload.none(), FetchSubLevelCategory);
router.post("/deletesublevelcategory", upload.none(), DeleteSubLevelCategory);
router.get("/fetch_subcategory_all", getSubCatgoryAll);
router.post("/editSublevelCategory", upload.none(), UpdateSubLevelCategory);
router.post("/add_sublevelcategory", upload.single("image"), AddSubLevelCategory);
router.get("/fetch_subonecategory_all", getSubOneCatgoryAll);
router.get("/manage_subtwolevelcategory", upload.none(), FetchSubTwoLevelCategory);
router.post("/add_subtwolevelcategory", upload.none(), AddSubTwoLevelCategory);
router.post("/editSubTwolevelCategory", upload.none(), UpdateSubTwoLevelCategory);
router.post("/deletesubtwolevelcategory", upload.none(), DeleteSubTwoLevelCategory);
router.get("/fetch_subtwocategory_all", getSubTwoCatgoryAll);
router.post(
  "/add_subthreelevelcategory",
  upload.none(),
  AddSubThreeLevelCategory
);
router.get(
  "/manage_subthreelevelcategory",
  upload.none(),
  FetchSubThreeLevelCategory
);
router.post(
  "/editSubThreelevelCategory",
  upload.none(),
  UpdateSubThreeLevelCategory
);
router.post(
  "/deletesubthreelevelcategory",
  upload.none(),
  DeleteSubThreeLevelCategory
);
router.get("/manage_degree", upload.none(), FetchDegree);
router.post("/add_degree", upload.none(), AddDegree);
router.post("/edit_degree", upload.none(), EditDegree);
router.post("/delete_degree", upload.none(), DeleteDegree);
router.get("/manage_language", upload.none(), FetchLanguage);
router.post("/add_language", upload.none(), AddLanguage);
router.post("/edit_language", upload.none(), EditLanguage);
router.post("/delete_language", upload.none(), DeleteLanguage);
router.get("/manage_subscription", upload.none(), FetchSubscription);
router.post("/add_subscription", upload.none(), AddSubscription);
router.post("/delete_subscription", upload.none(), DeleteSubscription);
router.get("/view_subscription/:subscription_id", ViewSubscription);
router.post("/edit_subscription", upload.none(), EditSubscription);
// subadmin
router.get("/manage_subadmin", upload.none(), ManageSubAdmin);
router.post("/add_subadmin", upload.none(), AddSubAdmin);
router.post("/delete_subadmin", upload.none(), DeleteSubAdmin);
router.post("/delete_jobpost", upload.none(), DeleteJobPost);
router.get("/get_subadmin_data_by_id/:user_id", GetSubadminData);
router.post("/edit_subadmin", upload.none(), EditSubAdmin);
router.get("/viewsubadminuser/:user_id", ViewSubAdminUser);
//fetch faq
router.get("/manage_faq", FetchFAQ);
router.post('/add_faq', upload.none(), AddFAQ);
router.post('/edit_faq', upload.none(), EditFAQ);
router.post('/delete_faq', upload.none(), DeleteFaq);
router.get("/view_faq/:customer_support_id", ViewFAQById);
router.get("/fetch_call_charge", UpdateCallCharge);
router.post("/edit_expert_call_charge", upload.none(), EditExpertCallCharge);
router.post("/edit_call_charge", upload.none(), EditCallCharge);
router.get("/fetch_commission", FetchCommission);
router.post("/edit_commission", upload.none(), EditCommission);
router.post("/edit_tax", upload.none(), EditTax);
router.post("/edit_mini_withdrawal_amt", upload.none(), EditMiniWithdrawalAmt);
router.get("/manage_post", upload.none(), ManagePost);
router.get("/view_post/:post_id", ViewPostById);
router.get("/fetch_state_all", getStateAll);
router.get("/fetch_city_all", getCityAll);
router.post("/add_city", upload.none(), AddCity);
router.post("/delete_city", upload.none(), DeleteCity);
router.post("/delete_rating", upload.none(), DeleteRating);
router.post("/edit_city", upload.none(), EditCity);
router.get("/get_withdrawal_request", upload.none(), getWithdrawalRequest);
router.get("/get_withdrawal_request_by_id/:withdraw_id", getWithdrawalRequestById);
router.get("/get_refund_request", upload.none(), getRefundRequest);
router.get("/get_sub_expert", upload.none(), FetchSubscribedExpert);
router.get("/fetch_expert_eye", viewExpertEye);
router.post("/update_expert_eye", upload.none(), updateExpertEye);
router.get("/get_rating", getRating);
router.get("/get_user_rating", getUserRating);
router.get("/get_user_post", getUserPost);
router.get("/get_milestones", getPostMilestone);
router.get("/get_expert_rating", getExpertRating);
router.get("/get_expert_consultation_by_id", getConsultationById);
router.get("/get_expert_earning_by_id", getEarningById);
router.get("/get_user_consultation_by_id", getUserConsultationById);
router.get("/get_wallet_details_by_id", getUserWalletDetailsId);
router.get("/get_expert_post", getExpertPost);
router.get("/fetch_nda_price", FetchNdaPrice);
router.post("/edit_nda_price", upload.none(), EditNdaPrice);
router.post("/user_report", upload.none(), getUserTabularReport);
router.post("/inactive_user_report", upload.none(), getInactiveUserTabularReport);
router.post(
  "/active_user_report",
  upload.none(),
  getActiveUserTabularReport
);
router.post("/expert_report", upload.none(), getExpertTabularReport);
router.post("/inactive_expert_report", upload.none(), getInactiveExpertTabularReport);
router.post("/post_report", upload.none(), getJobPostTabularReport);
router.post("/earning_report", upload.none(), getEarningTabularReport);
router.get("/get_user_analytical_count", getUserAnalyticalReport);
router.get("/get_expert_analytical_count", getExpertAnalyticalReport);
router.get("/get_post_analytical_count", getPostAnalyticalReport);
router.get("/get_earning_analytical_count", getEarningAnalyticalReport);
router.get("/get_earning", ManageEarnings);
router.get("/get_earning_details_by_id/:expert_earning_id", getEarningDetailsById);
router.post("/accept_withdraw", upload.none(), AcceptWithdrawRequest);
router.post("/reject_withdraw", upload.none(), RejectWithdrawRequest);
router.get("/get_contact_us_details", getContactUs);
router.post("/send_reply", upload.none(), sendReplyController);
router.post("/mark_as_resolved", upload.none(), MarkAsResolved);
router.post("/send_mail", upload.none(), sendMailController);
router.post("/send_inactive_mail", upload.none(), sendInactiveMailController);
router.get(
  "/get_refund_request_by_id/:milestone_id",
  getRefundRequestById
);
router.get('/get_admin_details', adminDetails);

router.get("/get_details_update_request", upload.none(), GetDetailsUpdateRequests);
router.post("/update_detail_request", upload.none(), UpdateDetailsRequestStatus);
router.get('/get_refunds', getAllRefundRequests);


// changess
module.exports = router;
