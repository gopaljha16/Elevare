const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');
const learningRoutes = require('./routes/learning');
const dashboardRoutes = require('./routes/dashboard');
const coverLetterRoutes = require('./routes/coverLetter');
const { errorHandler } = require('./middleware/errorHandler');

// load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT_NO || 5000;

// connect to mongodb and redis
connectDB();
connectRedis();

// security middleware
app.use(helmet());

// rate limiting (environment-based)
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 100, // Development: 200 requests, Production: 100 requests
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// cors configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// health check route
app.get('/health', async (req, res) => {
  const { safeRedisUtils } = require('./middleware/redis');

  // Check Redis health
  let redisStatus = 'disconnected';
  try {
    await safeRedisUtils.setUserSession('health-check', { test: true }, 1);
    await safeRedisUtils.deleteUserSession('health-check');
    redisStatus = 'connected';
  } catch (error) {
    redisStatus = 'error';
  }

  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected', // Assuming MongoDB is connected if server is running
      redis: redisStatus
    }
  });
});

// api routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cover-letters', coverLetterRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// error handling middleware (must be last)
app.use(errorHandler);

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

