/**
 * AI Health & Testing Routes
 * Endpoints for monitoring AI service health and testing
 */

const express = require('express');
const router = express.Router();
const aiServiceV2 = require('../services/aiServiceV2');
const { authenticate } = require('../middleware/auth');
const { getUserUsageSummary } = require('../middleware/usageLimits');

/**
 * @route GET /api/ai/health
 * @desc Get AI service health status
 * @access Public
 */
router.get('/health', (req, res) => {
  const health = aiServiceV2.getHealthStatus();
  
  res.json({
    success: true,
    data: {
      status: health.initialized ? 'healthy' : 'degraded',
      ...health,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route GET /api/ai/usage
 * @desc Get current user's AI usage summary
 * @access Private
 */
router.get('/usage', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const usage = await getUserUsageSummary(userId);
    
    if (!usage) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NO_SUBSCRIPTION',
          message: 'No subscription found'
        }
      });
    }
    
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch usage data'
      }
    });
  }
});

/**
 * @route POST /api/ai/test
 * @desc Test AI service with a simple prompt (development only)
 * @access Private
 */
router.post('/test', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'NOT_ALLOWED',
        message: 'Test endpoint not available in production'
      }
    });
  }

  try {
    const { prompt = 'Say hello in JSON format: {"message": "hello"}' } = req.body;
    
    const startTime = Date.now();
    const result = await aiServiceV2._makeRequest(prompt, { temperature: 0.5, maxOutputTokens: 100 }, 'test');
    const duration = Date.now() - startTime;
    
    res.json({
      success: true,
      data: {
        response: result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'TEST_FAILED',
        message: error.message
      }
    });
  }
});

/**
 * @route GET /api/ai/credit-costs
 * @desc Get credit costs for all AI features
 * @access Public
 */
router.get('/credit-costs', (req, res) => {
  const { CREDIT_COSTS } = require('../services/aiServiceV2');
  
  res.json({
    success: true,
    data: {
      costs: CREDIT_COSTS,
      description: {
        atsAnalysis: 'ATS compatibility analysis',
        resumeOptimization: 'Resume content optimization',
        coverLetter: 'Cover letter generation',
        interviewQuestions: 'Interview question generation',
        skillGap: 'Skill gap analysis',
        chat: 'AI chat interaction'
      }
    }
  });
});

module.exports = router;
