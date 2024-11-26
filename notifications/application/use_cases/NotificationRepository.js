class NotificationRepository {
    constructor(database) {
      this.database = database;
    }
  
    // Obtener notificaciones pendientes por paciente
    async findPendingByPaciente(idPaciente) {
      const [rows] = await this.database.query(
        'SELECT * FROM notifications WHERE id_paciente = ? AND estado = "pendiente"',
        [idPaciente]
      );
      return rows;
    }
  
    // Obtener notificaciones pendientes por paciente y medicamento
    async findPendingByPacienteAndMedicamento(idPaciente, idMedicamento) {
      const [rows] = await this.database.query(
        'SELECT * FROM notifications WHERE id_paciente = ? AND id_medicamento = ? AND estado = "pendiente"',
        [idPaciente, idMedicamento]
      );
      return rows;
    }
  }
  
  module.exports = NotificationRepository;
  