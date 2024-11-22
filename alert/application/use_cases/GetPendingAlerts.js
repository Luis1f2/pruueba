class GetPendingAlerts {
    constructor(alertRepository) {
      this.alertRepository = alertRepository;
    }
  
    async execute() {
      return await this.alertRepository.findPending();
    }
  }
  
  module.exports = GetPendingAlerts;
  