const express = require('express');
const orgRouter = express.Router();
const {registerOrganization,organizationExists,getOrganizationDetails, checkAuthorization, makeconnection, getOrgDetails, requestRefreshToken,checkForExtension} = require('../controllers/organization.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');

orgRouter.post('/register',catalystAuth, registerOrganization);
orgRouter.get('/checkHandler',catalystAuth,organizationExists);
orgRouter.get('/getorg/:orgId',catalystAuth,getOrganizationDetails);
orgRouter.post('/getdetails',catalystAuth,getOrgDetails);
orgRouter.get('/check-authorization/:orgId',catalystAuth,checkAuthorization);
orgRouter.post('/makeconnection',catalystAuth,makeconnection);
orgRouter.get('/checkForExtension',catalystAuth,checkForExtension);


orgRouter.post('/requestRefreshtoken',catalystAuth,accessControl,requestRefreshToken);

module.exports = orgRouter;