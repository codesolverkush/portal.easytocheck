const axios = require('axios');

// const getAccessToken = async (orgId, res) => {
//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();
    
//     const tokenQuery = `SELECT authcode,MODIFIEDTIME FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
//     const existingData = await zcql.executeZCQLQuery(tokenQuery);
//     console.log("CHeck it",existingData);

//     if (existingData.length === 0) {
//         throw new Error("No token data found for the given orgId.");
//     }

//     return existingData[0].Connections.authcode || process.env.ACCESS_TOKEN;
// };

const getAccessToken = async (orgId,req, res) => {
    // Check if accessToken is already in cookies
    // const orgId = "4340000000094031";
    const existingToken = req.cookies?.accessToken;
    if (existingToken) {
        return existingToken;
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

    const token = authcode || process.env.ACCESS_TOKEN;

    // Set token in cookies only if still valid
    if (timeRemaining > 0) {
        res.cookie("accessToken", token, {
            maxAge: timeRemaining,
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        });
    }

    return token;
};


const handleZohoRequest = async (url, method, data = null, token) => {
    try {
        const headers = {
            Authorization: `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
        };
        const response = await axios({ url, method, headers, data, timeout: 10000 });
        return response.data;

    } catch (error) {
        if (error.response?.data?.code === "INVALID_TOKEN") {
            throw new Error("TOKEN_EXPIRED"); 
        }
        throw error;
    }
};




// const tokenCache = {}; // { orgId: { token: string, expiresAt: timestamp } }

// const getAccessToken = async (orgId, res) => {
//     const currentTime = Date.now();

//     // Use token from cache if still valid (assume token is valid for 50 mins)
//     const cached = tokenCache[orgId];
//     if (cached && cached.expiresAt > currentTime) {
//         return cached.token;
//     }

//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();
    
//     const tokenQuery = `SELECT authcode FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
//     const existingData = await zcql.executeZCQLQuery(tokenQuery);

//     if (existingData.length === 0) {
//         throw new Error("No token data found for the given orgId.");
//     }

//     const token = existingData[0].Connections.authcode || process.env.ACCESS_TOKEN;

//     // Cache token for 50 minutes (assuming Zoho tokens last 1 hour)
//     tokenCache[orgId] = {
//         token,
//         expiresAt: currentTime + 50 * 60 * 1000,
//     };

//     return token;
// };


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


module.exports = {getAccessToken,handleZohoRequest}
