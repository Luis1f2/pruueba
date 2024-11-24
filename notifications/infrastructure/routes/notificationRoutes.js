const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.post('/schedule', notificationController.schedule);
router.post('/button-pressed', notificationController.buttonPressed);
router.get('/pending', notificationController.getPending);
router.get('/pending:id',notificationController.getPendingByPatient)

module.exports = router;
