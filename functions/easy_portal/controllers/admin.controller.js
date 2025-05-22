const refreshAccessToken = require("../utils/genaccestoken");
const { handleZohoRequest, getAccessToken } = require("../utils/zohoUtils");


const webtabHander = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    const userEmail = req.currentUser?.email_id;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    let check = false;
    let users = [];

    if (userId) {
      const orgQuery = `
             SELECT orgid FROM usermanagement WHERE userid = '${userId}'
            `;
      const orgDetail = await zcql.executeZCQLQuery(orgQuery);
      const orgId = orgDetail[0]?.usermanagement?.orgid;

      if (!orgId) {
        return res.status(404).json({
          success: false,
          message: "Organization ID not found for the user.",
        });
      }

      const selectFindQuery = `
            SELECT activationdate,activationEndDate,activeLicense,totalLicenses,superadminEmail
            FROM Organization 
            WHERE ROWID = '${orgId}' 
            LIMIT 1
           `;
      const orgDetails = await zcql.executeZCQLQuery(selectFindQuery);

      if (!orgDetails || orgDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No organization details found.",
        });
      }

      if (orgDetails[0]?.Organization?.superadminEmail === userEmail) {
        check = true;
        const selectUserQuery = `
                SELECT *
                FROM usermanagement
                WHERE orgid = '${orgId}'
               `;

        const userDetails = await zcql.executeZCQLQuery(selectUserQuery);

        users.push(userDetails);

        return res.status(200).json({
          check: check,
          data: orgDetails,
          users: users,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "You are not authorized to show this page!",
        });
      }
    } else {
      return res.status(404).send({
        success: false,
        message: "Data not found!",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }
};

const removeUser = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    const emailId = req.currentUser?.email_id;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { id } = req?.params;

    if (userId && id) {
      // First, get the organization ID for the user being removed
      const userQuery = `
                SELECT orgid,domain FROM usermanagement WHERE userid = '${id}'
            `;
      const userResult = await zcql.executeZCQLQuery(userQuery);

      if (!userResult || userResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });
      }

      const orgId = userResult[0]?.usermanagement?.orgid;

      // Get current license information
      const licenseQuery = `
                SELECT activeLicense ,superadminEmail FROM Organization WHERE ROWID = '${orgId}'
                
            `;
      const licenseResult = await zcql.executeZCQLQuery(licenseQuery);

      if (!licenseResult || licenseResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Organization not found!",
        });
      }
      if (
        licenseResult[0]?.Organization?.superadminEmail === emailId &&
        userId === id
      ) {
        return res.status(400).json({
          success: false,
          message: "You are superadmin!",
        });
      }

      let activeLicense = licenseResult[0]?.Organization?.activeLicense;

      // Check if active license count is already 0
      if (activeLicense <= 0) {
        return res.status(403).json({
          success: false,
          message: "Cannot remove user. Active license count is already at 0.",
        });
      }

      // Delete the user
      const deleteQuery = `
                DELETE FROM usermanagement WHERE userid = '${id}'
            `;
      await zcql.executeZCQLQuery(deleteQuery);

      // Decrease active license count
      activeLicense = parseInt(activeLicense) - 1;

      // Update the organization's active license count
      const updateLicenseQuery = `
                UPDATE Organization 
                SET activeLicense = ${activeLicense}
                WHERE ROWID = '${orgId}'
            `;
      await zcql.executeZCQLQuery(updateLicenseQuery);

      return res.status(200).send({
        success: true,
        message: "User Deleted Successfully!",
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "Data not found!",
      });
    }
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }
};

