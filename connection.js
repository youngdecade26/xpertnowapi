const mysql = require('mysql');
// Create a MySQL connection
const connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE_NAME
});
// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL');
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});
module.exports = connection