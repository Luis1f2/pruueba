class GetUserById {
    constructor(userRepository) {
      this.userRepository = userRepository;
    }
  
    async execute(id) {
      if (!id) {
        throw new Error('El ID del usuario es requerido');
      }
      return await this.userRepository.findById(id);
    }
  }
  
  module.exports = GetUserById;
  