const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { webtabHander, removeUser, updateUserAccess, updatePortalUser } = require('../controllers/admin.controller');
const router = express.Router();


router.get('/webtab',catalystAuth,webtabHander);
router.delete('/removeuser/:id',catalystAuth,removeUser);
router.post('/update-user-access',catalystAuth,updateUserAccess);
router.post('/crmupdate/:crmuserid',catalystAuth,updatePortalUser);

module.exports = router;

