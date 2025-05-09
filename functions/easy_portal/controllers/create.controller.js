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
        const crmuserid = req.userDetails[0].usermanagement?.crmuserid;
        const orgId = req.userDetails[0].usermanagement?.orgid;
        const domain = req.userDetails[0].usermanagement?.domain;

        if(accessScore < 2){
            return res.status(403).json({success: false, message: `Insufficient access rights to create a ${module}`});
        }

        if (!userId) {
            return res.status(404).json({ success: false, message: "User ID not found." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();

        // const { orgId, domain } = await getOrgDetails(userId, zcql);

        if (!orgId) {
            return res
              .status(404)
              .json({ success: false, message: "Organization ID not found." });
        }

        const list = [ "approval","workflow","blueprint","pathfinder","orchestration"]

        const moduleData = { data: [{...req.body,easyportal__Client_User: crmuserid}], trigger: list };
              
        let token = await getAccessToken(orgId,req,res);
        const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

        try {
            const data = await handleZohoRequest(url, 'post', moduleData, token);  
            return res.status(200).json({ success: true, data });

        } catch (error) {
            return res.status(error.status || 500).json({
                success: false, 
                error: error.response ? error.response.data : error.message
            });
        }

    } catch (error) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
        }
    }
};

// const createNewUser = async (req, res) => {
//     try {
//         const userId = req.currentUser?.user_id;
//         const {module} = req.params;


//         if (!req.userDetails || !req.userDetails[0]) {
//             return res.status(400).json({ success: false, message: "User details not found." });
//         }
        

//         // Check for access control
//         const accessScore = req.userDetails[0].usermanagement?.[module];

//         if(accessScore < 2){
//             return res.status(403).json({success: false, message: `Insufficient access rights to create a ${module}`});
//         }

//         if (!userId) {
//             return res.status(404).json({ success: false, message: "User ID not found." });
//         }

//         const { catalyst } = res.locals;
//         const zcql = catalyst.zcql();

//         const table1 = catalyst.datastore().table("usermanagement");
//         const {crmuserid ,easyportal__User_Email,Name,easyportal__Status} = req.body;





//         const { orgId, domain } = await getOrgDetails(userId, zcql);

//         if (!orgId) {
//             return res
//               .status(404)
//               .json({ success: false, message: "Organization ID not found." });
//         }

//         const list = [ "approval","workflow","blueprint","pathfinder","orchestration"]; 

//         const moduleData = { data: [{...req.body, trigger: list}] };
              
//         let token = await getAccessToken(orgId,req,res);
//         const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;

//         try {
//             const data = await handleZohoRequest(url, 'post', moduleData, token);
//             if(data?.data[0]?.code === "SUCCESS"){
//                 let rowData = {
//                     userid: crmuserid,
//                     orgid: orgId,
//                     username: Name,
//                     email: easyportal__User_Email,
//                     crmuserid: data?.data[0]?.details?.id
//                   };

//                   const usermanagementResponse = await table1.insertRow(rowData);
//                   console.log("UsermanangementRes",usermanagementResponse);
                           
//             }
//             return res.status(200).json({ success: true, data });
//         } catch (error) {
//             // console.log(error);
//             return res.status(error.status || 500).json({
//                 success: false, 
//                 error: error.response ? error.response.data : error.message
//             });
//         }

//     } catch (error) {
//         // console.log(error);
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
//         }
//     }
// };

// const createNewUser = async (req, res) => {
//     try {
//         const userId = req.currentUser?.user_id;
//         const {module} = req.params;

//         if (!req.userDetails || !req.userDetails[0]) {
//             return res.status(400).json({ success: false, message: "User details not found." });
//         }
        
//         // Check for access control
//         const accessScore = req.userDetails[0].usermanagement?.[module];

//         if (accessScore < 2) {
//             return res.status(403).json({success: false, message: `Insufficient access rights to create a ${module}`});
//         }

//         if (!userId) {
//             return res.status(404).json({ success: false, message: "User ID not found." });
//         }

//         const { catalyst } = res.locals;
//         const zcql = catalyst.zcql();

//         const table1 = catalyst.datastore().table("usermanagement");
//         const {crmuserid, easyportal__User_Email, Name, easyportal__Status} = req.body;

//         const { orgId, domain } = await getOrgDetails(userId, zcql);

//         if (!orgId) {
//             return res
//               .status(404)
//               .json({ success: false, message: "Organization ID not found." });
//         }

//         const list = ["approval", "workflow", "blueprint", "pathfinder", "orchestration"]; 

//         const moduleData = { data: [{...req.body, trigger: list}] };
              
//         let token = await getAccessToken(orgId, req, res);

