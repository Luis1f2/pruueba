const database = require('../../../user/infrastructure/database');

class StatisticsRepository {

  constructor(database) {
    this.database = database;
}

  async addRegister({ usuario_id, a_tiempo, fecha_toma }) {
    const query = `
      INSERT INTO registro_tomas (usuario_id, a_tiempo, fecha_toma)
      VALUES (?, ?, ?)
    `;
    await database.execute(query, [usuario_id, a_tiempo, fecha_toma]);
  }
  
  async getAdherence(userId) {
    try {
        const query = `
            SELECT 
                SUM(CASE WHEN a_tiempo = TRUE THEN 1 ELSE 0 END) AS dosis_tomadas,
                COUNT(*) AS dosis_programadas
            FROM registro_tomas
            WHERE usuario_id = ?;
        `;
        const [results] = await this.database.execute(query, [userId]);
        // Resto de la lógica...
    } catch (error) {
        console.error('Database error in getAdherence:', error);
        throw new Error('Unable to fetch adherence data');
    }
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

