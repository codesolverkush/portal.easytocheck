

 const userRegistration = async (req, res) => {
  try {
    const {email, password} = req.body;
    const userId = req?.decodedId;
    const { catalyst } = res.locals;
            const zcql = catalyst.zcql(); 
    
            if (userId) {
                const checkDomainQuery = ` 
                    SELECT ROWID 
                    FROM Userstable 
                    WHERE email = '${email}' 
                    LIMIT 1
                `;
    
                const existingUsers = await zcql
                .executeZCQLQuery(checkDomainQuery);
                
                if (existingUsers && existingUsers.length > 0) {
                    return res.status(400).send({
                        status: 'failure',
                        message: 'Email already exists. Please choose a different email.'
                    });
                }
                    
                
    
                
                const selectOrgQuery = `
                    SELECT orgId FROM Superadmin WHERE ROWID = '${userId}'
                `;
                
                const data = await zcql.executeZCQLQuery(selectOrgQuery);
                
            //     const insertOrgQuery = `
            //     INSERT INTO Organization (email, password, userId, orgId) 
            //     VALUES ('${email}', '${password}', '${userId}', '${orgId}')
            // `;
            // await zcql
            //     .executeZCQLQuery(insertOrgQuery);

            res.status(200).send({
                success: true,
                message: "User created successfully!",
                data: data
            })
                
            }else{
                res.status(500).send({
                    success: true
                })
            }              
    

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {userRegistration};



// const userId = req?.decodedId;

//         const { domain, orgName, street, city, state, zip } = req.body;

//         const { catalyst } = res.locals;
//         const zcql = catalyst.zcql(); 

//         if (userId) {
//             const checkDomainQuery = ` 
//                 SELECT ROWID 
//                 FROM Organization 
//                 WHERE domain = '${domain}' 
//                 LIMIT 1
//             `;

//             const existingOrg = await zcql
//             .executeZCQLQuery(checkDomainQuery);
            
//             if (existingOrg && existingOrg.length > 0) {
//                 return res.status(400).send({
//                     status: 'failure',
//                     message: 'Domain already exists. Please choose a different domain.'
//                 });
//             }

//             const insertOrgQuery = `
//                 INSERT INTO Organization (domain, orgName, street, city, state, zip) 
//                 VALUES ('${domain}', '${orgName}', '${street}', '${city}', '${state}', '${zip}')
//             `;
            
//             await zcql
//             .executeZCQLQuery(insertOrgQuery);

            
//             const selectOrgQuery = `
//                 SELECT ROWID FROM Organization WHERE domain = '${domain}'
//             `;
            
//             const org = await zcql
//             .executeZCQLQuery(selectOrgQuery);
            
//             const orgId = org[0]?.Organization?.ROWID


//             const updateSuperadminQuery = `
//                 UPDATE Superadmin 
//                 SET orgId = '${orgId}' 
//                 WHERE ROWID = '${userId}'
//             `;
            
//             await zcql.executeZCQLQuery(updateSuperadminQuery);

//             res.status(200).send({
//                 status: 'success',
//                 message: "Organization Registered Successfully!",
//                 data: org
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