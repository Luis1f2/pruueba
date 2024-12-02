class CalculateAdherence {
    constructor(statisticsRepository) {
      if (!statisticsRepository) {
        throw new Error('StatisticsRepository is required');
      }
      this.statisticsRepository = statisticsRepository;
    }
  
    async execute(idPaciente) {
      try {
        // Llama al repositorio para obtener la adherencia
        const adherenceData = await this.statisticsRepository.getAdherence(idPaciente);
  
        if (!adherenceData) {
          throw new Error('Adherence data not found for the provided idPaciente');
        }
  
        // Opcional: Estructura el resultado si es necesario
        return {
          idPaciente,
          dosisTomadas: adherenceData.dosis_tomadas,
          dosisProgramadas: adherenceData.dosis_programadas,
          porcentajeAdherencia: (adherenceData.dosis_tomadas / adherenceData.dosis_programadas) * 100
        };
      } catch (error) {
        console.error('Error in CalculateAdherence:', error.message);
        throw new Error('Unable to calculate adherence: ' + error.message);
      }
    }
  }
  
  module.exports = CalculateAdherence;
  