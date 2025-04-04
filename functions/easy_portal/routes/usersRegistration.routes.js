const express = require('express');
const userAuth = require('../middlewares/userAuth');
const {userRegistration} = require('../controllers/usersRegistration.controller');

const registrationRouter = express.Router();


registrationRouter.post('/register',userAuth,userRegistration);


module.exports = registrationRouter;