// Validation Middleware

const { validationResult, body, param } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters')
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for updating profile
 */
const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  body('theme')
    .optional()
    .isIn(['dark', 'light'])
    .withMessage('Theme must be "dark" or "light"')
];

/**
 * Validation rules for creating a question
 */
const validateCreateQuestion = [
  body('question')
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Question must be between 10 and 500 characters'),

  body('category')
    .isIn(['web-development', 'dns', 'networking', 'other'])
    .withMessage('Invalid category'),

  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),

  body('options')
    .isArray({ min: 4, max: 4 })
    .withMessage('Question must have exactly 4 options'),

  body('options.*.text')
    .notEmpty()
    .withMessage('Option text cannot be empty')
    .isLength({ max: 300 })
    .withMessage('Option text cannot exceed 300 characters'),

  body('answerIndex')
    .isInt({ min: 0, max: 3 })
    .withMessage('Answer index must be between 0 and 3'),

  body('explanation')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Explanation cannot exceed 1000 characters')
];

/**
 * Validation rules for submitting quiz results
 */
const validateSubmitScore = [
  body('score')
    .isInt({ min: -20, max: 20 })
    .withMessage('Score must be between -20 and 20'),

  body('correctAnswers')
    .isInt({ min: 0 })
    .withMessage('Correct answers must be a positive number'),

  body('wrongAnswers')
    .isInt({ min: 0 })
    .withMessage('Wrong answers must be a positive number'),

  body('timedOutQuestions')
    .isInt({ min: 0 })
    .withMessage('Timed out questions must be a positive number'),

  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number')
];

/**
 * Validation rules for ID parameter
 */
const validateObjectId = [
  param('id')
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid user ID format')
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateQuestion,
  validateSubmitScore,
  validateObjectId
};
