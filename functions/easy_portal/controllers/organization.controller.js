const axios = require('axios');
const refreshAccessToken = require('../utils/genaccestoken');
const { getAccessToken, handleZohoRequest } = require("../utils/zohoUtils");

// const registerOrganization = async (req, res) => {
//     try {
//         const userId = req?.currentUser?.user_id;

//         const { domain, orgName, street, city, state, country, zip, displayname, crmdomain, activationdate, activationEndDate, superadminEmail } = req.body;

//         const { catalyst } = res.locals;
//         const table1 = catalyst.datastore().table('usermanagement')
//         const zcql = catalyst.zcql();  
//         if (userId) {
           
//             // if user already registered organization...

//             const checkUserManagementQuery = `
//               SELECT ROWID , userid, orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1
//             `;
            
//             const exUser = await zcql.executeZCQLQuery(checkUserManagementQuery);

//             if(exUser && exUser.length > 0){
//                 return res.status(400).send({
//                     status:'failure',
//                     message:'You already registered your organization!'
//                 })
//             }
            

//             const checkDomainQuery = ` 
//                 SELECT ROWID, orgname, street, city, state, country, zip, displayname, crmdomain, isactive, activationdate, activationEndDate, superadminEmail
//                 FROM Organization 
//                 WHERE domain = '${domain}' 
//                 LIMIT 1
//             `; 

//             const existingOrg = await zcql
//             .executeZCQLQuery(checkDomainQuery);
            
//             if (existingOrg && existingOrg.length > 0) {
//                 return res.status(400).send({
//                     status: 'failure',
//                     message: 'Domain already exists. Please choose a different domain.',
//                     data: existingOrg
//                 });
//             }

//             const insertOrgQuery = `
//                 INSERT INTO Organization (domain, orgname, street, city, state, country, zip, displayname, crmdomain,  activationdate, activationEndDate, superadminEmail) 
//                 VALUES ('${domain}', '${orgName}', '${street}', '${city}', '${state}', '${country}', '${zip}', '${displayname}', '${crmdomain}', '${activationdate}', '${activationEndDate}', '${superadminEmail}')
//             `;
            
//             await zcql
//             .executeZCQLQuery(insertOrgQuery);

            
//             const selectOrgQuery = `
//                 SELECT ROWID, orgname, street, city, state, country, zip, displayname, crmdomain, isactive, activationdate, activationEndDate, superadminEmail FROM Organization WHERE domain = '${domain}'
//             `;
            
//             const org = await zcql
//             .executeZCQLQuery(selectOrgQuery);
            
//             const orgId = org[0]?.Organization?.ROWID;

//             const checkUserQuery = `
//                 SELECT ROWID FROM usermanagement WHERE userid = '${userId}'  LIMIT 1
//             `;

//             const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);
//             if (checkUserResult.length === 0) {

//                 let rowData = {
//                     userid: userId,
//                     orgid: orgId,
//                     username: req.currentUser?.first_name + req.currentUser?.last_name,
//                     email: req.currentUser?.email_id,
//                     domain: crmdomain
//                 };
                
//                 await table1.insertRow(rowData);
//             }


//             res.status(200).send({
//                 status: 'success',
//                 message: "Organization Registered Successfully!",
//                 data: org,
//                 orgId: orgId
//             });
//         } else {
//             res.status(401).send({
//                 status: 'Unauthorized',
//                 message: 'Please login!'
//             });
//         }
//     } catch (err) {
//         res.status(500).send({
//             status: 'failure',
//             message: err || 'An error occurred while registering the organization.'
//         });
//     }
// };

