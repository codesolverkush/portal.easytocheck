const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const {checkin, checkOut} = require('../controllers/attendance.controller');
const {accessControl} = require('../middlewares/accesscontrol.middeware')


const router = express.Router();

router.post('/checkin',catalystAuth,accessControl,checkin);

router.post('/checkOut',catalystAuth,accessControl,checkOut);

module.exports = router;