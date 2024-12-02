const database = require('../../infrastructure/routes/database');  
class StatisticsRepository {
  constructor(database) {
    this.database = database; 
  }

  async getStatistics(userId) {
    try {
      const query = `
        SELECT adherence, probability, alert, created_at 
        FROM statistics 
        WHERE id_paciente = ? 
        ORDER BY created_at DESC 
        LIMIT 1;
      `;
      const [results] = await this.database.execute(query, [userId]);

      if (results.length === 0) {
        throw new Error('No statistics found for this user');
      }

      return results[0];
    } catch (error) {
      console.error('Error al obtener estadísticas desde la base de datos:', error.message);
      throw new Error('Unable to fetch statistics data: ' + error.message);
    }
  }

  async addRegister({ id_paciente, id_medicamento, a_tiempo, fecha_toma }) {
    const query = `
      INSERT INTO registro_tomas (id_paciente, id_medicamento, a_tiempo, fecha_toma)
      VALUES (?, ?, ?, ?)
    `;
    await this.database.execute(query, [id_paciente, id_medicamento, a_tiempo, fecha_toma]);
  }

  async getAdherence(userId) {
    try {
      const query = `
        SELECT 
          SUM(CASE WHEN a_tiempo = TRUE THEN 1 ELSE 0 END) AS dosis_tomadas,
          COUNT(*) AS dosis_programadas
        FROM registro_tomas
        WHERE id_paciente = ?
      `;
      const [results] = await this.database.execute(query, [userId]);
  
      if (results.length === 0 || !results[0].dosis_tomadas || !results[0].dosis_programadas) {
        throw new Error('No adherence data found for userId: ' + userId);
      }
  
      return results[0];
    } catch (error) {
      console.error('Database error in getAdherence:', error);
      throw new Error('Unable to fetch adherence data');
    }
  }
  
  async getHealthAlerts(userId) {
    const query = `
      SELECT * FROM eventos_medicos WHERE id_paciente = ?
    `;
    const [results] = await this.database.execute(query, [userId]);
    return results;
  }

  async getProbability(userId) {
    const adherence = await this.getAdherence(userId);
    const probability = 1 - (adherence.dosis_tomadas / adherence.dosis_programadas);
    return probability.toFixed(2);
  }

  async saveStatistic(statistic) {
    const query = `
      INSERT INTO statistics (id_paciente, adherence, probability, alert) 
      VALUES (?, ?, ?, ?)
    `;
    await this.database.execute(query, [
      statistic.userId,
      statistic.adherence,
      statistic.probability,
      JSON.stringify(statistic.alert), 
    ]);
  }
}
module.exports = StatisticsRepository;