const registerOrganization = async (req, res) => {
    try {
        const userId = req?.currentUser?.user_id;
        const email_id = req?.currentUser?.email_id;
        

        const { domain, orgName, street, city, state, country, zip, displayname, crmdomain, activationdate, activationEndDate, superadminEmail,crmorgid,clientid,clientsecret,refreshtoken,authcode } = req.body;

        const { catalyst } = res.locals;
        const table1 = catalyst.datastore().table('usermanagement')
        const table2 = catalyst.datastore().table('Connections');
        const zcql = catalyst.zcql();  
        if (userId) {
           
            // if user already registered organization...

            const checkUserManagementQuery = `
              SELECT ROWID , userid, orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1
            `;


            
            const exUser = await zcql.executeZCQLQuery(checkUserManagementQuery);
            

            if(exUser && exUser.length > 0){
                return res.status(400).send({
                    status:'failure',
                    message:'You already registered your organization!'
                })
            }
            

            const checkDomainQuery = ` 
                SELECT ROWID, orgname, street, city, state, country, zip, displayname, crmdomain, isactive, activationdate, activationEndDate, superadminEmail
                FROM Organization 
                WHERE domain = '${domain}' 
                LIMIT 1
            `; 

            const existingOrg = await zcql
            .executeZCQLQuery(checkDomainQuery);
            
            if (existingOrg && existingOrg.length > 0) {
                return res.status(400).send({
                    status: 'failure',
                    message: 'Domain already exists. Please choose a different domain.',
                    data: existingOrg
                });
            }
            let insertOrgQuery;

           if(crmorgid !== undefined){
             insertOrgQuery = `
                INSERT INTO Organization (domain, orgname, street, city, state, country, zip, displayname, crmdomain,  activationdate, activationEndDate, superadminEmail,crmorgid) 
                VALUES ('${domain}', '${orgName}', '${street}', '${city}', '${state}', '${country}', '${zip}', '${displayname}', '${crmdomain}', '${activationdate}', '${activationEndDate}', '${email_id}','${crmorgid}')
            `;
           }else{
             insertOrgQuery = `
                INSERT INTO Organization (domain, orgname, street, city, state, country, zip, displayname, crmdomain,  activationdate, activationEndDate, superadminEmail) 
                VALUES ('${domain}', '${orgName}', '${street}', '${city}', '${state}', '${country}', '${zip}', '${displayname}', '${crmdomain}', '${activationdate}', '${activationEndDate}', '${email_id}')
            `;
           }
            
            await zcql
            .executeZCQLQuery(insertOrgQuery);

            
            const selectOrgQuery = `
                SELECT ROWID, orgname, street, city, state, country, zip, displayname, crmdomain, isactive, activationdate, activationEndDate, superadminEmail FROM Organization WHERE domain = '${domain}'
            `;
            
            const org = await zcql
            .executeZCQLQuery(selectOrgQuery);
            
            const orgId = org[0]?.Organization?.ROWID;

            const checkUserQuery = `
                SELECT ROWID FROM usermanagement WHERE userid = '${userId}'  LIMIT 1
            `;

            const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);
            if (checkUserResult.length === 0) {

                let rowData = {
                    userid: userId,
                    orgid: orgId,
                    username: req.currentUser?.first_name + req.currentUser?.last_name,
                    email: req.currentUser?.email_id,
                    domain: crmdomain
                };
                
                await table1.insertRow(rowData);
            }

            if(clientid && clientsecret && refreshtoken && authcode){
                let rowData = {
                clientid: clientid,
                clientsecret: clientsecret,
                refreshtoken: refreshtoken,
                authcode: authcode,
                orgid: orgId
            }
             await table2.insertRow(rowData);   
            }

                


            res.status(200).send({
                status: 'success',
                message: "Organization Registered Successfully!",
                data: org,
                orgId: orgId
            });
        } else {
            res.status(401).send({
                status: 'Unauthorized',
                message: 'Please login!'
            });
        }
    } catch (err) {
        res.status(500).send({
            status: 'failure',
            message: err || 'An error occurred while registering the organization.'
        });
    }
};

// const organizationExists = async(req,res)=>{
//     try {
//     const userId = req.currentUser?.user_id;
//     const email = req.currentUser?.email_id;

//     console.log(email);
//     const user = req.currentUser;
//     const {catalyst} = res?.locals;
//     const zcql = catalyst.zcql();

//     if(userId){
//         const checkDomainQuery = ` 
//         SELECT orgid
//         FROM usermanagement
//         WHERE userid = '${userId}' 
//         LIMIT 1
//     `;


//     const userExist = await zcql.executeZCQLQuery(checkDomainQuery);


//     if (userExist && userExist.length > 0) {
//         const orgId = userExist[0]?.usermanagement?.orgid;
    
//         if(orgId != null){
    
//             const orgDomainQuery = `
//             SELECT isActive,displayname FROM Organization,superadminEmail
//             WHERE ROWID = '${orgId}'
//           `
//           const orgdata = await await zcql
//           .executeZCQLQuery(orgDomainQuery);

