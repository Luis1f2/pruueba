class ConfirmNotification {
    constructor(notificationRepository) {
      this.notificationRepository = notificationRepository;
    }
  
    async execute(idMedicamento) {
      return await this.notificationRepository.markAsCompleted(idMedicamento);
    }
  }
  
  module.exports = ConfirmNotification;
  