class DeleteUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id) {
   
    if (!id) {
      throw new Error('User ID is required');
    }

    
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    
    await this.userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }
}

module.exports = DeleteUser;
