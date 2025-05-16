const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    console.log('No Authorization header provided');
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    console.log('Invalid token format in Authorization header:', authHeader);
    return res.status(401).json({ message: 'Invalid token format, authorization denied' });
  }

  console.log('Token received:', token);

  try {
    // Ensure JWT_SECRET is loaded
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET missing' });
    }

    console.log('Using JWT_SECRET for verification:', secret);

    const decoded = jwt.verify(token, secret);
    console.log('Decoded token:', decoded);

    if (!decoded.userId) {
      console.log('Token missing userId:', decoded);
      return res.status(401).json({ message: 'Invalid token: userId missing' });
    }

    // Check token expiration manually
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      console.log('Token expired:', { exp: decoded.exp, currentTime });
      return res.status(401).json({ message: 'Token has expired', exp: decoded.exp });
    }

    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired', error: error.message });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is malformed or invalid', error: error.message });
    }
    return res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};