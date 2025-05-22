
const axios = require('axios');

const  genaccesstokenadmin = async (orgId,domain,req, res) => {
            const { catalyst } = res?.locals;
    try {
        const zcql = catalyst.zcql();

        if (!orgId) {
            throw new Error("No organization ID found for the user");
        }

        const tokenQuery = 
            `SELECT ROWID, clientid, clientsecret,refreshtoken 
             FROM Connections  
             WHERE orgid = '${orgId}' 
             LIMIT 1`;

        const existingData = await zcql.executeZCQLQuery(tokenQuery);
        
        if (existingData.length === 0) {
            throw new Error("No token data found for the given orgId");
        }

        const { clientid, clientsecret, refreshtoken, ROWID} = existingData[0].Connections;

        const url = `https://accounts.zoho.${domain}/oauth/v2/token`;

        const params = new URLSearchParams();
        params.append('refresh_token', refreshtoken);
        params.append('client_id', clientid);
        params.append('client_secret', clientsecret);
        params.append('grant_type', 'refresh_token');

        const response = await axios.post(url, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const newAccessToken = response.data.access_token;
        
        const updateQuery = `UPDATE Connections 
                         SET authcode = '${newAccessToken}' 
                         WHERE ROWID = '${ROWID}'`;
        await zcql.executeZCQLQuery(updateQuery);


        res.cookie("accessToken", newAccessToken, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        });

        return newAccessToken;
    } catch (error) {
        // console.error("Error refreshing token:", error);
        throw error;
    }
};


module.exports = genaccesstokenadmin;