const ScheduleAlert = require('../../application/use_cases/ScheduleAlert');
const ConfirmAlert = require('../../application/use_cases/ConfirmAlert');
const GetPendingAlerts = require('../../application/use_cases/GetPendingAlerts');
const AlertRepository = require('../../domain/repositories/AlertRepository');


const alertRepository = new AlertRepository();


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


exports.buttonPressed = async (req, res) => {
  try {
      // Validar el evento recibido
      if (!req.body || req.body.event !== "botón alerta presionado") {
          return res.status(400).json({ message: 'Evento inválido o faltante' });
      }

      console.log('Evento del botón de alerta procesado:', req.body);

      // Lógica para manejar el evento
      const alertData = {
          id_usuario: req.body.id_usuario || null, // Asignar un usuario si es necesario
          mensaje: "Alerta de emergencia activada por el botón",
      };

      // Opcional: Guardar la alerta en la base de datos
      await alertRepository.save(alertData);

      // Respuesta exitosa
      res.status(200).json({ message: 'Alerta procesada exitosamente', alertData });
  } catch (err) {
      console.error('Error al procesar el evento del botón de alerta:', err.message);
      res.status(500).json({ message: 'Error al procesar la alerta', error: err.message });
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