//           const superadminEmail = orgdata[0]?.Organization?.superadminEmail;

//           if(email === superadminEmail){
//             return res.status(202).send({
//                 status: true
//             })
//           }
    
//             return res.status(208).send({
//                 status: true,
//                 message: 'Organization already exists!',
//                 active: orgdata[0]?.Organization?.isactive, 
//                 displayname: orgdata[0]?.Organization?.displayname,
//                 orgId: orgId
//             }); 
//         }else{
//             return res.status(200).send({
//                 status:true,
//                 message: 'Please Register your organization!'
//             })
//         }
//         }else{
//             return res.status(200).send({
//                 status: true,
//                 message: 'Please register your organization!'
//             })
//         }
//     }else{
//         return res.status(400).send({
//             status: 'failure',
//             message: 'User do not Exists.'
//         });
//     }

//     } catch (error) {
//         res.status(500).json({
//           success: false,
//           message: "Internal Server Error!",
//         })
//     }

// }


const organizationExists = async(req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        const email = req.currentUser?.email_id;

        console.log(email);
        const user = req.currentUser;
        const {catalyst} = res?.locals;
        const zcql = catalyst.zcql();

        if(userId){
            const checkDomainQuery = ` 
                SELECT orgid
                FROM usermanagement
                WHERE userid = '${userId}' 
                LIMIT 1
            `;

            const userExist = await zcql.executeZCQLQuery(checkDomainQuery);

            if (userExist && userExist.length > 0) {
                const orgId = userExist[0]?.usermanagement?.orgid;
            
                if(orgId != null){
                    const orgDomainQuery = `
                        SELECT isActive, displayname, superadminEmail 
                        FROM Organization
                        WHERE ROWID = '${orgId}'
                    `;
                    
                    const orgdata = await zcql.executeZCQLQuery(orgDomainQuery);
                    const superadminEmail = orgdata[0]?.Organization?.superadminEmail;
                    const isSuperAdmin = email === superadminEmail;

                    // If the current user is the super admin
                    if(isSuperAdmin){
                        return res.status(208).send({
                            status: true,
                            message: 'Organization exists and user is super admin',
                            active: orgdata[0]?.Organization?.isactive,
                            displayname: orgdata[0]?.Organization?.displayname,
                            orgId: orgId,
                            isSuperAdmin: true
                        });
                    }
            
                    // Regular organization member
                    return res.status(208).send({
                        status: true,
                        message: 'Organization already exists!',
                        active: orgdata[0]?.Organization?.isactive, 
                        displayname: orgdata[0]?.Organization?.displayname,
                        orgId: orgId,
                        isSuperAdmin: false
                    }); 
                } else {
                    return res.status(200).send({
                        status: true,
                        message: 'Please Register your organization!'
                    });
                }
            } else {
                return res.status(200).send({
                    status: true,
                    message: 'Please register your organization!'
                });
            }
        } else {
            return res.status(400).send({
                status: 'failure',
                message: 'User does not Exist.'
            });
        }
    } catch (error) {
        console.error("Error in organizationExists:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};


const getOrganizationDetails = async(req,res)=>{
   try {

    const userId = req.currentUser?.user_id; 
    const {orgId} = req.params;
    const {catalyst} = res.locals;
    const zcql = catalyst.zcql();

    if(userId){
        const selectFindQuery = `
        SELECT orgName, street, city, state, zip, country, displayname,crmdomain,isactive,activationdate,activationEndDate,superadminEmail,crmorgid
        FROM Organization 
        WHERE ROWID = '${orgId}' 
        LIMIT 1
    `
        const orgDetails = await zcql
        .executeZCQLQuery(selectFindQuery);


        return res.status(200).send({
            data: orgDetails
        })
    }else{
        return res.status(404).send({
            success: false,
            message: "Data not found!"
        })
    }    
   } catch (error) {
      res.status(500).send({
        message: error
      })
   }
}


const getOrgDetails = async(req,res)=>{
    try {
 
     const userId = req.currentUser?.user_id;
     const {catalyst} = res.locals;
     const zcql = catalyst.zcql();
     
     if(userId){
         const orgQuery = `
          SELECT orgid FROM usermanagement WHERE userid = '${userId}'
         `;
         const orgDetail = await zcql.executeZCQLQuery(orgQuery);
         const orgId = orgDetail[0]?.usermanagement?.orgid;
        
         if (!orgId) {
            return res.status(404).json({
                success: false,
                message: "Organization ID not found for the user."
            });
        }

         const selectFindQuery = `
         SELECT ROWID, orgname, street, city, state, zip, country, displayname,crmdomain,isactive,activationdate,activationEndDate,superadminEmail,crmorgid,widget
         FROM Organization 
         WHERE ROWID = '${orgId}' 
         LIMIT 1
        `
         const orgDetails = await zcql
         .executeZCQLQuery(selectFindQuery);


         if (!orgDetails || orgDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No organization details found."
            });
        }      
 
 
         return res.status(200).send({
             data: orgDetails
         })
     }else{
         return res.status(404).send({
             success: false,
             message: "Data not found!"
         })
     }    
    } catch (error) {
       res.status(500).send({
         message: error
       })
    }
}

