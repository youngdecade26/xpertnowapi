const moment = require('moment-timezone');
module.exports = {
  app_name: "XpertNow App",
  app_logo: "https://youngdecade.org/2024/xpert/admin/xpertlog.png",
  ios_url: "https://www.apple.com/in/shop/buy-iphone/iphone-15-pro",
  android_url: "https://www.youtube.com/watch?v=hAKl-lXdZUo",
  admin_url: "https://youngdecade.org/2024/xpert/admin/",
  main_admin_url: "https://youngdecade.org/2024/xpert/admin/",
  base_admin_url: "https://youngdecade.org/2024/xpert/admin/",
  timezone: "America/New_York",
  currentTime: moment.tz("America/New_York").format("YYYY-MM-DD HH:mm:ss"),
};
