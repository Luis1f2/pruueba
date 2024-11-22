class GenerateHealthAlerts {
    constructor(statisticsRepository) {
      this.statisticsRepository = statisticsRepository;
    }
  
    async execute(userId) {
      return await this.statisticsRepository.getHealthAlerts(userId);
    }
  }
  
  module.exports = GenerateHealthAlerts;
  