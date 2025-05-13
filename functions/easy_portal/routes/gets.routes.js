const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const {getDataById, getModuleFields} = require('../controllers/gets.controller');
const { accessControl } = require('../middlewares/accesscontrol.middeware');

const router = express.Router();



router.get('/getbyid/:module/:id',catalystAuth,accessControl,getDataById);
router.get('/getfields/:module',catalystAuth,getModuleFields);


module.exports = router;

