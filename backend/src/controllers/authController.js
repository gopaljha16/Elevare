const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sanitizeInput, isCommonPassword } = require('../utils/validation');
const { safeRedisUtils } = require('../middleware/redis');


const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;


  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email).toLowerCase();


  const existingUser = await User.findOne({ email: sanitizedEmail });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  if (isCommonPassword(password)) {
    throw new AppError('Please choose a stronger password', 400);
  }


  const user = new User({
    name: sanitizedName,
    email: sanitizedEmail,
    password,
  });

  await user.save();

  const token = generateToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  await user.updateOne({ lastLogin: new Date() });

  // Store session and refresh token in Redis
  const sessionData = {
    userId: user._id.toString(),
    email: user.email,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };

  await safeRedisUtils.setUserSession(user._id.toString(), sessionData);
  await safeRedisUtils.setRefreshToken(user._id.toString(), refreshToken);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toJSON(),
      token,
      refreshToken,
    },
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const sanitizedEmail = sanitizeInput(email).toLowerCase();

  const user = await User.findByEmail(sanitizedEmail);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.isLocked) {
    throw new AppError('Account is temporarily locked due to too many failed login attempts. Please try again later.', 423);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    await user.incLoginAttempts();
    throw new AppError('Invalid email or password', 401);
  }


  await user.resetLoginAttempts();

  const tokenExpiry = rememberMe ? '30d' : '7d';
  const token = generateToken({ userId: user._id }, tokenExpiry);
  const refreshToken = generateRefreshToken({ userId: user._id });

  // Store session and refresh token in Redis
  const sessionData = {
    userId: user._id.toString(),
    email: user.email,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    rememberMe: !!rememberMe
  };

  const sessionExpiry = rememberMe ? 2592000 : 604800; // 30 days or 7 days
  await safeRedisUtils.setUserSession(user._id.toString(), sessionData, sessionExpiry);
  await safeRedisUtils.setRefreshToken(user._id.toString(), refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      token,
      refreshToken,
    },
  });
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (email && email !== user.email) {
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }
    user.email = sanitizedEmail;
  }

  if (name) {
    user.name = sanitizeInput(name);
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.toJSON(),
    },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  // Find user with password
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  if (isCommonPassword(newPassword)) {
    throw new AppError('Please choose a stronger password', 400);
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.token;
  const userId = req.userId;

  if (!token || !userId) {
    throw new AppError('Invalid logout request', 400);
  }

  try {
    // Blacklist the current token in Redis
    // Calculate token expiration time for blacklist TTL
    const decoded = verifyToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const tokenTTL = decoded.exp - currentTime;

    if (tokenTTL > 0) {
      await safeRedisUtils.blacklistToken(token, tokenTTL);
    }

    // Delete user session from Redis
    await safeRedisUtils.deleteUserSession(userId.toString());

    // Delete refresh token from Redis
    await safeRedisUtils.deleteRefreshToken(userId.toString());

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if Redis operations fail, we should still respond with success
    // as the client will discard the token anyway
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // Check if refresh token exists in Redis
    const storedRefreshToken = await safeRedisUtils.getRefreshToken(userId);
    if (!storedRefreshToken || storedRefreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if user account is locked
    if (user.isLocked) {
      throw new AppError('Account is temporarily locked', 423);
    }

    // Generate new tokens
    const newToken = generateToken({ userId: user._id });
    const newRefreshToken = generateRefreshToken({ userId: user._id });

    // Update refresh token in Redis
    await safeRedisUtils.setRefreshToken(userId, newRefreshToken);

    // Update user session
    const sessionData = await safeRedisUtils.getUserSession(userId);
    if (sessionData) {
      sessionData.lastActivity = new Date().toISOString();
      await safeRedisUtils.setUserSession(userId, sessionData);
    }

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
});

const logoutAllDevices = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const currentToken = req.token;

  if (!userId) {
    throw new AppError('Invalid request', 400);
  }

  try {
    // Delete user session from Redis
    await safeRedisUtils.deleteUserSession(userId.toString());

    // Delete refresh token from Redis
    await safeRedisUtils.deleteRefreshToken(userId.toString());

    // Blacklist current token
    if (currentToken) {
      const decoded = verifyToken(currentToken);
      const currentTime = Math.floor(Date.now() / 1000);
      const tokenTTL = decoded.exp - currentTime;

      if (tokenTTL > 0) {
        await safeRedisUtils.blacklistToken(currentToken, tokenTTL);
      }
    }

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    console.error('Logout all devices error:', error);
    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  }
});

const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get session data from Redis
  const sessionData = await safeRedisUtils.getUserSession(userId.toString());

  const stats = {
    joinDate: user.createdAt,
    lastLogin: user.lastLogin,
    isEmailVerified: user.isEmailVerified,
    totalLogins: 1,
    currentSession: sessionData ? {
      loginTime: sessionData.loginTime,
      lastActivity: sessionData.lastActivity
    } : null
  };

  res.json({
    success: true,
    data: {
      stats,
    },
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  logoutAllDevices,
  refreshToken,
  getUserStats,
};