const express = require('express');
const orgRouter = express.Router();
const {registerOrganization,organizationExists,getOrganizationDetails, checkAuthorization, makeconnection, getOrgDetails, requestRefreshToken} = require('../controllers/organization.controller');
const catalystAuth = require('../middlewares/catalystAuth');

orgRouter.post('/register',catalystAuth, registerOrganization);
orgRouter.get('/checkHandler',catalystAuth,organizationExists);
orgRouter.get('/getorg/:orgId',catalystAuth,getOrganizationDetails);
orgRouter.post('/getdetails',catalystAuth,getOrgDetails);
orgRouter.get('/check-authorization/:orgId',catalystAuth,checkAuthorization);
orgRouter.post('/makeconnection',catalystAuth,makeconnection);


orgRouter.post('/requestRefreshtoken',catalystAuth,requestRefreshToken);

module.exports = orgRouter;