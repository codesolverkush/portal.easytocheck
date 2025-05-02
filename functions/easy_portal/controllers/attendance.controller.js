const axios = require('axios');
const stream = require("stream");
const FormData = require("form-data");
const refreshAccessToken = require('../utils/genaccestoken');
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");


const checkin = async (req, res) => {
    try {
        // const userId = req.currentUser?.user_id;
        // if (!userId) {
        //     return res.status(404).json({ success: false, message: "User ID not found." });
        // }

        // const { catalyst } = res.locals;
        // const zcql = catalyst.zcql();
        // const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        // const user = await zcql.executeZCQLQuery(userQuery);
        // const orgId = user[0]?.usermanagement?.orgid;
        // const domain = user[0]?.usermanagement?.domain;

        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        const list = [ "approval","workflow","blueprint","pathfinder","orchestration"]


        const leadData = { data: [{...req.body}], trigger: list };
        let token = await getAccessToken(orgId,req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/Attendance`;

        try {
            const data = await handleZohoRequest(url, 'post', leadData, token);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;
                    const data = await handleZohoRequest(url, 'post', leadData, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    return res.status(500).json({ success: false, error: refreshError.response ? refreshError.response.data : refreshError.message });
                }
            }

            // Handle DUPLICATE_DATA error and send id for it
            if (error.response?.data?.data[0]?.code === "DUPLICATE_DATA") {
                const duplicateDetails = error.response.data.data[0].details.duplicate_record;
                return res.status(400).json({
                    success: false,
                    message: "Already checked in",
                    duplicateRecordId: duplicateDetails.id
                });
            }

            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};

const checkOut = async (req, res) => {
    try {
        // const userId = req.currentUser?.user_id;
        // if (!userId) {
        //     return res.status(404).json({ success: false, message: "User ID not found." });
        // }

        // const { catalyst } = res.locals;
        // const zcql = catalyst.zcql();
        // const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
        // const user = await zcql.executeZCQLQuery(userQuery);
        // const orgId = user[0]?.usermanagement?.orgid;
        // const domain = user[0]?.usermanagement?.domain;

        const orgId = req.userDetails[0]?.usermanagement?.orgid;
        const domain = req.userDetails[0]?.usermanagement?.domain;

        if (!orgId) {
            return res.status(404).json({ success: false, message: "Organization ID not found." });
        }

        const empId = req.body.EMP_Id;
        if (!empId) {
            return res.status(400).json({ success: false, message: "EMP_Id is required." });
        }

        let token = await getAccessToken(orgId,req, res);
        const searchUrl = `https://www.zohoapis.${domain}/crm/v7/Attendance/search?criteria=(EMP_Id:equals:${empId})`;

        try {
            // Search for the record with the given EMP_Id
            const searchResponse = await handleZohoRequest(searchUrl, 'get', null, token);
            const record = searchResponse.data?.[0];
            if (!record) {
                return res.status(404).json({ success: false, message: "Record not found for the given EMP_Id." });
            }

            const recordId = record.id;
            const updateUrl = `https://www.zohoapis.${domain}/crm/v7/Attendance/${recordId}`;

            const list = [ "approval","workflow","blueprint","pathfinder","orchestration"];

            // Update the record to check out
            const updateData = {
                data: [
                    {
                        id: recordId,
                        Last_Check_out: req.body.Last_Check_out || null,
                        Record_Status__s: "Checked Out",
                        Check_out_Address: req.body.Check_out_Address || null
                    }
                ],
                trigger:list
            };

            const updateResponse = await handleZohoRequest(updateUrl, 'put', updateData, token);
            return res.status(200).json({ success: true, data: updateResponse });

        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    process.env.ACCESS_TOKEN = token;

                    // Retry the search request after refreshing the token
                    const searchResponse = await handleZohoRequest(searchUrl, 'get', null, token);
                    const record = searchResponse.data?.[0];

                    if (!record) {
                        return res.status(404).json({ success: false, message: "Record not found for the given EMP_Id." });
                    }

                    const recordId = record.id;
                    const updateUrl = `https://www.zohoapis.${domain}/crm/v7/Attendance/${recordId}`;

                    // Update the record to check out
                    const updateData = {
                        data: [
                            {
                                id: recordId,
                                Last_Check_out: req.body.Last_Check_out || null,
                                Record_Status__s: "Checked Out",
                                Check_out_Address: req.body.Check_out_Address || null
                            }
                        ]
                    };

                    const updateResponse = await handleZohoRequest(updateUrl, 'put', updateData, token);
                    return res.status(200).json({ success: true, data: updateResponse });

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
};

module.exports = { checkin, checkOut};