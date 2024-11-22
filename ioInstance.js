let ioInstance;

function initIO(server) {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: ['http://localhost:8083', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  // Configuración de conexión para los clientes
  ioInstance.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    // Emitir un mensaje inicial
    socket.emit('serverMessage', 'Bienvenido, ¿qué es lo que quieres hacer?');

    // Recibir mensajes desde el cliente
    socket.on('clientMessage', (message) => {
      console.log('Mensaje del cliente:', message);
    });

    // Manejar desconexión del cliente
    socket.on('disconnect', () => {
      console.log('Un cliente se ha desconectado');
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO no ha sido inicializado.');
  }
  return ioInstance;
}

module.exports = { initIO, getIO };
