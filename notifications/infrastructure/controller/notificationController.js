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
