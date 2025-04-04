// //get user 

// // get the details of the current user as a promise
// const catalystAuth = async (req,res)=>{
//     try {
//         const {catalyst} = res?.locals;
//         let userManagement = catalyst.userManagement(); 
//         let userPromise = userManagement.getCurrentUser(); 
//         userPromise.then(currentUser => 
//         { 
//         console.log(currentUser); 
//         });

//         res.status(200).json({
//             message: "You got it!"
//         })
//     } catch (error) {
//         res.status(400).json({
//             message: error
//         })
//     }
// }

