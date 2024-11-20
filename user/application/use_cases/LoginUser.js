const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Importar JWT

class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.contraseña);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    // Crear el token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Información a incluir en el token
      process.env.JWT_SECRET || 'your_secret_key', // Clave secreta del token
      { expiresIn: '1h' } // Tiempo de expiración del token
    );

    return { user, token }; // Retornar el usuario y el token
  }
}

module.exports = LoginUser;

