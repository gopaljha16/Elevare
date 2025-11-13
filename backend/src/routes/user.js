const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/userController');

// User profile management
router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);
router.post('/profile/avatar', authenticate, userController.uploadAvatar);

// User preferences
router.get('/preferences', authenticate, userController.getUserPreferences);
router.put('/preferences', authenticate, userController.updateUserPreferences);

// User skills
router.post('/skills', authenticate, userController.addUserSkills);
router.get('/skills', authenticate, userController.getUserSkills);
router.put('/skills/:skillId', authenticate, userController.updateSkillProficiency);
router.delete('/skills/:skillId', authenticate, userController.removeUserSkill);

// Account management
router.post('/export-data', authenticate, userController.exportUserData);

module.exports = router;