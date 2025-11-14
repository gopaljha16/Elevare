const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticate } = require('../middleware/auth');

// @desc    Track analytics event (public endpoint for portfolio tracking)
// @route   POST /api/analytics/track
// @access  Public
router.post('/track', async (req, res) => {
  try {
    const { type, portfolioId, ...eventData } = req.body;
    
    if (!type || !portfolioId) {
      return res.status(400).json({
        success: false,
        message: 'Type and portfolioId are required'
      });
    }
    
    // Track based on event type
    switch (type) {
      case 'pageview':
        await analyticsService.trackPageView(portfolioId, eventData.url, eventData);
        break;
      case 'cta_click':
        await analyticsService.trackCTAClick(portfolioId, eventData.ctaName, eventData);
        break;
      case 'scroll_depth':
        await analyticsService.trackScrollDepth(portfolioId, eventData.section, eventData.depth, eventData);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid event type'
        });
    }
    
    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
    
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't expose errors to client for analytics
    res.json({
      success: true,
      message: 'Event received'
    });
  }
});

// @desc    Get portfolio analytics
// @route   GET /api/analytics/portfolio/:id
// @access  Private
router.get('/portfolio/:id', authenticate, async (req, res) => {
  try {
    const { dateRange, metrics } = req.query;
    
    const analytics = await analyticsService.getPortfolioAnalytics(req.params.id, {
      dateRange,
      metrics: metrics ? metrics.split(',') : undefined
    });
    
    res.json({
      success: true,
      analytics
    });
    
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
});

// @desc    Get tracking script for portfolio
// @route   GET /api/analytics/script/:portfolioId
// @access  Public
router.get('/script/:portfolioId', (req, res) => {
  try {
    const script = analyticsService.generateTrackingScript(req.params.portfolioId);
    
    res.setHeader('Content-Type', 'application/javascript');
    res.send(script);
    
  } catch (error) {
    console.error('Failed to generate tracking script:', error);
    res.status(500).send('// Analytics script generation failed');
  }
});

module.exports = router;
