const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');
const { getAllProfile, cloneProfile } = require('../controllers/crmprofile.controllers');
const router = express.Router();

router.get('/profile',catalystAuth,accessControl,getAllProfile);
router.post('/clone-profile/:profileId',catalystAuth,accessControl,cloneProfile)

module.exports = router