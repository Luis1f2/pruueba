const SendEmergencyAlert = require('../../application/use_cases/SendEmergencyAlert');
const AlertRepository = require('../../domain/repositories/AlertRepository');
const UserRepository = require('../../domain/repositories/UserRepository');

const alertRepository = new AlertRepository();
const userRepository = new UserRepository();

exports.sendEmergencyAlert = async (req, res) => {
    try {
        const { id_usuario, mensaje_alerta } = req.body; // ID del usuario y mensaje opcional
        const sendEmergencyAlert = new SendEmergencyAlert(alertRepository, userRepository);

        const result = await sendEmergencyAlert.execute(id_usuario, mensaje_alerta);

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error al enviar la alerta', error: err.message });
    } 
};
