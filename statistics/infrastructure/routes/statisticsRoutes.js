const express = require('express');
const router = express.Router();
const StatisticsController = require('../controller/StatisticsController');


// Ruta para obtener estadísticas
router.get('/:userId', StatisticsController.getStatistics);
router.post('/add',StatisticsController.saveStatistics)
router.post('/register', StatisticsController.addRegister);
console.log("La estadistica muestra",StatisticsController);


module.exports = router;
