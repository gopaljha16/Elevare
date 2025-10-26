const express = require('express');
const {
  startInterviewSession,
  getCurrentQuestion,
  submitAnswer,
  getInterviewSession,
  getUserInterviewSessions,
  getInterviewStats,
  getQuestionMetadata
} = require('../controllers/interviewController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for interview operations
const interviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  message: {
    success: false,
    message: 'Too many interview operations, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply authentication to all routes
router.use(authenticate);

// Interview session management
router.post('/start', interviewLimiter, startInterviewSession);
router.post('/:sessionId/answer', submitAnswer);
router.get('/sessions', getUserInterviewSessions);
router.get('/sessions/:sessionId', getInterviewSession);
router.get('/sessions/:sessionId/current-question', getCurrentQuestion);

// Interview statistics and metadata
router.get('/stats', getInterviewStats);
router.get('/metadata', getQuestionMetadata);

module.exports = router;