const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/view/:shareLink', resumeController.getResumeByShareLink);
router.get('/templates', resumeController.getTemplates);

// Public test upload (for debugging)
router.post('/public-test-upload', (req, res) => {
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() }).single('resume');
  
  upload(req, res, (err) => {
    if (err) {
      console.error('Public upload test error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    console.log('Public upload test successful:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    res.json({
      success: true,
      message: 'Public upload test successful',
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  });
});

// Protected routes (require authentication)
router.use(authenticate);

// Test authentication endpoint
router.get('/test-auth', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication working',
    user: {
      id: req.user._id,
      email: req.user.email
    }
  });
});

// Simple upload test endpoint
router.post('/test-upload', (req, res) => {
  const multer = require('multer');
  const upload = multer({ storage: multer.memoryStorage() }).single('resume');
  
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    res.json({
      success: true,
      message: 'File upload test successful',
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      },
      user: {
        id: req.user._id,
        email: req.user.email
      }
    });
  });
});

// Diagnostic endpoint
router.get('/diagnostics', (req, res) => {
  try {
    const aiService = require('../services/aiService');
    const geminiAIService = require('../services/geminiAIService');
    const fileProcessor = require('../utils/fileProcessor');

    const rawKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';

    // Legacy AI service status
    const legacyStatus = {
      initialized: !!aiService,
      hasGenAI: !!(aiService.genAI),
      hasModel: !!(aiService.model),
      modelName: aiService.model ? 'gemini-1.5-flash or gemini-pro' : 'Not initialized'
    };

    // New Gemini AI service status
    const geminiStatus = geminiAIService.getHealthStatus
      ? geminiAIService.getHealthStatus()
      : { status: 'unknown' };

    res.json({
      success: true,
      diagnostics: {
        user: req.user ? { id: req.user._id, email: req.user.email } : null,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasGeminiKey: !!rawKey,
          geminiKeyLength: rawKey.length,
          geminiKeyPreview: rawKey ? rawKey.substring(0, 10) + '...' : 'Not set'
        },
        services: {
          aiServiceInitialized: legacyStatus.initialized,
          aiGenAIAvailable: legacyStatus.hasGenAI,
          aiModelAvailable: legacyStatus.hasModel,
          aiModelName: legacyStatus.modelName,
          geminiServiceStatus: geminiStatus.status || 'unknown',
          geminiCurrentModel: geminiStatus.currentModel || geminiStatus.model || null,
          geminiTotalKeys: geminiStatus.totalKeys || 0,
          fileProcessorAvailable: !!fileProcessor
        },
        dependencies: {
          pdfParse: (() => { try { return !!require('pdf-parse'); } catch { return false; } })(),
          mammoth: (() => { try { return !!require('mammoth'); } catch { return false; } })(),
          googleGenAI: (() => { try { return !!require('@google/generative-ai'); } catch { return false; } })()
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Diagnostics failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Test AI endpoint
router.post('/test-ai', authenticate, async (req, res) => {
  try {
    const aiService = require('../services/aiService');
    const geminiAIService = require('../services/geminiAIService');

    const hasLegacyModel = !!(aiService && aiService.model);
    const hasGeminiService = geminiAIService && geminiAIService.isAvailable && geminiAIService.isAvailable();

    if (!hasLegacyModel && !hasGeminiService) {
      return res.status(503).json({
        success: false,
        message: 'AI service not initialized. Check GEMINI_API_KEYS or GEMINI_API_KEY in backend/.env and restart the server.'
      });
    }

    const testPrompt = 'Say "Hello! AI is working!" in a friendly way.';
    let resultText = '';

    // Prefer the new Gemini AI service with multi-key rotation
    if (hasGeminiService) {
      const result = await geminiAIService.generateContent(testPrompt, {
        temperature: 0.7,
        maxOutputTokens: 100
      });
      resultText = result.text;
    } else {
      const result = await aiService._makeAIRequest(testPrompt, {
        temperature: 0.7,
        maxOutputTokens: 100
      });
      resultText = result;
    }

    res.json({
      success: true,
      message: 'AI service is working!',
      testResult: resultText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      success: false,
      message: 'AI test failed',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Resume CRUD
router.post('/', resumeController.createResume);
router.get('/', resumeController.getUserResumes);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

// Resume operations
router.post('/upload', resumeController.uploadResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.put('/:id/template', resumeController.updateTemplate);

// AI features
router.post('/:id/suggestions', resumeController.generateAISuggestions);
router.post('/:id/ats-score', resumeController.calculateATSScore);

// Sharing
router.post('/:id/share', resumeController.generateShareLink);

module.exports = router;
