class ConfirmAlert {
    constructor(alertRepository) {
      this.alertRepository = alertRepository;
    }
  
    async execute(idAlerta) {
      return await this.alertRepository.markAsCompleted(idAlerta);
    }
  }
  
  module.exports = ConfirmAlert;
  