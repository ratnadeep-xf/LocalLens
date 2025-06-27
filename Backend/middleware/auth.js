const jwt = require('jsonwebtoken');
const { User, Publisher } = require('../models');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
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
      return res.status(401).json({ message: 'Invalid token role' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(500).json({ message: 'Error verifying token', error: error.message });
  }
};

// Middleware to check if user is authenticated
const isUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'reader') {
      return res.status(403).json({ message: 'Access denied. Users only.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    req.role = 'reader';
    next();
  } catch (error) {
    console.error('User authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(500).json({ message: 'Error checking user authentication', error: error.message });
  }
};

// Middleware to check if publisher is authenticated
const isPublisher = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'publisher') {
      return res.status(403).json({ message: 'Access denied. Publishers only.' });
    }

    const publisher = await Publisher.findOne({ email: decoded.email });
    if (!publisher) {
      return res.status(404).json({ message: 'Publisher not found' });
    }

    req.publisher = publisher;
    req.role = 'publisher';
    next();
  } catch (error) {
    console.error('Publisher authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(500).json({ message: 'Error checking publisher authentication', error: error.message });
  }
};

module.exports = {
  verifyToken,
  isUser,
  isPublisher
}; 