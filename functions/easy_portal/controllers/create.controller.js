const { executeZohoRequest } = require("../utils/authUtils");
const refreshAccessToken = require("../utils/genaccestoken");
const { getOrgDetails } = require("../utils/getOrgDetails");
const getOrgInfo = require("../utils/getOrgInfo");
const { handleZohoRequest, getAccessToken } = require('../utils/zohoUtils');


const createNewData = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        const {module} = req.params;

        if (!req.userDetails || !req.userDetails[0]) {
            return res.status(400).json({ success: false, message: "User details not found." });
        }
        

        // Check for access control
        const accessScore = req.userDetails[0].usermanagement?.[module];

        if(accessScore < 2){
            return res.status(403).json({success: false, message: `Insufficient access rights to create a ${module}`});
        }

        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();

        const { orgId, domain } = await getOrgDetails(userId, zcql);

        if (!orgId) {
            return res
              .status(404)
              .json({ success: false, message: "Organization ID not found." });
        }

        const moduleData = { data: [req.body] };
              
        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

        try {
            const data = await handleZohoRequest(url, 'post', moduleData, token);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            console.log(error);
            return res.status(error.status || 500).json({
                success: false, 
                error: error.response ? error.response.data : error.message
            });
        }

    } catch (error) {
        console.log(error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};

module.exports = {createNewData}