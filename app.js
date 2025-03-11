require('dotenv').config();
const express = require('express');
const app = express();
const UserRouter = require('./routes/app_routes');
const AdminRouter = require('./adminapi/router/admin_router');
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3002;
// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use('/', UserRouter);
app.use('/adminapi', AdminRouter);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on :${PORT}`);
});
