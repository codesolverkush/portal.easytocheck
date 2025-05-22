const axios = require('axios');
const crypto = require('crypto');

// Encryption key and initialization vector - store these securely in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key'; // Must be 32 bytes for AES-256
const IV_LENGTH = 16; // For AES, this is always 16 bytes

/**
 * Encrypt a token string for secure storage
 * @param {string} token - The token to encrypt
 * @returns {string} - The encrypted token as a hex string
 */
const encryptForStorage = (token) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypt an encrypted token
 * @param {string} encryptedToken - The encrypted token (with IV prefix)
 * @returns {string} - The original decrypted token
 */
const decryptFromStorage = (encryptedToken) => {
  const textParts = encryptedToken.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = textParts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

/**
 * Get access token for the given organization ID
 * Returns the original token for immediate use but stores it encrypted
 * 
 * @param {string} orgId - Organization ID
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {string} - Original access token for immediate use
 */
const getAccessToken = async (orgId, req, res) => {
    // Check if encrypted token is already in cookies
    const existingEncryptedToken = req.cookies?.EPRUYFH002;
    
    if (existingEncryptedToken) {
        // Decrypt and return the original token
        return decryptFromStorage(existingEncryptedToken);
    }

    const { catalyst } = res.locals; 
    const zcql = catalyst.zcql();

    const tokenQuery = `SELECT authcode, MODIFIEDTIME FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
    const existingData = await zcql.executeZCQLQuery(tokenQuery);

    if (existingData.length === 0) {
        throw new Error("No token data found for the given orgId.");
    }

    const { authcode, MODIFIEDTIME } = existingData[0].Connections;

    // Convert MODIFIEDTIME string to a Date object
    const modifiedTime = new Date(MODIFIEDTIME.replace(" ", "T").replace(/:(\d{3})$/, '.$1'));
    const now = new Date();

    const tokenLifetime = 60 * 60 * 1000; // 60 minutes
    const timeElapsed = now - modifiedTime;
    const timeRemaining = Math.max(tokenLifetime - timeElapsed, 0);

    // Get the original token
    const originalToken = authcode || process.env.ACCESS_TOKEN;
    
    // Store the token encrypted in cookies for security
    if (timeRemaining > 0) {
        const encryptedToken = encryptForStorage(originalToken);
        res.cookie("EPRUYFH002", encryptedToken, {
            maxAge: timeRemaining,
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        });
    }

    // Return the original token for immediate use
    return originalToken;
};

// const getAccessToken = async (orgId,req, res) => {
//     // Check if accessToken is already in cookies
//     // const orgId = "4340000000094031";
//     const existingToken = req.cookies?.accessToken;
//     if (existingToken) {
//         return existingToken;
//     }

//     const { catalyst } = res.locals; 
//     const zcql = catalyst.zcql();

//     const tokenQuery = `SELECT authcode, MODIFIEDTIME FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
//     const existingData = await zcql.executeZCQLQuery(tokenQuery);

//     if (existingData.length === 0) {
//         throw new Error("No token data found for the given orgId.");
//     }

//     const { authcode, MODIFIEDTIME } = existingData[0].Connections;

//     // Convert MODIFIEDTIME string to a Date object
//     const modifiedTime = new Date(MODIFIEDTIME.replace(" ", "T").replace(/:(\d{3})$/, '.$1'));
//     const now = new Date();

//     const tokenLifetime = 60 * 60 * 1000; // 60 minutes
//     const timeElapsed = now - modifiedTime;
//     const timeRemaining = Math.max(tokenLifetime - timeElapsed, 0);

//     const token = authcode || process.env.ACCESS_TOKEN;

//     // Set token in cookies only if still valid
//     if (timeRemaining > 0) {
//         res.cookie("accessToken", token, {
//             maxAge: timeRemaining,
//             httpOnly: true,
//             secure: true,
//             sameSite: "Strict"
//         });
//     }

//     return token;
// };


const handleZohoRequest = async (url, method, data = null, token) => {
    try {
        const headers = {
            Authorization: `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
        };
        const response = await axios({ url, method, headers, data, timeout: 10000 });
        return response.data;

    } catch (error) {
        // console.log(error);
        if (error.response?.data?.code === "INVALID_TOKEN") {
            throw new Error("TOKEN_EXPIRED"); 
        }
        throw error;
    }
};





const getAccessToken2 = async (orgId, res) => {

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    
    const tokenQuery = `SELECT authcode FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
    const existingData = await zcql.executeZCQLQuery(tokenQuery);

    if (existingData.length === 0) {
        throw new Error("No token data found for the given orgId.");
    }

    const token = existingData[0].Connections.authcode || process.env.ACCESS_TOKEN;

    return token;
};


// const handleZohoRequest = async (url, method, data = null, token) => {
//     try {
//         console.time("zoho-request");
//         const headers = {
//             Authorization: `Zoho-oauthtoken ${token}`,
//             'Content-Type': 'application/json'
//         };

//         const response = await axios({
//             url,
//             method,
//             headers,
//             data,
//             timeout: 7000 // Optional: increase timeout a bit if Zoho is slow
//         });

//         console.timeEnd("zoho-request");
//         return response.data;

//     } catch (error) {
//         console.timeEnd("zoho-request");
      
//         if (error.response?.data?.code === "INVALID_TOKEN") {
//             throw new Error("TOKEN_EXPIRED");
//         }
//         throw error;
//     }
// };


module.exports = {getAccessToken,handleZohoRequest,getAccessToken2}
