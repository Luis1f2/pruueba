const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Crear el router
const miniApi = express.Router();



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
