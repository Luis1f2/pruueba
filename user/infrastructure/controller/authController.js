const bcrypt = require('bcrypt');
const GetUserById = require('../../application/use_cases/GetUserById');
const RegisterUser = require('../../application/use_cases/RegisterUser');
const LoginUser = require('../../application/use_cases/LoginUser');
const UpdateUser = require('../../application/use_cases/UpdateUser');
const DeleteUser = require('../../application/use_cases/DeleteUser');
const GetAllUsers = require('../../application/use_cases/GetAllUsers');
const UserRepository = require('../../domain/repositories/UserRepository');

const userRepository = new UserRepository();

exports.register = async (req, res) => {
  try {
    const { nombre, año_nacimiento, direccion_Email, contraseña, telefono } = req.body;

    if (!nombre || !direccion_Email || !contraseña) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Validación adicional para contraseñas
    if (contraseña.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Guardar usuario
    const user = await userRepository.save({
      nombre,
      año_nacimiento: parseInt(año_nacimiento),
      direccion_Email,
      contraseña: hashedPassword,
      telefono,
    });

    if (!user) {
      throw new Error('Error al guardar el usuario en la base de datos');
    }

    const { contraseña: _, ...userWithoutPassword } = user;

    res.status(201).json({ message: 'Usuario registrado exitosamente', user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
};

exports.login = async (req, res) => {
  const loginUser = new LoginUser(userRepository);
  try {
    const { direccion_Email, contraseña } = req.body;

    if (!direccion_Email || !contraseña) {
      return res.status(400).json({ message: 'El correo electrónico y la contraseña son requeridos' });
    }

    const { user, token } = await loginUser.execute(direccion_Email, contraseña);

    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.status(200).json({ message: 'Inicio de sesión exitoso', user, token });
  } catch (err) {
    res.status(401).json({ message: 'Invalid email or password', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }

    const getUserById = new GetUserById(userRepository);
    const user = await getUserById.execute(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Excluir contraseña
    const { contraseña, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }

    const updateUser = new UpdateUser(userRepository);
    const updatedUser = await updateUser.execute(id, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado exitosamente', updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const getAllUsers = new GetAllUsers(userRepository);
    const users = await getAllUsers.execute();

    // Excluir contraseñas de los resultados
    const sanitizedUsers = users.map(({ contraseña, ...rest }) => rest);

    res.status(200).json(sanitizedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }

    const deleteUser = new DeleteUser(userRepository);
    const result = await deleteUser.execute(id);

    if (!result) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: err.message });
  }
};
