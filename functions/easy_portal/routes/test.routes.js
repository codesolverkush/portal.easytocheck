const express = require('express');
const userAuth = require('../middlewares/userAuth');
const refreshAccessToken  = require('../utils/genaccestoken');
const { updateOrgDetails, registerNewUser, getUserDetails, cookiesDetails } = require('../controllers/catalyst.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const cookiesChecker = require('../middlewares/cookiesChecker');
const getZohoDomain = require('../utils/getZohoDomain');
const router = express.Router();


router.post("/access-token",catalystAuth,refreshAccessToken);
router.get("/org-update",updateOrgDetails);
router.post("/adduser",catalystAuth,registerNewUser);

// It is usefull route...
router.get("/userDetails",catalystAuth,getUserDetails);
// router.get("/userDetails",userAuth,getUserDetails);
// router.get("/token-check",testAuth);

// Route for the testing purpose...
router.get("/cookieDetails",cookiesChecker,cookiesDetails);

router.get("/getDomain",getZohoDomain);

module.exports = router;

// acess control ->
// Lead Full Access, 
// edit/create
// lead, deal, contact
