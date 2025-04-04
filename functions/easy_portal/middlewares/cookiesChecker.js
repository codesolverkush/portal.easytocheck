const jwt = require('jsonwebtoken');
const cookiesChecker = async(req, res, next) =>  {
    try{
        const token = req.cookies.access_token;
        const jwtSecret = process.env.JWT_SECRET;
        if(token){
          jwt.verify(token, jwtSecret , function(err, decoded) {
            if(decoded){
              req.decodedData = decoded;
            }           
            next(); 
          });
      }
        else {
          return res
            .status(401)
            .json({ message: "Not authorized or token not available" })
        }

    }catch(err){
      res.send(500).send({
        success: false,
        message: err
      })
    }
  }

  module.exports = cookiesChecker;
  