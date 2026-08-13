# Backend Build Guide - Quiz Application API

## Project Structure

```
backend/
├── server.js                   # Main server entry point
├── package.json               # Dependencies and scripts
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
│
├── models/                    # Database schemas
│   ├── User.js               # User account model
│   ├── Question.js           # Quiz questions model
│   └── Score.js              # Quiz results model
│
├── routes/                    # API endpoints
│   ├── auth.js               # Authentication routes
│   ├── questions.js          # Questions CRUD routes
│   ├── scores.js             # Score submission & leaderboard
│   └── users.js              # User profile routes
│
└── middleware/                # Express middleware
    ├── auth.js               # JWT verification & roles
    └── validation.js         # Input validation rules
```

## File Organization

### 1. `package.json` - Dependencies
- **Express.js**: Web framework
- **Mongoose**: MongoDB ORM
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Validation**: Input validation
- **Security**: Helmet, CORS, rate limiting

### 2. `.env.example` - Configuration Template
Copy this file to `.env` and set your values:
```bash
cp .env.example .env
```

### 3. Database Models

#### **User Model** (`models/User.js`)
Stores user accounts with:
- Authentication (username, email, password)
- Profile info (firstName, lastName, bio)
- Statistics (scores, accuracy, etc.)
- Preferences (theme, notifications)
- Timestamps (createdAt, updatedAt, lastLoginAt)

#### **Question Model** (`models/Question.js`)
Stores quiz questions with:
- Question text and options (A, B, C, D)
- Category (web-dev, DNS, etc.)
- Difficulty level
- Answer key
- Explanation
- Usage statistics

#### **Score Model** (`models/Score.js`)
Records quiz attempts with:
- User and score data
- Question-by-question answers
- Timing information
- Accuracy calculations
- Leaderboard info

### 4. Middleware

#### **Authentication** (`middleware/auth.js`)
- `authMiddleware`: Verify JWT token
- `adminMiddleware`: Check admin role
- `ownershipMiddleware`: Check resource ownership
- `errorMiddleware`: Global error handler

#### **Validation** (`middleware/validation.js`)
- `validateRegister`: New user validation
- `validateLogin`: Login credentials
- `validateCreateQuestion`: Admin question creation
- `validateSubmitScore`: Score submission
- `handleValidationErrors`: Error formatting

### 5. API Routes

#### **Auth Routes** (`routes/auth.js`)
```
POST   /api/auth/register        → Register new user
POST   /api/auth/login           → Login user
POST   /api/auth/verify          → Verify token
POST   /api/auth/refresh-token   → Refresh expired token
POST   /api/auth/logout          → Logout (client cleanup)
```

#### **Questions Routes** (`routes/questions.js`)
```
GET    /api/questions            → Get all questions (paginated, filterable)
GET    /api/questions/:id        → Get single question with explanation
POST   /api/questions            → Create question (admin only)
PUT    /api/questions/:id        → Update question (admin only)
DELETE /api/questions/:id        → Delete question (admin only)
GET    /api/questions/stats/overview → Question statistics (admin)
```

#### **Scores Routes** (`routes/scores.js`)
```
POST   /api/scores               → Submit quiz score
GET    /api/scores/user/:userId  → Get user's score history
GET    /api/scores/leaderboard/global → Global leaderboard
GET    /api/scores/stats/personal    → User's personal stats
GET    /api/scores/:scoreId      → Get specific score details
```

#### **Users Routes** (`routes/users.js`)
```
GET    /api/users/:id            → Get user profile
PUT    /api/users/:id            → Update profile
POST   /api/users/:id/change-password → Change password
GET    /api/users                → Get all users (admin)
PUT    /api/users/:id/role       → Change user role (admin)
PUT    /api/users/:id/deactivate → Deactivate account
DELETE /api/users/:id            → Delete user (admin)
```

### 6. Server Entry Point (`server.js`)
- Express app configuration
- Middleware setup (CORS, security, rate limiting)
- Route registration
- MongoDB connection
- Error handling
- Graceful shutdown

---

## Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (local or Atlas cloud)

### Step 1: Install Dependencies

```bash
# Navigate to backend directory
cd /workspaces/Quiz-App/backend

# Install all dependencies
npm install

# Verify installation
npm list
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
# or
code .env
```

**Key variables to set:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Step 3: MongoDB Setup

#### Option A: Local MongoDB

```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongo
# Type: use quiz-app
# Type: db.createCollection("users")
# Type: exit
```

#### Option B: MongoDB Atlas (Cloud)

