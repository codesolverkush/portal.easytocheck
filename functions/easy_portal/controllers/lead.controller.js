const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");


// Lead controller 
const getLead = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
                
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

        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/settings/fields?module=Leads`;

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

const searchRecords = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
                        
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;
        const domain = user[0]?.usermanagement?.domain;
        const { email, phone,company } = req.query;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const contactSearchurl = `https://www.zohoapis.${domain}/crm/v3/Contacts/search?criteria=${encodeURIComponent(`(Email:equals:${email})or(Mobile:equals:${phone})`)}`;
        const accountSearchurl = `https://www.zohoapis.${domain}/crm/v3/Accounts/search?criteria=${encodeURIComponent(`(Account_Name:equals:${company})`)}`;
    
           
        try {
            const contactdata = await handleZohoRequest(contactSearchurl, 'get', null, token);
            const accountData = await handleZohoRequest(accountSearchurl, 'get', null, token);
            const data = {"Contact" : contactdata, "Account" : accountData};
            return res.status(200).json({ success: true, data});
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const contactdata = await handleZohoRequest(contactSearchurl, 'get', null, token);
                    const accountData = await handleZohoRequest(accountSearchurl, 'get', null, token);
                    const data = {"Contact" : contactdata, "Account" : accountData};
                    return res.status(200).json({ success: true, data});
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

const convertLead = async (req,res)=>{
 

    try {
        const userId = req.currentUser?.user_id;
        // const userId = '4340000000085001';
        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        // const accessScore = req.userDetails[0].usermanagement?.Leads; 
    
        // if(accessScore < 3){
        //     return res.status(403).json({success: false, message: `Insufficient access rights to convert a Lead`});
        // }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;
        const domain = user[0]?.usermanagement?.domain;
        const { leadId,accountId,contactId,dealName,closingDate,amount} = req.body;       
        
        // const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
    
        // Create the main map (object in JavaScript)
            const mp = {};
            mp.overwrite = true;
            mp.notify_lead_owner = true;
            mp.notify_new_entity_owner = true;
    
            // Create account and contact maps
            const accountMap = {};
            accountMap.id = accountId || null;
    
            const contactMap = {};
            contactMap.id = contactId || null;
    
            // Add account and contact maps to main map
            mp.Accounts = accountMap;
            mp.Contacts = contactMap;
    
            // Create deal map
            const dealMap = {};
            dealMap.Deal_Name = dealName;
            dealMap.Closing_Date = closingDate;
            dealMap.Amount = amount
            dealMap.Pipeline = "Standard (Standard)";
   
            // Add deal map to main map
            mp.Deals = dealMap;
    
            // Create list and add main map to it
            const list = [];
            list.push(mp);
    
            // Create response map and add list to it
            const responseMap = {};
            responseMap.data = list;

    

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/Leads/${leadId}/actions/convert`
           
        try {
            const data = await handleZohoRequest(url, 'post', responseMap, token);
            return res.status(200).json({ success: true, data});
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED"){
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'post',responseMap, token);
                    return res.status(200).json({ success: true, data});
                } catch (refreshError) {
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
    
 
}

// Create the meeting for the check in...

const checkIn = async(req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;
        const domain = user[0]?.usermanagement?.domain;


        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        const checkInData = req.body;
       
        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/Events`;

        try {
            const data = await handleZohoRequest(url, 'post', checkInData, token);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'post', checkInData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    return res.status(500).json({ success: false, error: refreshError.response ? refreshError.response.data : refreshError.message });
                }
            }
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
}




module.exports = { getLead,checkIn,convertLead,searchRecords };

