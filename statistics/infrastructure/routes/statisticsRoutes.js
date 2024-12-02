const express = require('express');
const router = express.Router();
const StatisticsController = require('../controller/StatisticsController');

router.get('/:idPaciente', StatisticsController.getStatistics); 
router.post('/saveStatistics', StatisticsController.saveStatistics);
router.post('/register', StatisticsController.addRegister);

module.exports = router;
