const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { fetchContacts, fetchAccounts } = require('../controllers/lookup.controller');
const router = express.Router();

router.get("/fetchcontacts",catalystAuth,fetchContacts);
router.get("/fetchaccounts",catalystAuth,fetchAccounts);

module.exports = router;

