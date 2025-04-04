const jwt = require('jsonwebtoken');
const updateOrgDetails = async (req, res) => {
    try {
        const { catalyst } = res?.locals;
        const userManagement = catalyst?.userManagement();
        const data = await userManagement.getAllUsers(10095101398);

        res.status(200).json({
            data: data
        })

    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
}

const registerNewUser = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;
        console.log("Current User ID:", userId);
        const { catalyst } = res.locals;
        const userManagement = catalyst.userManagement();
        const { email_id, first_name, last_name, org_id, phone_number, country_code } = req.body;
        const table1 = catalyst.datastore().table('usermanagement');
        const zcql = catalyst.zcql();

        // Generate Custom Token (User Creation)
        await userManagement.generateCustomToken({
            type: 'web',
            user_details: {
                email_id,
                first_name,
                last_name,
                org_id,
                phone_number,
                country_code,
                role_name: "App User"
            }
        });

        // Fetch All Users and Find the Newly Created or Existing User
        let allUsers = await userManagement.getAllUsers();
        let userDetails = allUsers.find(user => user.email_id === email_id);

        console.log(userDetails);

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User registered but details not found."
            });
        }

        // Ensure that the correct user ID is used
        const user_id = userDetails.user_id;

        // Fetch organization ID from usermanagement table
        const checkUserQuery = `
            SELECT ROWID, orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1
        `;
        const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);

        let orgIdToUse = org_id; // Default to input `org_id`
        if (checkUserResult.length !== 0) {
            orgIdToUse = checkUserResult[0].usermanagement?.orgid || org_id;
        }

        // Prepare row data
        let rowData = {
            userid: user_id,
            orgid: orgIdToUse,
            username: `${first_name} ${last_name}`,
            email: email_id
        };
        console.log("Row Data to Insert:", rowData);

        // Insert user details into the table
        try {
            const response = await table1.insertRow(rowData);
            console.log("Inserted Data:", response);
        } catch (insertError) {
            if (insertError?.code === 'DUPLICATE_VALUE') {
                console.log("Duplicate user found. Fetching existing user ID...");

                // Fetch user ID again by email_id
                allUsers = await userManagement.getAllUsers();
                userDetails = allUsers.find(user => user.email_id === email_id);

                if (userDetails) {
                    rowData.userid = userDetails.user_id; // Use existing user_id
                    console.log("Retrying Insertion with Existing User ID:", rowData);

                    const response = await table1.insertRow(rowData);
                    console.log("Successfully inserted after handling duplicate:", response);
                } else {
                    return res.status(400).json({
                        success: false,
                        message: "User already exists, but user ID could not be found."
                    });
                }
            } else {
                throw insertError; // Re-throw if it's a different error
            }
        }

        res.status(200).json({
            success: true,
            data: userDetails
        });

    } catch (error) {
        console.error("Error in registerNewUser:", error);
        res.status(400).json({
            success: false,
            error: error.message || error
        });
    }
};




const catalyst = require('zcatalyst-sdk-node');


const getUserDetails = async (req, res) => {
    try {
        const user = req?.currentUser;

        res.status(200).json({
            user: user
        })
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Controller for the testing purpose...
const cookiesDetails = async (req,res)=>{
    try {
        const userId = req?.decodedData;
        console.log(userId);
        res.status(200).json({
           data: userId
        })
    } catch (error) {
        res.status(500).json({
            message: "Internal server error!",
            error: error
        })
    }
}


module.exports = { updateOrgDetails,registerNewUser,getUserDetails,cookiesDetails };