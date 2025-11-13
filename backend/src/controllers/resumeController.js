const Resume = require('../models/Resume');
const ResumeTemplate = require('../models/ResumeTemplate');
const aiService = require('../services/aiService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'));
    }
  }
}).single('resume');

/**
 * Upload and parse resume file
 */
exports.uploadResume = async (req, res) => {
  try {
    console.log('📤 Resume upload request received');
    console.log('User:', req.user ? req.user.email : 'No user found');
    console.log('Headers:', req.headers.authorization ? 'Authorization header present' : 'No authorization header');

    upload(req, res, async (err) => {
      if (err) {
        console.error('❌ Multer upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        console.error('❌ No file uploaded');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      try {
        console.log('📄 File received:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          userId: req.user ? req.user._id : 'No user'
        });

        // Multi-layer fallback approach for resume parsing
        console.log('📄 Starting resume parsing with fallback layers...');
        
        let extractedData = getDefaultResumeStructure();
        let message = 'File uploaded successfully. Please fill in your information manually.';
        let parsingMethod = 'manual';
        
        // LAYER 1: Try AI-powered parsing (best quality)
        try {
          console.log('🤖 Layer 1: Attempting AI-powered parsing...');
          const aiParsedData = await aiService.parseResumeFile(
            req.file.buffer,
            req.file.mimetype
          );
          
          if (aiParsedData && aiParsedData.personalInfo) {
            extractedData = aiParsedData;
            message = 'Resume uploaded and parsed successfully with AI!';
            parsingMethod = 'ai';
            console.log('✅ Layer 1 SUCCESS: AI parsing completed');
          } else {
            throw new Error('AI parsing returned invalid data');
          }
        } catch (aiError) {
          console.log('⚠️ Layer 1 FAILED:', aiError.message);
          
          // LAYER 2: Try basic text extraction
          try {
            console.log('📄 Layer 2: Attempting text extraction...');
            const fileProcessor = require('../utils/fileProcessor');
            const extractedText = await fileProcessor.extractTextFromFile(req.file);
            
            if (extractedText && extractedText.length > 50) {
              console.log('✅ Layer 2 SUCCESS: Text extracted, length:', extractedText.length);
              
              // Use basic structure with extracted text
              extractedData = getDefaultResumeStructure();
              extractedData.professionalSummary = extractedText.substring(0, 500);
              message = 'Resume uploaded. Text extracted but AI parsing unavailable. Please review and edit.';
              parsingMethod = 'text';
            } else {
              throw new Error('Insufficient text extracted');
            }
          } catch (textError) {
            console.log('⚠️ Layer 2 FAILED:', textError.message);
            
            // LAYER 3: Return empty structure for manual entry
            console.log('📝 Layer 3: Using manual entry fallback');
            extractedData = getDefaultResumeStructure();
            message = 'File uploaded but could not be parsed automatically. Please fill in your information manually.';
            parsingMethod = 'manual';
          }
        }

        res.status(200).json({
          success: true,
          message: message,
          data: extractedData,
          meta: {
            parsingMethod: parsingMethod,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            uploadedAt: new Date().toISOString()
          }
        });
      } catch (parseError) {
        console.error('❌ Resume parsing error:', parseError);
        console.error('Error stack:', parseError.stack);
        
        // Return basic structure even if parsing fails completely
        res.status(200).json({
          success: true,
          message: 'File uploaded but parsing failed. Please fill in manually.',
          data: getDefaultResumeStructure()
        });
      }
    });
  } catch (error) {
    console.error('❌ Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
};

// Helper function to get default resume structure
function getDefaultResumeStructure() {
  return {
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      photo: '',
      socialLinks: {
        linkedin: '',
        github: '',
        portfolio: ''
      }
    },
    professionalSummary: '',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      languages: [],
      tools: []
    },
    projects: [],
    certifications: []
  };
}

/**
 * Create new resume
 */
exports.createResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeData = req.body;

    // Create new resume
    const resume = new Resume({
      userId,
      ...resumeData,
      status: 'draft'
    });

    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume created successfully',
      data: resume
    });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resume: ' + error.message
    });
  }
};

