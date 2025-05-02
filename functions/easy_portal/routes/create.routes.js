const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');
const { createNewData,createNewUser } = require('../controllers/create.controller');


const router = express.Router();

router.post('/createdata/:module',catalystAuth,accessControl,createNewData);
router.post('/createnewuser/:module',catalystAuth,accessControl,createNewUser);

module.exports = router;

