// Authentication Middleware

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token
 * Checks if user is authenticated
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Middleware to check if user is admin
 * Must be used after authMiddleware
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'NOT_AUTHENTICATED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.',
      code: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 * Used for routes like /users/:id
 */
const ownershipMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'NOT_AUTHENTICATED'
    });
  }

  // Admin can access anything
  if (req.user.role === 'admin') {
    return next();
  }

  // User can only access their own data
  if (req.user.id !== req.params.id) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
      code: 'FORBIDDEN'
    });
  }

  next();
};

/**
 * Middleware to handle errors
 */
const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different value.`,
      code: 'DUPLICATE_FIELD'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  ownershipMiddleware,
  errorMiddleware
};
