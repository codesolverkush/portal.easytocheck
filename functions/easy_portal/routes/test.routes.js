const express = require('express');
const { getAdminDetails, webtabHandler, updateUserAccess, createNewUser, registerNewUser, removeUser, updatePortalUser, searchContactData } = require('../controllers/test.controller');
const router = express.Router();


router.get('/getdetails',getAdminDetails);
router.get('/adminview',webtabHandler);
router.post('/update-user-access',updateUserAccess);
router.post("/adduser",registerNewUser);
router.post('/createnewuser/:module',createNewUser);
router.delete('/removeuser/:id',removeUser);
router.post('/crmupdate/:crmuserid',updatePortalUser);

router.get('/searchcontact',searchContactData);




module.exports = router;