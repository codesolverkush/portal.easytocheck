const express = require('express');
const orgRouter = express.Router();
const {registerOrganization,organizationExists,getOrganizationDetails, checkAuthorization, makeconnection, getOrgDetails, requestRefreshToken,checkForExtension,getcrmorg, updateOrgDetails, editorgdetails, getOrgWidget, requestRefreshToken2} = require('../controllers/organization.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const { accessControl } = require('../middlewares/accesscontrol.middeware');

orgRouter.post('/register',catalystAuth, registerOrganization);
orgRouter.get('/checkHandler',catalystAuth,organizationExists);
orgRouter.get('/getorg/:orgId',catalystAuth,getOrganizationDetails);
orgRouter.post('/getdetails',catalystAuth,getOrgDetails);
orgRouter.get('/check-authorization/:orgId',catalystAuth,checkAuthorization);
orgRouter.post('/makeconnection',catalystAuth,makeconnection);
orgRouter.get('/checkForExtension',catalystAuth,checkForExtension);
orgRouter.get('/getcrmorg',catalystAuth,accessControl,getcrmorg);
orgRouter.put('/updateorgdetails',catalystAuth,accessControl,updateOrgDetails);

// Edit controller for the organization...

orgRouter.put('/editorgdetails',catalystAuth,accessControl,editorgdetails);
orgRouter.get('/widget',catalystAuth,accessControl,getOrgWidget);


orgRouter.post('/requestRefreshtoken',catalystAuth,accessControl,requestRefreshToken);

orgRouter.post('/requestRefreshtoken2',catalystAuth,requestRefreshToken2);


module.exports = orgRouter;