1. Create account: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quiz-app
```

### Step 4: Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Expected output:
# ============================================================
# 🚀 Quiz App Backend Server
# ============================================================
# ✅ Server is running on port 5000
# 📍 API URL: http://localhost:5000
# 📚 API Docs: http://localhost:5000/api/docs
# 💊 Health Check: http://localhost:5000/api/health
# 🌍 Environment: development
# ============================================================
```

---

## Testing the API

### Method 1: Using cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Get API documentation
curl http://localhost:5000/api/docs

# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get questions (save token from login response)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/questions
```

### Method 2: Using Postman

1. **Download Postman**: [postman.com](https://www.postman.com/downloads/)
2. **Import Collection**:
   - File → Import
   - Paste this JSON or import from URL
3. **Set Variables**:
   - baseUrl: `http://localhost:5000/api`
   - token: Copied from login response

### Method 3: Using REST Client (VS Code)

Create `test.rest` file:
```http
### Health Check
GET http://localhost:5000/api/health

### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Questions
GET http://localhost:5000/api/questions
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Development Workflow

### Adding New Endpoints

1. **Create Route Handler** in `routes/`
2. **Add Validation** in `middleware/validation.js`
3. **Test with REST client**
4. **Update API documentation** in `server.js`

### Example: Add New Route

**File: `routes/announcements.js`**
```javascript
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  // Implementation
});

module.exports = router;
```

**Update `server.js`:**
```javascript
const announcementRoutes = require('./routes/announcements');
app.use('/api/announcements', announcementRoutes);
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- users.test.js
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

---

## Database Seeding

Create `scripts/seedData.js` for initial data:

```javascript
// Add sample questions, admin user, etc.
// Run with: npm run seed
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check MONGODB_URI in .env, ensure MongoDB is running |
| Port already in use | Change PORT in .env or kill process: `lsof -i :5000` |
| JWT verification fails | Check JWT_SECRET is set and consistent |
| CORS errors | Update CORS_ORIGIN in .env to match frontend URL |
| Validation errors | Check request body format matches schema |

---

## Security Best Practices

✅ **Implemented:**
- Password hashing with bcryptjs
- JWT token authentication
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation
- Role-based access control

✅ **Recommended for Production:**
- Use HTTPS only
- Implement API key rotation
- Add request logging
- Set up monitoring/alerting
- Use environment-specific configs
- Implement database backups
- Add CSRF protection
- Use helmet security headers

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* ... */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* detailed errors */ ],
  "code": "ERROR_CODE"
}
```

---

## Deployment

### Option 1: Heroku

```bash
# Create Heroku account
heroku create quiz-app-backend

# Set environment variables
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 2: Railway

```bash
# Deploy via Railway CLI
railway login
railway link
railway up
```

### Option 3: Render

1. Connect GitHub repository
2. Set environment variables
3. Select Python/Node.js environment
4. Deploy

### Option 4: DigitalOcean

1. Create droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Set up PM2 for process management
5. Configure Nginx reverse proxy

---

## Performance Optimization

### Database Indexes
Already configured for:
- User queries: `email`, `username`
- Question queries: `category`, `difficulty`, `isActive`
- Score queries: `userId`, leaderboard sorting

### Caching Strategies
- Implement Redis for frequently accessed data
- Cache leaderboard results
- Cache question lists

### API Optimization
- Implement pagination (already in place)
- Add request deduplication
- Use gzip compression (helmet does this)

---

## Monitoring & Logging

### Recommended Tools
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring
- **DataDog**: Infrastructure monitoring

### Basic Logging
```javascript
console.log('INFO:', 'User registered');
console.error('ERROR:', 'Database connection failed');
console.warn('WARN:', 'High memory usage');
```

---

## Troubleshooting

### Server won't start
```bash
# Check logs
npm run dev

# Verify dependencies
npm install
npm list

# Check Node version
node --version
```

### Database connection issues
```bash
# Test MongoDB connection
mongo "mongodb://localhost:27017"

# Or for Atlas
mongo "mongodb+srv://user:pass@cluster.mongodb.net/quiz-app"
```

### Port conflicts
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

---

## Next Steps

1. **Implement Frontend Integration**
   - Connect frontend to backend API
   - Handle authentication tokens
   - Display user stats and leaderboard

2. **Add Features**
   - Email verification
   - Password reset
   - Advanced analytics
   - Quiz categories/filters

3. **Testing**
   - Write unit tests
   - Write integration tests
   - Load testing

4. **Deployment**
   - Set up CI/CD pipeline
   - Configure production environment
   - Set up monitoring

---

## Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Happy coding! 🚀**

Backend API is production-ready and fully documented. Ready to connect with the frontend!
