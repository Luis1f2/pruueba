const Notification = require('../../domain/entities/Notification');
const NotificationRepository = require('../../domain/repositories/NotificationRepository');

class ScheduleNotifications {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(medicamento) {
    const { id_paciente, id_medicamento, horario_medicamento, nombre_medicamento } = medicamento;

    // Crear notificaciones según el horario
    const notifications = [
      new Notification(null, id_paciente, id_medicamento, `Hora de tomar ${nombre_medicamento}`, 'pendiente', horario_medicamento),
      new Notification(null, id_paciente, id_medicamento, `Han pasado 10 minutos. Toma ${nombre_medicamento}`, 'pendiente', sumarMinutos(horario_medicamento, 10)),
      new Notification(null, id_paciente, id_medicamento, `Han pasado 30 minutos. Asegúrate de tomar ${nombre_medicamento}`, 'pendiente', sumarMinutos(horario_medicamento, 30)),
    ];

    // Guardar notificaciones en el repositorio
    for (const notification of notifications) {
      await this.notificationRepository.save(notification);
    }

    return notifications;
  }
}

function sumarMinutos(hora, minutos) {
  const date = new Date(`1970-01-01T${hora}:00`);
  date.setMinutes(date.getMinutes() + minutos);
  return date.toISOString().substr(11, 8);
}

module.exports = ScheduleNotifications;
