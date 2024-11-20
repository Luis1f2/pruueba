class UpdateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, data) {
   
    if (!id) {
      throw new Error('User ID is required');
    }

    
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    
    const updatedUser = {
      ...user,
      ...data 
    };

    
    return await this.userRepository.update(id, updatedUser);
  }
}

module.exports = UpdateUser;
