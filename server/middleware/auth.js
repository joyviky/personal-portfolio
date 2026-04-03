const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Validate JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      const message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid or expired token';
      return res.status(403).json({ message });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
