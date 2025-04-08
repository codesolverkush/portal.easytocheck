const axios = require('axios');
const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');
const { getAccessToken, handleZohoRequest } = require("./lead.controller");


// Notes for the leads

const getNoteById = async (req, res) => {
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

        const { leadId } = req.params;
        const { module } = req.params;

        // console.log(module);

        // console.log(orgId);

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/${module}/${leadId}/Notes?fields=Note_Content,Note_Title,Created_Time,Parent_Id`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            // console.log(data);
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
        console.error("Error fetching lead:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};

const createNote = async (req, res) => {
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

        const { leadId } = req.params;
        const { module } = req.params;
        // console.log(leadId);

        if (!leadId || typeof leadId !== "string") {
            return res.status(400).json({ error: "Invalid Lead ID" });
        }


        const leadData = {
            data: [
                {
                    Note_Title: req.body.Note_Title,
                    Note_Content: req.body.Note_Content
                }
            ]
        };

        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.com/crm/v7/${module}/${leadId}/Notes`;

        try {
            const data = await handleZohoRequest(url, 'post', leadData, token);
            // console.log(data);
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

// Attachments for the lead

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

    const { leadId } = req.params;
    const { module } = req.params;

    let token = await getAccessToken(orgId, res);
    // console.log(token);
    const file = req?.file;
    // console.log(file);

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

    const url = `https://www.zohoapis.com/crm/v7/${module}/${leadId}/Attachments`;

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
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "File upload failed",
            error: error.message
        });
    }
};


const getAttachFile = async (req, res) => {
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

    const { leadId } = req.params;
    const { module } = req.params;

    let token = await getAccessToken(orgId, res);

    const url = `https://www.zohoapis.com/crm/v7/${module}/${leadId}/Attachments?fields=id,File_Name,Created_Time`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`
            },
            timeout: 10000
        });

        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Files fetching failed",
            error: error.message
        });
    }
};

const downloadAttachFile = async (req, res) => {
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

    const { leadId, attachementId } = req.params;

    let token = await getAccessToken(orgId, res);

    const url = `https://www.zohoapis.com/crm/v7/Leads/${leadId}/Attachments/${attachementId}`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Zoho-oauthtoken ${token}`
            },
            timeout: 10000
        });

        return res.status(200).json({ success: true, data: response.data });
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Files fetching failed",
            error: error.message
        });
    }
};


// Activities for the particular lead



const getOpenActivitiesById = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;

        if (!userId) {
            return res.status(404).json({ message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        const { What_Id, Who_Id, $se_module } = req.query;

        // console.log(What_Id, Who_Id, $se_module);

        let token = await getAccessToken(orgId, res);
        const url = "https://www.zohoapis.com/crm/v7/coql";



        let condition = "";

        if ($se_module === "Contacts") {
            condition = `Who_Id = ${Who_Id}`;
        } else{
            condition = `What_Id = ${What_Id}`;
        }

        const requestData = {
            select_query: `SELECT Subject, Due_Date, Status, Priority, Created_Time FROM Tasks WHERE ${condition} 
                   ORDER BY Created_Time DESC`
        };
// console.log("request data", requestData);

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
        console.error("Error fetching lead:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
};



const createOpenActivity = async (req, res) => {
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


        const taskData = {
            data: [
                {
                    Subject: req.body.Subject,
                    Priority: req.body.Priority,
                    Status: req.body.Status,
                    Due_Date: req.body.Due_Date,
                    $se_module: req.body.$se_module,
                    Who_Id: req.body.Who_Id,
                    What_Id: req.body.What_Id
                }
            ]
        };



        // console.log(taskData);


        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Tasks';

        try {
            const data = await handleZohoRequest(url, 'post', taskData, token);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'post', taskData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, error: refreshError.response ? refreshError.response.data : refreshError.message });
                }
            }
            console.error("Error creating task:", error.message);
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error("Error creating task:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};



module.exports = { getNoteById, createNote, attachFile, getAttachFile, getOpenActivitiesById, createOpenActivity };