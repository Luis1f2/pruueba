const AddMedicine = require('../../application/use_cases/AddMedicine');
const GetAllMedicines = require('../../application/use_cases/GetAllMedicines');
const GetMedicineByRFID = require('../../application/use_cases/GetMedicineByRFID');
const UpdateMedicine = require('../../application/use_cases/UpdateMedicine');
const DeleteMedicine = require('../../application/use_cases/DeleteMedicine');
const AddPendingRFID = require('../../application/use_cases/AddPendingRFID');
const MedicineRepository = require('../../domain/repositories/MedicineRepository');

const medicineRepository = new MedicineRepository();

// Crear un medicamento
exports.addMedicine = async (req, res) => {
  try {
    // 1. Crear el medicamento
    const addMedicine = new AddMedicine(medicineRepository);
    const id_medicamento = await addMedicine.execute(req.body);

    // 2. Generar notificaciones relacionadas al medicamento
    const medicamento = { ...req.body, id_medicamento }; // Combina el cuerpo del request con el ID del medicamento recién creado
    const scheduleNotifications = new ScheduleNotifications(notificationRepository);
    const notifications = await scheduleNotifications.execute(medicamento); // Genera y guarda notificaciones

    // 3. (Opcional) Emitir notificaciones al frontend en tiempo real
    notifications.forEach((notification) => {
      io.emit('notification', {
        mensaje: notification.mensaje,
        id_paciente: notification.id_paciente,
        id_medicamento: notification.id_medicamento,
        fecha_notificacion: notification.fecha_notificacion,
      });
    });

    // 4. Responder al cliente
    res.status(201).json({
      message: 'Medicamento creado exitosamente y notificaciones generadas',
      id_medicamento,
      notifications, // Incluye las notificaciones generadas en la respuesta
    });
  } catch (err) {
    console.error('Error al crear medicamento y generar notificaciones:', err.message);
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

// Obtener el último RFID registrado
exports.getLatestRFID = async (req, res) => {
  try {
    // Llama al repositorio para obtener todos los RFIDs pendientes
    const pendingRFIDs = await medicineRepository.findAllPendingRFIDs();

    if (!pendingRFIDs || pendingRFIDs.length === 0) {
      // Si no hay RFIDs pendientes, devuelve un mensaje de error
      return res.status(404).json({ message: 'No hay RFIDs pendientes' });
    }

    // Devolver solo el ID del último RFID registrado como un objeto JSON
    const latestRFID = pendingRFIDs[pendingRFIDs.length - 1].id_medicamento_rfid;
    res.status(200).json({ id_medicamento_rfid: latestRFID }); // Respuesta con el formato solicitado
  } catch (err) {
    // En caso de error, devuelve un mensaje adecuado
    res.status(500).json({ message: 'Error al obtener el último RFID pendiente', error: err.message });
  }
};


exports.pend = async (req, res) => {
  try {
    const { id_medicamento_rfid } = req.body;

    if (!id_medicamento_rfid) {
      return res.status(400).json({ message: 'El ID RFID es obligatorio' });
    }

    const addPendingRFID = new AddPendingRFID(medicineRepository);
    await addPendingRFID.execute({ id_medicamento_rfid });

    res.status(201).json({ message: 'RFID registrado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el RFID', error: error.message });
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

// Registrar un RFID pendiente
exports.pend = async (req, res) => {
  try {
    const { id_medicamento_rfid } = req.body;

    if (!id_medicamento_rfid) {
      return res.status(400).json({ message: 'El ID RFID es obligatorio' });
    }

    const id = await medicineRepository.savePendingRFID({ id_medicamento_rfid });
    res.status(201).json({ message: 'RFID registrado exitosamente', id });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar el RFID', error: error.message });
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
