const axios = require('axios');
const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');

const getAccessToken = async (orgId, res) => {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    
    const tokenQuery = `SELECT authcode FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
    const existingData = await zcql.executeZCQLQuery(tokenQuery);
    // console.log(existingData);

    if (existingData.length === 0) {
        throw new Error("No token data found for the given orgId.");
    }

    return existingData[0].Connections.authcode || process.env.ACCESS_TOKEN;
};

const handleZohoRequest = async (url, method, data = null, token) => {
    try {
        const headers = {
            Authorization: `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json'
        };
        const response  = await axios({ url, method, headers, data, timeout: 10000 });
        return response.data;
    } catch (error) {
        if (error.response?.data?.code === "INVALID_TOKEN") {
            throw new Error("TOKEN_EXPIRED");
        }
        throw error;
    }
};

const getDeal = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        // console.log(userId);
        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        // console.log(orgId);

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/settings/fields?module=Deals`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'get', null, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error fetching deals:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const getDealbyConid = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        // console.log(userId);
        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        // console.log(orgId);

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/settings/fields?module=Deals`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'get', null, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error fetching deals:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const createDeal = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        
        const accessScore = req.userDetails[0].usermanagement?.Deals;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: "Insufficient access rights to create a Deal"});
        }
        
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;


        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        const dealData = { data: [req.body] };
        // console.log(dealData);
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Deals';

        try {
            const data = await handleZohoRequest(url, 'post', dealData, token);
            // console.log(data);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'post', dealData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, error: refreshError.response ? refreshError.response.data : refreshError.message });
                }
            }
            console.error("Error creating Deal:", error.message);
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error("Error creating Deal:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};


const getDealById = async (req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const {dealId} = req.params;

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/Deals/${dealId}`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            // console.log(data);
            return res.status(200).json({ success: true, data, username: req.currentUser.first_name + req.currentUser.last_name });
            
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'get', null, token);
                    return res.status(200).json({ success: true, data,username: req.currentUser.first_name + req.currentUser.last_name });
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
};


const cacheRetriveForDeal = async(req,res)=>{
    try {
        const {catalyst} = res.locals;
        const cache =  catalyst.cache(); 
        let segment = cache.segment(); 
        let data = await segment.getValue('DealView'); 
        // cachePromise.then((entity) => { console.log(entity); });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        // console.log(error);
        res.send("Error");
    }
}

const getDealFields = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        // console.log(userId);
        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        // console.log(orgId);

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/settings/fields?module=Deals`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'get', null, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error fetching Deals:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const updateDeal = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;

        // check for access control
        const accessScore = req.userDetails[0].usermanagement?.Deals;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: "Insufficient access rights to update this deal"});
        }

        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;


        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        const dealData = { data: [req.body] };
        
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Deals';

        try {
            const data = await handleZohoRequest(url, 'put', dealData, token);
            // console.log(data);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'put', leadData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, error: refreshError.response ? refreshError.response.data : refreshError.message });
                }
            }
            console.error("Error creating contact:", error.message);
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error("Error creating contact:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};

const associatedDealWithContact = async (req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        // console.log(userId);
        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;
        // console.log(orgId);

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }
        const {contactId} = req.params;
        console.log(contactId);

        let token = await getAccessToken(orgId, res);
        const url = "https://www.zohoapis.com/crm/v7/coql";
        const requestData = {
            select_query: `SELECT Deal_Name, id, Closing_Date, Created_Time, Amount, Stage, Account_Name FROM Deals WHERE Contact_Name = ${contactId} ORDER BY Created_Time DESC LIMIT 1000`
        };

        console.log(requestData);
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
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error("Error fetching Deals:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = {getAccessToken,handleZohoRequest,getDeal,getDealById,createDeal,cacheRetriveForDeal,getDealFields,updateDeal, associatedDealWithContact};