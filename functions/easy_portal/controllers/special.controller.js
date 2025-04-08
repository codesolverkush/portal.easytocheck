const getAccessControlDetails = async (req, res) => {
    try {
        if (!req.userDetails || req.userDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user: req.userDetails[0]?.usermanagement, // Assuming only one user matches the query
        });
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user details",
            error: error.message,
        });
    }
};

module.exports = {getAccessControlDetails};