// Check if orgId exists in the connection table
const checkAuthorization = async (req, res) => {

    const userId = req?.currentUser?.user_id;
    const { orgId } = req.params;
   
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql(); 

    try {
        if(userId){

            const checkDomainQuery = ` 
            SELECT * FROM Connections
            WHERE orgid = '${orgId}' 
            LIMIT 1
        `;
            const existingOrg = await zcql
            .executeZCQLQuery(checkDomainQuery);
            
            if (existingOrg && existingOrg.length > 0) {
                return res.json({
                    authorized: true
                })
            }
            res.json({ authorized: false });
        }else{
            res.status(400).json({
                message: "Unauthorized User!"
            })
        }
       
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}


const requestRefreshToken = async (req, res) => {
    try {
      const { clientId, clientSecret, authCode } = req.body;
    //   let {orgId} = req.body;
      const userId = req?.currentUser?.user_id;
     

    //  Initialized the catalyst instance...

      const { catalyst } = res.locals;
      const zcql = catalyst.zcql();

    //   Updating the orgid, if we get the orgid as undefined...

    //   if(userId && orgId === undefined){
    //     const checkDomainQuery = ` 
    //     SELECT orgid FROM usermanagement
    //     WHERE userid = '${userId}' 
    //     LIMIT 1
    // `;
    //     const exitingOrgId = await zcql.executeZCQLQuery(checkDomainQuery);      
    //     orgId = exitingOrgId[0].usermanagement?.orgid;
    //   }

    const checkDomainQuery = `SELECT orgid,domain FROM usermanagement WHERE userid = ${userId} LIMIT 1`;
    const exitingOrgId = await zcql.executeZCQLQuery(checkDomainQuery);

    // if(exitingOrgId[0]){
    //     orgId = exitingOrgId[0]?.usermanagement?.orgid;
        
    // }
    
    const orgId = exitingOrgId[0]?.usermanagement?.orgid;
    const domain = exitingOrgId[0]?.usermanagement?.domain;

    // Validate input
    
    if (!clientId || !clientSecret || !authCode || !orgId) {
        return res.status(400).json({ message: "All fields are required." });
    }
    
      // Ensure orgId is a number
    if (isNaN(orgId)) {
        return res.status(400).json({ message: "Invalid orgId. Expected a numeric value." });
    }
       
      // Make a request to Zoho's token endpoint
    
      const tokenResponse = await axios.post(
        `https://accounts.zoho.${domain}/oauth/v2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}&grant_type=authorization_code&redirect_uri=http://localhost:3000/app`,
        null, null
      );
      
      const { access_token, refresh_token, api_domain } = tokenResponse.data;
    
      // Insert connection details into the database
      const insertConnectionQuery = `
        INSERT INTO Connections (clientid, clientsecret, refreshtoken, authcode, orgid)
        VALUES ('${clientId}', '${clientSecret}', '${refresh_token}', '${access_token}', ${orgId})
      `;
    
      // Database operation commented out as in your original code
      await zcql.executeZCQLQuery(insertConnectionQuery);
    
      // just return the data
      return res.status(200).json({ 
        message: "Tokens generated successfully", 
        data: {
          accessToken: access_token,
          refreshToken: refresh_token,
          apiDomain: api_domain,
        }
      });
    
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to generate tokens";
      return res.status(500).json({ 
        message: errorMessage, 
        error: error.toString() // Only return the string representation
      });
    }
  };

const requestRefreshToken2 = async (req, res) => {
  try {
    const { clientId, clientSecret, authCode, domain } = req.body;
    const userId = req?.currentUser?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "You are not a valid user!" });
    }

    if (!clientId || !clientSecret || !authCode || !domain) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

    // Step 1: Exchange auth code for access and refresh tokens
    const tokenResponse = await axios.post(
      `https://accounts.zoho.${domain}/oauth/v2/token`,
      null,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          code: authCode,
          grant_type: "authorization_code",
          redirect_uri: "http://localhost:3000/app"
        }
      }
    );

    const { access_token, refresh_token, api_domain } = tokenResponse.data;

    // Step 2: Get CRM Org Details using the access token
    const orgDetailsUrl = `https://www.zohoapis.${domain}/crm/v7/org`;
    const crmResponse = await axios.get(orgDetailsUrl, {
      headers: {
        Authorization: `Zoho-oauthtoken ${access_token}`,
      },
    });

    const orgData = crmResponse.data;

    // Step 3: Extract orgId from the response
    // const orgId = orgData?.org?.zeoid;
    // if (!orgId) {
    //   return res.status(500).json({ success: false, message: "Failed to retrieve Organization ID." });
    // }

    // Step 4: Store connection details in database
    // const insertConnectionQuery = `
    //   INSERT INTO Connections (clientid, clientsecret, refreshtoken, authcode, orgid)
    //   VALUES ('${clientId}', '${clientSecret}', '${refresh_token}', '${access_token}', ${orgId})
    // `;

    // await zcql.executeZCQLQuery(insertConnectionQuery);

    // Step 5: Respond with everything
    return res.status(200).json({
      success: true,
      message: "Tokens generated and CRM details retrieved successfully.",
      data: {
        accessToken: access_token,
        refreshToken: refresh_token,
        apiDomain: api_domain,
        orgDetails: orgData,
        connections:{
          clientid: clientId,
          clientsecret: clientSecret,
          refreshtoken: refresh_token,
          authcode: access_token
        },
       
        username: `${req.currentUser.first_name} ${req.currentUser.last_name}`
      }
    });

  } catch (error) {
    console.error("Error in requestTokenAndGetOrgDetails:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unknown error occurred";

    return res.status(500).json({
      success: false,
      message: "Failed to generate tokens or fetch CRM org details.",
      error: errorMessage,
    });
  }
};
 

