const amqp = require('amqplib');
const axios = require('axios');
const mysql = require('mysql2/promise'); // Cliente de MySQL
require('dotenv').config();

// Configuración desde variables de entorno
const rabbitMQUrl = process.env.RABBITMQ_URL || 'amqp://Luis:Luis@54.237.63.42:5672';
const rfidQueueName = process.env.RFID_QUEUE || 'sensor_data'; // Exclusivo para RFID
const sensorsQueueName = process.env.SENSORS_QUEUE || 'sensores_data'; // Nueva cola para otros sensores
const notificationButtonQueueName = process.env.NOTIFICATION_BUTTON_QUEUE || 'boton_notificaciones';
const alertButtonQueueName = process.env.ALERT_BUTTON_QUEUE || 'boton_alerta'; // Cola para el botón de alerta

const MAX_RETRY_COUNT = 5;

// Crear conexión a la base de datos
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

// Crear un cliente Axios con timeout
const axiosInstance = axios.create({
  timeout: 5000, // Tiempo máximo de espera de 5 segundos
});

// Función para manejar mensajes y enviar datos a la API
async function handleMessageToAPI(channel, message, apiUrl, queueName) {
  if (!message) return;

  let content = JSON.parse(message.content.toString());
  console.log(`Mensaje recibido en la cola "${queueName}":`, content);

  const retryCount = (message.properties.headers?.['x-retry'] || 0);

  try {
    // Lógica específica para sensor_data
    if (queueName === 'sensor_data') {
      console.log(`Enviando datos a la API desde la cola "sensor_data":`, content);

      // Enviar datos a la API
      const response = await axiosInstance.post('https://back-pillcare.zapto.org/medicines/pending-rfids', content, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Respuesta de la API para la cola "sensor_data":`, response.data);

      // Confirmar el mensaje después de procesarlo
      channel.ack(message);
      return;
    }

    // Lógica específica para sensores_data
    if (queueName === 'sensores_data') {
      // Extraer datos para insertar en la base de datos
      const { sensor, status } = content;

      // Insertar datos en la base de datos
      await insertSensorDataToDB(sensor, status);

      // Confirmar el mensaje después de procesarlo
      channel.ack(message);
      return;
    }

    // Lógica de transformación para otras colas
    if (!content.id_usuario) {
      content.id_usuario = 0; // Usuario predeterminado
    }
    if (!content.mensaje) {
      content.mensaje = `Mensaje desde ${queueName}`;
    }
    if (!content.fecha_alerta) {
      content.fecha_alerta = new Date().toISOString(); // Fecha actual
    }
    console.log(`Mensaje transformado para la cola "${queueName}":`, content);

    // Enviar datos transformados a la API
    const response = await axiosInstance.post(apiUrl, content, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Respuesta de la API para la cola "${queueName}":`, response.data);

    // Confirmar el mensaje si se procesó correctamente
    channel.ack(message);
  } catch (error) {
    console.error(`Error enviando datos a la API desde la cola "${queueName}":`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Manejo de reintentos
    if (retryCount < MAX_RETRY_COUNT) {
      const newRetryCount = retryCount + 1;
      console.warn(`Reintentando mensaje (${newRetryCount} de ${MAX_RETRY_COUNT}) en la cola "${queueName}"`);
      channel.sendToQueue(queueName, Buffer.from(message.content), {
        headers: { 'x-retry': newRetryCount },
        persistent: true,
      });
    } else {
      console.warn(`Mensaje descartado tras ${retryCount} intentos fallidos en la cola "${queueName}"`);
      channel.sendToQueue(`${queueName}_dlq`, Buffer.from(message.content), { persistent: true });
    }

    channel.ack(message); // Confirmar el mensaje incluso si falla para evitar bloqueo
  }
}

// Función para manejar mensajes y enviar datos a la API
async function handleMessageToAPI(channel, message, apiUrl, queueName) {
  if (!message) return;

  let content = JSON.parse(message.content.toString());
  console.log(`Mensaje recibido en la cola "${queueName}":`, content);

  const retryCount = (message.properties.headers?.['x-retry'] || 0);

  try {
    // Si es la cola "boton_alerta", no transformar el mensaje
    if (queueName === 'boton_alerta') {
      console.log(`Enviando mensaje sin transformación desde la cola "${queueName}":`, content);

      // Enviar datos a la API tal cual
      const response = await axiosInstance.post(apiUrl, content, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`Respuesta de la API para la cola "${queueName}":`, response.data);

      // Confirmar el mensaje si se procesó correctamente
      channel.ack(message);
      return;
    }

    // Lógica específica para sensores_data
    if (queueName === 'sensores_data') {
      // Extraer datos para insertar en la base de datos
      const { sensor, status } = content;

      // Insertar datos en la base de datos
      await insertSensorDataToDB(sensor, status);

      // Confirmar el mensaje después de procesarlo
      channel.ack(message);
      return;
    }

    // Lógica de transformación para otras colas
    if (!content.id_usuario) {
      content.id_usuario = 0; // Usuario predeterminado
    }
    if (!content.mensaje) {
      content.mensaje = `Mensaje desde ${queueName}`;
    }
    if (!content.fecha_alerta) {
      content.fecha_alerta = new Date().toISOString(); // Fecha actual
    }
    console.log(`Mensaje transformado para la cola "${queueName}":`, content);

    // Enviar datos transformados a la API
    const response = await axiosInstance.post(apiUrl, content, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Respuesta de la API para la cola "${queueName}":`, response.data);

    // Confirmar el mensaje si se procesó correctamente
    channel.ack(message);
  } catch (error) {
    console.error(`Error enviando datos a la API desde la cola "${queueName}":`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Manejo de reintentos
    if (retryCount < MAX_RETRY_COUNT) {
      const newRetryCount = retryCount + 1;
      console.warn(`Reintentando mensaje (${newRetryCount} de ${MAX_RETRY_COUNT}) en la cola "${queueName}"`);
      channel.sendToQueue(queueName, Buffer.from(message.content), {
        headers: { 'x-retry': newRetryCount },
        persistent: true,
      });
    } else {
      console.warn(`Mensaje descartado tras ${retryCount} intentos fallidos en la cola "${queueName}"`);
      channel.sendToQueue(`${queueName}_dlq`, Buffer.from(message.content), { persistent: true });
    }

    channel.ack(message); // Confirmar el mensaje incluso si falla para evitar bloqueo
  }
}

// Consumir mensajes de RabbitMQ
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

    // Configuración de colas
    await configureQueues(channel);

    // Consumir mensajes
    startConsumers(channel);
  } catch (error) {
    console.error('Error al conectar con RabbitMQ:', error.message);
    setTimeout(connectToRabbitMQ, 5000);
  }
}

function configureQueues(channel) {
  return Promise.all([
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

  // Consumir mensajes para las colas que envían a la API
  channel.consume(notificationButtonQueueName, (message) => {
    handleMessageToAPI(channel, message, 'https://back-pillcare.zapto.org/button-pressed', notificationButtonQueueName);
  }, { noAck: false });

  channel.consume(alertButtonQueueName, (message) => {
    handleMessageToAPI(channel, message, 'http://localhost:8083/mini-api/alerts', alertButtonQueueName);
  }, { noAck: false });

  channel.consume(rfidQueueName, (message) => {
    handleMessageToAPI(channel, message, 'https://back-pillcare.zapto.org/medicines/pending-rfids', rfidQueueName);
  }, { noAck: false });

  // Consumir mensajes de la cola sensores_data y almacenar en la base de datos
  channel.consume(sensorsQueueName, (message) => {
    handleMessageToAPI(channel, message, null, sensorsQueueName); // No se envía a una API, solo a la base de datos
  }, { noAck: false });
}

connectToRabbitMQ();
