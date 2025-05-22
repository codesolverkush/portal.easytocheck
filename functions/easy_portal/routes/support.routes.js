const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const { createTicket } = require('../controllers/support.controller');
const router = express.Router();


router.post("/createticket",createTicket);
module.exports = router;

