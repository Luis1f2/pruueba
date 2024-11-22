const express = require('express');
const router = express.Router();
const medicineController = require('../controller/medicineController');

// Crear un medicamento
router.post('/add', medicineController.addMedicine);

// Obtener todos los medicamentos
router.get('/all', medicineController.getAllMedicines);

// Obtener un medicamento por ID
router.get('/id/:id', medicineController.getMedicineByIdOrRFID);

// Obtener RFIDs pendientes
router.get('/pending-rfids', medicineController.getLatestRFID);

// Actualizar un medicamento
router.put('/update/:id', medicineController.updateMedicine);

// Eliminar un medicamento por ID
router.delete('/id/:id', medicineController.deleteMedicine);

// Obtener medicamentos por ID de paciente
router.get('/patient/:id_paciente', medicineController.getMedicinesByIdPatient);

// Agregar RFID pendiente desde el broker
router.post('/pending-rfids', medicineController.pend);  

module.exports = router;
