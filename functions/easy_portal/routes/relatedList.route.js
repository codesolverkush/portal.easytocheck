const express = require('express');
const catalystAuth = require('../middlewares/catalystAuth');
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { getNoteById, createNote, attachFile, getAttachFile, getOpenActivitiesById, createOpenActivity, updateTask } = require('../controllers/relatedList.controller');


const router = express.Router();

// Notes in the lead

router.get('/notes/:module/:leadId',catalystAuth,getNoteById);
router.post('/createnote/:module/:leadId',catalystAuth,createNote);


// Attachment in the lead
router.post('/attach/:module/:leadId',catalystAuth,upload.single("file"),attachFile); 
router.get('/getattach/:module/:leadId',catalystAuth,getAttachFile);
router.get('/downloadattach/:module/:leadId/:attachementId',catalystAuth,getAttachFile);

// Open Activities in the lead

router.get('/openactivities',catalystAuth,getOpenActivitiesById);
router.post("/createTask",catalystAuth,createOpenActivity);
router.put("/updatetask",catalystAuth,updateTask);


module.exports = router;
