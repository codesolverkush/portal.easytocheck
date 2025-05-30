const axios = require('axios');
const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");





const associatedDealWithContact = async (req,res)=>{
    try {
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;
        const crmuserid = req.userDetails[0]?.usermanagement?.crmuserid;
       
        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }
        const {contactId} = req.params;

        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;
        const requestData = {
            select_query: `SELECT Deal_Name, id, Closing_Date, Created_Time, Amount, Stage, Account_Name FROM Deals WHERE (Contact_Name = ${contactId} and easytocheckeasyportal__Portal_User = ${crmuserid}) ORDER BY Created_Time DESC LIMIT 1000`
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
}


const associatedContactWithAccount = async (req,res)=>{
    try {
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;
        const {accountid} = req.query;

        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;
        const requestData = {
            select_query: `SELECT id,Last_Name,First_Name,Full_Name,Account_Name,Created_Time,Phone,Mobile,Email FROM Contacts WHERE (Account_Name = ${accountid}) ORDER BY Created_Time DESC LIMIT 1000`
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
}

const associatedDealWithAccount = async (req,res)=>{
    try {
        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;
        // const accountid = req.userDetails[0]?.usermanagement?.accountid;
        const {accountid} = req.query;
       
        if (!orgId) {
            return res.status(404).json({ message: "Organization ID not found." });
        }

        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/coql`;
        const requestData = {
            select_query: `SELECT Deal_Name, id, Closing_Date, Created_Time, Amount, Stage, Account_Name FROM Deals WHERE (Account_Name = ${accountid}) ORDER BY Created_Time DESC LIMIT 1000`
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
}


module.exports = {associatedDealWithContact,associatedContactWithAccount,associatedDealWithAccount};