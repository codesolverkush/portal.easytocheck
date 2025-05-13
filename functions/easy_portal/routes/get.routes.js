const express = require('express');
const { totalLead,totalTask,totalMeeting, totalDeals, leadDetails, totalContacts,dealDetails, accountDetails } = require('../controllers/get.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');
const router = express.Router();



router.get('/lead',catalystAuth,totalLead);
router.get('/task',catalystAuth,accessControl,totalTask);
router.get('/meetings',catalystAuth,accessControl,totalMeeting);
router.get('/deal',catalystAuth,accessControl,totalDeals);


// get the lead details for the dashboard preparation...

router.get('/leaddetails',catalystAuth,accessControl,leadDetails);
router.get('/contactdetails',catalystAuth,accessControl,totalContacts);
router.get('/dealdetails',catalystAuth,accessControl,dealDetails);
router.get('/accountdetails',catalystAuth,accessControl,accountDetails);





module.exports = router;

