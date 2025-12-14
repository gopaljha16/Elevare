/**
 * ATS Analysis Routes V2
 * Production-ready ATS analysis with job matching and usage limits
 * @version 2.0.0
 */

const express = require('express');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { checkCredits, checkFeatureLimit, deductCreditsAfterSuccess, trackFailedOperation } = require('../middleware/usageLimits');
const aiServiceV2 = require('../services/aiServiceV2');
const { extractTextFromFile, validateFile } = require('../utils/fileProcessor');
const { sanitizeInput } = require('../utils/sanitization');
const AdvancedATSScorer = require('../utils/advancedATSScoring');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
  }
});

/**
 * @route POST /api/ats/v2/analyze-file
 * @desc Analyze uploaded resume file for ATS compatibility
 * @access Private
 */
router.post('/analyze-file',
  authenticate,
  checkCredits(2), // ATS analysis costs 2 credits
  checkFeatureLimit('ats_analysis'),
  upload.single('resume'),
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded'
          }
        });
      }

      console.log('📄 ATS File Analysis:', {
        userId: req.userId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      // Validate file
      try {
        validateFile(req.file);
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE',
            message: validationError.message
          }
        });
      }

      // Extract text from file
      let resumeText;
      try {
        resumeText = await extractTextFromFile(req.file);
      } catch (extractError) {
        console.error('Text extraction failed:', extractError);
        return res.status(400).json({
          success: false,
          error: {
            code: 'EXTRACTION_FAILED',
            message: 'Failed to extract text from file. Please try a different format.'
          }
        });
      }

      if (!resumeText || resumeText.trim().length < 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CONTENT',
            message: 'Resume content is too short for analysis'
          }
        });
      }

      // Get job description if provided
      const jobDescription = req.body.jobDescription || '';

      // Perform analysis
      const analysisResult = await performComprehensiveAnalysis(resumeText, jobDescription);

      // Deduct credits on success
      await deductCreditsAfterSuccess(req, 'ats_analysis');

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          ...analysisResult,
          metadata: {
            ...analysisResult.metadata,
            processingTime,
            fileName: req.file.originalname,
            fileSize: req.file.size
          }
        }
      });

    } catch (error) {
      console.error('ATS file analysis error:', error);
      await trackFailedOperation(req, 'ats_analysis', error.message);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Failed to analyze resume. Please try again.'
        }
      });
    }
  }
);

/**
 * @route POST /api/ats/v2/analyze-text
 * @desc Analyze pasted resume text for ATS compatibility
 * @access Private
 */
router.post('/analyze-text',
  authenticate,
  checkCredits(2),
  checkFeatureLimit('ats_analysis'),
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || typeof resumeText !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Resume text is required'
          }
        });
      }

      const sanitizedText = sanitizeInput(resumeText);

      if (sanitizedText.trim().length < 100) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CONTENT',
            message: 'Resume text is too short (minimum 100 characters)'
          }
        });
      }

      console.log('📝 ATS Text Analysis:', {
        userId: req.userId,
        textLength: sanitizedText.length
      });

      // Perform analysis
      const analysisResult = await performComprehensiveAnalysis(
        sanitizedText, 
        jobDescription || ''
      );

      // Deduct credits on success
      await deductCreditsAfterSuccess(req, 'ats_analysis');

      const processingTime = Date.now() - startTime;

      res.json({
        success: true,
        data: {
          ...analysisResult,
          metadata: {
            ...analysisResult.metadata,
            processingTime,
            inputType: 'text',
            textLength: sanitizedText.length
          }
        }
      });

    } catch (error) {
      console.error('ATS text analysis error:', error);
      await trackFailedOperation(req, 'ats_analysis', error.message);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: 'Failed to analyze resume. Please try again.'
        }
      });
    }
  }
);

/**
 * @route POST /api/ats/v2/job-match
 * @desc Analyze resume against specific job description
 * @access Private
 */
router.post('/job-match',
  authenticate,
  checkCredits(3), // Job matching costs 3 credits
  async (req, res) => {
    try {
      const { resumeText, jobDescription } = req.body;

      if (!resumeText || !jobDescription) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_INPUT',
            message: 'Both resume text and job description are required'
          }
        });
      }

      const sanitizedResume = sanitizeInput(resumeText);
      const sanitizedJob = sanitizeInput(jobDescription);

      // Use AI service for detailed job matching
      const matchResult = await aiServiceV2.analyzeATS(sanitizedResume, sanitizedJob);

      // Deduct credits
      await deductCreditsAfterSuccess(req, 'ats_analysis');

      res.json({
        success: true,
        data: {
          ...matchResult,
          analysisType: 'job_match'
        }
      });

    } catch (error) {
      console.error('Job match analysis error:', error);
      await trackFailedOperation(req, 'ats_analysis', error.message);
      
      res.status(500).json({
        success: false,
        error: {
          code: 'MATCH_FAILED',
          message: 'Failed to analyze job match. Please try again.'
        }
      });
    }
  }
);

/**
 * @route GET /api/ats/v2/health
 * @desc Check ATS service health
 * @access Public
 */
