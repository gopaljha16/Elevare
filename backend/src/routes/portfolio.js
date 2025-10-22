const express = require('express');
const multer = require('multer');
const {
  parseResume,
  generateFromPrompt,
  generateHTML,
  deployPortfolio,
  sharePortfolio,
  getPortfolios,
  updatePortfolio,
  deletePortfolio,
  downloadDeploymentFiles
} = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter called:', file.originalname, file.mimetype);
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword',
      'text/plain' // Allow text files for testing
    ];
    if (allowedTypes.includes(file.mimetype)) {
      console.log('File type allowed');
      cb(null, true);
    } else {
      console.log('File type rejected:', file.mimetype);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF and DOCX files are allowed.`), false);
    }
  }
});

// Rate limiting for AI generation
const aiGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 10, // Development: 50, Production: 10
  message: {
    success: false,
    message: 'Too many AI generation requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for deployments
const deploymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 20 : 5, // Development: 20, Production: 5
  message: {
    success: false,
    message: 'Too many deployment requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Portfolio routes working!' });
});

// Test file upload route
router.post('/test-upload', upload.single('resume'), (req, res) => {
  console.log('Test upload called');
  console.log('File:', req.file ? 'Present' : 'Missing');
  if (req.file) {
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
  }
  
  res.json({
    success: true,
    message: 'Test upload endpoint working',
    file: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null
  });
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log('Multer error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: { message: 'File too large. Maximum size is 10MB.' }
      });
    }
    return res.status(400).json({
      success: false,
      error: { message: err.message }
    });
  } else if (err) {
    console.log('Other upload error:', err.message);
    return res.status(400).json({
      success: false,
      error: { message: err.message }
    });
  }
  next();
};

// Public routes (no authentication required for demo)
router.post('/parse-resume', 
  (req, res, next) => {
    console.log('Parse resume route hit');
    console.log('Content-Type:', req.headers['content-type']);
    next();
  }, 
  upload.single('resume'), 
  handleMulterError,
  (req, res, next) => {
    console.log('After multer middleware');
    console.log('File:', req.file ? 'Present' : 'Missing');
    if (req.file) {
      console.log('File details:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    }
    next();
  }, 
  parseResume
);
router.post('/generate-from-prompt', aiGenerationLimiter, generateFromPrompt);
router.post('/generate-with-ai', aiGenerationLimiter, generateFromPrompt);
router.post('/generate-html', generateHTML);
router.post('/download-deployment', downloadDeploymentFiles);

// Protected routes (require authentication) - commented out for demo
// router.use(authenticate);

// Temporarily make all routes public for demo
router.get('/', getPortfolios);
router.post('/deploy', deploymentLimiter, deployPortfolio);
router.post('/share', sharePortfolio);
router.put('/:id', updatePortfolio);
router.delete('/:id', deletePortfolio);

module.exports = router;