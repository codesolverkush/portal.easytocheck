const webtabHander = async(req,res)=>{
    try { 
        const userId = req.currentUser?.user_id;
        const userEmail = req.currentUser?.email_id;
        const {catalyst} = res.locals;
        const zcql = catalyst.zcql();
        let check = false;
        let users = [];
        
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
            SELECT activationdate,activationEndDate,activeLicense,totalLicenses,superadminEmail
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

           if(orgDetails[0]?.Organization?.superadminEmail === userEmail){
                check = true;
                const selectUserQuery = `
                SELECT *
                FROM usermanagement
                WHERE orgid = '${orgId}'
               `

               const userDetails = await zcql
               .executeZCQLQuery(selectUserQuery);

               users.push(userDetails);

               return res.status(200).json({
                check: check,
                data: orgDetails,
                users: users
            })
           }else{
              return res.status(401).json({
                 success: false,
                 message: "You are not authorized to show this page!"
              })
           }       
           
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

const removeUser = async(req,res)=>{
    try {
        const userId = req.currentUser?.user_id;
        const emailId = req.currentUser?.email_id;
        const {catalyst} = res.locals;
        const zcql = catalyst.zcql();
        const {id} = req?.params;
        
        if(userId && id){
            // First, get the organization ID for the user being removed
            const userQuery = `
                SELECT orgid,domain FROM usermanagement WHERE userid = '${id}'
            `;
            const userResult = await zcql.executeZCQLQuery(userQuery);
            
            if (!userResult || userResult.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found!"
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
                    message: "Organization not found!"
                });
            }
            if((licenseResult[0]?.Organization?.superadminEmail === emailId) && (userId === id)){
                return res.status(400).json({
                    success: false,
                    message: "You are superadmin!"
                })
            }
            
            let activeLicense = licenseResult[0]?.Organization?.activeLicense;
            
            // Check if active license count is already 0
            if (activeLicense <= 0) {
                return res.status(403).json({
                    success: false,
                    message: "Cannot remove user. Active license count is already at 0."
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
            message: "User Deleted Successfully!"
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

const updateUserAccess = async (req, res) => {
    try {
        const { userId, section, accessLevel } = req.body;


        
        // console.log(userId);

        const { catalyst } = res.locals;
        const zcql = catalyst.zcql();

        // Validate input
        if (!userId || !section || !accessLevel) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters"
            });
        }


        // Prepare the update query
        const updateQuery = `
            UPDATE usermanagement SET ${section}='${accessLevel}' WHERE userid='${userId}'
        `;

        try {
            // Execute the update query
            const updateResult = await zcql.executeZCQLQuery(updateQuery);
            
            // // Check if any rows were updated
            // if (updateResult.affectedRows === 0) {
            //     // write ksfn
            // }

            // console.log(updateResult);

            // Fetch the updated user permissions
            const fetchQuery = `
                SELECT * FROM usermanagement
                WHERE userid = '${userId}'
            `;
            const fetchResult = await zcql.executeZCQLQuery(fetchQuery);

            // console.log(fetchResult);

            res.status(200).json({
                success: true,
                message: "User access updated successfully",
                data: {
                    userId,
                    section,
                    accessLevel,
                    updatedPermissions: fetchResult[0]?.user_permissions || null
                }
            });
        } catch (updateError) {
            console.error("Update Error:", updateError);
            res.status(500).json({
                success: false,
                message: "Failed to update user access",
                error: updateError.message
            });
        }

    } catch (error) {
        console.error("Error in updateUserAccess:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {webtabHander,removeUser,updateUserAccess};