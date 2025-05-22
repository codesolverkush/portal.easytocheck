const genaccesstokenadmin = require("../utils/genaccesstokenadmin");
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");
const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.SECRET_KEY;

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    return null;
  }
};

const webtabHandler = async (req, res) => {
  try {
    const { orgid, email, key } = req.query;

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    let check = false;
    let users = [];

    if (!orgid) {
      return res.status(404).json({
        success: false,
        message: "Organization ID not found for the user.",
      });
    }

    const selectFindQuery = `
            SELECT ROWID,activationdate,activationEndDate,activeLicense,totalLicenses,superadminEmail
            FROM Organization 
            WHERE crmorgid = '${orgid}' 
            LIMIT 1
           `;
    const orgDetails = await zcql.executeZCQLQuery(selectFindQuery);

    if (!orgDetails || orgDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No organization details found.",
      });
    }

    const ORGID = orgDetails[0]?.Organization?.ROWID;

    if (orgDetails[0]?.Organization?.superadminEmail === email) {
      check = true;
      const selectUserQuery = `
                SELECT *
                FROM usermanagement
                WHERE orgid = '${ORGID}'
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
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }
};

const registerNewUser = async (req, res) => {
  try {
    // const userId = req.currentUser?.user_id;
    const { catalyst } = res.locals;
    const userManagement = catalyst.userManagement();
    const {
      email_id,
      first_name,
      last_name,
      orgid,
      phone_number,
      country_code,
      key,
    } = req.body;

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const zcql = catalyst.zcql();
    // const checkUserQuery = `SELECT ROWID, orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
    // const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);

    // const orgIdFromDB = checkUserResult?.[0]?.usermanagement?.orgid || org_id;

    const licenseDetailQuery = `SELECT ROWID, activeLicense,totalLicenses,crmdomain from Organization WHERE crmorgid = ${orgid}`;
    const licenseDetail = await zcql.executeZCQLQuery(licenseDetailQuery);
    let totalLicenses = licenseDetail[0]?.Organization?.totalLicenses;
    let activeLicense = licenseDetail[0]?.Organization?.activeLicense;
    const domain = licenseDetail[0]?.Organization?.crmdomain;
    const ORGID = licenseDetail[0]?.Organization?.ROWID;

    if (activeLicense >= totalLicenses) {
      return res.status(403).json({
        success: false,
        message: "License limit reached. Cannot register new user.",
      });
    }
    // ✅ Create user
    const data = await userManagement.generateCustomToken({
      type: "web",
      user_details: {
        email_id,
        first_name,
        last_name,
        phone_number,
        country_code,
        role_name: "App User",
      },
    });

    // ✅ Fetch all users and match new one
    const allUsers = await userManagement.getAllUsers();
    const userDetails = allUsers.find((user) => user.email_id === email_id);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User registered but details not found.",
      });
    }

    const user_id = userDetails.user_id;

    // ✅ Update license count
    const updatedLicense = parseInt(activeLicense) + 1;
    const updateLicenseQuery = `
      UPDATE Organization SET activeLicense = ${updatedLicense}
      WHERE crmorgid = '${orgid}'
    `;

    await zcql.executeZCQLQuery(updateLicenseQuery);

    res.status(200).json({
      success: true,
      data: {
        ...userDetails,
        orgId: ORGID,
        domain: domain,
        licenseRollback: {
          orgId: ORGID,
          previousCount: activeLicense,
        },
      },
    });
  } catch (error) {
    console.error("Error in registerNewUser:", error);
    res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
};

