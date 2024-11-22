const Notification = require('../../domain/entities/Notification');
const NotificationRepository = require('../../domain/repositories/NotificationRepository');
const moment = require('moment-timezone');

class ScheduleNotifications {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute(medicamento) {
    try {
      const { id_paciente, id_medicamento, horario_medicamento, nombre_medicamento } = medicamento;
  
      // Log para verificar los valores que se reciben
      console.log('Datos del medicamento:', medicamento);
  
      const [hours, minutes, seconds] = horario_medicamento.split(':');
      const now = new Date();
      const notificationTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds);
  
      // Crear notificaciones según el horario del medicamento
      const notifications = [
        new Notification(null, id_paciente, id_medicamento, `Hora de tomar ${nombre_medicamento}`, 'pendiente', notificationTime),
        new Notification(null, id_paciente, id_medicamento, `Han pasado 10 minutos. Toma ${nombre_medicamento}`, 'pendiente', sumarMinutos(notificationTime, 10)),
        new Notification(null, id_paciente, id_medicamento, `Han pasado 30 minutos. Asegúrate de tomar ${nombre_medicamento}`, 'pendiente', sumarMinutos(notificationTime, 30)),
      ];
  
      for (const notification of notifications) {
        await this.notificationRepository.save(notification);
      }
  
      return notifications;
  
    } catch (error) {
      console.error('Error en ScheduleNotifications.execute:', error);
      throw error;  // Lanza el error para que pueda ser capturado en el controlador
    }
  }
  
}

function obtenerHoraNotificacion(horario_medicamento, zonaHoraria) {
  // Asume que horario_medicamento es 'HH:mm:ss' y zonaHoraria es, por ejemplo, 'America/New_York'
  const [hours, minutes, seconds] = horario_medicamento.split(':');
  return moment().tz(zonaHoraria).set({ hour: hours, minute: minutes, second: seconds }).toDate();
}

function sumarMinutos(fecha, minutos) {
  const newDate = new Date(fecha);
  newDate.setMinutes(newDate.getMinutes() + minutos);
  return newDate;
}

function calcularProximoHorario(horario_medicamento) {
  // Suponiendo que el medicamento se toma una vez al día:
  const [hours, minutes, seconds] = horario_medicamento.split(':');
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1); // Añadir un día
  nextDay.setHours(hours, minutes, seconds);
  return nextDay.toTimeString().split(' ')[0]; // Devuelve en formato 'HH:mm:ss'
}

module.exports = ScheduleNotifications;
