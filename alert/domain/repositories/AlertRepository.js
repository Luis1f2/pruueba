const db = require('../../infrastructure/database');

// Clase para manejar las alertas en la base de datos
class AlertRepository {
  // Guardar una nueva alerta en la base de datos
  async save(alert) {
    const query = `
      INSERT INTO Alertas (id_usuario, mensaje, estado, fecha_alerta)
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      alert.id_usuario,
      alert.mensaje,
      alert.estado,
      alert.fecha_alerta,
    ];
    const [result] = await db.execute(query, values);
    alert.id_alerta = result.insertId; // Asignar el ID generado al objeto de alerta
    return alert;
  }

  // Encontrar todas las alertas pendientes
  async findPending() {
    const query = `SELECT * FROM Alertas WHERE estado = 'pendiente' AND fecha_alerta <= NOW()`;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Marcar una alerta como completada
  async markAsCompleted(idAlerta) {
    const query = `
      UPDATE Alertas
      SET estado = 'completada'
      WHERE id_alerta = ? AND estado = 'pendiente'
    `;
    const [result] = await db.execute(query, [idAlerta]);
    return result.affectedRows > 0;
  }
}

module.exports = AlertRepository;