router.get('/health', (req, res) => {
  const aiHealth = aiServiceV2.getHealthStatus();
  
  res.json({
    success: true,
    data: {
      status: aiHealth.initialized ? 'healthy' : 'degraded',
      aiService: aiHealth,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * Perform comprehensive ATS analysis using multiple analyzers
 * @param {string} resumeText - Resume text content
 * @param {string} jobDescription - Optional job description
 * @returns {Promise<Object>} Combined analysis results
 */
async function performComprehensiveAnalysis(resumeText, jobDescription = '') {
  const results = {
    primary: null,
    secondary: null,
    combined: null
  };

  // Try AI-powered analysis first
  try {
    results.primary = await aiServiceV2.analyzeATS(resumeText, jobDescription);
  } catch (error) {
    console.warn('AI analysis failed, using fallback:', error.message);
  }

  // Always run rule-based analysis for consistency
  try {
    const advancedScorer = new AdvancedATSScorer();
    results.secondary = advancedScorer.analyzeResume(resumeText);
  } catch (error) {
    console.warn('Advanced scorer failed:', error.message);
  }

  // Combine results
  if (results.primary && results.secondary) {
    // Weighted average of scores (AI: 60%, Rule-based: 40%)
    const combinedScore = Math.round(
      (results.primary.atsScore * 0.6) + (results.secondary.atsScore * 0.4)
    );

    results.combined = {
      atsScore: combinedScore,
      jobMatchScore: results.primary.jobMatchScore,
      breakdown: mergeBreakdowns(results.primary.breakdown, results.secondary.breakdown),
      keywordAnalysis: results.primary.keywordAnalysis,
      strengths: [...new Set([
        ...(results.primary.strengths || []),
        ...(results.secondary.strengths || [])
      ])].slice(0, 8),
      criticalIssues: [...new Set([
        ...(results.primary.criticalIssues || []),
        ...(results.secondary.weaknesses || [])
      ])].slice(0, 8),
      actionableSteps: results.primary.actionableSteps || [],
      recommendations: results.secondary.recommendations || [],
      overallAssessment: results.primary.overallAssessment,
      metadata: {
        ...results.primary.metadata,
        analysisMethod: 'hybrid',
        aiScore: results.primary.atsScore,
        ruleBasedScore: results.secondary.atsScore
      }
    };
  } else if (results.primary) {
    results.combined = results.primary;
  } else if (results.secondary) {
    results.combined = {
      atsScore: results.secondary.atsScore,
      jobMatchScore: null,
      breakdown: results.secondary.breakdown,
      keywordAnalysis: {
        presentKeywords: [],
        missingKeywords: [],
        keywordDensity: 'Not analyzed',
        industryAlignment: 'General'
      },
      strengths: results.secondary.strengths || [],
      criticalIssues: results.secondary.weaknesses || [],
      actionableSteps: (results.secondary.actionableFeedback || []).map(f => ({
        priority: f.priority || 'medium',
        category: f.category || 'general',
        action: f.suggestion || '',
        impact: f.impact || ''
      })),
      recommendations: results.secondary.recommendations || [],
      overallAssessment: `ATS Score: ${results.secondary.atsScore}/100`,
      metadata: {
        analysisMethod: 'rule-based',
        analyzedAt: new Date().toISOString()
      }
    };
  } else {
    // Complete fallback
    results.combined = getEmergencyFallback(resumeText);
  }

  return results.combined;
}

/**
 * Merge breakdowns from different analyzers
 */
function mergeBreakdowns(aiBreakdown, ruleBreakdown) {
  const merged = {};
  const sections = ['contactInfo', 'experience', 'education', 'skills', 'formatting'];

  for (const section of sections) {
    const ai = aiBreakdown?.[section] || {};
    const rule = ruleBreakdown?.[section] || {};

    merged[section] = {
      score: Math.round(((ai.score || 0) * 0.6) + ((rule.score || 0) * 0.4)),
      maxScore: 100,
      details: [...new Set([
        ...(ai.found || ai.suggestions || []),
        ...(rule.details || [])
      ])].slice(0, 5),
      suggestions: [...new Set([
        ...(ai.suggestions || []),
        ...(rule.suggestions || rule.issues || [])
      ])].slice(0, 5)
    };
  }

  return merged;
}

/**
 * Emergency fallback when all analyzers fail
 */
function getEmergencyFallback(resumeText) {
  const text = resumeText.toLowerCase();
  let score = 30; // Base score

  if (text.includes('@')) score += 15;
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) score += 10;
  if (text.includes('experience')) score += 15;
  if (text.includes('education')) score += 10;
  if (text.includes('skills')) score += 10;

  return {
    atsScore: Math.min(score, 100),
    jobMatchScore: null,
    breakdown: {
      contactInfo: { score: 50, maxScore: 100, details: [], suggestions: [] },
      experience: { score: 50, maxScore: 100, details: [], suggestions: [] },
      education: { score: 50, maxScore: 100, details: [], suggestions: [] },
      skills: { score: 50, maxScore: 100, details: [], suggestions: [] },
      formatting: { score: 70, maxScore: 100, details: [], suggestions: [] }
    },
    keywordAnalysis: {
      presentKeywords: [],
      missingKeywords: [],
      keywordDensity: 'Unable to analyze',
      industryAlignment: 'Unknown'
    },
    strengths: ['Resume content detected'],
    criticalIssues: ['Full analysis unavailable'],
    actionableSteps: [{
      priority: 'high',
      category: 'general',
      action: 'Please try again or contact support',
      impact: 'Get complete analysis'
    }],
    recommendations: ['Try uploading again'],
    overallAssessment: 'Basic analysis completed. Please try again for detailed results.',
    metadata: {
      analysisMethod: 'emergency-fallback',
      analyzedAt: new Date().toISOString()
    }
  };
}

module.exports = router;
