// Users Routes - User profiles and management

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware, adminMiddleware, ownershipMiddleware } = require('../middleware/auth');
const {
  validateUpdateProfile,
  validateObjectId,
  handleValidationErrors
} = require('../middleware/validation');

/**
 * GET /users/:id
 * Get user profile
 */
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

/**
 * PUT /users/:id
 * Update user profile
 */
router.put('/:id', authMiddleware, ownershipMiddleware, validateUpdateProfile, handleValidationErrors, async (req, res) => {
  try {
    const { firstName, lastName, bio, theme, notifications } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio) updateData.bio = bio;
    if (theme) updateData['preferences.theme'] = theme;
    if (notifications !== undefined) updateData['preferences.notifications'] = notifications;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

/**
 * POST /users/:id/change-password
 * Change user password
 */
router.post('/:id/change-password', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

/**
 * GET /users
 * Get all users (admin only)
 */
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

/**
 * PUT /users/:id/role
 * Change user role (admin only)
 */
router.put('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

/**
 * PUT /users/:id/deactivate
 * Deactivate user account (admin or self)
 */
router.put('/:id/deactivate', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating account'
    });
  }
});

/**
 * DELETE /users/:id
 * Delete user (admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

module.exports = router;
