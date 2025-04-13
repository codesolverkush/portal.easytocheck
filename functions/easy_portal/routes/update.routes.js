const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');
const { updateData } = require('../controllers/update.controller');

const router = express.Router();



// router.put('updatedata/:module',catalystAuth,accessControl,updateData);
router.put('/updatemoduledata/:module',catalystAuth,accessControl,updateData);


module.exports = router;

