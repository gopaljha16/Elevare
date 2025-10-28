const express = require('express');
const passport = require('../config/passport');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  logoutAllDevices,
  refreshToken,
  getUserStats,
  googleCallback,

} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  handleValidationErrors,
} = require('../utils/validation');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes (environment-based)
const isDevelopment = process.env.NODE_ENV === 'development';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 20 : 10, // Development: 20 requests, Production: 10 requests
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 15 : 5, // Development: 15 requests, Production: 5 requests
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', authLimiter, validateRegister, handleValidationErrors, register);
router.post('/login', strictAuthLimiter, validateLogin, handleValidationErrors, login);
router.post('/refresh-token', refreshToken);


// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`,
    session: false 
  }), 
  googleCallback
);

// Protected routes
router.use(authenticate); // All routes below this middleware require authentication

router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, handleValidationErrors, updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.post('/logout-all', logoutAllDevices);
router.get('/stats', getUserStats);

module.exports = router;