const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');

router.post('/add', patientController.addPatient);
router.put('/update/:id', patientController.updatePatient);
router.get('/get/:id', patientController.getPatientById);
router.get('/get/user/:userId', patientController.getPatientByIdUser);
router.delete('/delete/:id', patientController.deletePatient);
router.get('/all', patientController.getAllPatients);

module.exports = router;
