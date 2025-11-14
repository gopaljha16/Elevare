const express = require('express');
const router = express.Router();
const {
  createPortfolio,
  getUserPortfolios,
  getPortfolio,
  updatePortfolio,
  portfolioAIChat,
  publishPortfolio,
  generatePortfolioCode,
  clearPortfolioContext,
  getPortfolioContextStats
} = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validatePortfolioCreation = [
  body('resumeData').notEmpty().withMessage('Resume data is required'),
  body('template').optional().isIn(['modern', 'minimal', 'dark', 'creative']).withMessage('Invalid template'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validatePortfolioUpdate = [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('template').optional().isIn(['modern', 'minimal', 'dark', 'creative']).withMessage('Invalid template'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

const validateAIChat = [
  body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// @route   GET /api/portfolio/templates
// @desc    Get available portfolio templates
// @access  Private
router.get('/templates', authenticate, (req, res) => {
  const templates = [
    {
      id: 'modern',
      name: 'Modern Gradient',
      description: 'Sleek design with gradient backgrounds and smooth animations',
      category: 'modern',
      preview: '/templates/modern-preview.jpg',
      colors: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        accent: '#F472B6',
        background: '#0E101A',
        surface: '#121625'
      },
      features: ['Gradient backgrounds', 'Smooth animations', 'Mobile responsive', 'Dark theme'],
      rating: 4.9,
      downloads: 1234,
      isPremium: false
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Clean and professional design with focus on content',
      category: 'minimal',
      preview: '/templates/minimal-preview.jpg',
      colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#60A5FA',
        background: '#FFFFFF',
        surface: '#F8FAFC'
      },
      features: ['Clean typography', 'Minimal design', 'Fast loading', 'Light theme'],
      rating: 4.8,
      downloads: 987,
      isPremium: false
    },
    {
      id: 'dark',
      name: 'Dark Professional',
      description: 'Professional dark theme with elegant styling',
      category: 'professional',
      preview: '/templates/dark-preview.jpg',
      colors: {
        primary: '#10B981',
        secondary: '#059669',
        accent: '#34D399',
        background: '#111827',
        surface: '#1F2937'
      },
      features: ['Dark theme', 'Professional look', 'Eye-friendly', 'Modern design'],
      rating: 4.7,
      downloads: 756,
      isPremium: true
    },
    {
      id: 'creative',
      name: 'Creative Showcase',
      description: 'Bold and creative design for designers and artists',
      category: 'creative',
      preview: '/templates/creative-preview.jpg',
      colors: {
        primary: '#F59E0B',
        secondary: '#D97706',
        accent: '#FCD34D',
        background: '#1F2937',
        surface: '#374151'
      },
      features: ['Bold colors', 'Creative layouts', 'Portfolio focus', 'Interactive elements'],
      rating: 4.6,
      downloads: 543,
      isPremium: true
    }
  ];
  
  res.json({
    success: true,
    templates
  });
});

// @route   POST /api/portfolio/create
// @desc    Create new portfolio from resume data
// @access  Private
router.post('/create', authenticate, validatePortfolioCreation, createPortfolio);

// @route   GET /api/portfolio/my-portfolios
// @desc    Get user's portfolios
// @access  Private
router.get('/my-portfolios', authenticate, getUserPortfolios);

// @route   GET /api/portfolio/:id
// @desc    Get portfolio by ID
// @access  Private
router.get('/:id', authenticate, getPortfolio);

// @route   PUT /api/portfolio/:id
// @desc    Update portfolio
// @access  Private
router.put('/:id', authenticate, validatePortfolioUpdate, updatePortfolio);

// @route   DELETE /api/portfolio/:id
// @desc    Delete portfolio
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const Portfolio = require('../models/Portfolio');
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    await Portfolio.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
});

// @route   POST /api/portfolio/:id/duplicate
// @desc    Duplicate portfolio
// @access  Private
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const Portfolio = require('../models/Portfolio');
    
    const originalPortfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!originalPortfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    const duplicatedPortfolio = new Portfolio({
      userId: req.user._id,
      title: `${originalPortfolio.title} (Copy)`,
      template: originalPortfolio.template,
      data: originalPortfolio.data,
      structure: originalPortfolio.structure,
      customizations: originalPortfolio.customizations,
      isPublished: false
    });
    
    await duplicatedPortfolio.save();
    
    res.status(201).json({
      success: true,
      portfolio: {
        id: duplicatedPortfolio._id,
        title: duplicatedPortfolio.title,
        template: duplicatedPortfolio.template,
        isPublished: duplicatedPortfolio.isPublished,
        previewUrl: `/portfolio/preview/${duplicatedPortfolio._id}`,
        createdAt: duplicatedPortfolio.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate portfolio',
      error: error.message
    });
  }
});

