const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');
const { createNewData } = require('../controllers/create.controller');


const router = express.Router();

router.post('/createdata/:module',catalystAuth,accessControl,createNewData);

module.exports = router;

