const accessControl = async (req, res, next) => {
    try {
        const { catalyst } = res.locals;
        const userId = req.currentUser?.user_id;
        const zcql = catalyst.zcql();     

        if (!catalyst) {
            return res.status(500).json({
                success: false,
                message: "Catalyst instance is not available in locals",
            });
        }

        if(!userId || userId === null || userId === undefined){
            return res.status(401).json({
                success:false,
                message: "User not authenticated!"
            })
        }

        const selectUserQuery = `
            SELECT *
            FROM usermanagement 
            WHERE userid = '${userId}'
           `;

           const userDetails = await zcql
           .executeZCQLQuery(selectUserQuery);

           req.userDetails = userDetails;
           next();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to authenticate user",
            error: error.message,
        });
    }
};

module.exports = {accessControl};

