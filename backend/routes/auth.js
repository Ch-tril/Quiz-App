// Authentication Routes

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || ''
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLoginAt = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

/**
 * POST /auth/verify
 * Verify JWT token and return user info
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account inactive'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying token'
    });
  }
});

/**
 * POST /auth/refresh-token
 * Refresh expired JWT token
 */
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account inactive'
      });
    }

    // Generate new token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (client-side mainly, server can invalidate if needed)
 */
router.post('/logout', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
