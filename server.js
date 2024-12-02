const fs = require('fs');
const https = require('https');
const cors = require('cors');
const express = require('express');
const cron = require('node-cron');
const { verifyToken } = require('./middleware/auth');
const NotificationRepository = require('./notifications/domain/repositories/NotificationRepository');
const GetPendingNotifications = require('./notifications/application/use_cases/GetPendingNotifications');
const { initIO } = require('./ioInstance'); 


const corsOptions = {
  origin: ['http://localhost:8083', 'http://localhost:5173','http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};



const authRoutes = require('./user/infrastructure/routes/authRoutes');
const patientRoutes = require('./patient/infrastructure/routes/patientRoutes');
const medicineRoutes = require('./medicine/infrastructure/routes/medicineRoutes');
const notificationsRoutes = require('./notifications/infrastructure/routes/notificationRoutes');
const alertRoutes = require('./alert/infrastructure/routes/alertRoutes');
const statisticsRoutes = require('./statistics/infrastructure/routes/statisticsRoutes');
const sensorRoutes = require('./sensor/infrastructure/routes/sensorRoutes')
const miniApiRoutes = require('./mini_api')

const app = express();
app.use(cors(corsOptions));
app.use(express.json());


const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:5173','http://127.0.0.1:5500'],  
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,  
  }
});




app.use('/auth', authRoutes);
app.use('/patients',patientRoutes);
app.use('/medicines',medicineRoutes);
app.use('/alerts', alertRoutes); 
app.use('/notification',notificationsRoutes);
app.use('/statistics', statisticsRoutes);
app.use('/sensor',sensorRoutes)
app.use('/mini-api', miniApiRoutes);
const notificationRepository = new NotificationRepository();


cron.schedule('* * * * *', async () => {
  console.log('Verificando notificaciones y alertas pendientes cada minuto...');

  try {
    // Obtener las notificaciones pendientes
    const getPendingNotifications = new GetPendingNotifications(notificationRepository);
    const pendingNotifications = await getPendingNotifications.execute();

    const now = new Date();

    pendingNotifications.forEach(async (notification) => {
      const notificationTime = new Date(notification.fecha_notificacion);

      // Verificar si la hora actual es igual o posterior a la hora de la notificación
      if (now >= notificationTime && notification.estado === 'pendiente') {
        const room = `paciente_${notification.id_paciente}`;
        console.log(`Enviando notificación al paciente ${notification.id_paciente}: ${notification.mensaje}`);

        console.log(`Enviando notificación al paciente ${id_paciente}`);
        console.log(`Medicamento ID: ${id_medicamento}`);
        console.log(`Mensaje: ${mensaje}`);

        // Emitir la notificación al paciente a través de sockets
        io.to(room).emit('notification', {
          mensaje: notification.mensaje,
          id_paciente: notification.id_paciente,
          id_medicamento: notification.id_medicamento,
          fecha_notificacion: notification.fecha_notificacion,
        });

        // Marcar la notificación como completada
        await notificationRepository.markAsCompleted(notification.id_medicamento);

        // Registrar la adherencia si no se ha confirmado en el tiempo establecido
        setTimeout(async () => {
          // Verificar si el paciente ya ha confirmado la toma
          const confirmacion = await checkPacienteConfirmacion(notification.id_paciente, notification.id_medicamento);
          
          if (!confirmacion) {
            // Si no se confirmó la toma, marcar como no tomada a tiempo
            await statisticsRepository.addRegister({
              id_paciente: notification.id_paciente,
              id_medicamento: notification.id_medicamento,
              a_tiempo: false,  // No tomada a tiempo
              fecha_toma: new Date(),
            });
            console.log(`Medicamento ${notification.id_medicamento} no tomado a tiempo por el paciente ${notification.id_paciente}`);
          }
        }, 60000);  // Espera 1 minuto antes de marcar la toma como no registrada

      }
    });
  } catch (error) {
    console.error('Error al verificar notificaciones y adherencia:', error.message);
  }
});



const PORT = process.env.PORT || 8083;
server.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
