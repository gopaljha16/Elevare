const UserProgress = require('../models/UserProgress');
const LearningPath = require('../models/LearningPath');

// Get all user's learning paths progress
exports.getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const progressList = await UserProgress.find({ userId })
      .sort({ lastAccessedAt: -1 });

    // Populate with path details
    const progressWithPaths = await Promise.all(
      progressList.map(async (progress) => {
        const path = await LearningPath.findOne({ pathId: progress.pathId })
          .select('pathName description category difficulty estimatedHours');
        
        return {
          ...progress.toObject(),
          pathDetails: path
        };
      })
    );

    res.json({
      success: true,
      data: progressWithPaths
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user progress',
      error: error.message
    });
  }
};

// Get progress on specific path
exports.getPathProgress = async (req, res) => {
  try {
    const { userId, pathId } = req.params;
    
    const progress = await UserProgress.findOne({ userId, pathId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    const path = await LearningPath.findOne({ pathId });

    res.json({
      success: true,
      data: {
        progress,
        path
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching path progress',
      error: error.message
    });
  }
};

// Enroll user in learning path
exports.enrollInPath = async (req, res) => {
  try {
    const { userId, pathId } = req.body;
    
    // Check if already enrolled
    const existing = await UserProgress.findOne({ userId, pathId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this path'
      });
    }

    // Get path details to calculate estimated completion
    const path = await LearningPath.findOne({ pathId });
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    // Calculate estimated completion date (assuming 10 hours per week)
    const weeksToComplete = Math.ceil(path.estimatedHours / 10);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (weeksToComplete * 7));

    const progress = new UserProgress({
      userId,
      pathId,
      status: 'In Progress',
      estimatedCompletionDate,
      currentNode: path.nodes[0]?.nodeId
    });

    await progress.save();

    // Update enrollment count
    path.enrollmentCount += 1;
    await path.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in learning path',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error enrolling in path',
      error: error.message
    });
  }
};

// Mark node as completed
exports.completeNode = async (req, res) => {
  try {
    const { userId, pathId, nodeId } = req.params;
    const { timeSpent } = req.body;
    
    const progress = await UserProgress.findOne({ userId, pathId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    // Check if already completed
    const alreadyCompleted = progress.completedNodes.some(n => n.nodeId === nodeId);
    
    if (!alreadyCompleted) {
      progress.completedNodes.push({
        nodeId,
        completedAt: new Date(),
        timeSpent: timeSpent || 0
      });

      // Update total time spent
      progress.totalTimeSpent += (timeSpent || 0);

      // Calculate progress percentage
      const path = await LearningPath.findOne({ pathId });
      const totalNodes = path.nodes.length;
      const completedCount = progress.completedNodes.length;
      progress.progress = Math.round((completedCount / totalNodes) * 100);

      // Update status
      if (progress.progress === 100) {
        progress.status = 'Completed';
        progress.actualCompletionDate = new Date();
        
        // Update path completion rate
        const allProgress = await UserProgress.find({ pathId });
        const completedCount = allProgress.filter(p => p.status === 'Completed').length;
        path.completionRate = Math.round((completedCount / allProgress.length) * 100);
        await path.save();
      } else {
        progress.status = 'In Progress';
      }

      // Find next node
      const currentNodeIndex = path.nodes.findIndex(n => n.nodeId === nodeId);
      if (currentNodeIndex < path.nodes.length - 1) {
        progress.currentNode = path.nodes[currentNodeIndex + 1].nodeId;
      }

      progress.lastAccessedAt = new Date();
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Node marked as completed',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing node',
      error: error.message
    });
  }
};

// Update overall progress
exports.updateProgress = async (req, res) => {
  try {
    const { userId, pathId } = req.params;
    const updates = req.body;
    
    const progress = await UserProgress.findOneAndUpdate(
      { userId, pathId },
      { ...updates, lastAccessedAt: new Date() },
      { new: true }
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

// Add note to node
exports.addNote = async (req, res) => {
  try {
    const { userId, pathId } = req.params;
    const { nodeId, content } = req.body;
    
    const progress = await UserProgress.findOne({ userId, pathId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    progress.notes.push({
      nodeId,
      content,
      createdAt: new Date()
    });

    await progress.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
};

// Add bookmark
exports.addBookmark = async (req, res) => {
  try {
    const { userId, pathId } = req.params;
    const { nodeId, resourceIndex } = req.body;
    
    const progress = await UserProgress.findOne({ userId, pathId });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    progress.bookmarks.push({
      nodeId,
      resourceIndex,
      addedAt: new Date()
    });

    await progress.save();

    res.json({
      success: true,
      message: 'Bookmark added successfully',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding bookmark',
      error: error.message
    });
  }
};

// Get learning statistics
exports.getStatistics = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const allProgress = await UserProgress.find({ userId });
    
    const stats = {
      totalPaths: allProgress.length,
      completedPaths: allProgress.filter(p => p.status === 'Completed').length,
      inProgressPaths: allProgress.filter(p => p.status === 'In Progress').length,
      totalTimeSpent: allProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0),
      totalNodesCompleted: allProgress.reduce((sum, p) => sum + p.completedNodes.length, 0),
      averageProgress: allProgress.length > 0 
        ? Math.round(allProgress.reduce((sum, p) => sum + p.progress, 0) / allProgress.length)
        : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};
