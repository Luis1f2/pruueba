const express = require('express');
const router = express.Router();
const sensorController = require('../controller/sensorController');

router.get('/messages', sensorController.getSensorMessages);

module.exports = router;