const updateUserAccess = async (req, res) => {
  try {
    const { userId, section, accessLevel } = req.body;

 
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    // Validate input
    if (!userId || !section || !accessLevel) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Prepare the update query
    const updateQuery = `
            UPDATE usermanagement SET ${section}='${accessLevel}' WHERE userid='${userId}'
        `;

    try {
      // Execute the update query
      const updateResult = await zcql.executeZCQLQuery(updateQuery);

  


      // Fetch the updated user permissions
      const fetchQuery = `
                SELECT * FROM usermanagement
                WHERE userid = '${userId}'
            `;
      const fetchResult = await zcql.executeZCQLQuery(fetchQuery);


      res.status(200).json({
        success: true,
        message: "User access updated successfully",
        data: {
          userId,
          section,
          accessLevel,
          updatedPermissions: fetchResult[0]?.user_permissions || null,
        },
      });
    } catch (updateError) {
      // console.error("Update Error:", updateError);
      res.status(500).json({
        success: false,
        message: "Failed to update user access",
        error: updateError.message,
      });
    }
  } catch (error) {
    // console.error("Error in updateUserAccess:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updatePortalUser = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    
    if (!userId) {
      return res.status(404).json({ message: "User ID not found." });
    }

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { crmuserid } = req.params;
    
    if (!crmuserid) {
      return res.status(400).json({ message: "Portal User ID is required in params." });
    }

    // Get organization details with proper error handling
    let user;
    try {
      const userQuery = `SELECT orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
      user = await zcql.executeZCQLQuery(userQuery);
      
      if (!user || !user[0] || !user[0].usermanagement) {
        return res.status(404).json({ message: "User not found in database." });
      }
    } catch (dbError) {
      console.error("Database query error:", dbError);
      return res.status(500).json({ message: "Error fetching user information", error: dbError.message });
    }

    const orgId = user[0]?.usermanagement?.orgid;
    const domain = user[0]?.usermanagement?.domain;

    if (!orgId || !domain) {
      return res.status(404).json({ message: "Organization ID or domain not found." });
    }

    // Get access token with proper error handling
    let token;
    try {
      token = await getAccessToken(orgId, req, res);
    } catch (tokenError) {
      console.error("Token error:", tokenError);
      return res.status(401).json({ message: "Authentication failed", error: tokenError.message });
    }

    // First request: Find the portal user
    const url = `https://www.zohoapis.${domain}/crm/v7/coql`;
    const requestData = {
      select_query: `select id,Name from easyportal__Portal_Users where crmuserid = '${crmuserid}' limit 1`
    };

    
    let portalUserData;
    try {
      portalUserData = await handleZohoRequest(url, 'post', requestData, token);
      
      if (!portalUserData || !portalUserData.data || portalUserData.data.length === 0) {
        return res.status(404).json({ message: "Portal user not found in Zoho CRM." });
      }
      
      const id = portalUserData.data[0]?.id;
      const name = portalUserData.data[0]?.Name;
      if (!id) {
        return res.status(404).json({ message: "Portal user ID not found in response." });
      }
      
      // Second request: Update the portal user status
      const portalMap = {
        id: id,
        Name:`[INACTIVE] ${name}`,
        easyportal__Status: "Inactive" 
      };

      
      
      const responseMap = {
        data: [portalMap]
      };
      
      const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
      
      const updateResult = await handleZohoRequest(portalUrl, 'put', responseMap, token);
      
      return res.status(200).json({ 
        success: true, 
        message: "Portal user deactivated successfully",
        data: updateResult 
      });
      
    } catch (apiError) {
      // Handle token expiration specifically
      if (apiError.message === "TOKEN_EXPIRED") {
        try {
          token = await refreshAccessToken(req, res);
          
          // Retry the original request with new token
          portalUserData = await handleZohoRequest(url, 'post', requestData, token);
          
          if (!portalUserData || !portalUserData.data || portalUserData.data.length === 0) {
            return res.status(404).json({ message: "Portal user not found in Zoho CRM." });
          }
          
          const id = portalUserData.data[0]?.id;
          if (!id) {
            return res.status(404).json({ message: "Portal user ID not found in response." });
          }
          
          // Second request with new token
          const portalMap = {
            id: id,
            easyportal__Status: "Inactive"
          };
          
          const responseMap = {
            data: [portalMap]
          };
          
          const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
          const updateResult = await handleZohoRequest(portalUrl, 'put', responseMap, token);
          
          return res.status(200).json({ 
            success: true, 
            message: "Portal user deactivated successfully after token refresh",
            data: updateResult 
          });
          
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          return res.status(401).json({ 
            success: false, 
            message: "Authentication failed after token refresh attempt", 
            error: refreshError.message 
          });
        }
      } else {
        // Handle other API errors
        console.error("API request error:", apiError);
        return res.status(500).json({ 
          success: false, 
          message: "Error communicating with Zoho API", 
          error: apiError.message 
        });
      }
    }
  } catch (error) {
    console.error("Unhandled error in updatePortalUser:", error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: "An unexpected error occurred", 
        error: error.message 
      });
    }
  }
};

