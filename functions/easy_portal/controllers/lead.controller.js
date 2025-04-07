const axios = require('axios');
const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');


// const getAccessToken = async (orgId, res) => {
//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();
    
//     const tokenQuery = `SELECT authcode FROM Connections WHERE orgid = '${orgId}' LIMIT 1`;
//     const existingData = await zcql.executeZCQLQuery(tokenQuery);
//     // console.log(existingData);

//     if (existingData.length === 0) {
//         throw new Error("No token data found for the given orgId.");
//     }

//     return existingData[0].Connections.authcode || process.env.ACCESS_TOKEN;
// };

// const handleZohoRequest = async (url, method, data = null, token) => {
//     try {
//         const headers = {
//             Authorization: `Zoho-oauthtoken ${token}`,
//             'Content-Type': 'application/json'
//         };
//         const response  = await axios({ url, method, headers, data, timeout: 10000 });
//         console.log("Request-response",response);
//         return response.data;
//     } catch (error) {
//         if (error.response?.data?.code === "INVALID_TOKEN") {
//             throw new Error("TOKEN_EXPIRED");
//         }
//         throw error;
//     }
// };

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

const getLead = async (req, res) => {
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
        const url = `https://www.zohoapis.com/crm/v7/settings/fields?module=Leads`;

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
        console.error("Error fetching lead:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const createLead = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        
        const accessScore = req.userDetails[0].usermanagement?.Leads;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: "Insufficient access rights to create a lead"});
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

        const leadData = { data: [req.body] };
        // console.log(leadData);
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Leads';

        try {
            const data = await handleZohoRequest(url, 'post', leadData, token);
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
            console.error("Error creating lead:", error.message);
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error("Error creating lead:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};


// Getting the data of the required module...

const getAllLeadDetails = async (req, res) => {
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
        const url = "https://www.zohoapis.com/crm/v7/Leads?fields=Last_Name,Full_Name,Company,Phone,Mobile,Email,Record_Status__s,smsmagic4__LeadIdCPY,Lead_Status,Converted__s,Converted_Date_Time&per_page=20";

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
            console.error("Error fetching all leads:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error fetching all leads:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const cacheRetriveForLead = async(req,res)=>{
    try {
        const {catalyst} = res.locals;
        const cache =  catalyst.cache(); 
        let segment = cache.segment(); 
        let data = await segment.getValue('LeadView'); 
        // cachePromise.then((entity) => { console.log(entity); });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
}

const cacheUpdateForLead = async (req, res) => {
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
        const url = "https://www.zohoapis.com/crm/v7/Leads?fields=Last_Name,Full_Name,Company,Phone,Mobile,Email,Record_Status__s,smsmagic4__LeadIdCPY,Lead_Status,Converted__s,Converted_Date_Time&per_page=20";

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
           
            // console.log("Zoho API Response:", data);

            if (!data || Object.keys(data).length === 0) {
                return res.status(500).json({ success: false, message: "Invalid response from Zoho API." });
            }

            // Convert data to a string for caching
            let cacheValue = JSON.stringify(data);
            let cachePromise = await segment.update('LeadView', cacheValue, 1);

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
            console.error("Error fetching all leads:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error fetching all leads:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};



const getLeadById = async (req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const {leadId} = req.params;

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/Leads/${leadId}`;

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


// Attchments file api...

const attachFile = async (req, res) => {
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
    console.log(token);
    const file = req?.file;
    console.log(file);

    if (!file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // Convert file buffer into a stream
    const fileStream = new stream.PassThrough();
    fileStream.end(file.buffer);

    // Create FormData instance and append the file
    const fileData = new FormData();
    fileData.append("file", fileStream, {
        filename: file.originalname,
        contentType: file.mimetype
    });

    const url = `https://www.zohoapis.com/crm/v7/Leads/5962890000003850001/Attachments`;

    try {
        const response = await axios.post(url, fileData, {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`,
                ...fileData.getHeaders()
            },
            timeout: 10000
        });

        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "File upload failed",
            error: error.message
        });
    }
};


// const getRecordById = async (req,res)=>{
//     try {
//         const userId = req.currentUser?.user_id;
//         if (!userId) {
//             return res.status(404).json({ success: false, message: "User ID not found." });
//         }

//         const {taskId} = req.params;

//         const { catalyst } = res.locals;
//         const zcql = catalyst.zcql();
//         const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
//         const user = await zcql.executeZCQLQuery(userQuery);
//         const orgId = user[0]?.usermanagement?.orgid;

//         if (!orgId) {
//             return res.status(404).json({ success: false, message: "Organization ID not found." });
//         }

//         let token = await getAccessToken(orgId, res);
//         const url = `https://www.zohoapis.com/crm/v7/Tasks/${taskId}`;

//         try {
//             const data = await handleZohoRequest(url, 'get', null, token);
//             return res.status(200).json({ success: true, data });

//         } catch (error) {
//             if (error.message === "TOKEN_EXPIRED") {
//                 try {
//                     token = await refreshAccessToken(req, res);
//                     process.env.ACCESS_TOKEN = token;
//                     const data = await handleZohoRequest(url, 'get', null, token);
//                     return res.status(200).json({ success: true, data });
//                 } catch (refreshError) {
//                     console.error("Error after token refresh:", refreshError.message);
//                     return res.status(500).json({ success: false, message: refreshError.message });
//                 }
//             }
//             console.error("Error fetching all events:", error.message);
//             return res.status(500).json({ success: false, message: error.message });
//         }

//     } catch (error) {
//         console.error("Error fetching all events:", error.message);
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: error.message });
//         }
//     }
// }

// Create the meeting for the check in...

const checkIn = async(req,res)=>{
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

        const checkInData = req.body;
        console.log(checkInData);
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Events';

        try {
            const data = await handleZohoRequest(url, 'post', checkInData, token);
            console.log(data);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'post', checkInData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, error: refreshError.response ? refreshError.response.data : refreshError.message });
                }
            }
            console.error("Error creating Meeting:", error.message);
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error("Error creating Meeting", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
}


// Update the lead

const updateLead = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;

        const accessScore = req.userDetails[0].usermanagement?.Leads;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: "Insufficient access rights to edit this lead"});
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

        const leadData = { data: [req.body] };
        // console.log(leadData);
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Leads';

        try {
            const data = await handleZohoRequest(url, 'put', leadData, token);
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
            console.error("Error creating lead:", error);
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error("Error creating lead:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};

module.exports = { createLead,getAllLeadDetails,getLeadById,getLead,attachFile,checkIn,cacheRetriveForLead,getAccessToken,handleZohoRequest, cacheUpdateForLead,updateLead };

