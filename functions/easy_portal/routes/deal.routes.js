const express = require('express');
const { 
    getDeal, 
    createDeal, 
    getDealById, 
    cacheRetriveForDeal, 
    getDealFields,
    updateDeal,
    associatedDealWithContact
} = require('../controllers/deal.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const accessControl = require('../middlewares/accesscontrol.middeware');

const router = express.Router();

// Deal related routes

// Get all deal fields (similar to getLead)
router.get('/getdeal', catalystAuth, getDeal);

// Create a new deal
router.post('/createDeal', catalystAuth, accessControl, createDeal);

// Get deal by ID
router.get('/getdealbyid/:dealId', catalystAuth, getDealById);

// Cache-related route
router.get('/getcachedeal', catalystAuth, cacheRetriveForDeal);

router.get('/dealfields',catalystAuth,getDealFields);
router.put('/updatedeal',catalystAuth,accessControl,updateDeal);

router.get('/associateddeal/:contactId',catalystAuth,associatedDealWithContact);

module.exports = router;
