const fs = require('fs');
const https = require('https');
const cors = require('cors')
const express = require('express');
const { Server } = require('socket.io');

const corsOptions = {
  origin: ['http://localhost:8083', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const authRoutes = require('./user/infrastructure/routes/authRoutes');
const patientRoutes = require('./patient/infrastructure/routes/patientRoutes');
const medicineRoutes = require('./medicine/infrastructure/routes/medicineRoutes');


const app = express();
app.use(cors(corsOptions));
app.use(express.json());


const server = require('http').createServer(app);


const io = new Server(server);


app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/medicines', medicineRoutes);


io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');


  socket.emit('serverMessage', 'Bienvenido, ¿qué es lo que quieres hacer?');

  
  socket.on('clientMessage', (message) => {
    console.log('Mensaje del cliente:', message);
  });

  
  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });
});


const PORT = process.env.PORT || 8083;
server.listen(PORT, () => {
  console.log(`Servidor HTTPS activo en https://localhost:${PORT}`);
});
