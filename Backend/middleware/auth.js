const jwt = require('jsonwebtoken');
const { User, Publisher } = require('../models');

// Middleware to verify JWT token and attach user/publisher info
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role === 'reader') {
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;
      req.role = 'reader';
    } else if (decoded.role === 'publisher') {
      const publisher = await Publisher.findOne({ email: decoded.email });
      if (!publisher) {
        return res.status(404).json({ message: 'Publisher not found' });
      }
      req.publisher = publisher;
      req.role = 'publisher';
    } else {
      return res.status(401).json({ message: 'Invalid role' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication expired' });
    }
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
};

module.exports = {
  verifyToken
}; 