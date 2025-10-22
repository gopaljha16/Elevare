const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPathController');
const userProgressController = require('../controllers/userProgressController');

// Learning Path Routes
router.get('/paths', learningPathController.getAllPaths);
router.get('/paths/search', learningPathController.searchPaths);
router.get('/paths/:pathId', learningPathController.getPathById);
router.post('/paths', learningPathController.createPath);
router.put('/paths/:pathId', learningPathController.updatePath);
router.delete('/paths/:pathId', learningPathController.deletePath);

// Node Management Routes
router.post('/paths/:pathId/nodes', learningPathController.addNode);
router.put('/paths/:pathId/nodes/:nodeId', learningPathController.updateNode);
router.delete('/paths/:pathId/nodes/:nodeId', learningPathController.deleteNode);

// User Progress Routes
router.get('/progress/:userId', userProgressController.getUserProgress);
router.get('/progress/:userId/paths/:pathId', userProgressController.getPathProgress);
router.get('/progress/:userId/statistics', userProgressController.getStatistics);
router.post('/progress/enroll', userProgressController.enrollInPath);
router.put('/progress/:userId/paths/:pathId/nodes/:nodeId/complete', userProgressController.completeNode);
router.put('/progress/:userId/paths/:pathId', userProgressController.updateProgress);
router.post('/progress/:userId/paths/:pathId/notes', userProgressController.addNote);
router.post('/progress/:userId/paths/:pathId/bookmarks', userProgressController.addBookmark);

// Recommendations
router.get('/recommendations/:userId', learningPathController.getRecommendations);

module.exports = router;