// for making the connection if you are already register the organization...

const makeconnection = async (req, res) => {
    try {
        const { clientid, clientsecret, refreshtoken, authcode, orgId } = req.body;
       
        // Check if all required fields are provided
        
        if (!clientid || !clientsecret || !refreshtoken || !authcode || !orgId) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Ensure orgId is a number
        if (isNaN(orgId)) {
            return res.status(400).json({ message: "Invalid orgId. Expected a numeric value." });
        }

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();

        // Check if orgId already exists in the Connections table
        const checkQuery = `SELECT * FROM Connections WHERE orgid = ${orgId}`;  // No quotes
        const existingConnection = await zcql.executeZCQLQuery(checkQuery);

        if (existingConnection.length > 0) {
            return res.status(400).json({ message: "Organization is already connected." });
        }

        // Insert new connection into the Connections table
        const insertConnectionQuery = `
            INSERT INTO Connections (clientid, clientsecret, refreshtoken, authcode, orgid)
            VALUES ('${clientid}', '${clientsecret}', '${refreshtoken}', '${authcode}', ${orgId})  -- No quotes for orgId
        `;

        await zcql.executeZCQLQuery(insertConnectionQuery);

        return res.status(200).json({ message: "Connection established successfully." });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error});
    }
}

// check for extension if downloaded or not

