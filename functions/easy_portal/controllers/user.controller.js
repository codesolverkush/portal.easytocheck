const logoutHandler = async (req, res) => {
    try {
        const { catalyst } = res.locals;
        const redirectURL = "portal.easytocheck.com"; 


        const cookies = req.cookies;
        
        // Clear all cookies dynamically
        if (cookies) {
            Object.keys(cookies).forEach(cookieName => {
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
       res.clearCookie("_iamadt_client_10097471762", { path: "/", domain: "portal.easytocheck.com" });
       res.clearCookie("_iambdt_client_10097471762", { path: "/", domain: "portal.easytocheck.com" });
       res.clearCookie("_iamadt_client_10097471762", { path: "/", domain: ".portal.easytocheck.com" });
       res.clearCookie("_iambdt_client_10097471762", { path: "/", domain: ".portal.easytocheck.com" });

       var auth = catalyst?.auth;
       await auth?.signOut(redirectURL);

        res.status(200).json({ message: "Logout Successfully!" });
    } catch (error) {
        res.status(500).json({ 
            message: "Logout Failed",
            error: error.message || error
        });
    }
};

// const logoutHandler = async (req, res) => {
//     try {
//         // Get all cookies from the request
//         const cookies = req.cookies;
        
//         // Clear all cookies dynamically
//         if (cookies) {
//             Object.keys(cookies).forEach(cookieName => {
//                 res.clearCookie(cookieName, { path: "/" });
//             });
//         }

//        res.clearCookie("_iamadt_client_10096162526", { path: "/", domain: "easyportal-704392036.development.catalystserverless.com" });
//        res.clearCookie("_iambdt_client_10096162526", { path: "/", domain: "easyportal-704392036.development.catalystserverless.com" });
        
//         res.status(200).json({ message: "Logout Successfully!" });
//     } catch (error) {
//         res.status(500).json({
//             message: "Logout Failed",
//             error: error.message || error
//         });
//     }
// };
// Example in-memory caches
// const orgCache = {};
// const tokenCache = {};

// const logoutHandler = async (req, res) => {
//     try {
//         const cookies = req.cookies;
//         const userId = req.currentUser?.user_id;

//         // Clear cookies
//         if (cookies) {
//             Object.keys(cookies).forEach(cookieName => {
//                 res.clearCookie(cookieName, { path: "/" });
//             });
//         }

//         // Clear in-memory cache for user
//         if (userId) {
//             delete orgCache[userId];
//             delete tokenCache[userId]; // if you're caching tokens like this
//         }

//         res.status(200).json({ message: "Logout Successfully!" });
//     } catch (error) {
//         res.status(500).json({
//             message: "Logout Failed",
//             error: error.message || error
//         });
//     }
// };


module.exports = {  logoutHandler };