const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'your_secret_key');
    req.userId = decoded.id; // Agregar el ID del usuario al request
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};
