class CalculateProbability {
    constructor(statisticsRepository) {
      this.statisticsRepository = statisticsRepository;
    }
  
    async execute(userId) {
      return await this.statisticsRepository.getProbability(userId);
    }
  }
  
  module.exports = CalculateProbability;
  