/**
 * Get all resumes for user
 */
exports.getUserResumes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const resumes = await Resume.getUserResumes(userId, status);

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes'
    });
  }
};

/**
 * Get single resume by ID
 */
exports.getResumeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume'
    });
  }
};

/**
 * Update resume
 */
exports.updateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        resume[key] = updates[key];
      }
    });

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: resume
    });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume'
    });
  }
};

/**
 * Delete resume
 */
exports.deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOneAndDelete({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume'
    });
  }
};

/**
 * Generate AI suggestions for resume
 */
exports.generateAISuggestions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { targetRole } = req.body;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Generate AI suggestions
    const suggestions = await aiService.generateResumeContent(
      {
        personalInfo: resume.personalInfo,
        professionalSummary: resume.professionalSummary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects
      },
      targetRole
    );

    // Update resume with suggestions
    resume.aiSuggestions = {
      ...suggestions,
      lastGenerated: new Date()
    };

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'AI suggestions generated successfully',
      data: suggestions
    });
  } catch (error) {
    console.error('Generate suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions: ' + error.message
    });
  }
};

/**
 * Calculate ATS score for resume
 */
exports.calculateATSScore = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { jobDescription } = req.body;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Calculate ATS score
    const atsAnalysis = await aiService.calculateATSScore(
      {
        personalInfo: resume.personalInfo,
        professionalSummary: resume.professionalSummary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects
      },
      jobDescription
    );

    // Update resume with ATS score
    resume.atsScore = {
      score: atsAnalysis.score,
      strengths: atsAnalysis.strengths,
      improvements: atsAnalysis.improvements,
      missingKeywords: atsAnalysis.missingKeywords,
      lastAnalyzed: new Date()
    };

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'ATS score calculated successfully',
      data: atsAnalysis
    });
  } catch (error) {
    console.error('Calculate ATS score error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate ATS score: ' + error.message
    });
  }
};

/**
 * Generate share link for resume
 */
exports.generateShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Generate share link if not exists
    if (!resume.shareLink) {
      resume.generateShareLink();
      await resume.save();
    }

    res.status(200).json({
      success: true,
      message: 'Share link generated successfully',
      data: {
        shareLink: resume.shareLink,
        url: `${process.env.FRONTEND_URL}/resume/view/${resume.shareLink}`
      }
    });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share link'
    });
  }
};

/**
 * Get resume by share link (public)
 */
exports.getResumeByShareLink = async (req, res) => {
  try {
    const { shareLink } = req.params;

    const resume = await Resume.findOne({ shareLink });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Increment view count
    await resume.incrementViewCount();

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Get resume by share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume'
    });
  }
};

/**
 * Get all templates
 */
exports.getTemplates = async (req, res) => {
  try {
    const { category } = req.query;

    const templates = await ResumeTemplate.getActiveTemplates(category);

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    });
  }
};

/**
 * Duplicate resume
 */
exports.duplicateResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const originalResume = await Resume.findOne({ _id: id, userId });

    if (!originalResume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Create duplicate
    const duplicateData = originalResume.toObject();
    delete duplicateData._id;
    delete duplicateData.shareLink;
    delete duplicateData.createdAt;
    delete duplicateData.updatedAt;
    delete duplicateData.viewCount;

    const newResume = new Resume({
      ...duplicateData,
      status: 'draft',
      personalInfo: {
        ...duplicateData.personalInfo,
        fullName: `${duplicateData.personalInfo.fullName} (Copy)`
      }
    });

    await newResume.save();

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully',
      data: newResume
    });
  } catch (error) {
    console.error('Duplicate resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to duplicate resume'
    });
  }
};

/**
 * Update resume template
 */
exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { template, theme } = req.body;

    const resume = await Resume.findOne({ _id: id, userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (template) resume.template = template;
    if (theme) resume.theme = { ...resume.theme, ...theme };

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: resume
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template'
    });
  }
};
