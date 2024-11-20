const bcrypt = require('bcrypt');
const User = require('../../domain/entities/User');

class RegisterUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userData) {
    const { nombre, año_nacimiento, direccion_Email, contraseña, telefono } = userData;

    if (!nombre || !direccion_Email || !contraseña) {
      throw new Error('Faltan campos requeridos');
    }

    if (contraseña.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const user = new User(
      null, // id será generado automáticamente por la base de datos
      nombre,
      telefono,
      direccion_Email,
      año_nacimiento,
      hashedPassword
    );

    return await this.userRepository.save(user);
  }
}

module.exports = RegisterUser;
