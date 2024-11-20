class Notification {
    constructor(id_notificacion, id_paciente, id_medicamento, mensaje, estado, fecha_notificacion) {
      this.id_notificacion = id_notificacion;
      this.id_paciente = id_paciente;
      this.id_medicamento = id_medicamento;
      this.mensaje = mensaje;
      this.estado = estado;
      this.fecha_notificacion = fecha_notificacion;
    }
  }
  
  module.exports = Notification;
  