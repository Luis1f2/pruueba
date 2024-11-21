module.exports = (io) => {
    const SendEmergencyAlert = require('../../application/use_cases/SendEmergencyAlert');
    const AlertRepository = require('../../domain/repositories/AlertRepository');
    const UserRepository = require('../../domain/repositories/UserRepository');
  
    const alertRepository = new AlertRepository();
    const userRepository = new UserRepository();
  
    return {
      sendEmergencyAlert: async (req, res) => {
        try {
          const { id_usuario, mensaje_alerta } = req.body;
          const sendEmergencyAlert = new SendEmergencyAlert(alertRepository, userRepository);
  
          const result = await sendEmergencyAlert.execute(id_usuario, mensaje_alerta);
  
          // Emitir evento a todos los clientes conectados usando Socket.IO
          io.emit('emergency_alert_sent', {
            id_usuario,
            mensaje_alerta: mensaje_alerta || 'El botón de emergencia ha sido presionado.',
            success: result.success,
            message: result.message
          });
  
          res.status(200).json(result);
        } catch (err) {
          res.status(500).json({ message: 'Error al enviar la alerta', error: err.message });
        }
      }
    };
  };
  