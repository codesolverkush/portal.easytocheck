const express = require('express');
const router = express.Router();
const { getmetadata } = require('../controllers/metadata.controller.js');



router.get('/images',getmetadata);

module.exports = router;

