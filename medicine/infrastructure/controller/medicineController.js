const AddMedicine = require('../../application/use_cases/AddMedicine');
const GetAllMedicines = require('../../application/use_cases/GetAllMedicines');
const GetMedicineByRFID = require('../../application/use_cases/GetMedicineByRFID');
const UpdateMedicine = require('../../application/use_cases/UpdateMedicine');
const DeleteMedicine = require('../../application/use_cases/DeleteMedicine');
const MedicineRepository = require('../../domain/repositories/MedicineRepository');

const medicineRepository = new MedicineRepository();

// Crear un medicamento
exports.addMedicine = async (req, res) => {
  try {
    const addMedicine = new AddMedicine(medicineRepository);
    const id_medicamento = await addMedicine.execute(req.body);
    res.status(201).json({ message: 'Medicamento creado exitosamente', id_medicamento });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear el medicamento', error: err.message });
  }
};

// Obtener todos los medicamentos
exports.getAllMedicines = async (req, res) => {
  try {
    const getAllMedicines = new GetAllMedicines(medicineRepository);
    const medicines = await getAllMedicines.execute();
    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los medicamentos', error: err.message });
  }
};

// Obtener un medicamento por ID o RFID
exports.getMedicineByIdOrRFID = async (req, res) => {
  try {
    const { id } = req.params;
    const getMedicineByRFID = new GetMedicineByRFID(medicineRepository);
    const medicine = await getMedicineByRFID.execute(id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.status(200).json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el medicamento', error: err.message });
  }
};

// Obtener medicamentos por ID de paciente
exports.getMedicinesByIdPatient = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const medicines = await medicineRepository.findByIdPatient(id_paciente);
    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los medicamentos por ID de paciente', error: err.message });
  }
};

// Obtener un medicamento por RFID únicamente
exports.getMedicineByRFID = async (req, res) => {
  try {
    const { id_medicamento_rfid } = req.params;
    const getMedicineByRFID = new GetMedicineByRFID(medicineRepository);
    const medicine = await getMedicineByRFID.execute(id_medicamento_rfid);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.status(200).json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el medicamento por RFID', error: err.message });
  }
};

// Actualizar un medicamento
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateMedicine = new UpdateMedicine(medicineRepository);
    const updated = await updateMedicine.execute(id, req.body);

    if (!updated) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.status(200).json({ message: 'Medicamento actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el medicamento', error: err.message });
  }
};

// Eliminar un medicamento por ID
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteMedicine = new DeleteMedicine(medicineRepository);
    const deleted = await deleteMedicine.execute(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.status(200).json({ message: 'Medicamento eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el medicamento', error: err.message });
  }
};

// Completar el registro de un medicamento
exports.completeMedicine = async (req, res) => {
  try {
    const { id_medicamento_rfid } = req.params;
    const data = req.body;

    const updated = await medicineRepository.updateByRFID(id_medicamento_rfid, data);

    if (!updated) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.status(200).json({ message: 'Medicamento completado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al completar el registro del medicamento', error: err.message });
  }
};

// Registrar un RFID para un medicamento
exports.registerRFID = async (req, res) => {
  try {
    const { id_medicamento_rfid } = req.body;

    if (!id_medicamento_rfid) {
      return res.status(400).json({ message: 'El ID RFID es requerido' });
    }

    const medicine = {
      id_medicamento_rfid,
      nombre_medicamento: null,
      horario_medicamento: null,
      fecha_inicio: null,
      fecha_final: null,
      dosis: null,
      frecuencias: null,
      notas_adicionales: null,
    };

    const id_medicamento = await medicineRepository.save(medicine);
    res.status(201).json({ message: 'RFID registrado exitosamente', id_medicamento });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar el RFID', error: err.message });
  }
};

// Obtener RFIDs pendientes
exports.getPendingRFIDs = async (req, res) => {
  try {
    const pendingMedicines = await medicineRepository.findPending();
    res.status(200).json(pendingMedicines);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los RFID pendientes', error: err.message });
  }
};

// Eliminar un medicamento por RFID
exports.deleteMedicineByRFID = async (req, res) => {
  try {
    const { id_medicamento_rfid } = req.params;
    const deleteMedicine = new DeleteMedicine(medicineRepository);
    const deleted = await deleteMedicine.execute(id_medicamento_rfid);

    if (!deleted) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }

    res.status(200).json({ message: 'Medicamento eliminado exitosamente por RFID' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el medicamento por RFID', error: err.message });
  }
};
