const refreshAccessToken = require("../utils/genaccestoken");
const { getOrgDetails } = require("../utils/getOrgDetails");
const { handleZohoRequest, getAccessToken } = require("../utils/zohoUtils");

// const getDataById = async (req,res)=>{
//     try {
//         console.time("database-api");
//         const userId = req.currentUser?.user_id;
//         if (!userId) {
//             return res.status(404).json({ success: false, message: "User ID not found." });
//         }

//         const {id} = req.params;
//         const {module} = req.params;

//         const { catalyst } = res.locals;
//         const zcql = catalyst.zcql();
//         const userQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
//         const user = await zcql.executeZCQLQuery(userQuery);
//         const orgId = user[0]?.usermanagement?.orgid;
//         const domain = user[0]?.usermanagement?.domain;

//         if (!orgId) {
//             return res.status(404).json({ success: false, message: "Organization ID not found." });
//         }
//         console.timeEnd("database-api");
//         console.time("token-time");
//         let token = await getAccessToken(orgId, res);
//         console.timeEnd('token-time');
//         const url = `https://www.zohoapis.${domain}/crm/v7/${module}/${id}`;

//         try {
//             console.time("zoho-api")
//             const data = await handleZohoRequest(url, 'get', null, token);
//             console.timeEnd("zoho-api");
//             return res.status(200).json({ success: true, data,username: req.currentUser.first_name + req.currentUser.last_name });

//         } catch (error) {
//             if (error.message === "TOKEN_EXPIRED") {
//                 try {
//                     token = await refreshAccessToken(req, res);
//                     process.env.ACCESS_TOKEN = token;
//                     const data = await handleZohoRequest(url, 'get', null, token);
//                     return res.status(200).json({ success: true, data,username: req.currentUser.first_name + req.currentUser.last_name });
//                 } catch (refreshError) {
//                     console.error("Error after token refresh:", refreshError.message);
//                     return res.status(500).json({ success: false, message: refreshError.message });
//                 }
//             }
//             console.error(`Error fetching ${module}:`, error.message);
//             return res.status(500).json({ success: false, message: error.message });
//         }

//     } catch (error) {
//         console.error(`Error fetching ${module}:`, error.message);
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, message: error.message });
//         }
//     }
// };

const getDataById = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User ID not found." });
    }

    const { id, module } = req.params;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

   
    const { orgId, domain } = await getOrgDetails(userId, zcql);
  

    if (!orgId) {
      return res
        .status(404)
        .json({ success: false, message: "Organization ID not found." });
    }
    
   
    let token = await getAccessToken(orgId,req, res);
 
  
    const url = `https://www.zohoapis.${domain}/crm/v7/${module}/${id}`;
  

    try {
     
      const data = await handleZohoRequest(url, "get", null, token);
      
      return res
        .status(200)
        .json({
          success: true,
          data,
          username: req.currentUser.first_name + req.currentUser.last_name,
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
              username: req.currentUser.first_name + req.currentUser.last_name,
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

const getModuleFields = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;

    if (!userId) {
      return res.status(404).json({ message: "User ID not found." });
    }

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    const { orgId, domain } = await getOrgDetails(userId, zcql);

    if (!orgId) {
        return res
            .status(404)
            .json({ success: false, message: "Organization ID not found." });
    }
    
    const { module } = req.params;

    let token = await getAccessToken(orgId,req, res);
    const url = `https://www.zohoapis.${domain}/crm/v7/settings/fields?module=${module}`;

    try {
      const data = await handleZohoRequest(url, "get", null, token);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === "TOKEN_EXPIRED") {
        try {
          token = await refreshAccessToken(req, res);
          const data = await handleZohoRequest(url, "get", null, token);
          return res.status(200).json({ success: true, data });
        } catch (refreshError) {
          return res
            .status(500)
            .json({ success: false, message: refreshError.message });
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

module.exports = { getDataById, getModuleFields };