//         const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;
//         const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;
//         const requestData = {
//             select_query: `select id from easyportal__Portal_Users where easyportal__User_Email = '${easyportal__User_Email}' limit 10`
//         };

//         try {
//             const data = await handleZohoRequest(searchUrl, 'post', requestData, token);
//             console.log("data",data);

//             if (!data || data === "") {
//                 const createData = await handleZohoRequest(url, 'post', moduleData, token);
//                 if (createData?.data[0]?.code === "SUCCESS") {
//                     let rowData = {
//                         userid: crmuserid,
//                         orgid: orgId,
//                         username: Name,
//                         email: easyportal__User_Email,
//                         crmuserid: createData?.data[0]?.details?.id
//                     };

//                     const usermanagementResponse = await table1.insertRow(rowData);
//                     console.log("UsermanangementRes", usermanagementResponse);
//                     return res.status(200).json({ success: true, createData });
//                 }
//                 return res.status(400).json({ success: false, message: "Failed to create user", createData });
//             } else if ( data?.info?.count === 1 ) {
             
//                 const portalUserId = data?.data[0].id;
//                 const responseMap = {
//                     data: [{...req.body,id:portalUserId, trigger: list}]
//                 };               

//                 const portalUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
//                 console.log("Updating portal user with data:", responseMap);
                
//                 const updateResult = await handleZohoRequest(portalUrl, 'put', responseMap, token);

//                 if(updateResult?.data[0]?.code === "SUCCESS"){
//                     let rowData = {
//                         userid: crmuserid,
//                         orgid: orgId,
//                         username: Name,
//                         email: easyportal__User_Email,
//                         crmuserid: updateResult?.data[0]?.details?.id
//                     };

//                     const usermanagementResponse = await table1.insertRow(rowData);
//                     console.log("UsermanangementRes", usermanagementResponse);
//                     return res.status(200).json({ success: true, updateResult });
//                 }
//                 return res.status(400).json({ success: false, message: "Failed to update user!", updateResult });
//             } else {
//                 return res.status(500).json({
//                     success: false,
//                     message: "You have more than one portal user with same email id, so just delete the all and put only one."
//                 });
//             }
//         } catch (error) {
//             return res.status(error.status || 500).json({
//                 success: false, 
//                 error: error.response ? error.response.data : error.message
//             });
//         }

//     } catch (error) {
//         if (!res.headersSent) {
//             return res.status(500).json({ success: false, error: error.response ? error.response.data : error.message });
//         }
//     }
// };

// const createNewUser = async (req, res) => {
//     try {
//       const userId = req.currentUser?.user_id;
//       const { module } = req.params;
  
//       const { catalyst } = res.locals;
//       const zcql = catalyst.zcql();
//       const table1 = catalyst.datastore().table("usermanagement");
//       const {
//         crmuserid, easyportal__User_Email, Name,
//         easyportal__Status, orgId, licenseRollback
//       } = req.body;

//       console.log(req.body);
  
//       if (!req.userDetails || !req.userDetails[0]) {
//         return res.status(400).json({ success: false, message: "User details not found." });
//       }
  
//       const accessScore = req.userDetails[0].usermanagement?.[module];
//       if (accessScore < 2) {
//         return res.status(403).json({ success: false, message: `Insufficient access rights to create a ${module}` });
//       }
  
//       const domainQuery = `SELECT domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
//       const domainResult = await zcql.executeZCQLQuery(domainQuery);
//       const domain = domainResult[0]?.usermanagement?.domain;
  
//       if (!orgId || !domain) {
//         return res.status(404).json({ success: false, message: "Organization ID or domain not found." });
//       }
  
//       const token = await getAccessToken(orgId, req, res);
//       const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;
//       const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;
//       const query = {
//         select_query: `select id from easyportal__Portal_Users where easyportal__User_Email = '${easyportal__User_Email}' limit 10`
//       };
  
//       const crmSearch = await handleZohoRequest(searchUrl, 'post', query, token);
  
//       const portalUserId = crmSearch?.data?.[0]?.id;
//       const payload = {
//         data: [{
//           ...req.body,
//           id: portalUserId,
//           trigger: ["approval", "workflow", "blueprint", "pathfinder", "orchestration"]
//         }]
//       };
  
//       let crmResult;
//       if (!portalUserId) {
//         crmResult = await handleZohoRequest(url, 'post', payload, token);
//       } else {
//         const updateUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
//         crmResult = await handleZohoRequest(updateUrl, 'put', payload, token);
//       }
  
