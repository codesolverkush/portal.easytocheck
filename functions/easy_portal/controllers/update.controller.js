const refreshAccessToken = require("../utils/genaccestoken");
const getOrgInfo = require("../utils/getOrgInfo");
const { executeZohoRequest } = require("../utils/authUtils");

const { handleZohoRequest, getAccessToken } = require('../utils/zohoUtils');
const { getOrgDetails } = require("../utils/getOrgDetails");

const updateData = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        const {module} = req.params;
    
        // check for access control
        const accessScore = req.userDetails[0].usermanagement?.[module];

        if(accessScore < 2){
            return res.status(403).json({success: false, message: `Insufficient access rights to update a `});
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
        
       
        let token = await getAccessToken(orgId, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

        try {
            const data = await executeZohoRequest(url, 'put', moduleData, token, req, res);            // console.log(data);
            // console.log(data);
            return res.status(200).json({ success: true, data });

        } catch (error) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }

    } catch (error) {
        console.error(`Error updating ${module}:`, error.message);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};

module.exports = {updateData}