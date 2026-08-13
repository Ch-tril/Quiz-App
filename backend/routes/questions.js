// Questions Routes

const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  validateCreateQuestion,
  handleValidationErrors
} = require('../middleware/validation');

/**
 * GET /questions
 * Get all active questions (with pagination and filtering)
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, difficulty, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }

    // Get questions
    const questions = await Question.find(filter)
      .select('-explanation -createdBy -__v')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get total count
    const total = await Question.countDocuments(filter);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

/**
 * GET /questions/:id
 * Get single question with explanation
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid question ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching question'
    });
  }
});

/**
 * POST /questions
 * Create new question (admin only)
 */
router.post('/', authMiddleware, adminMiddleware, validateCreateQuestion, handleValidationErrors, async (req, res) => {
  try {
    const { question, category, difficulty, options, answerIndex, explanation, tags } = req.body;

    // Get next ID
    const lastQuestion = await Question.findOne().sort({ id: -1 });
    const nextId = lastQuestion ? lastQuestion.id + 1 : 1;

    const newQuestion = new Question({
      id: nextId,
      question,
      category,
      difficulty: difficulty || 'medium',
      options: options.map((opt, idx) => ({
        label: String.fromCharCode(65 + idx),
        text: opt.text || opt
      })),
      answerIndex,
      explanation: explanation || '',
      tags: tags || [],
      createdBy: req.user.id
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: newQuestion
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
});

/**
 * PUT /questions/:id
 * Update question (admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, category, difficulty, options, answerIndex, explanation, isActive } = req.body;

    const updateData = {};
    if (question) updateData.question = question;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (options) {
      updateData.options = options.map((opt, idx) => ({
        label: String.fromCharCode(65 + idx),
        text: opt.text || opt
      }));
    }
    if (answerIndex !== undefined) updateData.answerIndex = answerIndex;
    if (explanation) updateData.explanation = explanation;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
});

/**
 * DELETE /questions/:id
 * Delete question (admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting question'
    });
  }
});

/**
 * GET /questions/stats/overview
 * Get questions statistics (admin only)
 */
router.get('/stats/overview', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgCorrectPercentage: { $avg: '$correctAnswerPercentage' }
        }
      }
    ]);

    const total = await Question.countDocuments();
    const active = await Question.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        total,
        active,
        byCategory: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
});

module.exports = router;
