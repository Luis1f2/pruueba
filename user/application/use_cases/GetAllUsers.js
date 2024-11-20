class GetAllUsers {
    constructor(userRepository) {
      this.userRepository = userRepository;
    }
  
    async execute() {
      // Obtener todos los usuarios
      const users = await this.userRepository.findAll();
  
      
      if (users.length === 0) {
        return { message: 'Made in Heaven', users: [] };
      }
  
      return { users };
    }
  }
  
  module.exports = GetAllUsers;
  