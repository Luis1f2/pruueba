const database = require('../../../user/infrastructure/database');

class StatisticsRepository {
  async addRegister({ usuario_id, a_tiempo, fecha_toma }) {
    const query = `
      INSERT INTO registro_tomas (usuario_id, a_tiempo, fecha_toma)
      VALUES (?, ?, ?)
    `;
    await database.execute(query, [usuario_id, a_tiempo, fecha_toma]);
  }
  
  async getAdherence(userId) {
    const query = `
      SELECT 
        SUM(CASE WHEN a_tiempo = TRUE THEN 1 ELSE 0 END) AS dosis_tomadas,
        COUNT(*) AS dosis_programadas
      FROM registro_tomas
      WHERE usuario_id = ?;
    `;
    const [results] = await database.execute(query, [userId]);
    const { dosis_tomadas, dosis_programadas } = results[0];
    const adherence = dosis_programadas > 0 
      ? (dosis_tomadas / dosis_programadas) * 100 
      : 0;
    return adherence.toFixed(2);
  }

  async getHealthAlerts(userId) {
    const query = `SELECT * FROM eventos_medicos WHERE usuario_id = ?`;
    const [results] = await database.execute(query, [userId]);
    return results;
  }

  async getProbability(userId) {
    // Lógica para calcular la probabilidad de incumplimiento
    const adherence = await this.getAdherence(userId);
    const probability = 1 - adherence / 100; // Probabilidad inversa a la adherencia
    return probability.toFixed(2);
  }

  async saveStatistic(statistic) {
    const query = `
        INSERT INTO statistics (usuario_id, adherence, probability, alert) 
        VALUES (?, ?, ?, ?)
    `;
    await database.execute(query, [
        statistic.userId,
        statistic.adherence,
        statistic.probability,
        statistic.alert
    ]);
}
}

module.exports = StatisticsRepository;

