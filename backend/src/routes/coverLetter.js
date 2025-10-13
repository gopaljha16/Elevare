const express = require('express');
const {
  generateCoverLetter,
  getCoverLetterTemplates,
  customizeCoverLetter,
  analyzeCoverLetter
} = require('../controllers/coverLetterController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for AI-powered cover letter operations
const coverLetterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 AI requests per window (more restrictive due to AI usage)
  message: {
    success: false,
    message: 'Too many cover letter requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.get('/templates', getCoverLetterTemplates);

// Protected routes (authentication required)
router.use(authenticate);

// Cover letter operations
router.post('/generate', coverLetterLimiter, generateCoverLetter);
router.post('/customize', coverLetterLimiter, customizeCoverLetter);
router.post('/analyze', coverLetterLimiter, analyzeCoverLetter);

module.exports = router;