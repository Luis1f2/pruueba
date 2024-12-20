const db = require('../../infrastructure/database');

class NotificationRepository {
  async save(notification) {
    try {
      const query = `
        INSERT INTO Notificaciones (id_paciente, id_medicamento, mensaje, estado, fecha_notificacion)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        notification.id_paciente,
        notification.id_medicamento,
        notification.mensaje,
        notification.estado,
        notification.fecha_notificacion,
      ];

      // Log para verificar los valores que se están intentando guardar
      console.log('Valores a guardar en la base de datos:', values);

      const [result] = await db.execute(query, values);
      notification.id_notificacion = result.insertId;
      return notification;

    } catch (error) {
      console.error('Error al guardar la notificación en la base de datos:', error);
      throw error;
    }
  }

  async findPendingByPaciente(idPaciente) {
    try {
      const query = `
        SELECT * FROM Notificaciones 
        WHERE id_paciente = ? AND estado = 'pendiente'
      `;
      const [rows] = await db.query(query, [idPaciente]);
      return rows;
    } catch (error) {
      console.error('Error al buscar notificaciones pendientes por paciente:', error);
      throw error;
    }
  }

  async findPending() {
    try {
      const query = `
        SELECT * FROM Notificaciones 
        WHERE estado = 'pendiente' AND fecha_notificacion <= NOW()
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error al buscar notificaciones pendientes:', error);
      throw error;
    }
  }

  async markAsCompleted(idMedicamento) {
    try {
      const query = `
        UPDATE Notificaciones
        SET estado = 'completada'
        WHERE id_medicamento = ? AND estado = 'pendiente'
      `;
      const [result] = await db.execute(query, [idMedicamento]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al marcar la notificación como completada:', error);
      throw error;
    }
  }
}

module.exports = NotificationRepository;
