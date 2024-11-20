const express = require('express');
const router = express.Router();
const medicineController = require('../controller/medicineController');

// Crear un medicamento
router.post('/add', medicineController.addMedicine);

// Obtener todos los medicamentos
router.get('/all', medicineController.getAllMedicines);

// Obtener un medicamento por ID
router.get('/id/:id', medicineController.getMedicineByIdOrRFID);

// Obtener un medicamento por RFID
router.get('/rfid/:id_medicamento_rfid', medicineController.getMedicineByRFID);

// Obtener RFIDs pendientes
router.get('/pending-rfids', medicineController.getPendingRFIDs);

// Actualizar un medicamento
router.put('/update/:id', medicineController.updateMedicine);

// Eliminar un medicamento por ID
router.delete('/id/:id', medicineController.deleteMedicine);

// Eliminar un medicamento por RFID
router.delete('/rfid/:id_medicamento_rfid', medicineController.deleteMedicineByRFID);

// Obtener medicamentos por ID de paciente
router.get('/patient/:id_paciente', medicineController.getMedicinesByIdPatient);

module.exports = router;
