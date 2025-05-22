const express = require('express');
const { getAdminDetails, webtabHandler, updateUserAccess, createNewUser, registerNewUser, removeUser, updatePortalUser, searchContactData, getOrgDetails, editorgdetails } = require('../controllers/test.controller');
const router = express.Router();


router.get('/getdetails',getAdminDetails);
router.get('/adminview',webtabHandler);
router.post('/update-user-access',updateUserAccess);
router.post("/adduser",registerNewUser);
router.post('/createnewuser/:module',createNewUser);
router.delete('/removeuser/:id',removeUser);
router.post('/crmupdate/:crmuserid',updatePortalUser);

router.get('/searchcontact',searchContactData);
router.post('/getdetails',getOrgDetails);
router.put('/editorgdetails',editorgdetails);




module.exports = router;