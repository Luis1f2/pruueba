const sensorRepository = require('../../domain/repositories/sensorRepository');

exports.getSensorMessages = async (req, res) => {
  try {
    const messages = await sensorRepository.getAllMessages();
    if (!messages || messages.length === 0) {
      return res.status(404).json({ message: 'No se encontraron mensajes de sensores.' });
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error al obtener los mensajes de sensores:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