const createNewUser = async (req, res) => {
  let catalyst;
  try {
    const { module } = req.params;

    catalyst = res.locals.catalyst;
    const zcql = catalyst.zcql();
    const table1 = catalyst.datastore().table("usermanagement");

    const {
      crmuserid,
      easyportal__User_Email,
      Name,
      easyportal__Status,
      orgId,
      licenseRollback,
      domain,
      key,
    } = req.body;


    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const getToken = async () => await getAccessToken(orgId, req, res);

    let token = await getToken();

    const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;
    const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

    // ✅ Wrapper to handle token expiry and retry once
    const executeWithTokenRefresh = async (requestFunc) => {
      try {
        return await requestFunc(token);
      } catch (error) {
        if (error.message === "TOKEN_EXPIRED") {
          token = await genaccesstokenadmin(orgId, domain, req, res);
          return await requestFunc(token); // Retry with refreshed token
        }
        throw error; // Rethrow if not token expiry
      }
    };

    // ✅ CRM Search
    const crmSearch = await executeWithTokenRefresh(async (token) => {
      const query = {
        select_query: `select id from easyportal__Portal_Users where easyportal__User_Email = '${easyportal__User_Email}' limit 10`,
      };
      return await handleZohoRequest(searchUrl, "post", query, token);
    });

    const portalUserId = crmSearch?.data?.[0]?.id;

    const payload = {
      data: [
        {
          ...req.body,
          id: portalUserId,
          trigger: [
            "approval",
            "workflow",
            "blueprint",
            "pathfinder",
            "orchestration",
          ],
        },
      ],
    };

    let crmResult;
    if (!portalUserId) {
      crmResult = await executeWithTokenRefresh(async (token) => {
        return await handleZohoRequest(url, "post", payload, token);
      });
    } else {
      const updateUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
      crmResult = await executeWithTokenRefresh(async (token) => {
        return await handleZohoRequest(updateUrl, "put", payload, token);
      });
    }

    if (crmResult?.data[0]?.code === "SUCCESS") {
      const userData = {
        userid: crmuserid,
        orgid: orgId,
        username: Name,
        email: easyportal__User_Email,
        domain: domain,
        crmuserid: crmResult.data[0]?.details?.id,
      };

      await table1.insertRow(userData);

      return res.status(200).json({ success: true, crmResult });
    } else {
      // 🔁 Rollback license count if CRM failed
      if (licenseRollback) {
        const rollbackQuery = `
          UPDATE Organization SET activeLicense = ${licenseRollback.previousCount}
          WHERE ROWID = '${licenseRollback.orgId}'
        `;
        await zcql.executeZCQLQuery(rollbackQuery);
      }

      return res.status(400).json({
        success: false,
        message: "CRM operation failed",
        crmResult,
      });
    }
  } catch (error) {
    // ✅ Safe rollback on exception
    if (catalyst && req.body?.licenseRollback) {
      const rollbackQuery = `
        UPDATE Organization SET activeLicense = ${req.body.licenseRollback.previousCount}
        WHERE ROWID = '${req.body.licenseRollback.orgId}'
      `;
      await catalyst.zcql().executeZCQLQuery(rollbackQuery);
    }

    if (!res.headersSent) {
      return res.status(error.status || 500).json({
        success: false,
        error: error.message,
        message: "User not added!",
      });
    }
  }
};

