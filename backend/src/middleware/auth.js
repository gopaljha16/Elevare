const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { safeRedisUtils } = require('./redis');

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Check if token is blacklisted in Redis
    const isBlacklisted = await safeRedisUtils.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been invalidated. Please login again.',
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts.',
      });
    }

    // Check user session in Redis
    const userSession = await safeRedisUtils.getUserSession(user._id.toString());
    if (!userSession) {
      // Create new session
      const sessionData = {
        userId: user._id.toString(),
        email: user.email,
        lastActivity: new Date().toISOString(),
        loginTime: new Date().toISOString()
      };
      await safeRedisUtils.setUserSession(user._id.toString(), sessionData);
    } else {
      // Update last activity
      userSession.lastActivity = new Date().toISOString();
      await safeRedisUtils.setUserSession(user._id.toString(), userSession);
    }

    // Attach user and token to request object
    req.user = user;
    req.userId = user._id;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
};

// Middleware to check if user is admin (optional for future use)
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Allow if user owns the resource or is admin
    if (req.user._id.toString() === resourceUserId || req.user.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.',
    });
  };
};

// Optional middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next(); // Continue without authentication
    }

    // Check if token is blacklisted
    const isBlacklisted = await safeRedisUtils.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(); // Continue without authentication if token is blacklisted
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (user && !user.isLocked) {
      req.user = user;
      req.userId = user._id;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth,
};