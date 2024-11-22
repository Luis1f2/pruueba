const ScheduleAlert = require('../../application/use_cases/ScheduleAlert');
const ConfirmAlert = require('../../application/use_cases/ConfirmAlert');
const GetPendingAlerts = require('../../application/use_cases/GetPendingAlerts');
const AlertRepository = require('../../domain/repositories/AlertRepository');

// Crear instancia del repositorio de alertas
const alertRepository = new AlertRepository();

// Controlador para programar nuevas alertas
exports.schedule = async (req, res) => {
  try {
    const scheduleAlert = new ScheduleAlert(alertRepository);
    const alertData = req.body;

    // Programar las alertas usando los datos proporcionados
    const alerts = await scheduleAlert.execute(alertData);

    // Responder con las alertas programadas
    res.status(201).json(alerts);
  } catch (err) {
    console.error('Error al programar alertas:', err);
    res.status(500).json({ message: 'Error al programar alertas', error: err.message });
  }
};

// Controlador para confirmar una alerta específica
exports.confirm = async (req, res) => {
  try {
    const { id_alerta } = req.params; // Obtener el ID de la alerta desde los parámetros de la URL

    const confirmAlert = new ConfirmAlert(alertRepository);

    // Ejecutar la lógica para confirmar la alerta
    const result = await confirmAlert.execute(id_alerta);

    if (!result) {
      // Si no se encuentra la alerta, responder con un error 404
      return res.status(404).json({ message: 'Alerta no encontrada' });
    }

    // Responder confirmando la alerta
    res.status(200).json({ message: 'Alerta confirmada' });
  } catch (err) {
    console.error('Error al confirmar alerta:', err);
    res.status(500).json({ message: 'Error al confirmar alerta', error: err.message });
  }
};

// Controlador para obtener alertas pendientes
exports.getPending = async (req, res) => {
  try {
    const getPendingAlerts = new GetPendingAlerts(alertRepository);

    // Obtener todas las alertas pendientes
    const alerts = await getPendingAlerts.execute();

    // Responder con las alertas pendientes
    res.status(200).json(alerts);
  } catch (err) {
    console.error('Error al obtener alertas pendientes:', err);
    res.status(500).json({ message: 'Error al obtener alertas pendientes', error: err.message });
  }
};
