const LearningPath = require('../models/LearningPath');
const UserProgress = require('../models/UserProgress');
const UserAnalytics = require('../models/UserAnalytics');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sanitizeInput } = require('../utils/validation');

// get all learning paths
const getLearningPaths = asyncHandler(async (req, res) => {
    const { company, role, difficulty, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (company) {
        query.company = new RegExp(sanitizeInput(company), 'i');
    }

    if (role) {
        query.roles = new RegExp(sanitizeInput(role), 'i');
    }

    if (difficulty) {
        query.difficulty = difficulty;
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 }
    };

    const paths = await LearningPath.find(query)
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit)
        .exec();

    const total = await LearningPath.countDocuments(query);

    // Get path summaries
    const pathSummaries = paths.map(path => path.getSummary());

    res.json({
        success: true,
        data: {
            paths: pathSummaries,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalPaths: total,
                hasNext: options.page < Math.ceil(total / options.limit),
                hasPrev: options.page > 1
            }
        }
    });
});

// get a specific learning path
const getLearningPath = asyncHandler(async (req, res) => {
    const { pathId } = req.params;

    const path = await LearningPath.findOne({ _id: pathId, isActive: true });

    if (!path) {
        throw new AppError('Learning path not found', 404);
    }

    res.json({
        success: true,
        data: {
            path: path.toObject()
        }
    });
});

// start a learning path
const startLearningPath = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    const userId = req.userId;

    const path = await LearningPath.findOne({ _id: pathId, isActive: true });

    if (!path) {
        throw new AppError('Learning path not found', 404);
    }

    // Check if user already has progress for this path
    let userProgress = await UserProgress.findOne({ userId, learningPathId: pathId });

    if (userProgress) {
        return res.json({
            success: true,
            message: 'Learning path already started',
            data: {
                progress: userProgress.getProgressSummary()
            }
        });
    }

    // Create new progress record
    userProgress = new UserProgress({
        userId,
        learningPathId: pathId,
        company: path.company,
        pathTitle: path.title,
        skillProgress: path.skills.map(skill => ({
            skillId: skill._id.toString(),
            skillName: skill.name,
            progressPercentage: 0,
            completedResources: [],
            startedAt: new Date()
        })),
        status: 'in-progress'
    });

    await userProgress.save();

    // Update analytics
    try {
        let analytics = await UserAnalytics.findOne({ userId });
        if (analytics) {
            await analytics.trackAction('learning_path_started', {
                pathId: path._id,
                company: path.company,
                skillsCount: path.skills.length
            });
            await analytics.addRecentActivity('learning_path_started', `Started learning path: ${path.title}`, 'learning');
        }
    } catch (analyticsError) {
        console.error('Analytics update error:', analyticsError);
    }

    res.status(201).json({
        success: true,
        message: 'Learning path started successfully',
        data: {
            progress: userProgress.getProgressSummary()
        }
    });
});

// update skill progress
const updateSkillProgress = asyncHandler(async (req, res) => {
    const { pathId, skillId } = req.params;
    const { progressPercentage, resourceId, timeSpent } = req.body;
    const userId = req.userId;

    if (progressPercentage < 0 || progressPercentage > 100) {
        throw new AppError('Progress percentage must be between 0 and 100', 400);
    }

    const userProgress = await UserProgress.findOne({ userId, learningPathId: pathId });

    if (!userProgress) {
        throw new AppError('Learning path progress not found', 404);
    }

    await userProgress.updateSkillProgress(skillId, progressPercentage, resourceId, timeSpent || 0);

    // Update analytics
    try {
        let analytics = await UserAnalytics.findOne({ userId });
        if (analytics) {
            await analytics.trackAction('skill_progress_updated', {
                pathId,
                skillId,
                progressPercentage,
                timeSpent
            });

            if (resourceId) {
                await analytics.trackAction('learning_resource_accessed', {
                    pathId,
                    skillId,
                    resourceId,
                    timeSpent
                });
            }

            // Update learning stats
            const userPaths = await UserProgress.find({ userId });
            const learningStats = {
                totalPaths: userPaths.length,
                activePaths: userPaths.filter(p => p.status === 'in-progress').length,
                completedPaths: userPaths.filter(p => p.status === 'completed').length,
                averageProgress: userPaths.reduce((sum, p) => sum + p.overallProgress, 0) / userPaths.length,
                currentStreak: userProgress.streak.currentStreak,
                longestStreak: userProgress.streak.longestStreak,
                totalHoursSpent: Math.round(userPaths.reduce((sum, p) => sum + p.totalTimeSpent, 0) / 60),
                lastActivityDate: new Date()
            };

            await analytics.updateLearningStats(learningStats);
        }
    } catch (analyticsError) {
        console.error('Analytics update error:', analyticsError);
    }

    res.json({
        success: true,
        message: 'Skill progress updated successfully',
        data: {
            progress: userProgress.getProgressSummary()
        }
    });
});

