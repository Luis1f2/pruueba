class GetStatisticsData {
    constructor(statisticsRepository) {
      this.statisticsRepository = statisticsRepository;
    }
  
    async execute(userId) {
      const adherence = await this.statisticsRepository.getAdherence(userId);
      const probability = await this.statisticsRepository.getProbability(userId);
      const alerts = await this.statisticsRepository.getHealthAlerts(userId);
  
      return {
        userId,
        adherence,
        probability,
        alerts,
      };
    }
  }
  
  module.exports = GetStatisticsData;
  