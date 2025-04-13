const express = require('express');
const { associatedDealWithContact } = require('../controllers/deal.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');

const router = express.Router();



router.get('/associateddeal/:contactId',catalystAuth,associatedDealWithContact);

module.exports = router;
