const { getIO } = require('../../../ioInstance'); // WebSocket para emitir eventos
const Statistic = require('../../domain/entities/Statistic');
const StatisticsRepository = require('../../domain/repositories/StatisticsRepository');
const GetStatisticsData = require('../../application/use_cases/GetStatisticsData');

class StatisticsController {
  // Método para obtener estadísticas
  static async getStatistics(req, res) {
    const { userId } = req.params;
    const statisticsRepository = new StatisticsRepository();
    const getStatisticsData = new GetStatisticsData(statisticsRepository);

    try {
      const statistics = await getStatisticsData.execute(userId);
      const io = getIO();
      io.emit('statisticsUpdate', statistics); // Emitir estadísticas actualizadas vía WebSocket
      res.status(200).json(statistics); // Responder con estadísticas al cliente
    } catch (err) {
      console.error('Error en StatisticsController (getStatistics):', err.message);
      res.status(500).json({ error: err.message });
    }
  }

  static async saveStatistics(req, res) {
    const { userId, adherence, probability, alert } = req.body;
    
    if (!userId || adherence === undefined || probability === undefined || alert === undefined) {
        return res.status(400).json({ error: 'Datos incompletos: userId, adherence, probability y alert son requeridos.' });
    }

    const saveStatistics = async (req, res) => {
      try {
          const { userId, adherence, probability, alert } = req.body;
  
          // Validar que todos los datos requeridos estén presentes
          if (!userId || adherence == null || probability == null || !alert) {
              return res.status(400).json({
                  error: "Datos incompletos: userId, adherence, probability y alert son requeridos.",
              });
          }
  
          // Validar tipos de datos (opcional, pero recomendado)
          if (typeof userId !== "number" || typeof adherence !== "number" || typeof probability !== "number" || typeof alert !== "object") {
              return res.status(400).json({
                  error: "Datos inválidos: verifica los tipos de userId, adherence, probability y alert.",
              });
          }
  
          // Pasar datos al caso de uso o repositorio
          const statistic = { userId, adherence, probability, alert };
          await statisticsRepository.saveStatistic(statistic);
  
          return res.status(201).json({ message: "Estadísticas guardadas correctamente." });
      } catch (error) {
          console.error("Error en saveStatistics:", error);
          return res.status(500).json({ error: "Error interno del servidor." });
      }
  };
  

    const statisticsRepository = new StatisticsRepository();

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

    const statisticsRepository = new StatisticsRepository();

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
