const express = require("express");
const catalystAuth = require("../middlewares/catalystAuth");
const { accessControl } = require("../middlewares/accesscontrol.middeware");
const { getAccessControlDetails } = require("../controllers/special.controller");
const router = express.Router();


router.get('/fetching',catalystAuth,accessControl,getAccessControlDetails);

module.exports = router;