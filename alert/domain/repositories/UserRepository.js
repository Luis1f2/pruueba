const db = require('../../infrastructure/database');

class UserRepository {
  async save(user) {
    const query = `
      INSERT INTO Usuario (nombre, año_nacimiento, direccion_Email, contraseña, numero_telefono) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      user.nombre,
      user.año_nacimiento,
      user.direccion_Email,
      user.contraseña,
      user.telefono
    ];

    const [result] = await db.execute(query, values);
    if (!result.insertId) {
      throw new Error('Error al guardar el usuario');
    }

    user.id_usuario = result.insertId; // Cambié a `id_usuario` para coincidir con la base de datos
    return user;
  }

  async findByEmail(email) {
    if (!email) {
      throw new Error('El correo electrónico es obligatorio');
    }

    const query = `SELECT * FROM Usuario WHERE direccion_Email = ?`;
    const [rows] = await db.execute(query, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  async findById(id) {
    if (!id) {
      throw new Error('El ID es obligatorio');
    }

    const query = `SELECT * FROM Usuario WHERE id_usuario = ?`;
    const [rows] = await db.execute(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  async update(id, data) {
    if (!id) {
      throw new Error('El ID es obligatorio para actualizar');
    }

    const query = `
      UPDATE Usuario
      SET 
        nombre = ?, 
        año_nacimiento = ?, 
        direccion_Email = ?, 
        contraseña = ?, 
        numero_telefono = ?
      WHERE id_usuario = ?
    `;
    const values = [
      data.nombre || null,
      data.año_nacimiento || null,
      data.direccion_Email || null,
      data.contraseña || null,
      data.numero_telefono || null,
      id
    ];

    const [result] = await db.execute(query, values);
    if (result.affectedRows === 0) {
      throw new Error('No se pudo actualizar el usuario. ID no encontrado.');
    }

    return await this.findById(id); // Retornar el usuario actualizado
  }

  async findAll() {
    const query = `SELECT * FROM Usuario`;
    const [rows] = await db.execute(query);
    return rows;
  }

  async delete(id) {
    if (!id) {
      throw new Error('El ID es obligatorio para eliminar');
    }

    const query = `DELETE FROM Usuario WHERE id_usuario = ?`;
    const [result] = await db.execute(query, [id]);

    if (result.affectedRows === 0) {
      throw new Error('No se encontró el usuario para eliminar');
    }

    return { message: 'Usuario eliminado exitosamente', id };
  }
}

module.exports = UserRepository;
