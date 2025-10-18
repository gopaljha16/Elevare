const express = require('express');
const multer = require('multer');
const { analyzeResumeFile, analyzeResumeText } = require('../controllers/atsController');
const { authenticate } = require('../middleware/auth');
const { validateAPIKeys } = require('../middleware/apiKeyValidation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
  }
});

// Apply middleware (skip auth for test routes in development)
if (process.env.NODE_ENV !== 'development' || !process.env.SKIP_ATS_AUTH) {
  router.use(authenticate);
  router.use(validateAPIKeys);
} else {
  // Mock user for development testing
  router.use((req, res, next) => {
    req.userId = 'test-user-id';
    next();
  });
}

// Routes with debugging
router.post('/analyze-file', (req, res, next) => {
  console.log('🔍 ATS analyze-file route hit');
  next();
}, upload.single('resume'), analyzeResumeFile);

router.post('/analyze-text', (req, res, next) => {
  console.log('🔍 ATS analyze-text route hit');
  next();
}, analyzeResumeText);

// Test route without authentication (for debugging)
router.post('/test-analyze', (req, res) => {
  console.log('🧪 Test analyze endpoint hit');
  res.json({
    success: true,
    data: {
      atsScore: 75,
      breakdown: {
        personalInfo: { score: 20, maxScore: 25, details: ['Email found', 'Phone found'] },
        experience: { score: 25, maxScore: 30, details: ['Work experience present'] },
        education: { score: 10, maxScore: 15, details: ['Education section found'] },
        skills: { score: 15, maxScore: 20, details: ['Skills listed'] },
        structure: { score: 5, maxScore: 10, details: ['Basic structure present'] }
      },
      recommendations: ['Add more quantifiable achievements'],
      keywordSuggestions: ['Add industry-specific keywords'],
      grammarSuggestions: [],
      atsOptimization: ['Use standard section headers'],
      actionableFeedback: [
        {
          priority: 'high',
          category: 'content',
          suggestion: 'Add quantifiable achievements',
          impact: 'Helps recruiters understand your impact'
        }
      ],
      strengths: ['Clear contact information'],
      weaknesses: ['Limited quantifiable achievements'],
      nextSteps: ['Add specific metrics to experience descriptions']
    }
  });
});

// Simple test endpoint to check if routes are working
router.get('/health', (req, res) => {
  console.log('🏥 ATS health check');
  res.json({ success: true, message: 'ATS routes are working' });
});

// Test advanced scorer endpoint
router.post('/test-advanced', (req, res) => {
  console.log('🧪 Testing advanced ATS scorer...');
  try {
    const AdvancedATSScorer = require('../utils/advancedATSScoring');
    const scorer = new AdvancedATSScorer();
    const testText = req.body.text || 'John Doe Software Engineer john@example.com (555) 123-4567 Experience: Software Engineer at Tech Corp';
    
    const result = scorer.analyzeResume(testText);
    console.log('✅ Advanced scorer test completed, score:', result.atsScore);
    
    res.json({
      success: true,
      data: result,
      message: 'Advanced ATS scorer test completed'
    });
  } catch (error) {
    console.error('❌ Advanced scorer test failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Advanced scorer test failed: ' + error.message,
        statusCode: 500
      }
    });
  }
});

module.exports = router;