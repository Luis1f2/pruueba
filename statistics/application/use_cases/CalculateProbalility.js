class CalculateProbability {
  constructor(statisticsRepository) {
    if (!statisticsRepository) {
      throw new Error('StatisticsRepository is required');
    }
    this.statisticsRepository = statisticsRepository;
  }

  async execute(idPaciente) {
    try {
      // Llama al repositorio para obtener la probabilidad
      const probability = await this.statisticsRepository.getProbability(idPaciente);

      if (probability === undefined || probability === null) {
        throw new Error(`No probability data found for idPaciente: ${idPaciente}`);
      }

      // Devuelve la probabilidad calculada
      return {
        idPaciente,
        probability: parseFloat(probability)
      };
    } catch (error) {
      console.error('Error in CalculateProbability:', error.message);
      throw new Error('Unable to calculate probability: ' + error.message);
    }
  }
}

module.exports = CalculateProbability;
