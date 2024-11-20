const db = require('../../infrastructure/database');

class NotificationRepository {
  async save(notification) {
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
    const [result] = await db.execute(query, values);
    notification.id_notificacion = result.insertId;
    return notification;
  }

  async findPending() {
    const query = `SELECT * FROM Notificaciones WHERE estado = 'pendiente' AND fecha_notificacion <= NOW()`;
    const [rows] = await db.execute(query);
    return rows;
  }

  async markAsCompleted(idMedicamento) {
    const query = `
      UPDATE Notificaciones
      SET estado = 'completada'
      WHERE id_medicamento = ? AND estado = 'pendiente'
    `;
    const [result] = await db.execute(query, [idMedicamento]);
    return result.affectedRows > 0;
  }
}

module.exports = NotificationRepository;