// @route   POST /api/portfolio/:id/chat
// @desc    AI chat for portfolio editing
// @access  Private
router.post('/:id/chat', authenticate, validateAIChat, portfolioAIChat);

// @route   POST /api/portfolio/:id/publish
// @desc    Publish portfolio to deployment platform
// @access  Private
router.post('/:id/publish', authenticate, publishPortfolio);

// @route   POST /api/portfolio/:id/unpublish
// @desc    Unpublish portfolio
// @access  Private
router.post('/:id/unpublish', authenticate, async (req, res) => {
  try {
    const Portfolio = require('../models/Portfolio');
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    portfolio.isPublished = false;
    portfolio.deploymentUrl = null;
    portfolio.deploymentPlatform = null;
    portfolio.publishedAt = null;
    
    await portfolio.save();
    
    res.json({
      success: true,
      message: 'Portfolio unpublished successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unpublish portfolio',
      error: error.message
    });
  }
});

// @route   GET /api/portfolio/:id/analytics
// @desc    Get portfolio analytics
// @access  Private
router.get('/:id/analytics', authenticate, async (req, res) => {
  try {
    const Portfolio = require('../models/Portfolio');
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('analytics seoScore performanceScore');
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      analytics: {
        views: portfolio.analytics.views,
        uniqueVisitors: portfolio.analytics.uniqueVisitors,
        lastViewed: portfolio.analytics.lastViewed,
        seoScore: portfolio.seoScore,
        performanceScore: portfolio.performanceScore
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});


// @route   POST /api/portfolio/generate-code
// @desc    Generate portfolio code with AI
// @access  Private
router.post('/generate-code', authenticate, generatePortfolioCode);

// @route   DELETE /api/portfolio/context
// @desc    Clear user's portfolio generation context
// @access  Private
router.delete('/context', authenticate, clearPortfolioContext);

// @route   GET /api/portfolio/context/stats
// @desc    Get user's portfolio generation context stats
// @access  Private
router.get('/context/stats', authenticate, getPortfolioContextStats);

// @route   GET /api/portfolio/test-ai
// @desc    Test AI services availability
// @access  Private
router.get('/test-ai', authenticate, async (req, res) => {
  try {
    const geminiAIService = require('../services/geminiAIService');

    const healthStatus = geminiAIService.getHealthStatus();

    res.json({
      success: true,
      message: 'AI service health check',
      service: 'Gemini AI (gemini-2.5-pro)',
      status: healthStatus.status,
      model: healthStatus.model,
      totalKeys: healthStatus.totalKeys,
      currentKeyIndex: healthStatus.currentKeyIndex,
      keyStats: healthStatus.keyStats,
      available: geminiAIService.isAvailable()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to test AI service',
      error: error.message
    });
  }
});

// @route   POST /api/portfolio/:id/export
// @desc    Export portfolio as ZIP file
// @access  Private
router.post('/:id/export', authenticate, async (req, res) => {
  try {
    const Portfolio = require('../models/Portfolio');
    const archiver = require('archiver');
    
    const portfolio = await Portfolio.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${portfolio.title.replace(/\s+/g, '-')}-portfolio.zip"`);
    
    // Create archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    archive.pipe(res);
    
    // Generate and add portfolio files to archive
    // Generate portfolio files (simplified for now)
    const portfolioFiles = {
      'index.html': `<!DOCTYPE html><html><head><title>${portfolio.title}</title></head><body><h1>${portfolio.title}</h1></body></html>`,
      'package.json': JSON.stringify({ name: portfolio.title, version: '1.0.0' }, null, 2)
    };
    
    Object.entries(portfolioFiles).forEach(([filename, content]) => {
      archive.append(content, { name: filename });
    });
    
    await archive.finalize();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export portfolio',
      error: error.message
    });
  }
});

module.exports = router;
