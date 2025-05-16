const logoutHandler = async (req, res) => {
  try {
    const { catalyst } = res.locals;
    const redirectURL = "portal.easytocheck.com";

    const cookies = req.cookies;

    // Clear all cookies dynamically
    if (cookies) {
      Object.keys(cookies).forEach((cookieName) => {
        res.clearCookie(cookieName, { path: "/" });
      });
    }

    if (!catalyst) {
      return res.status(500).json({
        success: false,
        message: "Catalyst instance is not available in locals",
      });
    }

    //    res.clearCookie("_iamadt_client_10096162526", { path: "/", domain: "easyportal-704392036.development.catalystserverless.com" });
    //    res.clearCookie("_iambdt_client_10096162526", { path: "/", domain: "easyportal-704392036.development.catalystserverless.com" });
    res.clearCookie("_iamadt_client_10097471762", {
      path: "/",
      domain: "portal.easytocheck.com",
    });
    res.clearCookie("_iambdt_client_10097471762", {
      path: "/",
      domain: "portal.easytocheck.com",
    });
    res.clearCookie("_iamadt_client_10097471762", {
      path: "/",
      domain: ".portal.easytocheck.com",
    });
    res.clearCookie("_iambdt_client_10097471762", {
      path: "/",
      domain: ".portal.easytocheck.com",
    });

    var auth = catalyst?.auth;
    await auth?.signOut(redirectURL);

    res.status(200).json({ message: "Logout Successfully!" });
  } catch (error) {
    res.status(500).json({
      message: "Logout Failed",
      error: error.message || error,
    });
  }
};

const trobleShootHandler = async (req, res) => {
  try {
    res.clearCookie("accessToken", { path: "/", domain: "localhost" });
    res.status(200).json({
      success: true,
      message: "Your proble have been fixed!",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Please contact to app administrator!",
    });
  }
};

const checkRole = async (req, res) => {
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
        return res.status(200).json({
          check: check,
          role: "superadmin",
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


const generateToken = async (req, res) => {
  try {
    const { catalyst } = res.locals;
    const userManagement = catalyst.userManagement();
    const zcql = catalyst.zcql();
 
    // const { email_id } = req.body;
    const email_id = "test45demo@gmail.com";
 
    if (!email_id) {
      return res.status(400).json({
        success: false,
        message: "Email ID is required to login.",
      });
    }
 
    // 🔍 Fetch all users and check if email exists
    const allUsers = await userManagement.getAllUsers();
    const user = allUsers.find((u) => u.email_id === email_id);
 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }
 
    const { first_name, last_name, phone_number, country_code, org_id } = user;
 
    // ✅ Generate new custom token for login
    const tokenResponse = await userManagement.generateCustomToken({
      type: "web",
      user_details: {
        email_id,
        first_name,
        last_name,
        phone_number,
        country_code,
        org_id,
        role_name: "App User",
      },
    });
 
    res.status(200).json({
      success: true,
      message: "Login token generated successfully.",
      token: tokenResponse,
      userDetails: user,
    });
 
  } catch (error) {
    console.error("Error in generateToken:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate login token.",
      error: error.message || error,
    });
  }
};

module.exports = { logoutHandler, trobleShootHandler, checkRole, generateToken };
