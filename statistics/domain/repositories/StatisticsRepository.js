const database = require('../../infrastructure/routes/database');  // Asegúrate de que esta ruta sea correcta

class StatisticsRepository {
  constructor(database) {
    this.database = database; // Aquí asignas el pool de conexiones a la propiedad `this.database`
  }

  async getStatistics(userId) {
    try {
      const query = `
        SELECT adherence, probability, alert, created_at 
        FROM statistics 
        WHERE usuario_id = ? 
        ORDER BY created_at DESC 
        LIMIT 1;
      `;
      const [results] = await this.database.execute(query, [userId]);

      if (results.length === 0) {
        throw new Error('No statistics found for this user');
      }

      return results[0]; // Devuelve los datos más recientes (última estadística)
    } catch (error) {
      console.error('Error al obtener estadísticas desde la base de datos:', error.message);
      throw new Error('Unable to fetch statistics data: ' + error.message);
    }
  }

  // Método para agregar un nuevo registro
  async addRegister({ usuario_id, a_tiempo, fecha_toma }) {
    const query = `
      INSERT INTO registro_tomas (usuario_id, a_tiempo, fecha_toma)
      VALUES (?, ?, ?)
    `;
    // Ejecuta la consulta usando el pool de conexiones
    await this.database.execute(query, [usuario_id, a_tiempo, fecha_toma]);
  }

  // Método para obtener la adherencia de un usuario
  async getAdherence(userId) {
    try {
      const query = `
        SELECT 
          SUM(CASE WHEN a_tiempo = TRUE THEN 1 ELSE 0 END) AS dosis_tomadas,
          COUNT(*) AS dosis_programadas
        FROM registro_tomas
        WHERE usuario_id = ?
      `;
      const [results] = await this.database.execute(query, [userId]);
  
      if (results.length === 0 || !results[0].dosis_tomadas || !results[0].dosis_programadas) {
        throw new Error('No adherence data found for userId: ' + userId);
      }
  
      return results[0];  // Asegúrate de devolver el primer objeto en caso de que haya más de un resultado
    } catch (error) {
      console.error('Database error in getAdherence:', error);
      throw new Error('Unable to fetch adherence data');
    }
  }
  
  // Método para obtener alertas de salud de un usuario
  async getHealthAlerts(userId) {
    const query = `SELECT * FROM eventos_medicos WHERE usuario_id = ?`;
    // Ejecuta la consulta usando el pool de conexiones
    const [results] = await this.database.execute(query, [userId]);
    return results;
  }

  // Método para calcular la probabilidad de incumplimiento
  async getProbability(userId) {
    // Lógica para calcular la probabilidad de incumplimiento
    const adherence = await this.getAdherence(userId);
    const probability = 1 - (adherence.dosis_tomadas / adherence.dosis_programadas); // Asegúrate de dividir correctamente
    return probability.toFixed(2); // Retorna la probabilidad con 2 decimales
  }

  // Método para guardar las estadísticas calculadas
  async saveStatistic(statistic) {
    const query = `
      INSERT INTO statistics (usuario_id, adherence, probability, alert) 
      VALUES (?, ?, ?, ?)
    `;
    // Ejecuta la consulta usando el pool de conexiones
    await this.database.execute(query, [
      statistic.userId,
      statistic.adherence,
      statistic.probability,
      statistic.alert
    ]);
  }
}

module.exports = StatisticsRepository;
