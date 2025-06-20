// Task related api...

const refreshAccessToken = require("../utils/genaccestoken");
const { getAccessToken, handleZohoRequest } = require("./lead.controller");


const getMeetingById = async (req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const {meetingId} = req.params;

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/Events/${meetingId}`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'get', null, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            }
            console.error("Error fetching all events:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error fetching all events:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}


// To do work
// 1. Write the create meeting api
// 2. Update the meeting api




module.exports = {getMeetingById};
