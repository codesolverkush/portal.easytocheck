const express = require('express');
const {logoutHandler, trobleShootHandler,checkRole, generateToken} = require('../controllers/user.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const {accessControl} = require('../middlewares/accesscontrol.middeware');

const router = express.Router();

router.get('/logout',catalystAuth,logoutHandler);
router.get('/trobleshoot',catalystAuth,trobleShootHandler);
router.get('/check-role',catalystAuth,checkRole);
router.get('/generatetoken',generateToken);

module.exports = router;

