// load environment variables first
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const aiConfig = require('./config/aiConfig');
const { requestMonitoring, errorMonitoring, healthCheck, metricsEndpoint } = require('./middleware/monitoring');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const interviewRoutes = require('./routes/interview');
const learningRoutes = require('./routes/learning');
const learningPathRoutes = require('./routes/learningPath');
const dashboardRoutes = require('./routes/dashboard');
const coverLetterRoutes = require('./routes/coverLetter');
const atsRoutes = require('./routes/ats');
const chatRoutes = require('./routes/chat');
const portfolioRoutes = require('./routes/portfolio');
const resumeRoutes = require('./routes/resume');
const analyticsRoutes = require('./routes/analytics');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const {
  performanceMonitoring,
  responseCompression,
  memoryMonitoring,
  requestSizeLimiting
} = require('./middleware/performance');
const {
  validateAPIKeys,
  trackAPIUsage,
  validateEnvironment,
  securityMonitoring
} = require('./middleware/apiKeyValidation');



const app = express();
const PORT = process.env.PORT_NO || 5000;

// validate environment variables first
const { validateEnvironment: validateEnvVars } = require('./utils/envValidator');
console.log('\n=== Environment Validation ===');
const envValidation = validateEnvVars();
console.log('==============================\n');

// validate ai configuration
console.log('🔧 Validating AI configuration...');
try {
  aiConfig.validateConfiguration();
} catch (error) {
  console.error('❌ AI configuration validation failed:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// connect to mongodb and redis
connectDB();
connectRedis();

// security middleware
app.use(helmet());
app.use(validateEnvironment);
app.use(validateAPIKeys);
app.use(securityMonitoring);
app.use(trackAPIUsage);

// performance middleware
app.use(performanceMonitoring);
app.use(responseCompression);
app.use(memoryMonitoring);
app.use(requestSizeLimiting('10mb'));

// rate limiting (environment-based)
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 100, // Development: 200 requests, Production: 100 requests
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// cors configuration - allow both localhost and production URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://elevare-seven.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('\n=== CORS Configuration ===');
console.log('🔒 Allowed Origins:');
allowedOrigins.forEach((origin, index) => {
  console.log(`   ${index + 1}. ${origin}`);
});
console.log('   Credentials: Enabled');
console.log('   Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
console.log('   Headers: Content-Type, Authorization, X-Requested-With');
console.log('==========================\n');

app.use(cors({
  origin: (origin, callback) => {
    const timestamp = new Date().toISOString();
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`[${timestamp}] [CORS] ✅ Allowing request with no origin (server-to-server or tool)`);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`[${timestamp}] [CORS] ✅ ALLOWED - Origin: ${origin}`);
      callback(null, true);
    } else {
      console.log(`[${timestamp}] [CORS] ❌ BLOCKED - Origin: ${origin}`);
      console.log(`[${timestamp}] [CORS]    Allowed origins:`, allowedOrigins);
      console.log(`[${timestamp}] [CORS]    💡 Add this origin to FRONTEND_URL or allowedOrigins array`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// passport middleware
app.use(passport.initialize());

// monitoring middleware
app.use(requestMonitoring);

// health check and metrics routes
app.get('/health', healthCheck);
app.get('/metrics', metricsEndpoint);

// api routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cover-letters', coverLetterRoutes);
app.use('/api/ats', atsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analytics', analyticsRoutes);

// seed route (development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/api/seed/learning-paths', async (req, res) => {
    const { seedLearningPaths } = require('./utils/seedLearningPaths');
    const result = await seedLearningPaths();
    res.json(result);
  });
}

// 404 handler for unmatched routes
app.use(notFoundHandler);

// error monitoring and logging middleware
app.use(errorMonitoring);

// error handling middleware (must be last)
app.use(errorHandler);

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

