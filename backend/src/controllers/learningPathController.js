const LearningPath = require('../models/LearningPath');
const UserProgress = require('../models/UserProgress');
const { v4: uuidv4 } = require('crypto');
const geminiAIService = require('../services/geminiAIService');

// Get all learning paths with filters
exports.getAllPaths = async (req, res) => {
  try {
    const { category, difficulty, search, tags, limit = 20, page = 1 } = req.query;
    
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { pathName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const paths = await LearningPath.find(query)
      .select('-nodes -connections -reviews')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ enrollmentCount: -1, rating: -1 });

    const total = await LearningPath.countDocuments(query);

    res.json({
      success: true,
      data: paths,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching learning paths',
      error: error.message
    });
  }
};

// Get single learning path with all nodes
exports.getPathById = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await LearningPath.findOne({ pathId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    res.json({
      success: true,
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching learning path',
      error: error.message
    });
  }
};

// Create new learning path (admin only)
exports.createPath = async (req, res) => {
  try {
    const pathData = {
      ...req.body,
      pathId: req.body.pathId || `path-${Date.now()}`,
      createdBy: req.user?.id
    };

    const path = new LearningPath(pathData);
    await path.save();

    res.status(201).json({
      success: true,
      message: 'Learning path created successfully',
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating learning path',
      error: error.message
    });
  }
};

// Update learning path
exports.updatePath = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await LearningPath.findOneAndUpdate(
      { pathId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    res.json({
      success: true,
      message: 'Learning path updated successfully',
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating learning path',
      error: error.message
    });
  }
};

// Delete learning path
exports.deletePath = async (req, res) => {
  try {
    const { pathId } = req.params;
    
    const path = await LearningPath.findOneAndDelete({ pathId });

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Also delete all user progress for this path
    await UserProgress.deleteMany({ pathId });

    res.json({
      success: true,
      message: 'Learning path deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting learning path',
      error: error.message
    });
  }
};

// Add node to path
exports.addNode = async (req, res) => {
  try {
    const { pathId } = req.params;
    const nodeData = {
      ...req.body,
      nodeId: req.body.nodeId || `node-${Date.now()}`
    };

    const path = await LearningPath.findOne({ pathId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    path.nodes.push(nodeData);
    await path.save();

    res.status(201).json({
      success: true,
      message: 'Node added successfully',
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding node',
      error: error.message
    });
  }
};

// Update node
exports.updateNode = async (req, res) => {
  try {
    const { pathId, nodeId } = req.params;
    
    const path = await LearningPath.findOne({ pathId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const nodeIndex = path.nodes.findIndex(n => n.nodeId === nodeId);
    
    if (nodeIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Node not found'
      });
    }

    path.nodes[nodeIndex] = { ...path.nodes[nodeIndex].toObject(), ...req.body };
    await path.save();

    res.json({
      success: true,
      message: 'Node updated successfully',
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating node',
      error: error.message
    });
  }
};

// Delete node
exports.deleteNode = async (req, res) => {
  try {
    const { pathId, nodeId } = req.params;
    
    const path = await LearningPath.findOne({ pathId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    path.nodes = path.nodes.filter(n => n.nodeId !== nodeId);
    path.connections = path.connections.filter(c => c.from !== nodeId && c.to !== nodeId);
    await path.save();

    res.json({
      success: true,
      message: 'Node deleted successfully',
      data: path
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting node',
      error: error.message
    });
  }
};

// Get path recommendations for user
exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user's completed and in-progress paths
    const userProgress = await UserProgress.find({ userId });
    const enrolledPathIds = userProgress.map(p => p.pathId);
    
    // Find paths user hasn't enrolled in
    const recommendations = await LearningPath.find({
      pathId: { $nin: enrolledPathIds },
      isPublished: true
    })
      .select('-nodes -connections')
      .limit(10)
      .sort({ rating: -1, enrollmentCount: -1 });

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

// AI Learning Coach for a specific path
exports.aiCoachForPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    const { userId, message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const path = await LearningPath.findOne({ pathId });

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    let progress = null;
    if (userId) {
      progress = await UserProgress.findOne({ userId, pathId });
    }

    const context = {
      type: 'learning-path-coach',
      path: {
        pathId: path.pathId,
        pathName: path.pathName,
        category: path.category,
        difficulty: path.difficulty,
        estimatedHours: path.estimatedHours,
        tags: path.tags,
        totalNodes: path.nodes?.length || 0
      },
      progress: progress
        ? {
            status: progress.status,
            progress: progress.progress,
            completedNodes: progress.completedNodes?.length || 0,
            currentNode: progress.currentNode,
            totalTimeSpent: progress.totalTimeSpent
          }
        : null
    };

    const result = await geminiAIService.chatResponse(message, context, history);

    res.json({
      success: true,
      data: {
        response: result.response,
        content: result.response,
        suggestions: result.suggestions,
        followUpQuestions: result.followUpQuestions
      }
    });
  } catch (error) {
    console.error('AI learning coach error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI learning coach response',
      error: error.message
    });
  }
};

// Search paths
exports.searchPaths = async (req, res) => {
  try {
    const { q, category, difficulty } = req.query;
    
    const query = { isPublished: true };
    
    if (q) {
      query.$or = [
        { pathName: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const paths = await LearningPath.find(query)
      .select('-nodes -connections -reviews')
      .limit(20);

    res.json({
      success: true,
      data: paths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching paths',
      error: error.message
    });
  }
};
