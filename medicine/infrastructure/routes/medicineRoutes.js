const express = require('express');
const router = express.Router();
const medicineController = require('../controller/medicineController');
const { verifyToken } = require('../authMiddleware');

// Crear un medicamento
router.post('/add',medicineController.addMedicine);

// Obtener todos los medicamentos
router.get('/all', verifyToken,medicineController.getAllMedicines);

// Obtener un medicamento por ID
router.get('/id/:id', verifyToken,medicineController.getMedicineByIdOrRFID);

// Obtener RFIDs pendientes
router.get('/pending-rfids',medicineController.getLatestRFID);

// Actualizar un medicamento
router.put('/update/:id', verifyToken,medicineController.updateMedicine);

// Eliminar un medicamento por ID
router.delete('/id/:id', verifyToken,medicineController.deleteMedicine);

// Obtener medicamentos por ID de paciente
router.get('/patient/:id_paciente', verifyToken,medicineController.getMedicinesByIdPatient);

// Agregar RFID pendiente desde el broker
router.post('/pending-rfids', medicineController.pend);  

module.exports = router;
