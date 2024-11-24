const express = require('express');
const alertController = require('../controller/alertController');

const router = express.Router();

// Definir las rutas para manejar las alertas
router.post('/schedule', alertController.schedule);
router.post('/button-pressed', alertController.buttonPressed);
router.get('/pending', alertController.getPending);

module.exports = router;
