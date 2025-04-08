// Task related api...

const refreshAccessToken = require("../utils/genaccestoken");
const { getAccessToken, handleZohoRequest } = require("./lead.controller");

const getAllTasks = async (req, res) => {
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
        const url = "https://www.zohoapis.com/crm/v7/Tasks?fields=Subject,Due_Date,Status,Priority&per_page=20";

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



// Test for cache purpose 

const cacheRetrive = async(req,res)=>{
    try {
        const {catalyst} = res.locals;
        const cache =  catalyst.cache(); 
        let segment = cache.segment(); 
        let data = await segment.getValue('TaskView'); 
        // cachePromise.then((entity) => { console.log(entity); });
        return res.status(200).json({ success: true, data });
    } catch (error) {
        // console.log(error);
        res.send("Error");
    }
}

const cacheUpdate = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const cache = catalyst.cache();
        let segment = cache.segment();

        // Fetch organization ID
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId, res);
        const url = "https://www.zohoapis.com/crm/v7/Tasks?fields=Subject,Due_Date,Status,Priority&per_page=20";

        try {
            // Fetch tasks from Zoho API
            const data = await handleZohoRequest(url, 'get', null, token);
           
            if (!data || Object.keys(data).length === 0) {
                return res.status(500).json({ success: false, message: "Invalid response from Zoho API." });
            }

            // Convert data to a string for caching
            let cacheValue = JSON.stringify(data);
            let cachePromise = await segment.update('ContactView', cacheValue, 1);


            return res.status(200).json({ success: true, message: "Cache updated successfully", data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    // Refresh token and retry fetching tasks
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'get', null, token);

                    // Update cache after fetching tasks again
                    let cachePromise = segment.update('TaskView', data, 1);
                    cachePromise.then((entity) => {
                        console.log("Cache Updated After Token Refresh:", entity);
                    });

                    return res.status(200).json({ success: true, message: "Cache updated successfully after token refresh", data });

                } catch (refreshError) {
                    console.error("Error after token refresh:", refreshError.message);
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            }
            console.error("Error updating cache:", error.message);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error("Error in cache update:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};




const createTask = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        const taskAccess = req.userDetails[0]?.usermanagement.Tasks;

        // console.log(taskAccess);
        // console.log(userId);
        if (!userId ) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }
        if(taskAccess == 1){
            return res.status(401).json({success: false, message: "Unauthorized User!"})
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        const user = await zcql.executeZCQLQuery(userQuery);
        const orgId = user[0]?.usermanagement?.orgid;


        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        const taskData = { data: [req.body] };
        
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Tasks';

        try {
            const data = await handleZohoRequest(url, 'post', taskData, token);
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

const getRecordById = async (req,res)=>{
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
        const url = `https://www.zohoapis.com/crm/v7/Tasks/${leadId}`;

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

const updateTask = async (req, res) => {
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

        const taskData = { data: [req.body] };
        
       
        let token = await getAccessToken(orgId, res);
        const url = 'https://www.zohoapis.com/crm/v7/Tasks';

        try {
            const data = await handleZohoRequest(url, 'put', taskData, token);
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



module.exports = { getAllTasks, createTask,getRecordById,cacheRetrive,cacheUpdate,updateTask};
