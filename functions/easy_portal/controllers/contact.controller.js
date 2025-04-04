const refreshAccessToken = require("../utils/genaccestoken");
const { getAccessToken, handleZohoRequest } = require("./lead.controller");

const getContactFields = async (req, res) => {
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
        const url = `https://www.zohoapis.com/crm/v7/settings/fields?module=Contacts`;

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
        console.error("Error fetching Contacts:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const getAllContacts = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
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

        let token = await getAccessToken(orgId, res);
        const url = "https://www.zohoapis.com/crm/v7/Contacts?fields=Full_Name,Email,Lead_Source,Phone&per_page=20";

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
            console.error("Error fetching all tasks:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error fetching all tasks:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const cacheRetriveForContact = async(req,res)=>{
    try {
        const {catalyst} = res.locals;
        const cache =  catalyst.cache(); 
        let segment = cache.segment(); 
        let data = await segment.getValue('ContactView'); 
        // cachePromise.then((entity) => { console.log(entity); });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
}

const createContact = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;

        // Check for access control
        const accessScore = req.userDetails[0].usermanagement?.Contacts;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: "Insufficient access rights to create a contact"});
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

        const contactData = { data: [req.body] };
        
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Contacts';

        try {
            const data = await handleZohoRequest(url, 'post', contactData, token);
            console.log(data);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'post', leadData, token);
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

const getContactById = async (req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const {contactId} = req.params;

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/Contacts/${contactId}`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            return res.status(200).json({ success: true, data,username: req.currentUser.first_name + req.currentUser.last_name });

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
            console.error("Error fetching in contact:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error fetching in contact:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};


const cacheUpdateContact = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const cache = catalyst.cache();
        const segment = cache.segment();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = "https://www.zohoapis.com/crm/v7/Contacts?fields=Full_Name,Email,Lead_Source,Phone&per_page=20";

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            
            // console.log("Zoho API Response:", data);

            if (!data || Object.keys(data).length === 0) {
                return res.status(500).json({ success: false, message: "Invalid response from Zoho API." });
            }

            // Convert data to a string for caching
            let cacheValue = JSON.stringify(data);
            let cachePromise = await segment.update('ContactView', cacheValue, 1);
             
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
            console.error("Error fetching all tasks:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error fetching all tasks:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};


const updateContact = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;

        // check for access control
        const accessScore = req.userDetails[0].usermanagement?.Contacts;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: "Insufficient access rights to create a contact"});
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

        const contactData = { data: [req.body] };
        
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Contacts';

        try {
            const data = await handleZohoRequest(url, 'put', contactData, token);
            console.log(data);
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



module.exports = { getContactFields,getAllContacts,createContact,getContactById,cacheRetriveForContact,cacheUpdateContact,updateContact };
