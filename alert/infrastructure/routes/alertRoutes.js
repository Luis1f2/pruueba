const express = require('express');
const alertController = require('../controller/alertController');

const router = express.Router();

// Definir las rutas para manejar las alertas
router.post('/schedule', alertController.schedule);
router.post('/confirm/:id_alerta', alertController.confirm);
router.get('/pending', alertController.getPending);

module.exports = router;
