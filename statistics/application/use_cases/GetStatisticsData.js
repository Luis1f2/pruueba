class GetStatisticsData {
  constructor(statisticsRepository) {
    this.statisticsRepository = statisticsRepository;
  }

  async execute(userId) {
    try {
      // Obtener las estadísticas desde el repositorio
      const statisticsData = await this.statisticsRepository.getStatistics(userId);

      // Estructuramos la respuesta con los datos
      return {
        userId,
        adherence: statisticsData.adherence.toFixed(2), // Formateamos adherencia a 2 decimales
        probability: statisticsData.probability,
        alert: statisticsData.alert, // Directamente tomamos el campo alert, que ya es un objeto
        created_at: statisticsData.created_at
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error.message);
      throw new Error('Unable to fetch statistics data: ' + error.message);
    }
  }
}

module.exports = GetStatisticsData;
