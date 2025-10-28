const express = require('express');
const { portfolioAssistant, clearChatHistory, generalMessage } = require('../controllers/chatController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for chat requests
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 30, // Development: 100, Production: 30
  message: {
    success: false,
    message: 'Too many chat requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Portfolio AI Assistant endpoint
router.post('/portfolio-assistant', chatLimiter, portfolioAssistant);

// General AI message endpoint (for resume generation, etc.)
router.post('/message', chatLimiter, generalMessage);

// Clear chat history
router.post('/clear-history', clearChatHistory);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Chat routes working!' });
});

module.exports = router;