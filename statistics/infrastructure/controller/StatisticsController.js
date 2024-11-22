const { getIO } = require('../../../ioInstance'); // Asegúrate de que la ruta sea correcta
const StatisticsRepository = require('../../domain/repositories/StatisticsRepository');
const GetStatisticsData = require('../../application/use_cases/GetStatisticsData');

class StatisticsController {
  static async getStatistics(req, res) {
    const { userId } = req.params; // Obtén el ID del usuario de los parámetros
    const statisticsRepository = new StatisticsRepository();
    const getStatisticsData = new GetStatisticsData(statisticsRepository);

    try {
      // Ejecuta el caso de uso para obtener las estadísticas
      const statistics = await getStatisticsData.execute(userId);

      // Envía las estadísticas actualizadas a través de Socket.IO
      const io = getIO();
      io.emit('statisticsUpdate', statistics);

      // Devuelve las estadísticas al cliente
      res.status(200).json(statistics);
    } catch (err) {
      console.error('Error en StatisticsController:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = StatisticsController;
