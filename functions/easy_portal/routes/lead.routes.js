const express = require('express');
const {getLead, createLead, getAllLead, attachFile, checkIn, getAllMeetings, getAllLeadDetails, getLeadById,cacheRetriveForLead, cacheUpdateForLead, updateLead} = require('../controllers/lead.controller');
const catalystAuth = require('../middlewares/catalystAuth');
const accessControl = require('../middlewares/accesscontrol.middeware');
const multer = require("multer");
const { getAllTasks, createTask, getRecordById, cacheRetrive, cacheUpdate, updateTask } = require('../controllers/task.controller');
const { getAllContacts, createContact, getContactById, cacheRetriveForContact, cacheUpdateContact, updateContact, getContactFields } = require('../controllers/contact.controller');
const { getMeetingById } = require('../controllers/meeting.controller');
const upload = multer({ storage: multer.memoryStorage() });



const router = express.Router();


// Lead related route

router.get('/getlead',catalystAuth,getLead);
router.post('/createLead',catalystAuth,accessControl,createLead);
    // this is not usable and for refrence go on the get.routes.js...
router.get('/getleaddetails',catalystAuth,accessControl,getAllLeadDetails);

router.get('/getleadbyid/:leadId',catalystAuth,getLeadById);


        //   Cache related route
         router.get('/getcachelead',catalystAuth,cacheRetriveForLead);
         router.get('/cacheupdateforlead',catalystAuth,cacheUpdateForLead);
// Updating the lead
router.put('/updatelead',catalystAuth,accessControl,updateLead);



// Task route

router.get("/gettaskdetails",catalystAuth,getAllTasks);
router.post("/createTask",catalystAuth,accessControl,createTask);
router.get('/getrecordbyid/:leadId',catalystAuth,getRecordById);

    // caching route for the task 
        router.get('/getcache',catalystAuth,cacheRetrive);
        router.get('/cacheupdate',catalystAuth,cacheUpdate);

router.put('/updatetask',catalystAuth,updateTask);

// Contact Route

router.get("/getcontactdetails",catalystAuth,getAllContacts);
router.post("/createContact",catalystAuth,accessControl,createContact);
router.get('/getcontactbyid/:contactId',catalystAuth,getContactById); 
    // caching route for the contact
        router.get('/getcachecontact',catalystAuth,cacheRetriveForContact);
        router.get('/cacheupdatecontact',catalystAuth,cacheUpdateContact);

router.put('/updatecontact',catalystAuth,accessControl,updateContact);
router.get('/contactfield',catalystAuth,getContactFields);



// Meeting Route 
router.get("/getmeetingbyid/:meetingId",catalystAuth,getMeetingById);


// Some extra testing route

router.post('/attach',catalystAuth,upload.single("file"),attachFile);
router.post('/checkin',catalystAuth,checkIn);



module.exports = router;