//       if (crmResult?.data[0]?.code === "SUCCESS") {
//         const userData = {
//           userid: crmuserid,
//           orgid: orgId,
//           username: Name,
//           email: easyportal__User_Email,
//           crmuserid: crmResult.data[0]?.details?.id
//         };
  
//         await table1.insertRow(userData);
  
//         return res.status(200).json({ success: true, crmResult });
//       } else {
//         // 🔁 Rollback license count
//         if (licenseRollback) {
//           const rollbackQuery = `
//             UPDATE Organization SET activeLicense = ${licenseRollback.previousCount}
//             WHERE ROWID = '${licenseRollback.orgId}'
//           `;
//           await zcql.executeZCQLQuery(rollbackQuery);
//           console.log("Rolled back license count due to CRM failure");
//         }
  
//         return res.status(400).json({
//           success: false,
//           message: "CRM operation failed",
//           crmResult
//         });
//       }
  
//     } catch (error) {
//       if (req.body?.licenseRollback) {
//         const rollbackQuery = `
//           UPDATE Organization SET activeLicense = ${req.body.licenseRollback.previousCount}
//           WHERE ROWID = '${req.body.licenseRollback.orgId}'
//         `;
//         await catalyst.zcql().executeZCQLQuery(rollbackQuery);
//         console.log("Rolled back due to unexpected error");
//       }
  
//       return res.status(error.status || 500).json({
//         success: false,
//         error: error.response ? error.response.data : error.message
//       });
//     }
//   };


const createNewUser = async (req, res) => {
    let catalyst; // Declare here so it's accessible in catch
    try {
      const userId = req.currentUser?.user_id;
      const { module } = req.params;
  
      catalyst = res.locals.catalyst; // assign value
      const zcql = catalyst.zcql();
      const table1 = catalyst.datastore().table("usermanagement");
  
      const {
        crmuserid, easyportal__User_Email, Name,
        easyportal__Status, orgId, licenseRollback
      } = req.body;
  
      if (!req.userDetails || !req.userDetails[0]) {
        return res.status(400).json({ success: false, message: "User details not found." });
      }
  
      const accessScore = req.userDetails[0].usermanagement?.[module];
      if (accessScore < 2) {
        return res.status(403).json({ success: false, message: `Insufficient access rights to create a ${module}` });
      }
  
      const domainQuery = `SELECT domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
      const domainResult = await zcql.executeZCQLQuery(domainQuery);
      const domain = domainResult[0]?.usermanagement?.domain;
  
      if (!orgId || !domain) {
        return res.status(404).json({ success: false, message: "Organization ID or domain not found." });
      }
  
      const token = await getAccessToken(orgId, req, res);
      const searchUrl = `https://www.zohoapis.${domain}/crm/v7/coql`;
      const url = `https://www.zohoapis.${domain}/crm/v7/${module}`;
      const query = {
        select_query: `select id from easyportal__Portal_Users where easyportal__User_Email = '${easyportal__User_Email}' limit 10`
      };
  
      const crmSearch = await handleZohoRequest(searchUrl, 'post', query, token);
  
      const portalUserId = crmSearch?.data?.[0]?.id;
      const payload = {
        data: [{
          ...req.body,
          id: portalUserId,
          trigger: ["approval", "workflow", "blueprint", "pathfinder", "orchestration"]
        }]
      };
  
      let crmResult;
      if (!portalUserId) {
        crmResult = await handleZohoRequest(url, 'post', payload, token);
      } else {
        const updateUrl = `https://www.zohoapis.${domain}/crm/v7/easyportal__Portal_Users`;
        crmResult = await handleZohoRequest(updateUrl, 'put', payload, token);
      }
  
      if (crmResult?.data[0]?.code === "SUCCESS") {
        const userData = {
          userid: crmuserid,
          orgid: orgId,
          username: Name,
          email: easyportal__User_Email,
          domain:domain,
          crmuserid: crmResult.data[0]?.details?.id
        };
  
        await table1.insertRow(userData);
  
        return res.status(200).json({ success: true, crmResult });
      } else {
        // 🔁 Rollback license count
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
          crmResult
        });
      }
  
    } catch (error) {
      // ✅ Safe rollback in catch
      if (catalyst && req.body?.licenseRollback) {
        const rollbackQuery = `
          UPDATE Organization SET activeLicense = ${req.body.licenseRollback.previousCount}
          WHERE ROWID = '${req.body.licenseRollback.orgId}'
        `;
        await catalyst.zcql().executeZCQLQuery(rollbackQuery);
      }

  
      return res.status(error.status || 500).json({
        success: false,
        error: error,
        message: "User do not added!"
      });
    }
  };
  
  
  

module.exports = {createNewData,createNewUser}