const express = require('express');
const {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  getPortfolioSuggestions,
  applyPortfolioSuggestion
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for chat messages
const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'development' ? 30 : 15, // Development: 30, Production: 15
  message: {
    success: false,
    message: 'Too many chat messages. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat routes (public for demo, add authenticate middleware for production)
router.post('/message', chatLimiter, sendChatMessage);
router.get('/history/:portfolioId', getChatHistory);
router.delete('/history/:portfolioId', clearChatHistory);
router.post('/suggestions', getPortfolioSuggestions);
router.post('/apply-suggestion', applyPortfolioSuggestion);

module.exports = router;