const axios = require('axios');

const registerOrganization = async (req, res) => {
    try {
        const userId = req?.currentUser?.user_id;

        const { domain, orgName, street, city, state, country, zip, displayname, crmdomain, isactive, activationdate, activationEndDate, superadminEmail } = req.body;
        // console.log(req.body);

        const { catalyst } = res.locals;
        const table1 = catalyst.datastore().table('usermanagement')
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

            const insertOrgQuery = `
                INSERT INTO Organization (domain, orgname, street, city, state, country, zip, displayname, crmdomain, isactive, activationdate, activationEndDate, superadminEmail) 
                VALUES ('${domain}', '${orgName}', '${street}', '${city}', '${state}', '${country}', '${zip}', '${displayname}', '${crmdomain}', '${isactive}', '${activationdate}', '${activationEndDate}', '${superadminEmail}')
            `;
            
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
            // console.log(checkUserResult);
            if (checkUserResult.length === 0) {

                let rowData = {
                    userid: userId,
                    orgid: orgId
                };
                
                await table1.insertRow(rowData);
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

const organizationExists = async(req,res)=>{
    try {
    const userId = req.currentUser?.user_id;
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

    // console.log(checkDomainQuery);

    const userExist = await zcql.executeZCQLQuery(checkDomainQuery);

     
    // console.log(userExist);

    if (userExist && userExist.length > 0) {
        const orgId = userExist[0]?.usermanagement?.orgid;
    
        if(orgId != null){
    
            const orgDomainQuery = `
            SELECT isActive,displayname FROM Organization
            WHERE ROWID = '${orgId}'
          `
          const orgdata = await await zcql
          .executeZCQLQuery(orgDomainQuery);

        //   console.log(orgdata);
    
            return res.status(208).send({
                status: true,
                message: 'Organization already exists!',
                active: orgdata[0]?.Organization?.isactive, 
                displayname: orgdata[0]?.Organization?.displayname,
                orgId: orgId
            }); 
        }else{
            return res.status(200).send({
                status:true,
                message: 'Please Register your organization!'
            })
        }
        }else{
            return res.status(200).send({
                status: true,
                message: 'Please register your organization!'
            })
        }
    }else{
        return res.status(400).send({
            status: 'failure',
            message: 'User do not Exists.'
        });
    }

    } catch (error) {
        // console.log(error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error!",
        })
    }

}

const getOrganizationDetails = async(req,res)=>{
   try {

    const userId = req.currentUser?.user_id; 
    const {orgId} = req.params;
    const {catalyst} = res.locals;
    const zcql = catalyst.zcql();

    if(userId){
        const selectFindQuery = `
        SELECT orgName, street, city, state, zip, country, displayname,crmdomain,isactive,activationdate,activationEndDate,superadminEmail
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
    // console.log(error);
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


    //  console.log("Catalyst Instance:", catalyst);
    //  console.log("ZCQL Instance:", zcql);
     
     if(userId){
         const orgQuery = `
          SELECT orgid FROM usermanagement WHERE userid = '${userId}'
         `;
         const orgDetail = await zcql.executeZCQLQuery(orgQuery);
         const orgId = orgDetail[0]?.usermanagement?.orgid;
        //  console.log(orgId)


         if (!orgId) {
            return res.status(404).json({
                success: false,
                message: "Organization ID not found for the user."
            });
        }
        

         const selectFindQuery = `
         SELECT ROWID, orgname, street, city, state, zip, country, displayname,crmdomain,isactive,activationdate,activationEndDate,superadminEmail
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
    //  console.log(error);
       res.status(500).send({
         message: error
       })
    }
}

// Check if orgId exists in the connection table
const checkAuthorization = async (req, res) => {

    const userId = req?.currentUser?.user_id;
    const { orgId } = req.params;
    // console.log(orgId);

    const { catalyst } = res.locals;
    const zcql = catalyst.zcql(); 

    // console.log(orgId);
    // console.log(userId);
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
      let {orgId} = req.body;
      const userId = req?.currentUser?.user_id;

    //  Initialized the catalyst instance...

      const { catalyst } = res.locals;
      const zcql = catalyst.zcql();

    //   Updating the orgid, if we get the orgid as undefined...

      if(userId && orgId === undefined){
        const checkDomainQuery = ` 
        SELECT orgid FROM usermanagement
        WHERE userid = '${userId}' 
        LIMIT 1
    `;
        const exitingOrgId = await zcql.executeZCQLQuery(checkDomainQuery);      
        orgId = exitingOrgId[0].usermanagement?.orgid;
      }
    
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
        `https://accounts.zoho.com/oauth/v2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}&grant_type=authorization_code&redirect_uri=https://portal.easytocheck.com`,
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
      console.error("Error requesting refresh token:", error);
      const errorMessage = error.response?.data?.message || "Failed to generate tokens";
      return res.status(500).json({ 
        message: errorMessage, 
        error: error.toString() // Only return the string representation
      });
    }
  };
 

// for making the connection if you are already register the organization...

const makeconnection = async (req, res) => {
    try {
        const { clientid, clientsecret, refreshtoken, authcode, orgId } = req.body;
        // console.log(orgId);

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
        console.error("Error creating connection:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error});
    }
}

module.exports = {registerOrganization,organizationExists,getOrganizationDetails,getOrgDetails,checkAuthorization,makeconnection,requestRefreshToken};