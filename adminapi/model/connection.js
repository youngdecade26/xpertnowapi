var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "xpertnowapp.ch0gwucc0tlw.ap-south-1.rds.amazonaws.com",
  user: "xpertadmin",
  password: "21Mruq9jIex5O9dCVeOA",
  database: "xpertnowDB",
});
connection.connect((err) => {
  if (err) {
    console.log("error in connection database...!!");
  } else {
    console.log("database Connected successfully..!!!");
  }
});
module.exports = connection;
