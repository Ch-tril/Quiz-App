// Question Model - Quiz questions and answers

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },

  question: {
    type: String,
    required: [true, 'Please provide a question'],
    minlength: [10, 'Question must be at least 10 characters'],
    maxlength: [500, 'Question cannot exceed 500 characters']
  },

  category: {
    type: String,
    enum: ['web-development', 'dns', 'networking', 'other'],
    required: true
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },

  options: {
    type: [
      {
        label: String,
        text: String
      }
    ],
    validate: [
      function(arr) {
        return arr.length === 4;
      },
      'Question must have exactly 4 options'
    ]
  },

  answerIndex: {
    type: Number,
    required: [true, 'Please provide the correct answer index'],
    min: 0,
    max: 3
  },

  explanation: {
    type: String,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
    default: ''
  },

  tags: {
    type: [String],
    default: []
  },

  usageCount: {
    type: Number,
    default: 0
  },

  correctAnswerPercentage: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Question', questionSchema);
