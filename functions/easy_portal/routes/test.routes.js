const express = require('express');
const userAuth = require('../middlewares/userAuth');
const refreshAccessToken  = require('../utils/genaccestoken');
const { registerNewUser, getUserDetails, cookiesDetails } = require('../controllers/catalyst.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const cookiesChecker = require('../middlewares/cookiesChecker');
const getZohoDomain = require('../utils/getZohoDomain');
const router = express.Router();


router.post("/access-token",catalystAuth,refreshAccessToken);
router.post("/adduser",catalystAuth,registerNewUser);

// It is usefull route...
router.get("/userDetails",catalystAuth,getUserDetails);


// Route for the testing purpose...
router.get("/cookieDetails",cookiesChecker,cookiesDetails);

router.get("/getDomain",getZohoDomain);

module.exports = router;

// acess control ->
// Lead Full Access, 
// edit/create
// lead, deal, contact
