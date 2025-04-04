
const axios = require('axios');

const refreshAccessToken = async (req, res) => {
    try {
        const userId = req.currentUser?.user_id;

        // console.log(userId);
        
       
        const { catalyst } = res?.locals;
        const zcql = catalyst.zcql();

        
        if(userId){
            const checkDomainQuery = ` 
            SELECT orgid
            FROM usermanagement
            WHERE userid = '${userId}' 
            LIMIT 1
        `;

        const user = await zcql
    .executeZCQLQuery(checkDomainQuery);
   

    const orgId = user[0]?.usermanagement?.orgid;
    // console.log("Hello",orgId);
  

    if(orgId !== null){
        const tokenQuery = 
        `SELECT ROWID, clientid, clientsecret, refreshtoken 
         FROM Connections  
         WHERE orgid = '${orgId}' 
         LIMIT 1`;

    const existingData = await zcql.executeZCQLQuery(tokenQuery);
    // console.log("Hello",existingData);
    

    // if (existingData.length === 0) {
    //     return res.status(404).send({
    //         message: "No token data found for the given orgId."
    //     });
    // }

    if (existingData.length === 0) {
        return res.status(404).json({
            error: true,
            message: "No token data found for the given orgId.",
            code: "ORG_NOT_AUTHORIZED"
        });
    }

    const { clientid, clientsecret, refreshtoken,ROWID } = existingData[0].Connections;

    const url = `https://accounts.zoho.com/oauth/v2/token`;

    const params = new URLSearchParams();
    params.append('refresh_token', refreshtoken);
    params.append('client_id', clientid);
    params.append('client_secret', clientsecret);
    params.append('grant_type', 'refresh_token');

    const response = await axios.post(url, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    // console.log(response.data);

 
    const newAccessToken = response.data.access_token;
    // console.log(newAccessToken);
    const updateQuery = `UPDATE Connections 
                         SET authcode = '${newAccessToken}' 
                         WHERE ROWID = '${ROWID}'`;
    await zcql.executeZCQLQuery(updateQuery);

    res.status(200).send({
        message: "Token refreshed successfully"
    });
    return newAccessToken;
    }

}else{
    return res.status(404).send({
        message: "Your request is not working!"
    })
}

      
      

    } catch (error) {
        console.error("error",error);
        res.status(500).send({
            message: "An error occurred while refreshing the token",
            error: error.message
        });
    }
};

module.exports = refreshAccessToken;

