const fs = require('fs');
const https = require('https');
const cors = require('cors');
const express = require('express');
const { Server } = require('socket.io');
const cron = require('node-cron'); 
const NotificationRepository = require('./notifications/domain/repositories/NotificationRepository');
const GetPendingNotifications = require('./notifications/application/use_cases/GetPendingNotifications');

// Configurar CORS
const corsOptions = {
  origin: ['http://localhost:8083', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Importar rutas
const authRoutes = require('./user/infrastructure/routes/authRoutes');
const patientRoutes = require('./patient/infrastructure/routes/patientRoutes');
const medicineRoutes = require('./medicine/infrastructure/routes/medicineRoutes');
const notificationsRoutes = require('./notifications/infrastructure/routes/notificationRoutes');
const alertRoutes = require('./alert/infrastructure/routes/alertRoutes');

// Crear la aplicación de Express
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Crear servidor HTTP
const server = require('http').createServer(app);

// Crear instancia de Socket.IO
const io = new Server(server);

// Usar rutas
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/medicines', medicineRoutes);
app.use('/alert', alertRoutes(io));
app.use('/notification', notificationsRoutes);

// Conectar clientes con Socket.IO
io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  // Emitir mensaje de bienvenida al cliente conectado
  socket.emit('serverMessage', 'Bienvenido, ¿qué es lo que quieres hacer?');

  // Recibir mensajes del cliente
  socket.on('clientMessage', (message) => {
    console.log('Mensaje del cliente:', message);
  });

  // Desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });
});

// Crear instancia del repositorio de notificaciones
const notificationRepository = new NotificationRepository();

// Programar tarea con node-cron para enviar notificaciones automáticamente
cron.schedule('* * * * *', async () => {
  console.log('Verificando notificaciones pendientes cada minuto...');

  try {
    // Obtener notificaciones pendientes
    const getPendingNotifications = new GetPendingNotifications(notificationRepository);
    const pendingNotifications = await getPendingNotifications.execute();

    // Emitir las notificaciones pendientes a los clientes conectados
    pendingNotifications.forEach((notification) => {
      io.emit('notification', {
        id_paciente: notification.id_paciente,
        id_medicamento: notification.id_medicamento,
        mensaje: notification.mensaje,
        fecha_notificacion: notification.fecha_notificacion,
      });

      // Marcar la notificación como completada para evitar reenvíos
      notificationRepository.markAsCompleted(notification.id_medicamento);
    });
  } catch (err) {
    console.error('Error al enviar notificaciones pendientes:', err.message);
  }
});

// Iniciar servidor en el puerto especificado
const PORT = process.env.PORT || 8083;
server.listen(PORT, () => {
  console.log(`Servidor HTTPS activo en https://localhost:${PORT}`);
});
