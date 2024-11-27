const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Crear el router
const miniApi = express.Router();

// Configuración de CORS
const corsOptions = {
  origin: [
    'http://54.163.130.107:3000',
    'http://127.0.0.1:5500',
    'https://pillcare.zapto.org/',
    'http://localhost:5173/',
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

// Aplicar middlewares al router
miniApi.use(cors(corsOptions));
miniApi.use(bodyParser.json());

// Variable en memoria para rastrear el estado
let firstAlertTriggered = false;

// Endpoint POST para recibir alertas
miniApi.post('/alerts', (req, res) => {
  const alert = req.body;

  // Validar formato de la alerta
  if (!alert || !alert.event) {
    console.log('POST /alerts -> Formato de alerta inválido:', req.body);
    return res.status(400).json({ message: 'Formato de alerta inválido' });
  }

  console.log('POST /alerts -> Recibido:', alert);

  // Normalizar y comparar el evento
  const processedEvent = alert.event
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (processedEvent === 'boton alerta presionado') {
    console.log('POST /alerts -> Evento "botón alerta presionado" detectado.');
    firstAlertTriggered = true; // Actualizar el estado
  }

  res.status(200).json({ message: 'Alerta almacenada exitosamente' });
});

// Endpoint GET para consumir el estado
miniApi.get('/alerts/consume', (req, res) => {
  console.log('GET /alerts/consume -> Estado de firstAlertTriggered:', firstAlertTriggered);

  if (firstAlertTriggered) {
    console.log('GET /alerts/consume -> Enviando alert: 1');
    firstAlertTriggered = false; // Resetear después de consumir
    return res.status(200).json({ alert: 1 });
  }

  console.log('GET /alerts/consume -> Enviando alert: 0');
  return res.status(200).json({ alert: 0 });
});

// Exportar el router para usarlo en la aplicación principal
module.exports = miniApi;
