const express = require('express');
const {logoutHandler, trobleShootHandler} = require('../controllers/user.controller');
const catalystAuth = require('../middlewares/catalystAuth');

const router = express.Router();

router.get('/logout',catalystAuth,logoutHandler);
router.get('/trobleshoot',catalystAuth,trobleShootHandler);

module.exports = router;

