// Score Model - Quiz attempt results

const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },

  username: {
    type: String,
    required: true,
    index: true
  },

  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: -20,
    max: 20
  },

  totalQuestions: {
    type: Number,
    required: true,
    default: 20
  },

  correctAnswers: {
    type: Number,
    required: true,
    default: 0
  },

  wrongAnswers: {
    type: Number,
    required: true,
    default: 0
  },

  timedOutQuestions: {
    type: Number,
    required: true,
    default: 0
  },

  accuracy: {
    type: Number,
    required: true,
    default: 0
  },

  timeSpent: {
    type: Number, // in seconds
    default: 0
  },

  category: {
    type: String,
    enum: ['all', 'web-development', 'dns', 'networking'],
    default: 'all'
  },

  difficulty: {
    type: String,
    enum: ['all', 'easy', 'medium', 'hard'],
    default: 'all'
  },

  answers: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      selectedOptionIndex: Number,
      isCorrect: Boolean,
      timeTaken: Number // seconds
    }
  ],

  isPerfect: {
    type: Boolean,
    default: false
  },

  isPersonalBest: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
scoreSchema.index({ userId: 1, createdAt: -1 });
scoreSchema.index({ score: -1, createdAt: -1 }); // For leaderboard
scoreSchema.index({ username: 1, createdAt: -1 });

// Calculate accuracy before saving
scoreSchema.pre('save', function(next) {
  if (this.totalQuestions > 0) {
    this.accuracy = (this.correctAnswers / this.totalQuestions) * 100;
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Score', scoreSchema);
