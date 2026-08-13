// Main Server File

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// =====================================================================
// MIDDLEWARE
// =====================================================================

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// =====================================================================
// ROUTES
// =====================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Quiz API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/verify': 'Verify JWT token',
        'POST /api/auth/refresh-token': 'Refresh expired token',
        'POST /api/auth/logout': 'Logout user'
      },
      questions: {
        'GET /api/questions': 'Get all questions (paginated)',
        'GET /api/questions/:id': 'Get single question',
        'POST /api/questions': 'Create question (admin)',
        'PUT /api/questions/:id': 'Update question (admin)',
        'DELETE /api/questions/:id': 'Delete question (admin)',
        'GET /api/questions/stats/overview': 'Get question stats (admin)'
      },
      scores: {
        'POST /api/scores': 'Submit quiz score',
        'GET /api/scores/user/:userId': 'Get user scores',
        'GET /api/scores/leaderboard/global': 'Get global leaderboard',
        'GET /api/scores/stats/personal': 'Get personal stats',
        'GET /api/scores/:scoreId': 'Get score details'
      },
      users: {
        'GET /api/users/:id': 'Get user profile',
        'PUT /api/users/:id': 'Update profile',
        'POST /api/users/:id/change-password': 'Change password',
        'GET /api/users': 'Get all users (admin)',
        'PUT /api/users/:id/role': 'Change user role (admin)',
        'PUT /api/users/:id/deactivate': 'Deactivate account',
        'DELETE /api/users/:id': 'Delete user (admin)'
      }
    }
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const scoreRoutes = require('./routes/scores');
const userRoutes = require('./routes/users');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
const { errorMiddleware } = require('./middleware/auth');
app.use(errorMiddleware);

// =====================================================================
// DATABASE CONNECTION
// =====================================================================

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// =====================================================================
// SERVER STARTUP
// =====================================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Quiz App Backend Server');
    console.log('='.repeat(60));
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    console.log(`💊 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60) + '\n');
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n📋 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n📋 SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close();
      process.exit(0);
    });
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
};

// Start server if not imported as a module
if (require.main === module) {
  startServer().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
