class GetStatisticsData {
  constructor(statisticsRepository) {
    if (!statisticsRepository) {
      throw new Error('StatisticsRepository is required');
    }
    this.statisticsRepository = statisticsRepository;
  }

  async execute(idPaciente) {
    try {
      // Obtener las estadísticas desde el repositorio
      const statisticsData = await this.statisticsRepository.getStatistics(idPaciente);

      if (!statisticsData) {
        throw new Error(`No statistics data found for idPaciente: ${idPaciente}`);
      }

      // Asegurarse de que adherence es un número
      const adherence = parseFloat(statisticsData.adherence);
      const probability = parseFloat(statisticsData.probability);

      // Estructuramos la respuesta con los datos
      return {
        idPaciente,
        adherence: adherence ? adherence.toFixed(2) : null, // Formateamos adherencia a 2 decimales
        probability: probability !== null ? probability.toFixed(2) : null,
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
