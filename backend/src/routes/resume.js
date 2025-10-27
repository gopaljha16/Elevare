const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/view/:shareLink', resumeController.getResumeByShareLink);
router.get('/templates', resumeController.getTemplates);

// Protected routes (require authentication)
router.use(authenticate);

// Resume CRUD
router.post('/', resumeController.createResume);
router.get('/', resumeController.getUserResumes);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);

// Resume operations
router.post('/upload', resumeController.uploadResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.put('/:id/template', resumeController.updateTemplate);

// AI features
router.post('/:id/suggestions', resumeController.generateAISuggestions);
router.post('/:id/ats-score', resumeController.calculateATSScore);

// Sharing
router.post('/:id/share', resumeController.generateShareLink);

module.exports = router;
