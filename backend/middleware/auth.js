const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Server error during authentication.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

const checkOwnership = (resourceField = 'student') => {
  return (req, res, next) => {
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Teachers can access their assigned students/classes
    if (req.user.role === 'teacher') {
      // Additional logic for teacher permissions can be added here
      return next();
    }

    // Students can only access their own data
    if (req.user.role === 'student') {
      if (req.params.id && req.params.id !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied. You can only access your own data.' });
      }
    }

    // Parents can only access their children's data
    if (req.user.role === 'parent') {
      // Additional logic for parent permissions can be added here
      return next();
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  checkOwnership
};
