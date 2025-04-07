const express = require('express');
const { totalLead,totalTask,totalMeeting, totalDeals, leadDetails, totalContacts,dealDetails } = require('../controllers/get.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const accessControl = require('../middlewares/accesscontrol.middeware');
const router = express.Router();



router.get('/lead',catalystAuth,totalLead);
router.get('/task',catalystAuth,totalTask);
router.get('/contact',catalystAuth,totalMeeting);
router.get('/deal',catalystAuth,totalDeals);


// get the lead details for the dashboard preparation...

router.get('/leaddetails',catalystAuth,accessControl,leadDetails);
router.get('/contactdetails',catalystAuth,accessControl,totalContacts);
router.get('/dealdetails',catalystAuth,accessControl,dealDetails)





module.exports = router;