// get user's learning progress
const getUserLearningProgress = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };

    if (status) {
        query.status = status;
    }

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { lastActivityAt: -1 }
    };

    const progressRecords = await UserProgress.find(query)
        .sort(options.sort)
        .limit(options.limit * 1)
        .skip((options.page - 1) * options.limit)
        .populate('learningPathId', 'title company difficulty estimatedDuration')
        .exec();

    const total = await UserProgress.countDocuments(query);

    const progressSummaries = progressRecords.map(progress => ({
        ...progress.getProgressSummary(),
        pathInfo: {
            id: progress.learningPathId._id,
            title: progress.learningPathId.title,
            company: progress.learningPathId.company,
            difficulty: progress.learningPathId.difficulty,
            estimatedDuration: progress.learningPathId.estimatedDuration
        }
    }));

    res.json({
        success: true,
        data: {
            progress: progressSummaries,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                hasNext: options.page < Math.ceil(total / options.limit),
                hasPrev: options.page > 1
            }
        }
    });
});

// get specific learning path progress
const getLearningPathProgress = asyncHandler(async (req, res) => {
    const { pathId } = req.params;
    const userId = req.userId;

    const userProgress = await UserProgress.findOne({ userId, learningPathId: pathId })
        .populate('learningPathId');

    if (!userProgress) {
        throw new AppError('Learning path progress not found', 404);
    }

    res.json({
        success: true,
        data: {
            progress: {
                ...userProgress.toObject(),
                summary: userProgress.getProgressSummary()
            }
        }
    });
});

// get learning statistics
const getLearningStats = asyncHandler(async (req, res) => {
    const userId = req.userId;

    const stats = await UserProgress.getUserStats(userId);

    if (!stats || stats.length === 0) {
        return res.json({
            success: true,
            data: {
                totalPaths: 0,
                completedPaths: 0,
                totalTimeSpent: 0,
                averageProgress: 0,
                totalAchievements: 0,
                longestStreak: 0
            }
        });
    }

    const userStats = stats[0];

    // Get recent activity
    const recentProgress = await UserProgress.find({ userId })
        .sort({ lastActivityAt: -1 })
        .limit(5)
        .populate('learningPathId', 'title company');

    res.json({
        success: true,
        data: {
            ...userStats,
            recentActivity: recentProgress.map(progress => ({
                pathTitle: progress.pathTitle,
                company: progress.company,
                overallProgress: progress.overallProgress,
                lastActivity: progress.lastActivityAt,
                status: progress.status
            }))
        }
    });
});

// get popular companies
const getPopularCompanies = asyncHandler(async (req, res) => {
    const companies = await LearningPath.getPopularCompanies();

    res.json({
        success: true,
        data: {
            companies: companies.map(company => ({
                name: company._id,
                pathsCount: company.count
            }))
        }
    });
});

// search learning paths
const searchLearningPaths = asyncHandler(async (req, res) => {
    const { query, company, role } = req.query;

    if (!query) {
        throw new AppError('Search query is required', 400);
    }

    const searchQuery = {
        isActive: true,
        $or: [
            { title: new RegExp(sanitizeInput(query), 'i') },
            { description: new RegExp(sanitizeInput(query), 'i') },
            { tags: new RegExp(sanitizeInput(query), 'i') },
            { 'skills.name': new RegExp(sanitizeInput(query), 'i') }
        ]
    };

    if (company) {
        searchQuery.company = new RegExp(sanitizeInput(company), 'i');
    }

    if (role) {
        searchQuery.roles = new RegExp(sanitizeInput(role), 'i');
    }

    const paths = await LearningPath.find(searchQuery)
        .limit(20)
        .sort({ createdAt: -1 });

    const pathSummaries = paths.map(path => path.getSummary());

    res.json({
        success: true,
        data: {
            paths: pathSummaries,
            totalResults: paths.length
        }
    });
});

