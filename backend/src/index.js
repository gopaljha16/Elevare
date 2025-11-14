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
const subscriptionRoutes = require('./routes/subscription');
const webhookRoutes = require('./routes/webhooks');
const cronService = require('./services/cronService');
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
connectRedis().catch(err => {
  console.error('Redis connection failed, continuing with mock client:', err.message);
});

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

// Enhanced CORS Configuration Logging
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║              🔒 CORS CONFIGURATION DETAILS                     ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('\n📋 Environment Information:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${PORT}`);
console.log(`   FRONTEND_URL env var: ${process.env.FRONTEND_URL || '❌ NOT SET'}`);
console.log('\n🌐 Allowed Origins (${allowedOrigins.length} total):');
allowedOrigins.forEach((origin, index) => {
  const source = origin === process.env.FRONTEND_URL ? '(from FRONTEND_URL env)' : '(hardcoded)';
  console.log(`   ${index + 1}. ${origin} ${source}`);
});
console.log('\n⚙️  CORS Settings:');
console.log('   ✓ Credentials: Enabled (cookies & auth headers allowed)');
console.log('   ✓ Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
console.log('   ✓ Headers: Content-Type, Authorization, X-Requested-With');
console.log('\n💡 CORS Behavior:');
console.log('   • Requests with no origin (server-to-server) → ALLOWED');
console.log('   • Requests from allowed origins → ALLOWED');
console.log('   • Requests from other origins → BLOCKED');
console.log('   • All CORS decisions will be logged below');
console.log('\n════════════════════════════════════════════════════════════════\n');

// CORS request counter for debugging
let corsRequestCount = 0;

app.use(cors({
  origin: (origin, callback) => {
    corsRequestCount++;
    const timestamp = new Date().toISOString();
    const requestId = `CORS-${corsRequestCount}`;

    console.log(`\n[${timestamp}] [${requestId}] 🔍 CORS Request Check`);
    console.log(`   Origin Header: ${origin || '(no origin header)'}`);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`   Decision: ✅ ALLOWED (no origin - server-to-server or tool)`);
      console.log(`   ────────────────────────────────────────────────────────────`);
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      console.log(`   Decision: ✅ ALLOWED`);
      console.log(`   Matched: ${origin}`);
      console.log(`   ────────────────────────────────────────────────────────────`);
      callback(null, true);
    } else {
      console.log(`   Decision: ❌ BLOCKED`);
      console.log(`   Reason: Origin not in allowed list`);
      console.log(`   \n   📋 Allowed Origins:`);
      allowedOrigins.forEach((allowed, idx) => {
        console.log(`      ${idx + 1}. ${allowed}`);
      });
      console.log(`   \n   💡 Fix: Add "${origin}" to FRONTEND_URL environment variable`);
      console.log(`          or update allowedOrigins array in backend/src/index.js`);
      console.log(`   ────────────────────────────────────────────────────────────`);
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

// Enhanced request logging middleware for debugging production issues
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin || req.headers.referer || 'no-origin';

  // Log all incoming requests with origin information
  if (req.method === 'OPTIONS') {
    console.log(`\n[${timestamp}] 🔄 PREFLIGHT REQUEST`);
    console.log(`   Method: OPTIONS (CORS preflight)`);
    console.log(`   Path: ${req.path}`);
    console.log(`   Origin: ${origin}`);
    console.log(`   Access-Control-Request-Method: ${req.headers['access-control-request-method'] || 'not specified'}`);
    console.log(`   Access-Control-Request-Headers: ${req.headers['access-control-request-headers'] || 'not specified'}`);
  } else if (req.path.startsWith('/api/auth')) {
    console.log(`\n[${timestamp}] 🔐 AUTH REQUEST`);
    console.log(`   Method: ${req.method}`);
    console.log(`   Path: ${req.path}`);
    console.log(`   Origin: ${origin}`);
    console.log(`   Content-Type: ${req.headers['content-type'] || 'not specified'}`);
    console.log(`   Authorization: ${req.headers.authorization ? 'Present' : 'Not present'}`);
  }

  next();
});

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
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);

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
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  🚀 SERVER STARTED SUCCESSFULLY                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('📡 Server Information:');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health Check: http://localhost:${PORT}/health`);

  // Initialize cron jobs
  if (process.env.NODE_ENV === 'production') {
    cronService.init();
  }

  console.log('\n🌐 URL Configuration:');
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL || '❌ NOT SET (using fallback: http://localhost:5173)'}`);
  console.log(`   Backend URL: http://localhost:${PORT}`);

  console.log('\n🔐 Authentication Configuration:');
  console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`   Google OAuth Client ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`   Google OAuth Secret: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ NOT SET'}`);

  console.log('\n💾 Database Configuration:');
  console.log(`   MongoDB: ${process.env.DATABASE_URL ? '✅ Connected' : '❌ NOT SET'}`);
  console.log(`   Redis: ${process.env.REDIS_HOST ? '✅ Configured' : '❌ NOT SET'}`);

  console.log('\n🤖 AI Configuration:');
  console.log(`   Gemini API Keys: ${process.env.GEMINI_API_KEYS ? '✅ Set' : '❌ NOT SET'}`);
  console.log(`   Gemini Model: ${process.env.GEMINI_MODEL || 'gemini-1.5-pro'}`);

  console.log('\n📸 Media Configuration:');
  console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ NOT SET'}`);

  console.log('\n💳 Payment Configuration:');
  console.log(`   Razorpay: ${process.env.RAZORPAY_KEY ? '✅ Configured' : '❌ NOT SET'}`);

  console.log('\n⚠️  Critical Warnings:');
  if (!process.env.FRONTEND_URL) {
    console.log('   ⚠️  FRONTEND_URL not set - CORS may fail in production!');
  }
  if (!process.env.JWT_SECRET) {
    console.log('   ⚠️  JWT_SECRET not set - authentication will fail!');
  }
  if (!process.env.DATABASE_URL) {
    console.log('   ⚠️  DATABASE_URL not set - database operations will fail!');
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('✅ Server is ready to accept requests');
  console.log('📝 All CORS requests will be logged above');
  console.log('════════════════════════════════════════════════════════════════\n');
});