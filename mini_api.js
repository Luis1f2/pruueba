const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const miniApi = express.Router(); // Cambiar de app a Router
const corsOptions = {
  origin: ['http://54.163.130.107:3000', 'http://127.0.0.1:5500', 'https://pillcare.zapto.org/', 'http://localhost:5173/'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

miniApi.use(cors(corsOptions));
miniApi.use(bodyParser.json());

let firstAlertTriggered = false;

// Endpoint POST
miniApi.post('/alerts', (req, res) => {
  const alert = req.body;
  if (!alert || !alert.event) {
    return res.status(400).json({ message: 'Formato de alerta inválido' });
  }
  if (alert.event.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'boton alerta presionado') {
    firstAlertTriggered = true;
  }
  res.status(200).json({ message: 'Alerta almacenada exitosamente' });
});

// Endpoint GET
miniApi.get('/alerts/consume', (req, res) => {
  if (firstAlertTriggered) {
    firstAlertTriggered = false;
    return res.status(200).json({ alert: 1 });
  }
  return res.status(200).json({ alert: 0 });
});

module.exports = miniApi;
