const express = require('express');
const router = express.Router();
const alertController = require('../controller/alertController');

// Ruta para enviar alertas de emergencia
router.post('/send', alertController.sendEmergencyAlert);

module.exports = router;