const checkForExtension = async (req, res) => {
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

        let token = await getAccessToken(orgId, req, res);
        const url = `https://www.zohoapis.${domain}/crm/v7/settings/modules/easyportal__Portal_Users`;

        try {
            const data = await handleZohoRequest(url, 'get', null, token);
            return res.status(200).json({ success: true, data });
        } catch (error) {
            if (error.message === "TOKEN_EXPIRED") {
                try {
                    token = await refreshAccessToken(req, res);
                    const data = await handleZohoRequest(url, 'get', null, token);
                    return res.status(200).json({ success: true, data });
                } catch (refreshError) {
                    return res.status(500).json({ success: false, message: refreshError.message });
                }
            } else if (error.status === 204) {
                // Module doesn't exist - return empty data with success true
                return res.status(200).json({ success: true, data: null, moduleExists: false });
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



const getcrmorg = async (req, res) => {
    const userId = req.currentUser?.user_id;
  try {
    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User ID not found." });
    }

    const { id, module } = req.params;
    const { catalyst } = res.locals;
    const zcql = catalyst.zcql();

   
    const orgId = req.userDetails[0]?.usermanagement?.orgid;
    const domain = req.userDetails[0]?.usermanagement?.domain;
    const accessscore = req.userDetails[0]?.usermanagement?.[module];  

    if (!orgId) {
      return res
        .status(404)
        .json({ success: false, message: "Organization ID not found." });
    }
    
   
    let token = await getAccessToken(orgId,req, res);
 
  
    const url = `https://www.zohoapis.${domain}/crm/v7/org`;
  

    try {
     
      const data = await handleZohoRequest(url, "get", null, token);
      
      return res
        .status(200)
        .json({
          success: true,
          data,
          username: req.currentUser.first_name + " " + req.currentUser.last_name,
          accessscore
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
              accessscore
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

const updateOrgDetails = async (req, res) => {  
    try {
        const orgid = req.userDetails[0]?.usermanagement.orgid;
        const { company_name, domain_name, street, city, state, country, zip, zgid } = req.body.orgData;

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const updateQuery = `
            UPDATE Organization 
            SET orgname = '${company_name}', 
                domain = '${domain_name}', 
                street = '${street}', 
                city = '${city}', 
                state = '${state}', 
                country = '${country}', 
                zip = '${zip}', 
                displayname = '${company_name}', 
                crmorgid = ${zgid}
            WHERE ROWID = '${orgid}'
        `;
        await zcql.executeZCQLQuery(updateQuery);
        return res.status(200).json({ message: "Organization details updated successfully." }); 
    } catch (error) {
        res.status(500).send({
            message: error.message || error
        });
    }
}

const editorgdetails = async (req, res) => {  
    try {
        // const orgid = req.userDetails[0]?.usermanagement.orgid;
        const userExist = req.currentUser;

        if(!userExist) return res.status(401).json({success:false,message:"You have't access!"});

        const orgId = req.userDetails[0].usermanagement?.orgid;
        if(!orgId) return res.status(404).json({success:false,message:"Something missing in your orgnization!"});
        
        const {domain,widget} = req.body;
 
        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();
        const updateQuery = `
            UPDATE Organization 
            SET 
                widget = '${widget}'
            WHERE ROWID = '${orgId}'
        `;
        await zcql.executeZCQLQuery(updateQuery);
        return res.status(200).json({ message: "Organization details updated successfully." }); 
    } catch (error) {
        res.status(500).send({
            message: error.message || error
        });
    }
}


const getOrgWidget = async(req,res)=>{
    try {
 
     const userId = req.currentUser?.user_id;
     const {catalyst} = res.locals;
     const zcql = catalyst.zcql();
     
     if(userId){
         const orgQuery = `
          SELECT orgid FROM usermanagement WHERE userid = '${userId}'
         `;
         const orgDetail = await zcql.executeZCQLQuery(orgQuery);
         const orgId = orgDetail[0]?.usermanagement?.orgid;
        
         if (!orgId) {
            return res.status(404).json({
                success: false,
                message: "Organization ID not found for the user."
            });
        }
        

         const selectFindQuery = `
         SELECT widget
         FROM Organization 
         WHERE ROWID = '${orgId}' 
         LIMIT 1
        `
         const orgDetails = await zcql
         .executeZCQLQuery(selectFindQuery);


         if (!orgDetails || orgDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No organization details found."
            });
        }      
 
 
         return res.status(200).send({
             data: orgDetails
         })
     }else{
         return res.status(404).send({
             success: false,
             message: "Data not found!"
         })
     }    
    } catch (error) {
       res.status(500).send({
         message: error
       })
    }
}







module.exports = {registerOrganization,organizationExists,getOrganizationDetails,getOrgDetails,checkAuthorization,makeconnection,requestRefreshToken, checkForExtension, getcrmorg,updateOrgDetails,editorgdetails,getOrgWidget,requestRefreshToken2};