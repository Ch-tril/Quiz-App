// Scores Routes - Quiz results and leaderboard

const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const {
  validateSubmitScore,
  handleValidationErrors,
  validateObjectId
} = require('../middleware/validation');

/**
 * POST /scores
 * Submit quiz score
 */
router.post('/', authMiddleware, validateSubmitScore, handleValidationErrors, async (req, res) => {
  try {
    const { score, correctAnswers, wrongAnswers, timedOutQuestions, timeSpent, category, difficulty } = req.body;

    const newScore = new Score({
      userId: req.user.id,
      username: req.user.username,
      score,
      correctAnswers,
      wrongAnswers,
      timedOutQuestions,
      timeSpent: timeSpent || 0,
      category: category || 'all',
      difficulty: difficulty || 'all',
      totalQuestions: correctAnswers + wrongAnswers + timedOutQuestions
    });

    // Check if perfect score
    if (score === 20 && correctAnswers === 20) {
      newScore.isPerfect = true;
    }

    await newScore.save();

    // Update user stats
    const user = await User.findById(req.user.id);
    user.stats.totalQuizzesTaken += 1;
    user.stats.totalScore += score;
    user.stats.correctAnswers += correctAnswers;
    user.stats.questionsAnswered += newScore.totalQuestions;
    
    // Update average score
    user.stats.averageScore = user.stats.totalScore / user.stats.totalQuizzesTaken;
    
    // Update accuracy
    if (user.stats.questionsAnswered > 0) {
      user.stats.accuracy = (user.stats.correctAnswers / user.stats.questionsAnswered) * 100;
    }

    // Check for personal best
    if (score > user.stats.highestScore) {
      user.stats.highestScore = score;
      newScore.isPersonalBest = true;
      await newScore.save();
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        score: newScore,
        userStats: user.stats,
        isPerfect: newScore.isPerfect,
        isPersonalBest: newScore.isPersonalBest
      }
    });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting score',
      error: error.message
    });
  }
});

/**
 * GET /scores/user/:userId
 * Get user's score history
 */
router.get('/user/:userId', authMiddleware, validateObjectId, async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const scores = await Score.find({ userId: req.params.userId })
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Score.countDocuments({ userId: req.params.userId });

    res.json({
      success: true,
      data: scores,
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
      message: 'Error fetching scores'
    });
  }
});

/**
 * GET /scores/leaderboard
 * Get global leaderboard
 */
router.get('/leaderboard/global', async (req, res) => {
  try {
    const { page = 1, limit = 50, period = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Calculate date range
    const now = new Date();
    let dateFilter = {};

    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    // Get top scores
    const leaderboard = await Score.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$username',
          userId: { $first: '$userId' },
          highestScore: { $max: '$score' },
          averageScore: { $avg: '$score' },
          totalAttempts: { $sum: 1 },
          perfectScores: {
            $sum: {
              $cond: [{ $eq: ['$score', 20] }, 1, 0]
            }
          }
        }
      },
      { $sort: { highestScore: -1, averageScore: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const total = await Score.distinct('username', dateFilter);

    res.json({
      success: true,
      data: leaderboard.map((entry, idx) => ({
        rank: skip + idx + 1,
        ...entry
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.length,
        pages: Math.ceil(total.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    });
  }
});

/**
 * GET /scores/stats/personal
 * Get user's personal statistics
 */
router.get('/stats/personal', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent scores
    const recentScores = await Score.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get category breakdown
    const categoryStats = await Score.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: '$category',
          avgScore: { $avg: '$score' },
          attempts: { $sum: 1 },
          highestScore: { $max: '$score' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userStats: user.stats,
        recentScores,
        categoryStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching personal statistics'
    });
  }
});

/**
 * GET /scores/:scoreId
 * Get specific score details
 */
router.get('/:scoreId', authMiddleware, async (req, res) => {
  try {
    const score = await Score.findById(req.params.scoreId)
      .populate('userId', 'username email firstName lastName');

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Score not found'
      });
    }

    // Check permission
    if (score.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this score'
      });
    }

    res.json({
      success: true,
      data: score
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching score'
    });
  }
});

module.exports = router;
