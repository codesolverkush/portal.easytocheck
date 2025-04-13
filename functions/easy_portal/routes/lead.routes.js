const express = require('express');
const {getLead, checkIn} = require('../controllers/lead.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const multer = require("multer");
const { getMeetingById } = require('../controllers/meeting.controller');
const upload = multer({ storage: multer.memoryStorage() });



const router = express.Router();


// Lead related route

router.get('/getlead',catalystAuth,getLead);


// Meeting Route 
router.get("/getmeetingbyid/:meetingId",catalystAuth,getMeetingById);


// Some extra testing route

router.post('/checkin',catalystAuth,checkIn);



module.exports = router;