const amqp = require('amqplib');
const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://Luis:Luis@54.237.63.42:5672';
const rfidQueueName = process.env.RFID_QUEUE || 'sensor_data';
const sensorsQueueName = process.env.SENSORS_QUEUE || 'sensores_data';
const notificationButtonQueueName = process.env.NOTIFICATION_BUTTON_QUEUE || 'boton_notificaciones';
const alertButtonQueueName = process.env.ALERT_BUTTON_QUEUE || 'boton_alerta';

const MAX_RETRY_COUNT = 5;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mydatabase',
};

async function insertSensorDataToDB(sensor, status) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const query = 'INSERT INTO SensorActivity (sensor, status) VALUES (?, ?)';
    await connection.execute(query, [sensor, status]);
    console.log(`Datos insertados en la base de datos: Sensor: ${sensor}, Status: ${status}`);
    await connection.end();
  } catch (error) {
    console.error('Error al insertar datos en la base de datos:', error.message);
  }
}

const axiosInstance = axios.create({
  timeout: 5000,
});

async function handleMessageToAPI(channel, message, apiUrl, queueName) {
  if (!message) return;

  let content;
  try {
    content = JSON.parse(message.content.toString());
  } catch (error) {
    console.error(`Error al parsear mensaje de la cola "${queueName}":`, error.message);
    channel.ack(message);
    return;
  }

  console.log(`Mensaje recibido en la cola "${queueName}":`, content);

  const retryCount = message.properties.headers?.['x-retry'] || 0;

  try {
    // Cola sensor_data (RFID)
    if (queueName === 'sensor_data') {
      if (!content.rfid) {
        console.error('El mensaje de sensor_data no contiene un campo "rfid".');
        throw new Error('Mensaje inválido para sensor_data');
      }

      // Ajustamos el contenido al formato requerido por la API
      const formattedContent = {
        id_medicamento_rfid: content.rfid, // Cambiado para cumplir con lo esperado por la API
      };

      const response = await axiosInstance.post('https://back-pillcare.zapto.org/medicines/pending-rfids', formattedContent, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`Respuesta de la API para sensor_data:`, response.data);
      channel.ack(message);
      return;
    }

    // Cola boton_alerta
    if (queueName === 'boton_alerta') {
      const requiredFields = ['id_usuario', 'mensaje', 'fecha_alerta'];
      requiredFields.forEach((field) => {
        if (!content[field]) {
          console.warn(`Campo "${field}" faltante en boton_alerta, asignando valor predeterminado.`);
          content[field] = field === 'fecha_alerta' ? new Date().toISOString() : 0;
        }
      });

      const response = await axiosInstance.post(apiUrl, content, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log(`Respuesta de la API para boton_alerta:`, response.data);
      channel.ack(message);
      return;
    }

    // Cola sensores_data (Base de datos)
    if (queueName === 'sensores_data') {
      const { sensor, status } = content;
      if (!sensor || !status) {
        console.error(`Datos incompletos en sensores_data: ${JSON.stringify(content)}`);
        throw new Error('Mensaje inválido para sensores_data');
      }

      await insertSensorDataToDB(sensor, status);
      channel.ack(message);
      return;
    }

    // Cola boton_notificaciones
    if (!content.id_usuario) {
      content.id_usuario = 0;
    }
    if (!content.mensaje) {
      content.mensaje = `Mensaje desde ${queueName}`;
    }
    if (!content.fecha_alerta) {
      content.fecha_alerta = new Date().toISOString();
    }

    const response = await axiosInstance.post(apiUrl, content, {
      headers: { 'Content-Type': 'application/json' },
    });

    console.log(`Respuesta de la API para ${queueName}:`, response.data);
    channel.ack(message);
  } catch (error) {
    console.error(`Error procesando mensaje de la cola "${queueName}":`, error.message);

    if (retryCount < MAX_RETRY_COUNT) {
      console.warn(`Reintentando mensaje (${retryCount + 1}/${MAX_RETRY_COUNT}) en la cola "${queueName}"`);
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(content)), {
        headers: { 'x-retry': retryCount + 1 },
        persistent: true,
      });
    } else {
      console.warn(`Mensaje descartado tras ${retryCount} intentos fallidos en la cola "${queueName}"`);
      channel.sendToQueue(`${queueName}_dlq`, Buffer.from(JSON.stringify(content)), { persistent: true });
    }

    channel.ack(message);
  }
}


async function connectToRabbitMQ() {
  try {
    console.log('Intentando conectar a RabbitMQ...');
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    console.log('Conexión a RabbitMQ establecida.');

    channel.on('close', () => {
      console.error('Conexión cerrada. Intentando reconectar...');
      setTimeout(connectToRabbitMQ, 5000);
    });

    channel.on('error', (err) => {
      console.error('Error en la conexión de RabbitMQ:', err.message);
      setTimeout(connectToRabbitMQ, 5000);
    });

    await configureQueues(channel);
    startConsumers(channel);
  } catch (error) {
    console.error('Error al conectar con RabbitMQ:', error.message);
    setTimeout(connectToRabbitMQ, 5000);
  }
}

async function configureQueues(channel) {
  await Promise.all([
    channel.assertQueue(rfidQueueName, { durable: true }),
    channel.assertQueue(sensorsQueueName, { durable: true }),
    channel.assertQueue(notificationButtonQueueName, { durable: true }),
    channel.assertQueue(alertButtonQueueName, { durable: true }),
    channel.assertQueue(`${rfidQueueName}_dlq`, { durable: true }),
    channel.assertQueue(`${sensorsQueueName}_dlq`, { durable: true }),
  ]);
}

function startConsumers(channel) {
  channel.prefetch(10);

  channel.consume(notificationButtonQueueName, (message) => {
    handleMessageToAPI(channel, message, 'https://back-pillcare.zapto.org/button-pressed', notificationButtonQueueName);
  });

  channel.consume(alertButtonQueueName, (message) => {
    handleMessageToAPI(channel, message, 'http://localhost:8083/mini-api/alerts', alertButtonQueueName);
  });

  channel.consume(rfidQueueName, (message) => {
    handleMessageToAPI(channel, message, null, rfidQueueName);
  });

  channel.consume(sensorsQueueName, (message) => {
    handleMessageToAPI(channel, message, null, sensorsQueueName);
  });
}

connectToRabbitMQ();
