const express = require('express');
const { getAdminDetails, webtabHander, updateUserAccess, createNewUser, registerNewUser, removeUser, updatePortalUser } = require('../controllers/test.controller');
const router = express.Router();


router.get('/getdetails',getAdminDetails);
router.get('/adminview',webtabHander);
router.post('/update-user-access',updateUserAccess);
router.post("/adduser",registerNewUser);
router.post('/createnewuser/:module',createNewUser);
router.delete('/removeuser/:id',removeUser);
router.post('/crmupdate/:crmuserid',updatePortalUser);




module.exports = router;