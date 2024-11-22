const db = require('../../infrastructure/database');

class AlertRepository {
    async save(alert) {
        const query = `INSERT INTO Alertas (id_usuario, mensaje_alerta) VALUES (?, ?)`;
        const values = [alert.id_usuario, alert.mensaje_alerta];
        await db.execute(query, values);
    }
    // Función para manejar el botón de alerta
    async  handleAlertButtonMessage(channel, message) {
    if (!message) return;
  
    const buttonMessage = message.content.toString();
    console.log(`Mensaje del botón de alerta recibido: ${buttonMessage}`);
  
    try {
      // Verificar que el mensaje tenga el formato esperado
      const alertData = JSON.parse(buttonMessage);
      if (alertData.event !== "boton presionado") {
        throw new Error('Evento no válido');
      }
  
      // Crear instancia de la alerta y enviarla
      const sendEmergencyAlert = new SendEmergencyAlert(alertRepository, userRepository);
      const result = await sendEmergencyAlert.execute(alertData.id_usuario, alertData.mensaje_alerta);
  
      console.log('Alerta enviada exitosamente:', result);
      channel.ack(message); // Confirmar mensaje procesado
    } catch (error) {
      console.error('Error procesando el mensaje del botón de alerta:', error.message);
      channel.nack(message, false, false); // No reenviar automáticamente
    }
  }
  

    
}

module.exports = AlertRepository;