// ai-powered skill gap analysis
const analyzeSkillGaps = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { targetCompany, targetRole, currentSkills } = req.body;

    if (!targetCompany || !targetRole) {
        throw new AppError('Target company and role are required', 400);
    }

    try {
        // Get user's current skills from resumes and learning progress if not provided
        let userSkills = currentSkills || [];

        if (!currentSkills || currentSkills.length === 0) {
            // Get skills from user's resumes
            const Resume = require('../models/Resume');
            const userResumes = await Resume.find({ userId, isActive: true });
            const resumeSkills = userResumes.reduce((skills, resume) => {
                return [...skills, ...resume.skills];
            }, []);

            // Get skills from learning progress
            const userProgress = await UserProgress.find({ userId });
            const learningSkills = userProgress.reduce((skills, progress) => {
                const completedSkills = progress.skillProgress
                    .filter(sp => sp.progressPercentage >= 70)
                    .map(sp => sp.skillName);
                return [...skills, ...completedSkills];
            }, []);

            userSkills = [...new Set([...resumeSkills, ...learningSkills])];
        }

        // Use Gemini AI to analyze skill gaps
        const geminiAIService = require('../services/geminiAIService');
        const skillGapAnalysis = await geminiAIService.analyzeSkillGaps(
            userSkills,
            sanitizeInput(targetRole),
            sanitizeInput(targetCompany)
        );

        // Find relevant learning paths
        const relevantPaths = await LearningPath.find({
            $or: [
                { company: new RegExp(sanitizeInput(targetCompany), 'i') },
                { roles: new RegExp(sanitizeInput(targetRole), 'i') }
            ],
            isActive: true
        }).limit(5);

        // Update analytics
        try {
            let analytics = await UserAnalytics.findOne({ userId });
            if (analytics) {
                await analytics.trackAction('skill_gap_analyzed', {
                    targetCompany: sanitizeInput(targetCompany),
                    targetRole: sanitizeInput(targetRole),
                    skillsAnalyzed: userSkills.length,
                    gapsIdentified: skillGapAnalysis.missingSkills?.length || 0
                });
                await analytics.addRecentActivity('skill_gap_analyzed', `Analyzed skills for ${targetCompany} ${targetRole}`, 'learning');
            }
        } catch (analyticsError) {
            console.error('Analytics update error:', analyticsError);
        }

        res.json({
            success: true,
            message: 'Skill gap analysis completed',
            data: {
                ...skillGapAnalysis,
                currentSkills: userSkills,
                targetCompany: sanitizeInput(targetCompany),
                targetRole: sanitizeInput(targetRole),
                recommendedPaths: relevantPaths.map(path => path.getSummary()),
                analysisDate: new Date()
            }
        });

    } catch (error) {
        console.error('Skill gap analysis error:', error);
        throw new AppError('Failed to analyze skill gaps. Please try again.', 500);
    }
});

// get personalized learning recommendations
const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { interests, careerGoals, timeAvailable } = req.query;

    try {
        // Get user's current progress and skills
        const userProgress = await UserProgress.find({ userId }).populate('learningPathId');
        const Resume = require('../models/Resume');
        const userResumes = await Resume.find({ userId, isActive: true });

        const currentSkills = userResumes.reduce((skills, resume) => {
            return [...skills, ...resume.skills];
        }, []);

        const completedSkills = userProgress.reduce((skills, progress) => {
            const completed = progress.skillProgress
                .filter(sp => sp.progressPercentage >= 80)
                .map(sp => sp.skillName);
            return [...skills, ...completed];
        }, []);

        // Get learning paths that match user's profile
        let recommendedPaths = await LearningPath.find({ isActive: true });

        // Filter based on interests if provided
        if (interests) {
            const interestArray = interests.split(',').map(i => i.trim());
            recommendedPaths = recommendedPaths.filter(path =>
                interestArray.some(interest =>
                    path.tags.some(tag => tag.toLowerCase().includes(interest.toLowerCase())) ||
                    path.title.toLowerCase().includes(interest.toLowerCase())
                )
            );
        }

        // Sort by relevance (paths with skills user doesn't have yet)
        recommendedPaths = recommendedPaths.map(path => {
            const pathSkills = path.skills.map(s => s.name.toLowerCase());
            const userSkillsLower = [...currentSkills, ...completedSkills].map(s => s.toLowerCase());
            const newSkillsCount = pathSkills.filter(skill => !userSkillsLower.includes(skill)).length;

            return {
                ...path.toObject(),
                relevanceScore: newSkillsCount,
                newSkillsCount
            };
        }).sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Limit recommendations
        const topRecommendations = recommendedPaths.slice(0, 8);

        res.json({
            success: true,
            data: {
                recommendations: topRecommendations.map(path => ({
                    ...path,
                    summary: path.getSummary ? path.getSummary() : {
                        id: path._id,
                        company: path.company,
                        title: path.title,
                        skillsCount: path.skills?.length || 0,
                        estimatedDuration: path.estimatedDuration
                    }
                })),
                userProfile: {
                    currentSkills: currentSkills.slice(0, 10), // Limit for response size
                    completedSkills: completedSkills.slice(0, 10),
                    activePaths: userProgress.filter(p => p.status === 'in-progress').length,
                    completedPaths: userProgress.filter(p => p.status === 'completed').length
                }
            }
        });

    } catch (error) {
        console.error('Personalized recommendations error:', error);
        throw new AppError('Failed to get personalized recommendations', 500);
    }
});

module.exports = {
    getLearningPaths,
    getLearningPath,
    startLearningPath,
    updateSkillProgress,
    getUserLearningProgress,
    getLearningPathProgress,
    getLearningStats,
    getPopularCompanies,
    searchLearningPaths,
    analyzeSkillGaps,
    getPersonalizedRecommendations
};