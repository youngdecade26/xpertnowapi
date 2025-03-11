//common_call_function.js
const crypto = require('crypto');
const moment = require("moment");
const connection = require('../connection')
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

//token
async function generateToken(user_id) {
    // Define your variables
    const appID = "ca128bc49e004ef78b7112f92d63a224";
    const appCertificate = "d97e6402b4684249b85b902e66815055";
    const string=await generateRandomString(15);
    const channelName = `${string}_${user_id}`; // Unique channel name
    const uid = user_id; // Dynamic UID
    const role = RtcRole.PUBLISHER;
    // Token expiration in seconds
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    // Log inputs for debugging
    console.log({ appID, appCertificate, channelName, uid, role, privilegeExpiredTs });
    // Generate token
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(appID,appCertificate,channelName,uid,role,privilegeExpiredTs);
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

//token
async function generateTokenByChannel(user_id,channel_name){
    // Define your variables
    const appID = "ca128bc49e004ef78b7112f92d63a224";
    const appCertificate = "d97e6402b4684249b85b902e66815055";
    const channelName = channel_name; // Unique channel name
    const uid = user_id; // Dynamic UID
    const role = RtcRole.PUBLISHER;

    // Token expiration in seconds
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Log inputs for debugging
    console.log({ appID, appCertificate, channelName, uid, role, privilegeExpiredTs });

    // Generate token
    try {
        const token = RtcTokenBuilder.buildTokenWithUid(appID,appCertificate,channelName,uid,role,privilegeExpiredTs);
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


module.exports = {generateToken,generateTokenByChannel,generateRandomString};