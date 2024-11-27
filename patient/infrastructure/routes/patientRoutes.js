const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');
const { verifyToken } = require('../authMiddleware');

router.post('/add', patientController.addPatient);
router.put('/update/:id',verifyToken, patientController.updatePatient);
router.get('/get/:id', verifyToken,patientController.getPatientById);
router.get('/get/user/:userId', verifyToken,patientController.getPatientByIdUser);
router.delete('/delete/:id', verifyToken,patientController.deletePatient);
router.get('/all', verifyToken,patientController.getAllPatients);

module.exports = router;
