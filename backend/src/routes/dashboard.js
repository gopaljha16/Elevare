const express = require('express');
const {
  getDashboardData,
  getWeeklyProgress,
  getAchievements,
  getGoals
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for dashboard operations
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many dashboard requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all routes
router.use(authenticate);

// Dashboard data endpoints
router.get('/overview', dashboardLimiter, getDashboardData);
router.get('/weekly-progress', getWeeklyProgress);
router.get('/achievements', getAchievements);
router.get('/goals', getGoals);

module.exports = router;