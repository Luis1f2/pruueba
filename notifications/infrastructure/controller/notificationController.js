const ScheduleNotifications = require('../../application/use_cases/scheduleNotifications');
const ConfirmNotification = require('../../application/use_cases/ConfirmNotification');
const GetPendingNotifications = require('../../application/use_cases/GetPendingNotifications');
const NotificationRepository = require('../../domain/repositories/NotificationRepository');

const notificationRepository = new NotificationRepository();

exports.schedule = async (req, res) => {
  try {
    const scheduleNotifications = new ScheduleNotifications(notificationRepository);
    const notifications = await scheduleNotifications.execute(req.body);
    res.status(201).json(notifications);
  } catch (err) {
    console.error('Error al programar notificaciones:', err);  // Imprimir el error en la consola para más detalles
    res.status(500).json({ message: 'Error al programar notificaciones', error: err.message });
  }
};

exports.confirm = async (req, res) => {
  try {
    const { id_medicamento } = req.params;
    const confirmNotification = new ConfirmNotification(notificationRepository);
    const result = await confirmNotification.execute(id_medicamento);
    if (!result) {
      return res.status(404).json({ message: 'Notificación no encontrada' });
    }
    res.status(200).json({ message: 'Notificación confirmada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al confirmar notificación', error: err.message });
  }
};

exports.getPending = async (req, res) => {
  try {
    const getPendingNotifications = new GetPendingNotifications(notificationRepository);
    const notifications = await getPendingNotifications.execute();
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener notificaciones pendientes', error: err.message });
  }
};

exports.buttonPressed = async (req, res) => {
  try {
    // Verificar si el cuerpo de la solicitud contiene "event": "boton presionado"
    if (!req.body || req.body.event !== "boton presionado") {
      return res.status(400).json({ message: 'Evento inválido o faltante' });
    }

    console.log('Botón presionado, intentando confirmar el medicamento...');

    // 1. Obtener todas las notificaciones pendientes
    const pendingNotifications = await notificationRepository.findPending();

    if (pendingNotifications.length === 0) {
      return res.status(404).json({ message: 'No hay medicamentos pendientes para confirmar en este momento' });
    }

    // 2. Obtener la hora actual y calcular cuál notificación es la más cercana
    const now = new Date();
    let closestNotification = null;
    let smallestDifference = Infinity;

    pendingNotifications.forEach(notification => {
      const notificationDate = new Date(notification.fecha_notificacion);
      const timeDifference = Math.abs(now - notificationDate);

      // Verificar si esta notificación está más cercana que la anterior
      if (timeDifference < smallestDifference) {
        smallestDifference = timeDifference;
        closestNotification = notification;
      }
    });

    if (!closestNotification) {
      return res.status(404).json({ message: 'No se encontró ninguna notificación adecuada para confirmar.' });
    }

    // 3. Confirmar la notificación encontrada
    const confirmNotification = new ConfirmNotification(notificationRepository);
    const result = await confirmNotification.execute(closestNotification.id_medicamento);

    if (!result) {
      return res.status(404).json({ message: 'No se pudo confirmar la notificación' });
    }

    // 4. Emitir el evento al frontend para informar de la confirmación del medicamento
    io.emit('medicationTaken', {
      id_medicamento: closestNotification.id_medicamento,
      id_paciente: closestNotification.id_paciente,
      message: `El medicamento con ID ${closestNotification.id_medicamento} ha sido tomado por el paciente con ID ${closestNotification.id_paciente}.`
    });

    // 5. Reprogramar el siguiente ciclo de notificaciones para este medicamento específico
    const scheduleNotifications = new ScheduleNotifications(notificationRepository);
    const nuevoHorario = calcularProximoHorario(closestNotification.fecha_notificacion.split('T')[1]); // Calcular próximo horario basado en la hora actual

    const nextSchedule = await scheduleNotifications.execute({
      id_paciente: closestNotification.id_paciente,
      id_medicamento: closestNotification.id_medicamento,
      horario_medicamento: nuevoHorario,
      nombre_medicamento: closestNotification.nombre_medicamento,
    });

    res.status(200).json({ message: 'Medicamento confirmado y próximo ciclo programado', nextSchedule });

  } catch (err) {
    console.error('Error al confirmar la toma del medicamento:', err);
    res.status(500).json({ message: 'Error al confirmar la toma del medicamento', error: err.message });
  }
};
