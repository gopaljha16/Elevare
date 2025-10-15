const express = require('express');
const {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  duplicateResume,
  optimizeResume,
  calculateATSScore,
  matchJobDescription,
  getResumeAnalytics,
  analyzeResumeWithAI
} = require('../controllers/resumeController');
const {
  generateResumePDF,
  downloadResumePDF,
  getPDFHistory,
  previewResumeWithTemplate
} = require('../controllers/pdfController');
const {
  getTemplates,
  getTemplate,
  getTemplateCategories
} = require('../controllers/templateController');
const { authenticate } = require('../middleware/auth');
const { checkGeminiUsage } = require('../middleware/apiKeyValidation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// rate limiting for resume operations
const resumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many resume operations, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// rate limiting for AI analysis (more restrictive)
const aiAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 AI analysis requests per 15 minutes per user
  keyGenerator: (req) => req.userId || req.ip, // Rate limit per user
  message: {
    success: false,
    message: 'Too many AI analysis requests, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// apply authentication to all routes
router.use(authenticate);

// resume crud operations
router.post('/', resumeLimiter, createResume);
router.get('/', getResumes);
router.get('/analytics', getResumeAnalytics);
router.get('/:resumeId', getResume);
router.put('/:resumeId', resumeLimiter, updateResume);
router.delete('/:resumeId', deleteResume);

// resume operations
router.post('/:resumeId/duplicate', duplicateResume);
router.post('/:resumeId/optimize', optimizeResume);
router.get('/:resumeId/ats-score', calculateATSScore);
router.post('/:resumeId/match-job', matchJobDescription);

// ai analysis endpoint
router.post('/analyze', aiAnalysisLimiter, checkGeminiUsage, analyzeResumeWithAI);

// pdf operations
router.post('/:resumeId/generate-pdf', generateResumePDF);
router.get('/:resumeId/download', downloadResumePDF);
router.post('/:resumeId/preview', previewResumeWithTemplate);
router.get('/pdf/history', getPDFHistory);

// template operations
router.get('/templates', getTemplates);
router.get('/templates/categories', getTemplateCategories);
router.get('/templates/:templateId', getTemplate);

module.exports = router;