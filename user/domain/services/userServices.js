class UserServices {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(userData) {
    // Validar datos de entrada
    if (!userData.nombre || !userData.correo || !userData.contraseña) {
      throw new Error('Missing required fields');
    }
    if (userData.contraseña.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Verificar si el correo ya está registrado
    const existingUser = await this.userRepository.findByEmail(userData.correo);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Guardar usuario en el repositorio
    return await this.userRepository.save(userData);
  }

  async login(email, password) {
    // Verificar si el usuario existe
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Aquí podrías agregar la lógica para comparar la contraseña si no lo haces en el caso de uso
    return user;
  }

  async updateUser(userId, updateData) {
    // Validar si el usuario existe
    const user = await this._validateUserExists(userId);

    // Actualizar datos del usuario
    return await this.userRepository.update(userId, {
      ...user, // Mantener los datos existentes
      ...updateData, // Sobrescribir los campos proporcionados
    });
  }

  async deleteUser(userId) {
    await this._validateUserExists(userId);
    return await this.userRepository.delete(userId);
  }

  
  async _validateUserExists(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

module.exports = UserServices;
