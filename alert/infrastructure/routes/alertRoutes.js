const express = require('express');
const router = express.Router();
const alertController = require('../controller/alertController');

module.exports = (io) => {
    const alertController = require('../controller/alertController')(io);
  
   
    router.post('/send', alertController.sendEmergencyAlert);
  
    return router;
  };