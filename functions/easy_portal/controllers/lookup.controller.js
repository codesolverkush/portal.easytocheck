const refreshAccessToken = require("../utils/genaccestoken");
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");

const fetchContacts = async (req, res) => {

    try {
        const userId = req.currentUser?.user_id;
        const query = req.query.query; 
        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;
        const domain = user[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

 
        const escapeQuotes = (str) => str.replace(/'/g, "\\'");
        const safeFullName = escapeQuotes(query);

        const requestData = {
        select_query: `select Last_Name, First_Name,Email,Full_Name, Lead_Source from Contacts where (((Full_Name like '%${safeFullName}%'))) limit 1000`
        };

       
        try {
            const data = await handleZohoRequest(url, 'post', requestData, token);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'post', requestData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const fetchAccounts = async (req, res) => {

    try {
        const userId = req.currentUser?.user_id;
        const query = req.query.query; 
       
        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;
        const domain = user[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

 
        const escapeQuotes = (str) => str.replace(/'/g, "\\'");
        const safeFullName = escapeQuotes(query);

        const requestData = {
            select_query: `select Account_Name from Accounts where (((Account_Name like '%${safeFullName}%'))) limit 1000`
        };

      
        try {
            const data = await handleZohoRequest(url, 'post', requestData, token);
           
            return res.status(200).json({ success: true, data });
        } catch (error) {
        
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'post', requestData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};


module.exports = {fetchContacts,fetchAccounts}