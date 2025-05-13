const express = require('express');
const { associatedDealWithContact, associatedDealWithAccount, associatedContactWithAccount } = require('../controllers/deal.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');

const router = express.Router();



router.get('/associateddeal/:contactId',catalystAuth,accessControl,associatedDealWithContact);
router.get('/associatedcontactwithaccount',catalystAuth,accessControl,associatedContactWithAccount);
router.get('/associateddealwithaccount',catalystAuth,accessControl,associatedDealWithAccount);

module.exports = router;
