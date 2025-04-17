const getmetadata = async(req,res)=>{
    try {
     const {catalyst} = res.locals;
     const zcql = catalyst.zcql();
     const id = 9878978734;

    //  console.log('id',id);
 
     if(id){
         const selectFindQuery = `
         SELECT logo,image2,Image1
         FROM etcadminlogs
         WHERE uniqueid = '${id}' 
         LIMIT 1
     `;
    //  console.log(selectFindQuery);
         const metadataDetails = await zcql
         .executeZCQLQuery(selectFindQuery);
        //  console.log(metadataDetails);
 
 
         return res.status(200).send({
             data: metadataDetails
         })
     }else{
         return res.status(404).send({
             success: false,
             message: "Data not found!"
         })
     }    
    } catch (error) {
       res.status(500).send({
         message: error
       })
    }
 }


 module.exports = {getmetadata};



// const NodeCache = require('node-cache');
// // Initialize cache with standard TTL of 10 minutes (600 seconds)
// const metadataCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// const getmetadata = async(req, res) => {
//     try {
//         const {catalyst} = res.locals;
//         const zcql = catalyst.zcql();
//         const id = 9878978734;

//         // console.log('id', id);
        
//         if(id) {
//             // Create a cache key based on the id
//             const cacheKey = `metadata_${id}`;
            
//             // Check if data exists in cache
//             let metadataDetails = metadataCache.get(cacheKey);
            
//             if (metadataDetails) {
//                 // console.log('Returning metadata from cache');
//                 return res.status(200).send({
//                     data: metadataDetails,
//                     source: 'cache'
//                 });
//             }
            
//             // If not in cache, fetch from database
//             const selectFindQuery = `
//                 SELECT logo,image2,Image1
//                 FROM etcadminlogs
//                 WHERE uniqueid = '${id}' 
//                 LIMIT 1
//             `;
//             // console.log(selectFindQuery);
            
//             metadataDetails = await zcql.executeZCQLQuery(selectFindQuery);
//             // console.log(metadataDetails);
            
//             // Store in cache for future requests
//             metadataCache.set(cacheKey, metadataDetails);
            
//             return res.status(200).send({
//                 data: metadataDetails,
//                 source: 'database'
//             });
//         } else {
//             return res.status(404).send({
//                 success: false,
//                 message: "Data not found!"
//             });
//         }    
//     } catch (error) {
//         console.error('Error fetching metadata:', error);
//         res.status(500).send({
//             message: error.message || error
//         });
//     }
// };

// module.exports = { getmetadata };