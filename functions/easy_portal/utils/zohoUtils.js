const axios = require('axios');

const getAccessToken = async (orgId, res) => {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    
    const tokenQuery = `SELECT authcode FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
    const existingData = await zcql.executeZCQLQuery(tokenQuery);

    if (existingData.length === 0) {
        throw new Error("No token data found for the given orgId.");
    }

    return existingData[0].Connections.authcode || process.env.ACCESS_TOKEN;
};

const handleZohoRequest = async (url, method, data = null, token) => {
    try {
        console.time("zoho-request");
        const headers = {
            Authorization: `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
        };
        const response = await axios({ url, method, headers, data, timeout: 5000 });
        console.timeEnd("zoho-request");
        return response.data;

    } catch (error) {
        if (error.response?.data?.code === "INVALID_TOKEN") {
            throw new Error("TOKEN_EXPIRED"); 
        }
        throw error;
    }
};

module.exports = {getAccessToken,handleZohoRequest}
