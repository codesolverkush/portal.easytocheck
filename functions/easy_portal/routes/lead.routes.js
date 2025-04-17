const express = require('express');
const {getLead,convertLead,checkIn, searchRecords} = require('../controllers/lead.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const multer = require("multer");
const { getMeetingById } = require('../controllers/meeting.controller');
const { getAccessToken } = require('../utils/zohoUtils');
const upload = multer({ storage: multer.memoryStorage() });



const router = express.Router();


// Lead related route

router.get('/getlead',catalystAuth,getLead);
router.post('/convertlead',catalystAuth,getAccessToken,convertLead);
router.get('/searchrecords',catalystAuth,searchRecords)


// Meeting Route 
router.get("/getmeetingbyid/:meetingId",catalystAuth,getMeetingById);


// Some extra testing route

router.post('/checkin',catalystAuth,checkIn);



module.exports = router;