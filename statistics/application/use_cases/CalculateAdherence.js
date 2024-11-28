class CalculateAdherence {
    constructor(statisticsRepository) {
      this.statisticsRepository = statisticsRepository;
    }
    async execute(userId) {
        try {
            return await this.statisticsRepository.getAdherence(userId);
        } catch (error) {
            console.error('Error in CalculateAdherence:', error);
            throw new Error('Unable to calculate adherence');
        }
    }
    
  }
  
  module.exports = CalculateAdherence;
  