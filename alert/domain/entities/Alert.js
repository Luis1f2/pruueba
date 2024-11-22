class Alert {
    constructor(id_alerta, id_usuario, mensaje, estado, fecha_alerta) {
      this.id_alerta = id_alerta;
      this.id_usuario = id_usuario;
      this.mensaje = mensaje;
      this.estado = estado; // Puede ser 'pendiente', 'completada', etc.
      this.fecha_alerta = fecha_alerta;
    }
  }
  
  module.exports = Alert;