const personalizedUpdate = async (req, res) => {
  try {
    const userId = req?.currentUser?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You are going in wrong way!",
      });
    }
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    const userQuery = `SELECT * from usermanagement WHERE userid = ${userId}`;

    const userResult = await zcql.executeZCQLQuery(userQuery);

    if (!userResult || userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    const orgId = userResult[0]?.usermanagement?.orgid;

    const personalizedQuery = `SELECT widget, crmordid from Organization WHERE orgId = ${ROWID}`;
    const personalizedDetails = await zcql.executeZCQLQuery(personalizedQuery);
    return res.status(200).json({
        success: true,
        data: personalizedDetails[0]?.Organization
    })
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: "Something went wrong!"
    })
  }
};


const changesDoneStatus = async (req, res) => {
  try {
    const { userId, section, accessLevel } = req.body;

 
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    // Validate input
    if (!userId || !section || !accessLevel) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
    }

    // Prepare the update query
    const updateQuery = `
            UPDATE usermanagement SET ${section}='${accessLevel}' WHERE userid='${userId}'
        `;

    try {
      // Execute the update query
      const updateResult = await zcql.executeZCQLQuery(updateQuery);

  


      // Fetch the updated user permissions
      const fetchQuery = `
                SELECT * FROM usermanagement
                WHERE userid = '${userId}'
            `;
      const fetchResult = await zcql.executeZCQLQuery(fetchQuery);


      res.status(200).json({
        success: true,
        message: "User access updated successfully",
        data: {
          userId,
          section,
          accessLevel,
          updatedPermissions: fetchResult[0]?.user_permissions || null,
        },
      });
    } catch (updateError) {
      // console.error("Update Error:", updateError);
      res.status(500).json({
        success: false,
        message: "Failed to update user access",
        error: updateError.message,
      });
    }
  } catch (error) {
    // console.error("Error in updateUserAccess:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const searchContactData = async (req, res) => {
      const {catalyst} = res.locals;
  try {
      const userId = req.currentUser?.user_id;
      const orgId = req.userDetails[0]?.usermanagement?.orgid;
      const domain = req.userDetails[0]?.usermanagement?.domain;
      const zcql = catalyst.zcql();
    
    if (!userId) {
      return res.status(404).json({ message: "Invalid User!." });
    }
    const {email} = req.query;
    
   



    if (!orgId) {
      return res.status(400).json({ success: false, message: "Organization ID not found." });
    }

    // Get domain from Organization table
    if (!domain) {
      return res.status(404).json({ success: false, message: "Domain not found." });
    }

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    // ✅ Build COQL Query
    const query = {
      select_query: `
        select id, Last_Name, First_Name, Email, Full_Name, Lead_Source, Account_Name 
        from Contacts 
        where (((Full_Name like '%${email}%') or (Email like '%${email}%'))) 
        limit 1000
      `.trim(),
    };

    const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;

    // ✅ First attempt with current access token
    let token = await getAccessToken(orgId, req, res);

    try {
      const contactDataSearch = await handleZohoRequest(searchUrl, 'post', query, token);
      return res.status(200).json({ success: true, data: contactDataSearch });
    } catch (error) {
      // ✅ If token expired, refresh and retry once
      if (error.message === 'TOKEN_EXPIRED') {
        try {
          token = await genaccesstokenadmin(orgId,domain,req, res);
          const contactDataSearch = await handleZohoRequest(searchUrl, 'post', query, token);
          return res.status(200).json({ success: true, data: contactDataSearch });
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError.message);
          return res.status(500).json({
            success: false,
            message: "Token expired and refresh failed.",
            error: refreshError.message,
          });
        }
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error("Error searching contact data:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to search contact data.",
      error: error.message || error,
    });
  }
};

module.exports = { webtabHander, removeUser, updateUserAccess, updatePortalUser, personalizedUpdate, searchContactData };
