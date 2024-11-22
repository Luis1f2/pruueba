const fs = require('fs');
const https = require('https');
const cors = require('cors');
const express = require('express');
const cron = require('node-cron');
const NotificationRepository = require('./notifications/domain/repositories/NotificationRepository');
const GetPendingNotifications = require('./notifications/application/use_cases/GetPendingNotifications');
const { initIO } = require('./ioInstance'); // Importar la inicialización de Socket.IO

// Configurar CORS
const corsOptions = {
  origin: ['http://localhost:8083', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Importar rutas
const authRoutes = require('./user/infrastructure/routes/authRoutes');
const patientRoutes = require('./patient/infrastructure/routes/patientRoutes');
const medicineRoutes = require('./medicine/infrastructure/routes/medicineRoutes');
const notificationsRoutes = require('./notifications/infrastructure/routes/notificationRoutes');
const alertRoutes = require('./alert/infrastructure/routes/alertRoutes');
const statisticsRoutes = require('./statistics/infrastructure/routes/statisticsRoutes');

// Crear la aplicación de Express
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Crear servidor HTTP
const server = require('http').createServer(app);

// Inicializar Socket.IO
const io = initIO(server);

// Usar rutas
app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/medicines', medicineRoutes);
app.use('/alert', alertRoutes(io)); // Aquí pasamos `io` solo si es necesario
app.use('/notification', notificationsRoutes);
app.use('/statistics', statisticsRoutes);

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
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
