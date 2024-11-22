class CalculateAdherence {
    constructor(statisticsRepository) {
      this.statisticsRepository = statisticsRepository;
    }
  
    async execute(userId) {
      return await this.statisticsRepository.getAdherence(userId);
    }
  }
  
  module.exports = CalculateAdherence;
  