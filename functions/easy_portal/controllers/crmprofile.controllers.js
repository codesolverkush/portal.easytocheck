const refreshAccessToken = require("../utils/genaccestoken");
const { handleZohoRequest, getAccessToken } = require("../utils/zohoUtils");

const getAllProfile = async (req, res) => {
    const userId = req.currentUser?.user_id;
  try {
    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User ID not found." });
    }

   
    const orgId = req.userDetails[0]?.usermanagement?.orgid;
    const domain = req.userDetails[0]?.usermanagement?.domain;

    if (!orgId) {
      return res
        .status(404)
        .json({ success: false, message: "Organization ID not found." });
    }
    
   
    let token = await getAccessToken(orgId,req, res);
 
  
    const url = `https://www.zohoapis.${domain}/crm/v7/settings/profiles`;
  

    try {
     
      const data = await handleZohoRequest(url, "get", null, token);
      
      return res
        .status(200)
        .json({
          success: true,
          data,
        });
    } catch (error) {
      if (error.message === "TOKEN_EXPIRED") {
        try {
        
          token = await refreshAccessToken(req, res);
          process.env.ACCESS_TOKEN = token;
          const data = await handleZohoRequest(url, "get", null, token);
          return res
            .status(200)
            .json({
              success: true,
              data,
            });
        } catch (refreshError) {
          return res
            .status(500)
            .json({ success: false, message: refreshError.message });
        }
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};


const cloneProfile = async (req, res) => {
    const userId = req.currentUser?.user_id;
  try {
    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User ID not found." });
    }


   
    const orgId = req.userDetails[0]?.usermanagement?.orgid;
    const domain = req.userDetails[0]?.usermanagement?.domain;

    if (!orgId) {
      return res
        .status(404)
        .json({ success: false, message: "Organization ID not found." });
    }

    const {profileId} = req.params;
    console.log(profileId);
    
   
    let token = await getAccessToken(orgId,req, res);
    
    const bodyData = {
    profiles: [
        {
        name: req.body.name,
        description: req.body.description
        }
    ]
     };

 
  
    const url = `https://www.zohoapis.${domain}/crm/v8/settings/profiles/${profileId}/actions/clone`;
  

    try {
     
      const data = await handleZohoRequest(url, "post", bodyData, token);
      
      return res
        .status(200)
        .json({
          success: true,
          data,
        });
    } catch (error) {
      if (error.message === "TOKEN_EXPIRED") {
        try {
        
          token = await refreshAccessToken(req, res);
          process.env.ACCESS_TOKEN = token;
          const data = await handleZohoRequest(url, "post", bodyData, token);
          return res
            .status(200)
            .json({
              success: true,
              data,
            });
        } catch (refreshError) {
          return res
            .status(500)
            .json({ success: false, message: refreshError.message });
        }
      }
      return res.status(500).json({ success: false, message: error});
    }
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error });
    }
  }
};



module.exports = {getAllProfile,cloneProfile};