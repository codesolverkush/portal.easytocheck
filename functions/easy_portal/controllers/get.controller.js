const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");

// THIS IS NOT IN USED
const totalLead = async (req, res) => {
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

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        // const requestData = {
        //     select_query: "SELECT Last_Name, First_Name, Email FROM Leads WHERE Last_Name != '' LIMIT 1000"
        // };

         const requestData = {
            select_query: "select COUNT(id) from Leads where Last_Name != ''"
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


const totalTask = async (req, res) => {
    try {
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: "SELECT Subject,Due_Date,Status,Priority,Created_Time FROM Tasks WHERE Subject != '' ORDER BY Created_Time DESC LIMIT 1000"
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


const totalMeeting = async (req, res) => {
    try {

        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;


        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: "SELECT id, Event_Title, Start_DateTime, End_DateTime, Owner, Created_Time FROM Events WHERE Event_Title != '' ORDER BY Created_Time DESC LIMIT 1000"
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

const totalDeals = async (req, res) => {
    try {
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: `SELECT COUNT(id) FROM Deals WHERE Stage != '' ORDER BY Created_Time DESC LIMIT 1000`
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

const totalContacts = async (req, res) => {
    try {
        const accessScore = req.userDetails[0].usermanagement?.Contacts;
        const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;


        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: `SELECT Full_Name,Email,Lead_Source,Phone,Date_of_Birth,Mailing_Street,Mailing_State,Mailing_Country,Mailing_City,Mailing_Zip,Other_Phone,Secondary_Email,Skype_ID from Contacts WHERE (((easyportal__Client_User = ${crmuserid}) or (Mark_as_Public = true))) ORDER BY Created_Time DESC`
        };
        try {
            const data = await handleZohoRequest(url, 'post', requestData, token);
            return res.status(200).json({ success: true, data, accessScore });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'post',requestData, token);
                    return res.status(200).json({ success: true, data,accessScore });
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

const leadDetails = async (req, res) => {
    try {
        const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;
        const accessScore = req.userDetails[0]?.usermanagement?.Leads;



        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: `SELECT id,Last_Name,Full_Name,Company,Phone,Mobile,Email,Lead_Status,Created_Time FROM Leads WHERE (((easyportal__Client_User = ${crmuserid}) or (Mark_as_Public	= true))) ORDER BY Created_Time DESC LIMIT 1000`
        };
           
        try {
            const data = await handleZohoRequest(url, 'post', requestData, token);
            return res.status(200).json({ success: true, data, accessScore });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                // Refresh token without ending the response
                try {
                    token = await refreshAccessToken(req, res);
                   
                    const data = await handleZohoRequest(url, 'post', requestData, token);
                
                    return res.status(200).json({ success: true, data, accessScore });
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

const dealDetails = async (req, res) => {
    try {
        // const userId = req.currentUser?.user_id;
        

        // // if(accesScore < 2){
        // //     return res.status(403).json({ success: false, message: "Access Not Available" });
        // // }
        
        // if (!userId) {
        //     return res.status(404).json({ message: "User ID not found." });
        // }

        // const { catalyst } = res.locals;
        // const zcql = catalyst.zcql();
        // const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        // const user = await zcql.executeZCQLQuery(userQuery);
        // const orgId = user[0]?.usermanagement?.orgid;
        // const domain = user[0]?.usermanagement?.domain;
        
        const accessScore = req.userDetails[0].usermanagement?.Deals;
        const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: `SELECT id,Deal_Name,Closing_Date,Contact_Name,Account_Name,Stage,Pipeline,Created_Time FROM Deals WHERE (((easyportal__Portal_User = ${crmuserid}) or (Mark_as_Public = true))) ORDER BY Created_Time DESC LIMIT 2000 `
        };
           
        try {
            const data = await handleZohoRequest(url, 'post', requestData, token);
            return res.status(200).json({ success: true, data, accessScore });


        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                // Refresh token without ending the response
                try {
                    token = await refreshAccessToken(req, res);
                   
                    const data = await handleZohoRequest(url, 'post', requestData, token);
                
                    return res.status(200).json({ success: true, data, accessScore });
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

const accountDetails = async (req, res) => {
    try {    
        const accessScore = req.userDetails[0].usermanagement?.Deals;
        const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;

        const requestData = {
            select_query: `SELECT id,Account_Name,Account_Type,Phone,Ownership,Created_Time FROM Accounts WHERE (((easyportal__Portal_User = ${crmuserid}) or (Mark_as_Public = true))) ORDER BY Created_Time DESC LIMIT 2000 `
        };
           
        try {
            const data = await handleZohoRequest(url, 'post', requestData, token);
            return res.status(200).json({ success: true, data, accessScore });


        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                // Refresh token without ending the response
                try {
                    token = await refreshAccessToken(req, res);
                   
                    const data = await handleZohoRequest(url, 'post', requestData, token);
                
                    return res.status(200).json({ success: true, data, accessScore });
                } catch (refreshError) {
                    return res.status(500).json({ success: false, message:refreshError });
                }
            } else {
                throw error;
            }
        }
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: error });
        }
    }
};

module.exports = {totalLead,totalTask,totalMeeting,totalDeals,leadDetails,totalContacts,dealDetails,accountDetails};