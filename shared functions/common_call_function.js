//common_call_function.js
const axios = require('axios');
const crypto = require('crypto');
const moment = require("moment");
const connection = require('../connection')
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const agoraCon = require('../shared functions/agora_confiq');
//token
async function generateToken(user_id) {
    // Define your variable
    const string=await generateRandomString(15);
    const channelName = `${string}_${user_id}`; // Unique channel name
    const uid = user_id; // Dynamic UID
    const role = RtcRole.PUBLISHER;
    // Token expiration in seconds
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    // Log inputs for debugging
    
    // Generate token
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(agoraCon.appID,agoraCon.appCertificate,channelName,uid,role,privilegeExpiredTs);
        return {
            token:token,
            channelName:channelName,
            uid:uid

        }
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
}

//generateResourceId
async function generateResourceId(user_id){
    const string = crypto.randomBytes(8).toString('hex'); // Generate a random string
    const channelName = `${string}_${user_id}`;
    const uid = user_id;
    const role = RtcRole.PUBLISHER;

    // Token expiration settings
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    
    try {
        // Generate RTC Token
        const token = RtcTokenBuilder.buildTokenWithUid(agoraCon.appID, agoraCon.appCertificate, channelName, uid, role, privilegeExpiredTs);

        // Encode authentication credentials
        const authorization = 'Basic ' + Buffer.from(`${agoraCon.customerID}:${agoraCon.customerSecret}`).toString('base64');

        // Agora API URL for acquiring a resource ID
        const url = `https://api.agora.io/v1/apps/${agoraCon.appID}/cloud_recording/acquire`;

        // API request payload
        const body = {
            cname: channelName,
            uid: String(uid),
            clientRequest: {
                resourceExpiredHour: 24
            }
        };

        // Make the API call to acquire the resource ID
        const response = await axios.post(url, body, {
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json',
            }
        });

        if(response.status === 200){
            const resourceId = response.data.resourceId;
            console.log("Resource ID acquired:", resourceId);

            return {
                token,
                channelName,
                uid,
                resourceId
            };
        } else {
            console.error("Failed to acquire resource ID:", response.data);
            return null;
        }

    } catch (error) {
        console.error("Error generating resource ID:", error);
        throw error;
    }
}

//token
async function generateTokenByChannel(user_id,channel_name){
    // Define your variables
    const channelName = channel_name; // Unique channel name
    const uid = user_id; // Dynamic UID
    const role = RtcRole.PUBLISHER;

    // Token expiration in seconds
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

   

    // Generate token
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(agoraCon.appID,agoraCon.appCertificate,channelName,uid,role,privilegeExpiredTs);
        return {
            token:token,
            channelName:channelName,
            uid:uid

        }
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
}

async function generateRandomString(limit) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < limit; i++) {
        randomString += characters[Math.floor(Math.random() * characters.length)];
    }
    return randomString;
}

const getResourceId = async (channelName, uid) => {
    try {
        const response = await axios.post(
            `https://api.agora.io/v1/apps/${agoraCon.AGORA_APP_ID}/cloud_recording/acquire`,
            {
                cname: channelName,
                uid: `${uid}`,
                clientRequest: {}
            },
            {
                auth: {
                    username: agoraCon.CUSTOMER_ID,
                    password: agoraCon.CUSTOMER_SECRET
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.data.resourceId) {
            throw new Error("Failed to get resource ID.");
        }
        return response.data.resourceId;
    } catch (error) {
        console.error("Error getting resource ID:", error.response?.data || error.message);
        throw error;
    }
};

module.exports = {generateToken,generateTokenByChannel,generateRandomString,generateResourceId,getResourceId};