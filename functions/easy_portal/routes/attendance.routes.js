const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const {checkin, checkOut} = require('../controllers/attendance.controller');


const router = express.Router();

router.post('/checkin',catalystAuth,checkin);

router.post('/checkOut',catalystAuth,checkOut);

module.exports = router;