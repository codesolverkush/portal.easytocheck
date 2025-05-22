const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { webtabHander, removeUser, updateUserAccess, updatePortalUser, searchContactData, enableDisableUser } = require('../controllers/admin.controller');
const { accessControl } = require('../middlewares/accesscontrol.middeware');
const router = express.Router();


router.get('/webtab',catalystAuth,webtabHander);
router.delete('/removeuser/:id',catalystAuth,removeUser);
router.post('/update-user-access',catalystAuth,updateUserAccess);
router.post('/crmupdate/:crmuserid',catalystAuth,updatePortalUser);

router.get('/searchcontact',catalystAuth,accessControl,searchContactData);

router.get('/enable-disable-user/:id',catalystAuth,enableDisableUser);


module.exports = router;

