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
  analyzeResumeWithAI,
  generateAIContent,
  optimizeAIContent,
  aiChatHandler,
  getKeywordSuggestions,
  suggestTemplate,
  compileLaTeX,
  generateLaTeXPreview,
  autoSaveResume
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

// Resume parsing endpoint (before authentication middleware)
router.post('/parse', authenticate, async (req, res) => {
  try {
    const multer = require('multer');
    const upload = multer({ 
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
        }
      }
    });
    
    // Handle file upload
    upload.single('resume')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'File upload failed',
          error: err.message
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      try {
        console.log('=== RESUME PARSING STARTED ===');
        console.log('📁 File info:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer_length: req.file.buffer ? req.file.buffer.length : 0
        });
        
        // Parse resume using AI service
        const aiService = require('../services/aiService');
        console.log('🤖 AI service loaded, calling parseResumeFile...');
        
        const resumeData = await aiService.parseResumeFile(req.file);
        
        console.log('=== RESUME PARSING SUCCESS ===');
        console.log('📊 Extracted data summary:', {
          hasName: !!resumeData.personalInfo?.name,
          hasEmail: !!resumeData.personalInfo?.email,
          hasPhone: !!resumeData.personalInfo?.phone,
          skillsCount: (resumeData.skills?.technical?.length || 0) + (resumeData.skills?.soft?.length || 0) + (resumeData.skills?.tools?.length || 0),
          experienceCount: resumeData.experience?.length || 0,
          projectsCount: resumeData.projects?.length || 0,
          educationCount: resumeData.education?.length || 0
        });
        console.log('📋 Full parsed data:', JSON.stringify(resumeData, null, 2));
        
        res.json({
          success: true,
          message: 'Resume parsed successfully',
          data: resumeData
        });
      } catch (parseError) {
        console.error('=== PARSING FAILED ===');
        console.error('❌ Resume parsing error:', parseError.message);
        console.error('📍 Error stack:', parseError.stack);
        
        // Provide basic fallback data based on filename
        const fallbackData = {
          personalInfo: {
            name: req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
            email: '',
            phone: '',
            location: '',
            social: {
              linkedin: '',
              github: '',
              portfolio: ''
            }
          },
          summary: 'Please update your professional summary.',
          skills: {
            technical: [],
            soft: [],
            tools: []
          },
          experience: [],
          projects: [],
          education: []
        };
        
        console.log('🔄 Using fallback data:', JSON.stringify(fallbackData, null, 2));
        
        res.json({
          success: true,
          message: 'Resume uploaded but parsing failed. Please manually update the information.',
          data: fallbackData,
          warning: `Parsing error: ${parseError.message}. Please review and update all information manually.`
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Resume parsing failed',
      error: error.message
    });
  }
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

// enhanced ai endpoints for the new resume builder
router.post('/ai/generate', aiAnalysisLimiter, checkGeminiUsage, generateAIContent);
router.post('/ai/optimize', aiAnalysisLimiter, checkGeminiUsage, optimizeAIContent);
router.post('/ai/chat', aiAnalysisLimiter, checkGeminiUsage, aiChatHandler);
router.post('/ai/keywords', aiAnalysisLimiter, checkGeminiUsage, getKeywordSuggestions);
router.post('/ai/suggest-template', aiAnalysisLimiter, checkGeminiUsage, suggestTemplate);

// latex compilation endpoints
router.post('/latex/compile', compileLaTeX);
router.post('/latex/preview', generateLaTeXPreview);

// auto-save endpoint
router.post('/auto-save', autoSaveResume);

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