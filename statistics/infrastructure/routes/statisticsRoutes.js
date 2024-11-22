const express = require('express');
const router = express.Router();
const StatisticsController = require('../controller/StatisticsController');

// Ruta para obtener estadísticas
router.get('/:userId', StatisticsController.getStatistics);

module.exports = router;
