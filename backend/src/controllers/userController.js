const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for avatar uploads
const storage = multer.memoryStorage();
const avatarUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
  }
}).single('avatar');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, location, bio, website, socialLinks } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: user.toObject({ getters: true, virtuals: false }) }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

/**
 * Upload profile avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    avatarUpload(req, res, async (err) => {
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

      try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Convert image to base64 for storage
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        user.avatar = base64Image;
        
        await user.save();

        res.status(200).json({
          success: true,
          message: 'Avatar uploaded successfully',
          data: { avatar: user.avatar }
        });
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload avatar'
        });
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during avatar upload'
    });
  }
};

/**
 * Get user preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { preferences: user.preferences || {} }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences'
    });
  }
};

/**
 * Update user preferences
 */
exports.updateUserPreferences = async (req, res) => {
  try {
    const { theme, notifications, language, emailUpdates } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize preferences if not exists
    if (!user.preferences) {
      user.preferences = {};
    }

    // Update preferences
    if (theme !== undefined) user.preferences.theme = theme;
    if (notifications !== undefined) user.preferences.notifications = notifications;
    if (language !== undefined) user.preferences.language = language;
    if (emailUpdates !== undefined) user.preferences.emailUpdates = emailUpdates;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

/**
 * Add user skills
 */
exports.addUserSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills array is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize skills array if not exists
    if (!user.skills) {
      user.skills = [];
    }

    // Add new skills
    skills.forEach(skill => {
      if (!user.skills.find(s => s.name === skill.name)) {
        user.skills.push({
          name: skill.name,
          level: skill.level || 'beginner',
          category: skill.category || 'other'
        });
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skills added successfully',
      data: { skills: user.skills }
    });
  } catch (error) {
    console.error('Add skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skills'
    });
  }
};

/**
 * Get user skills
 */
exports.getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('skills');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { skills: user.skills || [] }
    });
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch skills'
    });
  }
};

/**
 * Update skill proficiency
 */
exports.updateSkillProficiency = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { level } = req.body;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skill = user.skills.id(skillId);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    skill.level = level;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: { skill }
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update skill'
    });
  }
};

/**
 * Remove user skill
 */
exports.removeUserSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.skills.pull(skillId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Skill removed successfully'
    });
  } catch (error) {
    console.error('Remove skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove skill'
    });
  }
};

/**
 * Export user data (GDPR compliance)
 */
exports.exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all user-related data
    const Resume = require('../models/Resume');
    const Portfolio = require('../models/Portfolio');
    
    const resumes = await Resume.find({ userId: req.user._id });
    const portfolios = await Portfolio.find({ userId: req.user._id });

    const userData = {
      profile: user.toObject(),
      resumes: resumes,
      portfolios: portfolios,
      exportDate: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'User data exported successfully',
      data: userData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data'
    });
  }
};

module.exports = exports;
