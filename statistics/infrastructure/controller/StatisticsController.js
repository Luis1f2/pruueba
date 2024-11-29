const database = require('../../infrastructure/routes/database'); // Trae el pool de conexiones
const StatisticsRepository = require('../../domain/repositories/StatisticsRepository');
const GetStatisticsData = require('../../application/use_cases/GetStatisticsData');

class StatisticsController {
  // Método para obtener estadísticas
  static async getStatistics(req, res) {
    const { userId } = req.params;

    // Pasamos el `database` al repositorio para acceder a la base de datos
    const statisticsRepository = new StatisticsRepository(database); 
    const getStatisticsData = new GetStatisticsData(statisticsRepository);

    try {
      const statistics = await getStatisticsData.execute(userId);
      res.status(200).json(statistics); // Respondemos con las estadísticas al cliente
    } catch (err) {
      console.error('Error en StatisticsController (getStatistics):', err.message);
      res.status(500).json({ error: 'Unable to fetch statistics data: ' + err.message });
    }
  }

  // El resto de métodos también deben pasar la instancia de `database`
  static async saveStatistics(req, res) {
    const { userId, adherence, probability, alert } = req.body;

    if (!userId || adherence === undefined || probability === undefined || alert === undefined) {
        return res.status(400).json({ error: 'Datos incompletos: userId, adherence, probability y alert son requeridos.' });
    }

    const statisticsRepository = new StatisticsRepository(database);

    try {
        const statistic = new Statistic({ userId, adherence, probability, alert });
        await statisticsRepository.saveStatistic(statistic);
        res.status(201).json({ message: 'Estadísticas guardadas exitosamente' });
    } catch (err) {
        console.error('Error en StatisticsController (saveStatistics):', err.message);
        res.status(500).json({ error: err.message });
    }
  }

  static async addRegister(req, res) {
    const { usuario_id, a_tiempo, fecha_toma } = req.body;

    if (!usuario_id || a_tiempo === undefined || !fecha_toma) {
      return res.status(400).json({ error: 'Datos incompletos: usuario_id, a_tiempo y fecha_toma son requeridos.' });
    }

    const statisticsRepository = new StatisticsRepository(database);

    try {
      await statisticsRepository.addRegister({ usuario_id, a_tiempo, fecha_toma });
      res.status(201).json({ message: 'Registro agregado exitosamente' });
    } catch (err) {
      console.error('Error en StatisticsController (addRegister):', err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = StatisticsController;
