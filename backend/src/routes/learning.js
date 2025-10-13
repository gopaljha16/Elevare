const express = require('express');
const {
  getLearningPaths,
  getLearningPath,
  startLearningPath,
  updateSkillProgress,
  getUserLearningProgress,
  getLearningPathProgress,
  getLearningStats,
  getPopularCompanies,
  searchLearningPaths,
  analyzeSkillGaps,
  getPersonalizedRecommendations
} = require('../controllers/learningController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for learning operations
const learningLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many learning operations, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (no authentication required)
router.get('/paths', getLearningPaths);
router.get('/paths/search', searchLearningPaths);
router.get('/paths/:pathId', getLearningPath);
router.get('/companies/popular', getPopularCompanies);

// Protected routes (authentication required)
router.use(authenticate);

// Learning path management
router.post('/paths/:pathId/start', learningLimiter, startLearningPath);
router.put('/paths/:pathId/skills/:skillId/progress', learningLimiter, updateSkillProgress);

// User progress tracking
router.get('/my-progress', getUserLearningProgress);
router.get('/paths/:pathId/progress', getLearningPathProgress);
router.get('/stats', getLearningStats);

// AI-powered features
router.post('/analyze-skill-gaps', learningLimiter, analyzeSkillGaps);
router.get('/recommendations', getPersonalizedRecommendations);

module.exports = router;