const db = require('../../infrastructure/database');

const getAllMessages = async () => {
  try {
    // Consulta SQL para obtener todos los datos
    const query = `SELECT * FROM SensorActivity`;
    const [rows] = await db.execute(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener los mensajes:', error.message);
    throw error; // Lanza el error para que el controlador lo maneje
  }
};

module.exports = { getAllMessages };
