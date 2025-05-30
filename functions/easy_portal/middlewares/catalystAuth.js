// const hardcodedUser = {
//     zuid: '10097563637',
//     zaaid: '10097563636',
//     org_id: '10097563636',
//     status: 'ACTIVE',
//     is_confirmed: false,
//     email_id: 'kushal@easytocheck.com',
//     first_name: 'kushal Pratap ',
//     last_name: 'Singh',
//     created_time: 'Mar 27, 2025 11:09 AM',
//     modified_time: 'Mar 27, 2025 11:09 AM',
//     invited_time: 'Mar 27, 2025 11:09 AM',
//     role_details: { role_name: 'App User', role_id: '4340000000043024' },
//     user_type: 'App User',
//     source: 'Email',
//     user_id: '4340000000085001',
//     locale: 'us|en_us|America/Los_Angeles',
//     time_zone: 'America/Los_Angeles'
    
//   }


// const hardcodedUser = {
//   zuid: '10099839882',
//   zaaid: '10099839881',
//   org_id: '10099839881',
//   status: 'ACTIVE',
//   is_confirmed: true,
//   email_id: 'kushalpratapsingh17@gmail.com',
//   first_name: 'Kushal Pratap',
//   last_name: 'Singh',
//   created_time: 'May 22, 2025 12:29 PM',
//   modified_time: 'May 22, 2025 12:29 PM',
//   invited_time: 'May 22, 2025 12:29 PM',
//   role_details: { role_name: 'App User', role_id: '4340000000043024' },
//   user_type: 'App User',
//   source: 'Email',
//   user_id: '4340000000147315',
//   locale: 'us|en_us|America/Los_Angeles',
//   time_zone: 'America/Los_Angeles'
// }


const catalystAuth = async (req, res, next) => {
    try {
        const { catalyst } = res?.locals;
     

        if (!catalyst) {
            return res.status(500).json({
                success: false,
                message: "Catalyst instance is not available in locals",
            });
        }

        const userManagement = catalyst.userManagement();

        const currentUser = await userManagement.getCurrentUser();     

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }
        
        req.currentUser = currentUser;         
        // req.currentUser = hardcodedUser;        
        next();
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to authenticate user",
            error: error.message,
        });
    }
};

module.exports = catalystAuth;

