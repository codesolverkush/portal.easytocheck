const express = require('express');
const {logoutHandler} = require('../controllers/user.controller');
const catalystAuth = require('../middlewares/catalystAuth');

const router = express.Router();

router.get('/logout',catalystAuth,logoutHandler);

module.exports = router;

