
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { verifyToken } = require('../authMiddleware');

router.get('/users', verifyToken,authController.getAllUsers);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/update/:id', verifyToken,authController.update);
router.get('/user/:id', verifyToken,authController.getUserById);
router.delete('/delete/:id', verifyToken,authController.delete);
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await userRepository.findById(req.userId); 
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Perfil del usuario autenticado', user });
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el perfil del usuario', error: err.message });
    }
});

module.exports = router;
