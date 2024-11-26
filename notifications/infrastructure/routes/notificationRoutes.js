const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');

router.post('/schedule', notificationController.schedule);
router.post('/button-pressed', notificationController.buttonPressed);
router.get('/notificaciones', notificationController.getNotifications);


module.exports = router;
