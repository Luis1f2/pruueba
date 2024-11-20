class GetPendingNotifications {
    constructor(notificationRepository) {
      this.notificationRepository = notificationRepository;
    }
  
    async execute() {
      return await this.notificationRepository.findPending();
    }
  }
  
  module.exports = GetPendingNotifications;