const removeUser = async (req, res) => {
  try {
    const { orgId, email, key } = req.query;

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { id } = req?.params;

    if (id) {
      // Get current license information
      const licenseQuery = `
                SELECT activeLicense ,superadminEmail FROM Organization WHERE crmorgid = '${orgId}'
                
            `;
      const licenseResult = await zcql.executeZCQLQuery(licenseQuery);

      if (!licenseResult || licenseResult.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Organization not found!",
        });
      }
      if (licenseResult[0]?.Organization?.superadminEmail === email) {
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
                WHERE crmorgid = '${orgId}'
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

const updatePortalUser = async (req, res) => {
  try {
    const { orgId, key } = req.body;

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { crmuserid } = req.params;

    if (!crmuserid) {
      return res
        .status(400)
        .json({ message: "Portal User ID is required in params." });
    }

    const licenseQuery = `
                SELECT ROWID, crmdomain FROM Organization WHERE crmorgid = '${orgId}'
                
            `;
    const domainResult = await zcql.executeZCQLQuery(licenseQuery);

    if (!domainResult || domainResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organization not found!",
      });
    }
    let domain = domainResult[0]?.Organization?.crmdomain;
    const ORGID = domainResult[0]?.Organization?.ROWID

    // Get access token with proper error handling
    let token;
    try {
      token = await getAccessToken(ORGID, req, res);
    } catch (tokenError) {
      console.error("Token error:", tokenError);
      return res
        .status(401)
        .json({ message: "Authentication failed", error: tokenError.message });
    }

    // First request: Find the portal user
    const url = `https://www.zohoapis.${domain}/crm/v7/coql`;
    const requestData = {
      select_query: `select id,Name from easyportal__Portal_Users where crmuserid = '${crmuserid}' limit 1`,
    };

    let portalUserData;
    try {
      portalUserData = await handleZohoRequest(url, "post", requestData, token);

      if (
        !portalUserData ||
        !portalUserData.data ||
        portalUserData.data.length === 0
      ) {
        return res
          .status(404)
          .json({ message: "Portal user not found in Zoho CRM." });
      }

      const id = portalUserData.data[0]?.id;
      const name = portalUserData.data[0]?.Name;
      if (!id) {
        return res
          .status(404)
          .json({ message: "Portal user ID not found in response." });
      }

      // Second request: Update the portal user status
      const portalMap = {
        id: id,
        Name: `[INACTIVE] ${name}`,
        easyportal__Status: "Inactive",
      };

      const responseMap = {
        data: [portalMap],
      };

      const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;

      const updateResult = await handleZohoRequest(
        portalUrl,
        "put",
        responseMap,
        token
      );

      return res.status(200).json({
        success: true,
        message: "Portal user deactivated successfully",
        data: updateResult,
      });
    } catch (apiError) {
      // Handle token expiration specifically
      if (apiError.message === "TOKEN_EXPIRED") {
        try {
          token = await refreshAccessToken(req, res);

          // Retry the original request with new token
          portalUserData = await handleZohoRequest(
            url,
            "post",
            requestData,
            token
          );

          if (
            !portalUserData ||
            !portalUserData.data ||
            portalUserData.data.length === 0
          ) {
            return res
              .status(404)
              .json({ message: "Portal user not found in Zoho CRM." });
          }

          const id = portalUserData.data[0]?.id;
          if (!id) {
            return res
              .status(404)
              .json({ message: "Portal user ID not found in response." });
          }

          // Second request with new token
          const portalMap = {
            id: id,
            easyportal__Status: "Inactive",
          };

          const responseMap = {
            data: [portalMap],
          };

          const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
          const updateResult = await handleZohoRequest(
            portalUrl,
            "put",
            responseMap,
            token
          );

          return res.status(200).json({
            success: true,
            message: "Portal user deactivated successfully after token refresh",
            data: updateResult,
          });
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          return res.status(401).json({
            success: false,
            message: "Authentication failed after token refresh attempt",
            error: refreshError.message,
          });
        }
      } else {
        // Handle other API errors
        console.error("API request error:", apiError);
        return res.status(500).json({
          success: false,
          message: "Error communicating with Zoho API",
          error: apiError,
        });
      }
    }
  } catch (error) {
    console.error("Unhandled error in updatePortalUser:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  }
};

const updateUserAccess = async (req, res) => {
  try {
    const { userId, section, accessLevel, key } = req.body;

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

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

const getAdminDetails = async (req, res) => {
  try {
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const { crmorgid, email, key } = req.query;

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const query = `select * from Organization where crmorgid = '${crmorgid}'`;
    const data = await zcql.executeZCQLQuery(query);

    if (data.length > 0) {
      return res.status(200).json({
        success: true,
        data: data[0],
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }
  } catch (error) {
    console.error("Error in getDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchContactData = async (req, res) => {
  const { catalyst } = res.locals;
  try {
    const { orgId, email, key } = req.query;
    console.log(orgId,email,key);

    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });

    const zcql = catalyst.zcql();

    if (!orgId) {
      return res
        .status(400)
        .json({ success: false, message: "Organization ID not found." });
    }

    // Get domain from Organization table
    const orgDetailsQuery = `SELECT ROWID, crmdomain FROM Organization WHERE crmorgid = '${orgId}' LIMIT 1`;
    const orgDetails = await zcql.executeZCQLQuery(orgDetailsQuery);

    console.log(orgDetails);

    if (!orgDetails?.length) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found." });
    }

    const domain = orgDetails[0]?.Organization?.crmdomain;
    const ORGID = orgDetails[0]?.Organization?.ROWID;

    if (!domain) {
      return res
        .status(404)
        .json({ success: false, message: "Domain not found." });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
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
    let token = await getAccessToken(ORGID, req, res);

    console.log(token)

    try {
      const contactDataSearch = await handleZohoRequest(
        searchUrl,
        "post",
        query,
        token
      );
      return res.status(200).json({ success: true, data: contactDataSearch });
    } catch (error) {
      // ✅ If token expired, refresh and retry once
      if (error.message === "TOKEN_EXPIRED") {
        try {
          token = await genaccesstokenadmin(orgId, domain, req, res);
          const contactDataSearch = await handleZohoRequest(
            searchUrl,
            "post",
            query,
            token
          );
          return res
            .status(200)
            .json({ success: true, data: contactDataSearch });
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
      error: error
    });
  }
};

const getOrgDetails = async (req, res) => {
  try {
    const { orgId, key } = req.body;
    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    if (!orgId) {
      return res.status(404).json({
        success: false,
        message: "Organization ID not found for the user.",
      });
    }

    const selectFindQuery = `
         SELECT ROWID, widget
         FROM Organization 
         WHERE crmorgid = '${orgId}' 
         LIMIT 1
        `;
    const orgDetails = await zcql.executeZCQLQuery(selectFindQuery);

    if (!orgDetails || orgDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No organization details found.",
      });
    }

    return res.status(200).send({
      data: orgDetails,
    });
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }
};

const editorgdetails = async (req, res) => {
  try {
    const { orgId, key } = req.body;
 
    if (decryptData(key) !== process.env.CHECKMAC)
      return res.status(401).json({ message: "Unauthorized access!" });
    if (!orgId)
      return res
        .status(404)
        .json({
          success: false,
          message: "Something missing in your orgnization!",
        });

    const { widget } = req.body;

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();
    const updateQuery = `
            UPDATE Organization 
            SET 
                widget = '${widget}'
            WHERE crmorgid = '${orgId}'
        `;
    await zcql.executeZCQLQuery(updateQuery);
    return res
      .status(200)
      .json({ message: "Organization details updated successfully." });
  } catch (error) {
    res.status(500).send({
      message: error.message || error,
    });
  }
};

module.exports = {
  getAdminDetails,
  webtabHandler,
  updateUserAccess,
  registerNewUser,
  createNewUser,
  removeUser,
  updatePortalUser,
  searchContactData,
  getOrgDetails,
  editorgdetails,
};

// const genaccesstokenadmin = require("../utils/genaccesstokenadmin");
// const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");
// const CryptoJS = require('crypto-js');
// const dotenv = require("dotenv");
// dotenv.config();

// const secretKey = process.env.SECRET_KEY;

// const decryptData = (ciphertext) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
//     const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//     return decryptedData;
//   } catch (error) {
//     return null;
//   }
// };

// const webtabHandler = async (req, res) => {
//   try {
//     const { orgid,email,key } = req.query;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();
//     let check = false;
//     let users = [];

//       if (!orgid) {
//         return res.status(404).json({
//           success: false,
//           message: "Organization ID not found for the user.",
//         });
//       }

//       const selectFindQuery = `
//             SELECT activationdate,activationEndDate,activeLicense,totalLicenses,superadminEmail
//             FROM Organization
//             WHERE ROWID = '${orgid}'
//             LIMIT 1
//            `;
//       const orgDetails = await zcql.executeZCQLQuery(selectFindQuery);

//       if (!orgDetails || orgDetails.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "No organization details found.",
//         });
//       }

//       if (orgDetails[0]?.Organization?.superadminEmail === email) {
//         check = true;
//         const selectUserQuery = `
//                 SELECT *
//                 FROM usermanagement
//                 WHERE orgid = '${orgid}'
//                `;

//         const userDetails = await zcql.executeZCQLQuery(selectUserQuery);

//         users.push(userDetails);

//         return res.status(200).json({
//           check: check,
//           data: orgDetails,
//           users: users,
//         });
//       } else {
//         return res.status(401).json({
//           success: false,
//           message: "You are not authorized to show this page!",
//         });
//       }

//   } catch (error) {
//     res.status(500).send({
//       message: error,
//     });
//   }
// };

// const registerNewUser = async (req, res) => {
//   try {
//     // const userId = req.currentUser?.user_id;
//     const { catalyst } = res.locals;
//     const userManagement = catalyst.userManagement();
//     const {
//       email_id, first_name, last_name, orgid,
//       phone_number, country_code,key
//     } = req.body;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const zcql = catalyst.zcql();
//     // const checkUserQuery = `SELECT ROWID, orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
//     // const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);

//     // const orgIdFromDB = checkUserResult?.[0]?.usermanagement?.orgid || org_id;

//     const licenseDetailQuery = `SELECT activeLicense,totalLicenses,crmdomain from Organization WHERE ROWID = ${orgid}`;
//     const licenseDetail = await zcql.executeZCQLQuery(licenseDetailQuery);
//     let totalLicenses = licenseDetail[0]?.Organization?.totalLicenses;
//     let activeLicense = licenseDetail[0]?.Organization?.activeLicense;
//     const domain = licenseDetail[0]?.Organization?.crmdomain;

//     if (activeLicense >= totalLicenses) {
//       return res.status(403).json({
//         success: false,
//         message: "License limit reached. Cannot register new user.",
//       });
//     }
//     // ✅ Create user
//     const data = await userManagement.generateCustomToken({
//       type: "web",
//       user_details: {
//         email_id,
//         first_name,
//         last_name,
//         phone_number,
//         country_code,
//         role_name: "App User",
//       },
//     });

//     // ✅ Fetch all users and match new one
//     const allUsers = await userManagement.getAllUsers();
//     const userDetails = allUsers.find((user) => user.email_id === email_id);

//     if (!userDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "User registered but details not found.",
//       });
//     }

//     const user_id = userDetails.user_id;

//     // ✅ Update license count
//     const updatedLicense = parseInt(activeLicense) + 1;
//     const updateLicenseQuery = `
//       UPDATE Organization SET activeLicense = ${updatedLicense}
//       WHERE ROWID = '${orgid}'
//     `;

//     await zcql.executeZCQLQuery(updateLicenseQuery);

//     res.status(200).json({
//       success: true,
//       data: {
//         ...userDetails,
//         orgId: orgid,
//         domain: domain,
//         licenseRollback: {
//           orgId: orgid,
//           previousCount: activeLicense,
//         }
//       }
//     });
//   } catch (error) {
//     console.error("Error in registerNewUser:", error);
//     res.status(400).json({
//       success: false,
//       error: error.message || error,
//     });
//   }
// };

// const createNewUser = async (req, res) => {
//   let catalyst;
//   try {
//     const { module } = req.params;

//     catalyst = res.locals.catalyst;
//     const zcql = catalyst.zcql();
//     const table1 = catalyst.datastore().table("usermanagement");

//     const {
//       crmuserid, easyportal__User_Email, Name,
//       easyportal__Status, orgId, licenseRollback, domain,
//       key
//     } = req.body;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const getToken = async () => await getAccessToken(orgId, req, res);

//     let token = await getToken();

//     const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;
//     const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

//     // ✅ Wrapper to handle token expiry and retry once
//     const executeWithTokenRefresh = async (requestFunc) => {
//       try {
//         return await requestFunc(token);
//       } catch (error) {
//         if (error.message === "TOKEN_EXPIRED") {
//           token = await genaccesstokenadmin(orgId,domain,req, res);
//           return await requestFunc(token); // Retry with refreshed token
//         }
//         throw error; // Rethrow if not token expiry
//       }
//     };

//     // ✅ CRM Search
//     const crmSearch = await executeWithTokenRefresh(async (token) => {
//       const query = {
//         select_query: `select id from easyportal__Portal_Users where easyportal__User_Email = '${easyportal__User_Email}' limit 10`
//       };
//       return await handleZohoRequest(searchUrl, 'post', query, token);
//     });

//     const portalUserId = crmSearch?.data?.[0]?.id;

//     const payload = {
//       data: [{
//         ...req.body,
//         id: portalUserId,
//         trigger: ["approval", "workflow", "blueprint", "pathfinder", "orchestration"]
//       }]
//     };

//     let crmResult;
//     if (!portalUserId) {
//       crmResult = await executeWithTokenRefresh(async (token) => {
//         return await handleZohoRequest(url, 'post', payload, token);
//       });
//     } else {
//       const updateUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
//       crmResult = await executeWithTokenRefresh(async (token) => {
//         return await handleZohoRequest(updateUrl, 'put', payload, token);
//       });
//     }

//     if (crmResult?.data[0]?.code === "SUCCESS") {
//       const userData = {
//         userid: crmuserid,
//         orgid: orgId,
//         username: Name,
//         email: easyportal__User_Email,
//         domain: domain,
//         crmuserid: crmResult.data[0]?.details?.id
//       };

//       await table1.insertRow(userData);

//       return res.status(200).json({ success: true, crmResult });
//     } else {
//       // 🔁 Rollback license count if CRM failed
//       if (licenseRollback) {
//         const rollbackQuery = `
//           UPDATE Organization SET activeLicense = ${licenseRollback.previousCount}
//           WHERE ROWID = '${licenseRollback.orgId}'
//         `;
//         await zcql.executeZCQLQuery(rollbackQuery);
//       }

//       return res.status(400).json({
//         success: false,
//         message: "CRM operation failed",
//         crmResult
//       });
//     }

//   } catch (error) {

//     // ✅ Safe rollback on exception
//     if (catalyst && req.body?.licenseRollback) {
//       const rollbackQuery = `
//         UPDATE Organization SET activeLicense = ${req.body.licenseRollback.previousCount}
//         WHERE ROWID = '${req.body.licenseRollback.orgId}'
//       `;
//       await catalyst.zcql().executeZCQLQuery(rollbackQuery);
//     }

//     if (!res.headersSent) {
//       return res.status(error.status || 500).json({
//         success: false,
//         error: error.message,
//         message: "User not added!"
//       });
//     }
//   }
// };

// const removeUser = async (req, res) => {
//   try {
//     const { orgId, email,key } = req.query;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();
//     const { id } = req?.params;

//     if (id) {

//       // Get current license information
//       const licenseQuery = `
//                 SELECT activeLicense ,superadminEmail FROM Organization WHERE ROWID = '${orgId}'

//             `;
//       const licenseResult = await zcql.executeZCQLQuery(licenseQuery);

//       if (!licenseResult || licenseResult.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "Organization not found!",
//         });
//       }
//       if (
//         licenseResult[0]?.Organization?.superadminEmail === email
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "You are superadmin!",
//         });
//       }

//       let activeLicense = licenseResult[0]?.Organization?.activeLicense;

//       // Check if active license count is already 0
//       if (activeLicense <= 0) {
//         return res.status(403).json({
//           success: false,
//           message: "Cannot remove user. Active license count is already at 0.",
//         });
//       }

//       // Delete the user
//       const deleteQuery = `
//                 DELETE FROM usermanagement WHERE userid = '${id}'
//             `;
//       await zcql.executeZCQLQuery(deleteQuery);

//       // Decrease active license count
//       activeLicense = parseInt(activeLicense) - 1;

//       // Update the organization's active license count
//       const updateLicenseQuery = `
//                 UPDATE Organization
//                 SET activeLicense = ${activeLicense}
//                 WHERE ROWID = '${orgId}'
//             `;
//       await zcql.executeZCQLQuery(updateLicenseQuery);

//       return res.status(200).send({
//         success: true,
//         message: "User Deleted Successfully!",
//       });
//     } else {
//       return res.status(404).send({
//         success: false,
//         message: "Data not found!",
//       });
//     }
//   } catch (error) {
//     res.status(500).send({
//       message: error,
//     });
//   }
// };

// const updatePortalUser = async (req, res) => {
//   try {

//     const {orgId,key} = req.body;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();
//     const { crmuserid } = req.params;

//     if (!crmuserid) {
//       return res.status(400).json({ message: "Portal User ID is required in params." });
//     }

//     // Get organization details with proper error handling
//     let user;
//     // try {
//     //   const userQuery = `SELECT orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
//     //   user = await zcql.executeZCQLQuery(userQuery);

//     //   if (!user || !user[0] || !user[0].usermanagement) {
//     //     return res.status(404).json({ message: "User not found in database." });
//     //   }
//     // } catch (dbError) {
//     //   console.error("Database query error:", dbError);
//     //   return res.status(500).json({ message: "Error fetching user information", error: dbError.message });
//     // }

//     // const domain = user[0]?.usermanagement?.domain;

//     // if (!orgId || !domain) {
//     //   return res.status(404).json({ message: "Organization ID or domain not found." });
//     // }

//     const domain = "com";
//     // Get access token with proper error handling
//     let token;
//     try {
//       token = await getAccessToken(orgId, req, res);
//     } catch (tokenError) {
//       console.error("Token error:", tokenError);
//       return res.status(401).json({ message: "Authentication failed", error: tokenError.message });
//     }

//     // First request: Find the portal user
//     const url = `https://www.zohoapis.${domain}/crm/v7/coql`;
//     const requestData = {
//       select_query: `select id,Name from easyportal__Portal_Users where crmuserid = '${crmuserid}' limit 1`
//     };

//     let portalUserData;
//     try {
//       portalUserData = await handleZohoRequest(url, 'post', requestData, token);

//       if (!portalUserData || !portalUserData.data || portalUserData.data.length === 0) {
//         return res.status(404).json({ message: "Portal user not found in Zoho CRM." });
//       }

//       const id = portalUserData.data[0]?.id;
//       const name = portalUserData.data[0]?.Name;
//       if (!id) {
//         return res.status(404).json({ message: "Portal user ID not found in response." });
//       }

//       // Second request: Update the portal user status
//       const portalMap = {
//         id: id,
//         Name:`[INACTIVE] ${name}`,
//         easyportal__Status: "Inactive"
//       };

//       const responseMap = {
//         data: [portalMap]
//       };

//       const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;

//       const updateResult = await handleZohoRequest(portalUrl, 'put', responseMap, token);

//       return res.status(200).json({
//         success: true,
//         message: "Portal user deactivated successfully",
//         data: updateResult
//       });

//     } catch (apiError) {
//       // Handle token expiration specifically
//       if (apiError.message === "TOKEN_EXPIRED") {
//         try {
//           token = await refreshAccessToken(req, res);

//           // Retry the original request with new token
//           portalUserData = await handleZohoRequest(url, 'post', requestData, token);

//           if (!portalUserData || !portalUserData.data || portalUserData.data.length === 0) {
//             return res.status(404).json({ message: "Portal user not found in Zoho CRM." });
//           }

//           const id = portalUserData.data[0]?.id;
//           if (!id) {
//             return res.status(404).json({ message: "Portal user ID not found in response." });
//           }

//           // Second request with new token
//           const portalMap = {
//             id: id,
//             easyportal__Status: "Inactive"
//           };

//           const responseMap = {
//             data: [portalMap]
//           };

//           const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
//           const updateResult = await handleZohoRequest(portalUrl, 'put', responseMap, token);

//           return res.status(200).json({
//             success: true,
//             message: "Portal user deactivated successfully after token refresh",
//             data: updateResult
//           });

//         } catch (refreshError) {
//           console.error("Token refresh error:", refreshError);
//           return res.status(401).json({
//             success: false,
//             message: "Authentication failed after token refresh attempt",
//             error: refreshError.message
//           });
//         }
//       } else {
//         // Handle other API errors
//         console.error("API request error:", apiError);
//         return res.status(500).json({
//           success: false,
//           message: "Error communicating with Zoho API",
//           error: apiError
//         });
//       }
//     }
//   } catch (error) {
//     console.error("Unhandled error in updatePortalUser:", error);
//     if (!res.headersSent) {
//       return res.status(500).json({
//         success: false,
//         message: "An unexpected error occurred",
//         error: error.message
//       });
//     }
//   }
// };

// const updateUserAccess = async (req, res) => {
//   try {
//     const { userId, section, accessLevel,key } = req.body;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const { catalyst } = res.locals;
//     const zcql = catalyst.zcql();

//     // Validate input
//     if (!userId || !section || !accessLevel) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required parameters",
//       });
//     }

//     // Prepare the update query
//     const updateQuery = `
//             UPDATE usermanagement SET ${section}='${accessLevel}' WHERE userid='${userId}'
//         `;

//     try {
//       // Execute the update query
//       const updateResult = await zcql.executeZCQLQuery(updateQuery);

//       // Fetch the updated user permissions
//       const fetchQuery = `
//                 SELECT * FROM usermanagement
//                 WHERE userid = '${userId}'
//             `;
//       const fetchResult = await zcql.executeZCQLQuery(fetchQuery);

//       res.status(200).json({
//         success: true,
//         message: "User access updated successfully",
//         data: {
//           userId,
//           section,
//           accessLevel,
//           updatedPermissions: fetchResult[0]?.user_permissions || null,
//         },
//       });
//     } catch (updateError) {
//       // console.error("Update Error:", updateError);
//       res.status(500).json({
//         success: false,
//         message: "Failed to update user access",
//         error: updateError.message,
//       });
//     }
//   } catch (error) {
//     // console.error("Error in updateUserAccess:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

// const getAdminDetails = async (req, res) => {
//     try {
//         const { catalyst } = res.locals;
//         const zcql = catalyst.zcql();
//         const {crmorgid,email,key} = req.query;

//         if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//         const query = `select * from Organization where ROWID = '${crmorgid}'`;
//         const data = await zcql.executeZCQLQuery(query);

//         if (data.length > 0) {
//             return res.status(200).json({
//                 success: true,
//                 data: data[0],
//             });
//         } else {
//             return res.status(404).json({
//                 success: false,
//                 message: "No data found",
//             });
//         }
//     } catch (error) {
//         console.error("Error in getDetails:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// }

// // const searchContactData = async (req, res) => {
// //     let catalyst;
// //     try {

// //       const {orgId,email} = req.query;

// //       console.log("orgId", orgId);
// //       console.log("email", email);

// //       catalyst = res.locals.catalyst;
// //       const zcql = catalyst.zcql();

// //       if (!orgId) {
// //         return res.status(400).json({ success: false, message: "Organization ID not found." });
// //       }

// //       // Get domain
// //       const orgDetailsQuery = `SELECT crmdomain FROM Organization WHERE ROWID = '${orgId}' LIMIT 1`;
// //       const orgDetails = await zcql.executeZCQLQuery(orgDetailsQuery);
// //       if (!orgDetails || orgDetails.length === 0) {
// //         return res.status(404).json({ success: false, message: "Organization not found." });
// //       }
// //       const domain = orgDetails[0]?.Organization?.crmdomain;
// //       if (!domain) {
// //         return res.status(404).json({ success: false, message: "Domain not found." });
// //       }

// //       if (!email) {
// //         return res.status(400).json({ success: false, message: "Email is required." });
// //       }

// //       const token = await getAccessToken(orgId, req, res);
// //       const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;

// //       const query = {
// //         select_query: `select id,First_Name,Last_Name,Account_Name from Contacts  (((Last_Name = '${email}') or (First_Name = '${email}')) or email = '${email}') limit 10`
// //       };
// //       const contactDataSearch = await handleZohoRequest(searchUrl, 'post', query, token);
// //       console.log("contactDataSearch", contactDataSearch);

// //       return res.status(200).json({
// //         success: true,
// //         data: contactDataSearch
// //       });

// //     } catch (error) {
// //       console.error("Error searching contact data:", error.message);

// //       return res.status(error.status || 500).json({
// //         success: false,
// //         message: "Failed to search contact data.",
// //         error: error.message || error
// //       });
// //     }
// //   };

// // const searchContactData = async (req, res) => {
// //     let catalyst;
// //     try {

// //       const {orgId,email} = req.query;

// //       console.log("orgId", orgId);
// //       console.log("email", email);

// //       catalyst = res.locals.catalyst;
// //       const zcql = catalyst.zcql();

// //       if (!orgId) {
// //         return res.status(400).json({ success: false, message: "Organization ID not found." });
// //       }

// //       // Get domain
// //       const orgDetailsQuery = `SELECT crmdomain FROM Organization WHERE ROWID = '${orgId}' LIMIT 1`;
// //       const orgDetails = await zcql.executeZCQLQuery(orgDetailsQuery);
// //       if (!orgDetails || orgDetails.length === 0) {
// //         return res.status(404).json({ success: false, message: "Organization not found." });
// //       }
// //       const domain = orgDetails[0]?.Organization?.crmdomain;
// //       if (!domain) {
// //         return res.status(404).json({ success: false, message: "Domain not found." });
// //       }

// //       if (!email) {
// //         return res.status(400).json({ success: false, message: "Email is required." });
// //       }

// //       const token = await getAccessToken(orgId, req, res);
// //       const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;

// //       const query = {
// //         select_query: `select id, Last_Name, First_Name,Email,Full_Name, Lead_Source,Account_Name from Contacts where (((Full_Name like '%${email}%') or (Email like '%${email}%'))) limit 1000`
// //       };
// //       const contactDataSearch = await handleZohoRequest(searchUrl, 'post', query, token);
// //       console.log("contactDataSearch", contactDataSearch);

// //       return res.status(200).json({
// //         success: true,
// //         data: contactDataSearch
// //       });

// //     } catch (error) {
// //       console.error("Error searching contact data:", error.message);

// //       return res.status(error.status || 500).json({
// //         success: false,
// //         message: "Failed to search contact data.",
// //         error: error.message || error
// //       });
// //     }
// //   };

// const searchContactData = async (req, res) => {
//       const {catalyst} = res.locals;
//   try {
//     const { orgId, email,key } = req.query;

//     if(decryptData(key) !== process.env.CHECKMAC) return res.status(401).json({message:"Unauthorized access!"});

//     const zcql = catalyst.zcql();

//     if (!orgId) {
//       return res.status(400).json({ success: false, message: "Organization ID not found." });
//     }

//     // Get domain from Organization table
//     const orgDetailsQuery = `SELECT crmdomain FROM Organization WHERE ROWID = '${orgId}' LIMIT 1`;
//     const orgDetails = await zcql.executeZCQLQuery(orgDetailsQuery);

//     if (!orgDetails?.length) {
//       return res.status(404).json({ success: false, message: "Organization not found." });
//     }

//     const domain = orgDetails[0]?.Organization?.crmdomain;
//     if (!domain) {
//       return res.status(404).json({ success: false, message: "Domain not found." });
//     }

//     if (!email) {
//       return res.status(400).json({ success: false, message: "Email is required." });
//     }

//     // ✅ Build COQL Query
//     const query = {
//       select_query: `
//         select id, Last_Name, First_Name, Email, Full_Name, Lead_Source, Account_Name
//         from Contacts
//         where (((Full_Name like '%${email}%') or (Email like '%${email}%')))
//         limit 1000
//       `.trim(),
//     };

//     const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;

//     // ✅ First attempt with current access token
//     let token = await getAccessToken(orgId, req, res);

//     try {
//       const contactDataSearch = await handleZohoRequest(searchUrl, 'post', query, token);
//       return res.status(200).json({ success: true, data: contactDataSearch });
//     } catch (error) {
//       // ✅ If token expired, refresh and retry once
//       if (error.message === 'TOKEN_EXPIRED') {
//         try {
//           token = await genaccesstokenadmin(orgId,domain,req, res);
//           const contactDataSearch = await handleZohoRequest(searchUrl, 'post', query, token);
//           return res.status(200).json({ success: true, data: contactDataSearch });
//         } catch (refreshError) {
//           console.error("Token refresh failed:", refreshError.message);
//           return res.status(500).json({
//             success: false,
//             message: "Token expired and refresh failed.",
//             error: refreshError.message,
//           });
//         }
//       } else {
//         throw error;
//       }
//     }

//   } catch (error) {
//     console.error("Error searching contact data:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to search contact data.",
//       error: error.message || error,
//     });
//   }
// };

// module.exports = {
//     getAdminDetails,
//     webtabHandler,
//     updateUserAccess,
//     registerNewUser,
//     createNewUser,
//     removeUser,
//     updatePortalUser,
//     searchContactData
// };
