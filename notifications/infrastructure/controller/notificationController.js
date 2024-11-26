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

exports.buttonPressed = async (req, res) => {
  try {
    // Verifica si el evento es el esperado
    if (!req.body || req.body.event !== "botón presionado") {
      console.log(req.body)
      return res.status(400).json({ message: 'Evento inválido o faltante' });
    }

    console.log('Evento de botón recibido. Procesando notificación...');

    // 1. Consulta la notificación más cercana pendiente
    const pendingNotifications = await notificationRepository.findPending();
    if (pendingNotifications.length === 0) {
      return res.status(404).json({ message: 'No hay notificaciones pendientes para confirmar en este momento' });
    }

    const now = new Date();
    let closestNotification = null;
    let smallestDifference = Infinity;

    // Encuentra la notificación más cercana a la hora actual
    pendingNotifications.forEach(notification => {
      const notificationDate = new Date(notification.fecha_notificacion);
      const timeDifference = Math.abs(now - notificationDate);

      if (timeDifference < smallestDifference) {
        smallestDifference = timeDifference;
        closestNotification = notification;
      }
    });

    if (!closestNotification) {
      return res.status(404).json({ message: 'No se encontró una notificación válida para confirmar.' });
    }

    // 2. Confirma la notificación
    await notificationRepository.markAsCompleted(closestNotification.id_medicamento);

    // 3. Emite una notificación de confirmación al frontend
    io.emit('notification', {
      id_paciente: closestNotification.id_paciente,
      id_medicamento: closestNotification.id_medicamento,
      mensaje: `¡Excelente! Has tomado tu medicamento: ${closestNotification.mensaje}`,
    });

    console.log(`Notificación confirmada: Medicamento ${closestNotification.id_medicamento}`);

    // 4. Procesa la siguiente notificación, si existe
    const nextNotifications = pendingNotifications.filter(
      n => n.id_medicamento !== closestNotification.id_medicamento
    );

    if (nextNotifications.length > 0) {
      const nextNotification = nextNotifications[0];

      // Reprograma la próxima notificación
      io.emit('notification', {
        id_paciente: nextNotification.id_paciente,
        id_medicamento: nextNotification.id_medicamento,
        mensaje: `Hora de tomar tu próximo medicamento: ${nextNotification.mensaje}`,
      });

      console.log(`Siguiente notificación programada: Medicamento ${nextNotification.id_medicamento}`);
    } else {
      // Si no hay más notificaciones, reprograma para la próxima hora
      console.log('No hay más notificaciones en este ciclo. Reprogramando para la próxima hora...');
      const scheduleNotifications = new ScheduleNotifications(notificationRepository);
      const reprogramSchedule = await scheduleNotifications.execute({
        id_paciente: closestNotification.id_paciente,
        id_medicamento: closestNotification.id_medicamento,
        horario_medicamento: calcularProximoHorario(new Date()),
        nombre_medicamento: closestNotification.mensaje,
      });

      console.log('Reprogramación completada:', reprogramSchedule);
    }

    res.status(200).json({ message: 'Notificación procesada correctamente.' });
  } catch (err) {
    console.error('Error al procesar el evento del botón:', err);
    res.status(500).json({ message: 'Error al procesar el evento del botón.', error: err.message });
  }
};
exports.getPendingNotifications = async (req, res) => {
  try {
    const { id_paciente, id_medicamento } = req.query;

    // Validar que el `id_paciente` esté presente
    if (!id_paciente) {
      return res.status(400).json({ message: 'El id_paciente es requerido' });
    }

    const getPendingNotifications = new GetPendingNotifications(notificationRepository);
    const notifications = await getPendingNotifications.execute({ idPaciente: id_paciente, idMedicamento: id_medicamento });

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error al obtener notificaciones pendientes:', err.message);
    res.status(500).json({ message: 'Error al obtener las notificaciones pendientes', error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    console.log('Solicitud recibida:', req.query); 
    const id_paciente = req.query?.id_paciente;
    const id_medicamento = req.query?.id_medicamento;

    if (!id_paciente) {
      return res.status(400).json({ message: 'El id_paciente es requerido' });
    }

    const getPendingNotifications = new GetPendingNotifications(notificationRepository);
    const notifications = await getPendingNotifications.execute({
      idPaciente: id_paciente,
      idMedicamento: id_medicamento,
    });

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error al obtener notificaciones pendientes:', err.message);
    res.status(500).json({ message: 'Error al obtener las notificaciones pendientes', error: err.message });
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
