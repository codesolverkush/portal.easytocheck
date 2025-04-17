// const hardcodedUser = {
//     zuid: '10096164337',
//     zaaid: '10096164336',
//     org_id: '10096164336',
//     status: 'ACTIVE',
//     is_confirmed: true,
//     email_id: 'aditya@easytocheck.com',
//     first_name: 'Aditya',
//     last_name: 'Keshari',
//     created_time: 'Feb 26, 2025 11:12 AM',
//     modified_time: 'Mar 03, 2025 02:35 PM',
//     invited_time: 'Feb 26, 2025 11:12 AM',
//     role_details: { role_name: 'App Administrator', role_id: '4340000000043022' },
//     user_type: 'App User',
//     source: 'Email',
//     user_id: '4340000000051003',
//     locale: 'us|en_us|America/Los_Angeles',
//     time_zone: 'America/Los_Angeles'
//   }

  
const hardcodedUser = {
    zuid: '10097563637',
    zaaid: '10097563636',
    org_id: '10097563636',
    status: 'ACTIVE',
    is_confirmed: false,
    email_id: 'kushal@easytocheck.com',
    first_name: 'kushal Pratap ',
    last_name: 'Singh',
    created_time: 'Mar 27, 2025 11:09 AM',
    modified_time: 'Mar 27, 2025 11:09 AM',
    invited_time: 'Mar 27, 2025 11:09 AM',
    role_details: { role_name: 'App User', role_id: '4340000000043024' },
    user_type: 'App User',
    source: 'Email',
    user_id: '4340000000085001',
    locale: 'us|en_us|America/Los_Angeles',
    time_zone: 'America/Los_Angeles'
    
  }


  const catalystAuth = async (req, res, next) => {
    try {
        const { catalyst } = res?.locals;
     

        if (!catalyst) {
            return res.status(500).json({
                success: false,
                message: "Catalyst instance is not available in locals",
            });
        }

        // const userManagement = catalyst.userManagement();

        // const currentUser = await userManagement.getCurrentUser();   

        // if (!currentUser) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "User not authenticated",
        //     });
        // }
        
        // req.currentUser = currentUser; 
        
        req.currentUser = hardcodedUser;        
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






// // 1000.SSZLXBMLISTY1435YN23IT8Y1Z7B9D
// // bf0e71540306061551c7164db3a1b3ce169d21c351
// // 1000.cfd44a56f406a94c29f55dbc8825f483.677624b544f22d2eb85eb12d963378fa

