const jwt = require("jsonwebtoken");
const catalyst = require("zcatalyst-sdk-node");


// const registerNewUser = async (req, res) => {
//   try {
//     const userId = req.currentUser?.user_id;
//     // console.log("Current User ID:", userId);
//     const { catalyst } = res.locals;
//     const userManagement = catalyst.userManagement();
//     const {
//       email_id,
//       first_name,
//       last_name, 
//       org_id,
//       phone_number,
//       country_code,
//     } = req.body;
//     // const table1 = catalyst.datastore().table("usermanagement");
//     const zcql = catalyst.zcql();

//     // Fetch organization ID from usermanagement table
//     const checkUserQuery = `
//               SELECT ROWID, orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1
//           `;
//     const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);
//     console.log(checkUserResult);

//     const licenseDetailQuery = `SELECT activeLicense,totalLicenses from Organization WHERE ROWID = ${checkUserResult[0].usermanagement?.orgid}`;

//     const licenseDetail = await zcql.executeZCQLQuery(licenseDetailQuery);
//     let totalLicenses = licenseDetail[0]?.Organization?.totalLicenses;
//     let activeLicense = licenseDetail[0]?.Organization?.activeLicense;

//     console.log(totalLicenses);

//     // ✅ Check if active licenses have reached the limit
//     if (activeLicense >= totalLicenses) {
//       return res.status(403).json({
//         success: false,
//         message: "License limit reached. Cannot register new user.",
//       });
//     }

//     // Generate Custom Token (User Creation)
//     const data = await userManagement.generateCustomToken({
//       type: "web",
//       user_details: {
//         email_id,
//         first_name,
//         last_name,
//         org_id,
//         phone_number,
//         country_code,
//         role_name: "App User",
//       },
//     });

//     console.log(data);

//     // Fetch All Users and Find the Newly Created or Existing User
//     let allUsers = await userManagement.getAllUsers();
//     let userDetails = allUsers.find((user) => user.email_id === email_id);

//     // console.log(userDetails);

//     if (!userDetails) {
//       return res.status(404).json({
//         success: false,
//         message: "User registered but details not found.",
//       });
//     }

//     // Ensure that the correct user ID is used
//     const user_id = userDetails.user_id;

//     let orgIdToUse = org_id; // Default to input `org_id`
//     if (checkUserResult.length !== 0) {
//       orgIdToUse = checkUserResult[0].usermanagement?.orgid || org_id;
//     }

//     try {       
//       //   Update activeLicense count in Organization table
//       activeLicense = parseInt(activeLicense) + 1;

//       const updateLicenseQuery = `
//                 UPDATE Organization 
//                 SET activeLicense = ${activeLicense}
//                 WHERE ROWID = '${orgIdToUse}'
//             `;
//       const data = await zcql.executeZCQLQuery(updateLicenseQuery);
//       //   console.log(data);
//     } catch (insertError) {
//       console.log(insertError);
//       if (insertError?.code === "DUPLICATE_VALUE") {

//         console.log("insertError",insertError);
//         // Fetch user ID again by email_id 
//         allUsers = await userManagement.getAllUsers();
//         userDetails = allUsers.find((user) => user.email_id === email_id);

//         if (userDetails) {

//           // const response = await table1.insertRow(rowData);
//           const updateLicenseQuery = `
//           UPDATE Organization 
//           SET activeLicense = ${activeLicense}
//           WHERE ROWID = '${orgIdToUse}'
//       `;
//           const data = await zcql.executeZCQLQuery(updateLicenseQuery);
//         } else {
//           return res.status(400).json({
//             success: false,
//             message: "User already exists, but user ID could not be found.",
//           });
//         }
//       } else {
//         throw insertError; // Re-throw if it's a different error
//       }
//     }


//     res.status(200).json({
//       success: true,
//       data: userDetails,
//     });
//   } catch (error) {
//     console.error("Error in registerNewUser:", error);
//     res.status(400).json({
//       success: false,
//       error: error.message || error,
//     });
//   }
// };

const registerNewUser = async (req, res) => {
  try {
    const userId = req.currentUser?.user_id;
    const { catalyst } = res.locals;
    const userManagement = catalyst.userManagement();
    const {
      email_id, first_name, last_name, org_id,
      phone_number, country_code
    } = req.body;

    const zcql = catalyst.zcql();
    const checkUserQuery = `SELECT ROWID, orgid, domain FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
    const checkUserResult = await zcql.executeZCQLQuery(checkUserQuery);

    const orgIdFromDB = checkUserResult?.[0]?.usermanagement?.orgid || org_id;


    const licenseDetailQuery = `SELECT activeLicense,totalLicenses from Organization WHERE ROWID = ${orgIdFromDB}`;
    const licenseDetail = await zcql.executeZCQLQuery(licenseDetailQuery);
    let totalLicenses = licenseDetail[0]?.Organization?.totalLicenses;
    let activeLicense = licenseDetail[0]?.Organization?.activeLicense;

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
      WHERE ROWID = '${orgIdFromDB}'
    `;

    await zcql.executeZCQLQuery(updateLicenseQuery);

    res.status(200).json({
      success: true,
      data: {
        ...userDetails,
        orgId: orgIdFromDB,
        licenseRollback: {
          orgId: orgIdFromDB,
          previousCount: activeLicense,
        }
      }
    });
  } catch (error) {
    console.error("Error in registerNewUser:", error);
    res.status(400).json({
      success: false,
      error: error.message || error,
    });
  }
};


const getUserDetails = async (req, res) => {
  try {
    const user = req?.currentUser;

    res.status(200).json({
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for the testing purpose...
const cookiesDetails = async (req, res) => {
  try {
    const userId = req?.decodedData;
    res.status(200).json({
      data: userId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error!",
      error: error,
    });
  }
};

module.exports = {
  registerNewUser,
  getUserDetails,
  cookiesDetails,
};
