const db = require('../../infrastructure/database');

class AlertRepository {
    async save(alert) {
        const query = `INSERT INTO Alertas (id_usuario, mensaje_alerta) VALUES (?, ?)`;
        const values = [alert.id_usuario, alert.mensaje_alerta];
        await db.execute(query, values);
    }
}

module.exports = AlertRepository;
