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
  origin: ['http://localhost:8083', 'http://localhost:5173'],
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

const app = express();
app.use(cors(corsOptions));
app.use(express.json());


const server = require('http').createServer(app);

const io = initIO(server);


app.use('/auth', authRoutes);
app.use('/patients', verifyToken,patientRoutes);
app.use('/medicines', verifyToken,medicineRoutes);
app.use('/alerts', verifyToken,alertRoutes); 
app.use('/notification', verifyToken,notificationsRoutes);
app.use('/statistics', verifyToken,statisticsRoutes);

const notificationRepository = new NotificationRepository();


cron.schedule('* * * * *', async () => {
  console.log('Verificando notificaciones pendientes cada minuto...');

  try {
    const getPendingNotifications = new GetPendingNotifications(notificationRepository);
    const pendingNotifications = await getPendingNotifications.execute();

    pendingNotifications.forEach((notification) => {
        const room = `paciente_${notification.id_paciente}`;
        console.log(`Enviando notificación al paciente ${notification.id_paciente}: ${notification.mensaje}`);

        // Emitir solo a la sala del paciente correspondiente
        io.to(room).emit('notification', {
            id_paciente: notification.id_paciente,
            id_medicamento: notification.id_medicamento,
            mensaje: notification.mensaje,
            fecha_notificacion: notification.fecha_notificacion,
        });

        // Marcar la notificación como completada
        notificationRepository.markAsCompleted(notification.id_medicamento);
    });
} catch (err) {
    console.error('Error al enviar notificaciones pendientes:', err.message);
}
});


const PORT = process.env.PORT || 8083;
server.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
