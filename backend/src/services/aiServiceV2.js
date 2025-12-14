/**
 * AI Service V2 - Production-Ready AI Integration
 * Centralized AI logic with proper error handling, retry logic, and structured responses
 * @version 2.0.0
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError } = require('../middleware/errorHandler');
const { cacheService } = require('./cacheService');
const { sanitizeInput } = require('../utils/sanitization');

// Prompt versions for tracking and A/B testing
const PROMPT_VERSIONS = {
  ATS_ANALYSIS: 'v2.0',
  RESUME_OPTIMIZATION: 'v2.0',
  COVER_LETTER: 'v2.0',
  INTERVIEW_QUESTIONS: 'v2.0',
  SKILL_GAP: 'v2.0'
};

// AI Configuration with temperature tuning per use case
const AI_CONFIG = {
  atsAnalysis: { temperature: 0.2, maxOutputTokens: 4000, topK: 40, topP: 0.9 },
  resumeOptimization: { temperature: 0.4, maxOutputTokens: 3000, topK: 40, topP: 0.95 },
  coverLetter: { temperature: 0.7, maxOutputTokens: 2000, topK: 40, topP: 0.95 },
  interviewQuestions: { temperature: 0.8, maxOutputTokens: 3000, topK: 40, topP: 0.95 },
  skillGap: { temperature: 0.5, maxOutputTokens: 2000, topK: 40, topP: 0.95 },
  chat: { temperature: 0.7, maxOutputTokens: 1500, topK: 40, topP: 0.95 }
};

// Credit costs per operation
const CREDIT_COSTS = {
  atsAnalysis: 2,
  resumeOptimization: 3,
  coverLetter: 2,
  interviewQuestions: 1,
  skillGap: 1,
  chat: 1
};

class AIServiceV2 {
  constructor() {
    this.initialized = false;
    this.genAI = null;
    this.model = null;
    this.apiKeys = [];
    this.currentKeyIndex = 0;
    
    // Retry configuration
    this.retryConfig = {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      timeout: 45000
    };
    
    // Request logging
    this.requestLog = [];
    this.maxLogSize = 1000;
    
    this._initialize();
  }

  /**
   * Initialize the AI service with API keys
   * @private
   */
  _initialize() {
    try {
      const apiKeysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
      
      if (!apiKeysString) {
        console.error('❌ No Gemini API keys found');
        return;
      }

      this.apiKeys = apiKeysString.includes(',')
        ? apiKeysString.split(',').map(k => k.trim()).filter(k => k)
        : [apiKeysString.trim()];

      console.log(`🔑 Found ${this.apiKeys.length} Gemini API key(s)`);
      
      this._initializeModel(this.apiKeys[0]);
      this.initialized = true;
      console.log('✅ AI Service V2 initialized successfully');
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error.message);
    }
  }

  /**
   * Initialize model with specific API key
   * @private
   */
  _initializeModel(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Try gemini-1.5-flash first, fallback to gemini-pro
    const models = ['gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Using model: ${modelName}`);
        return;
      } catch (error) {
        console.warn(`⚠️ Model ${modelName} not available`);
      }
    }
    
    throw new Error('No available Gemini models');
  }

  /**
   * Rotate to next API key on rate limit
   * @private
   */
  _rotateApiKey() {
    if (this.apiKeys.length <= 1) return false;
    
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this._initializeModel(this.apiKeys[this.currentKeyIndex]);
    console.log(`🔄 Rotated to API key ${this.currentKeyIndex + 1}`);
    return true;
  }

  /**
   * Make AI request with retry logic and error handling
   * @private
   */
  async _makeRequest(prompt, config, operationType) {
    if (!this.initialized || !this.model) {
      throw new AppError('AI service not initialized', 503);
    }

    const startTime = Date.now();
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const result = await Promise.race([
          this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: config
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.retryConfig.timeout)
          )
        ]);

        const response = await result.response;
        const text = response.text();
        
        // Log successful request
        this._logRequest({
          operationType,
          attempt,
          success: true,
          duration: Date.now() - startTime,
          promptLength: prompt.length,
          responseLength: text.length
        });
        
        return text;
      } catch (error) {
        lastError = error;
        
        this._logRequest({
          operationType,
          attempt,
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        });

        // Handle specific errors
        if (error.message.includes('quota') || error.message.includes('rate')) {
          if (this._rotateApiKey()) {
            continue; // Retry with new key
          }
        }

        if (error.message.includes('API key')) {
          throw new AppError('Invalid API configuration', 500);
        }

        // Exponential backoff
        if (attempt < this.retryConfig.maxAttempts) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('❌ All AI request attempts failed:', lastError.message);
    throw new AppError('AI service temporarily unavailable', 503);
  }

  /**
   * Log request for monitoring
   * @private
   */
  _logRequest(logEntry) {
    logEntry.timestamp = new Date().toISOString();
    this.requestLog.push(logEntry);
    
    if (this.requestLog.length > this.maxLogSize) {
      this.requestLog.shift();
    }
  }

  /**
   * Validate and sanitize input
   * @private
   */
  _validateInput(input, minLength = 10, maxLength = 50000) {
    if (!input || typeof input !== 'string') {
      throw new AppError('Invalid input provided', 400);
    }

    const sanitized = sanitizeInput(input.trim());
    
    if (sanitized.length < minLength) {
      throw new AppError(`Input too short (minimum ${minLength} characters)`, 400);
    }
    
    if (sanitized.length > maxLength) {
      throw new AppError(`Input too long (maximum ${maxLength} characters)`, 400);
    }

    // Check for potential prompt injection
    const injectionPatterns = [
      /ignore\s+(previous|all)\s+instructions/i,
      /system\s*:\s*/i,
      /\[INST\]/i,
      /<\|im_start\|>/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(sanitized)) {
        throw new AppError('Invalid input detected', 400);
      }
    }

    return sanitized;
  }

  /**
   * Parse JSON from AI response with fallback
   * @private
   */
  _parseJsonResponse(response, fallback = {}) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Try parsing entire response
      return JSON.parse(response);
    } catch (error) {
      console.warn('⚠️ Failed to parse JSON response, using fallback');
      return fallback;
    }
  }


  /**
   * ATS Analysis with Job Description Matching
   * @param {string} resumeText - Resume text content
   * @param {string} jobDescription - Optional job description for matching
   * @returns {Promise<Object>} Structured ATS analysis
   */
  async analyzeATS(resumeText, jobDescription = '') {
    const sanitizedResume = this._validateInput(resumeText, 100, 30000);
    const sanitizedJob = jobDescription ? this._validateInput(jobDescription, 0, 10000) : '';

    // Generate cache key
    const cacheKey = cacheService.generateKey('ats_v2', { 
      resume: sanitizedResume.substring(0, 500), 
      job: sanitizedJob.substring(0, 200) 
    });

    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const prompt = this._buildATSPrompt(sanitizedResume, sanitizedJob);
    
    try {
      const response = await this._makeRequest(
        prompt, 
        AI_CONFIG.atsAnalysis, 
        'atsAnalysis'
      );
      
      const result = this._parseATSResponse(response, sanitizedResume, sanitizedJob);
      
      // Cache result
      await cacheService.set(cacheKey, result, { memoryTTL: 300, redisTTL: 3600 });
      
      return result;
    } catch (error) {
      console.error('ATS analysis failed:', error);
      return this._getFallbackATSAnalysis(sanitizedResume, sanitizedJob);
    }
  }

  /**
   * Build ATS analysis prompt
   * @private
   */
  _buildATSPrompt(resumeText, jobDescription) {
    const jobMatchSection = jobDescription ? `
JOB DESCRIPTION TO MATCH:
${jobDescription}

ADDITIONAL ANALYSIS REQUIRED:
- Calculate job match score (0-100)
- Identify matching keywords
- List missing keywords from job description
- Provide tailored recommendations for this specific job
` : '';

    return `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume for ATS compatibility and provide a comprehensive assessment.

PROMPT VERSION: ${PROMPT_VERSIONS.ATS_ANALYSIS}

RESUME TEXT:
${resumeText}

${jobMatchSection}

Provide your analysis in the following EXACT JSON format (no additional text):

{
  "atsScore": <number 0-100>,
  "jobMatchScore": <number 0-100 or null if no job description>,
  "breakdown": {
    "contactInfo": {
      "score": <number 0-100>,
      "found": ["list of found items"],
      "missing": ["list of missing items"],
      "suggestions": ["specific improvements"]
    },
    "experience": {
      "score": <number 0-100>,
      "yearsDetected": <number or null>,
      "hasQuantifiableAchievements": <boolean>,
      "actionVerbsUsed": <number>,
      "suggestions": ["specific improvements"]
    },
    "education": {
      "score": <number 0-100>,
      "degreesFound": ["list of degrees"],
      "suggestions": ["specific improvements"]
    },
    "skills": {
      "score": <number 0-100>,
      "technicalSkills": ["list"],
      "softSkills": ["list"],
      "suggestions": ["specific improvements"]
    },
    "formatting": {
      "score": <number 0-100>,
      "issues": ["list of formatting issues"],
      "suggestions": ["specific improvements"]
    }
  },
  "keywordAnalysis": {
    "presentKeywords": ["keywords found in resume"],
    "missingKeywords": ["important keywords missing"],
    "keywordDensity": "<assessment>",
    "industryAlignment": "<detected industry>"
  },
  "strengths": ["top 5 resume strengths"],
  "criticalIssues": ["high-priority problems to fix"],
  "actionableSteps": [
    {
      "priority": "high|medium|low",
      "category": "content|format|keywords|structure",
      "action": "specific action to take",
      "impact": "expected improvement"
    }
  ],
  "overallAssessment": "<2-3 sentence summary>"
}

SCORING GUIDELINES:
- 90-100: Excellent ATS compatibility, likely to pass most systems
- 70-89: Good compatibility with minor improvements needed
- 50-69: Moderate compatibility, significant improvements recommended
- Below 50: Poor compatibility, major revisions needed

Focus on:
1. Standard section headers (Experience, Education, Skills)
2. Keyword optimization for ATS parsing
3. Quantifiable achievements with metrics
4. Action verbs at the start of bullet points
5. Clean formatting without tables/graphics
6. Complete contact information
7. Relevant skills matching industry standards`;
  }

  /**
   * Parse ATS response with validation
   * @private
   */
  _parseATSResponse(response, resumeText, jobDescription) {
    const parsed = this._parseJsonResponse(response, null);
    
    if (!parsed || typeof parsed.atsScore !== 'number') {
      return this._getFallbackATSAnalysis(resumeText, jobDescription);
    }

    // Validate and normalize scores
    const normalizeScore = (score) => Math.max(0, Math.min(100, Math.round(score || 0)));

    return {
      atsScore: normalizeScore(parsed.atsScore),
      jobMatchScore: parsed.jobMatchScore ? normalizeScore(parsed.jobMatchScore) : null,
      breakdown: {
        contactInfo: {
          score: normalizeScore(parsed.breakdown?.contactInfo?.score),
          found: parsed.breakdown?.contactInfo?.found || [],
          missing: parsed.breakdown?.contactInfo?.missing || [],
          suggestions: parsed.breakdown?.contactInfo?.suggestions || []
        },
        experience: {
          score: normalizeScore(parsed.breakdown?.experience?.score),
          yearsDetected: parsed.breakdown?.experience?.yearsDetected,
          hasQuantifiableAchievements: !!parsed.breakdown?.experience?.hasQuantifiableAchievements,
          actionVerbsUsed: parsed.breakdown?.experience?.actionVerbsUsed || 0,
          suggestions: parsed.breakdown?.experience?.suggestions || []
        },
        education: {
          score: normalizeScore(parsed.breakdown?.education?.score),
          degreesFound: parsed.breakdown?.education?.degreesFound || [],
          suggestions: parsed.breakdown?.education?.suggestions || []
        },
        skills: {
          score: normalizeScore(parsed.breakdown?.skills?.score),
          technicalSkills: parsed.breakdown?.skills?.technicalSkills || [],
          softSkills: parsed.breakdown?.skills?.softSkills || [],
          suggestions: parsed.breakdown?.skills?.suggestions || []
        },
        formatting: {
          score: normalizeScore(parsed.breakdown?.formatting?.score),
          issues: parsed.breakdown?.formatting?.issues || [],
          suggestions: parsed.breakdown?.formatting?.suggestions || []
        }
      },
      keywordAnalysis: {
        presentKeywords: parsed.keywordAnalysis?.presentKeywords || [],
        missingKeywords: parsed.keywordAnalysis?.missingKeywords || [],
        keywordDensity: parsed.keywordAnalysis?.keywordDensity || 'Not analyzed',
        industryAlignment: parsed.keywordAnalysis?.industryAlignment || 'General'
      },
      strengths: (parsed.strengths || []).slice(0, 5),
      criticalIssues: (parsed.criticalIssues || []).slice(0, 5),
      actionableSteps: (parsed.actionableSteps || []).slice(0, 10).map(step => ({
        priority: ['high', 'medium', 'low'].includes(step.priority) ? step.priority : 'medium',
        category: step.category || 'general',
        action: step.action || '',
        impact: step.impact || ''
      })),
      overallAssessment: parsed.overallAssessment || 'Analysis completed',
      metadata: {
        promptVersion: PROMPT_VERSIONS.ATS_ANALYSIS,
        analyzedAt: new Date().toISOString(),
        hasJobDescription: !!jobDescription
      }
    };
  }

  /**
   * Fallback ATS analysis when AI fails
   * @private
   */
  _getFallbackATSAnalysis(resumeText, jobDescription) {
    const text = resumeText.toLowerCase();
    let score = 0;
    const found = [];
    const missing = [];
    const suggestions = [];

    // Contact info analysis
    const hasEmail = /@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
    const hasPhone = /\d{3}[-.]?\d{3}[-.]?\d{4}/.test(resumeText);
    const hasLinkedIn = text.includes('linkedin');
    
    if (hasEmail) { score += 15; found.push('Email'); } else { missing.push('Email'); }
    if (hasPhone) { score += 10; found.push('Phone'); } else { missing.push('Phone'); }
    if (hasLinkedIn) { score += 5; found.push('LinkedIn'); }

    // Section analysis
    if (text.includes('experience') || text.includes('work history')) { score += 20; found.push('Experience section'); }
    else { missing.push('Experience section'); suggestions.push('Add a clear Experience section'); }
    
    if (text.includes('education')) { score += 15; found.push('Education section'); }
    else { missing.push('Education section'); suggestions.push('Add an Education section'); }
    
    if (text.includes('skills')) { score += 15; found.push('Skills section'); }
    else { missing.push('Skills section'); suggestions.push('Add a Skills section'); }

    // Quantifiable achievements
    const hasMetrics = /\d+%|\$[\d,]+|\d+\s*(million|thousand|k)/i.test(resumeText);
    if (hasMetrics) { score += 10; found.push('Quantifiable achievements'); }
    else { suggestions.push('Add quantifiable achievements with numbers'); }

    // Action verbs
    const actionVerbs = ['achieved', 'improved', 'led', 'developed', 'managed', 'created', 'implemented'];
    const verbCount = actionVerbs.filter(v => text.includes(v)).length;
    if (verbCount >= 3) { score += 10; found.push('Strong action verbs'); }
    else { suggestions.push('Use more action verbs like achieved, improved, led'); }

    return {
      atsScore: Math.min(score, 100),
      jobMatchScore: null,
      breakdown: {
        contactInfo: { score: hasEmail && hasPhone ? 80 : 40, found, missing: missing.filter(m => ['Email', 'Phone', 'LinkedIn'].includes(m)), suggestions: [] },
        experience: { score: text.includes('experience') ? 70 : 30, yearsDetected: null, hasQuantifiableAchievements: hasMetrics, actionVerbsUsed: verbCount, suggestions: [] },
        education: { score: text.includes('education') ? 70 : 30, degreesFound: [], suggestions: [] },
        skills: { score: text.includes('skills') ? 60 : 20, technicalSkills: [], softSkills: [], suggestions: [] },
        formatting: { score: 70, issues: [], suggestions: [] }
      },
      keywordAnalysis: {
        presentKeywords: found,
        missingKeywords: missing,
        keywordDensity: 'Basic analysis',
        industryAlignment: 'General'
      },
      strengths: found.slice(0, 5),
      criticalIssues: missing.slice(0, 5),
      actionableSteps: suggestions.map((s, i) => ({
        priority: i < 2 ? 'high' : 'medium',
        category: 'content',
        action: s,
        impact: 'Improves ATS compatibility'
      })),
      overallAssessment: `Basic analysis completed. Score: ${Math.min(score, 100)}/100. ${suggestions.length} improvements suggested.`,
      metadata: {
        promptVersion: 'fallback',
        analyzedAt: new Date().toISOString(),
        hasJobDescription: !!jobDescription,
        isFallback: true
      }
    };
  }


  /**
   * Optimize resume content for specific job
   * @param {Object} resumeData - Resume data object
   * @param {string} jobDescription - Target job description
   * @returns {Promise<Object>} Optimization suggestions
   */
  async optimizeResume(resumeData, jobDescription = '') {
    const prompt = this._buildOptimizationPrompt(resumeData, jobDescription);
    
    try {
      const response = await this._makeRequest(
        prompt,
        AI_CONFIG.resumeOptimization,
        'resumeOptimization'
      );
      
      return this._parseOptimizationResponse(response);
    } catch (error) {
      console.error('Resume optimization failed:', error);
      return this._getFallbackOptimization(resumeData);
    }
  }

  /**
   * Build optimization prompt
   * @private
   */
  _buildOptimizationPrompt(resumeData, jobDescription) {
    return `You are an expert resume writer and career coach. Optimize this resume for maximum impact.

PROMPT VERSION: ${PROMPT_VERSIONS.RESUME_OPTIMIZATION}

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `TARGET JOB:\n${jobDescription}` : ''}

Provide optimization suggestions in this EXACT JSON format:

{
  "overallScore": <number 0-100>,
  "summaryOptimization": {
    "currentAssessment": "<assessment of current summary>",
    "suggestedSummary": "<optimized professional summary>",
    "improvements": ["list of specific improvements made"]
  },
  "experienceOptimization": [
    {
      "originalDescription": "<original>",
      "optimizedDescription": "<improved version with action verbs and metrics>",
      "addedKeywords": ["keywords added"],
      "improvements": ["specific improvements"]
    }
  ],
  "skillsOptimization": {
    "currentSkills": ["existing skills"],
    "suggestedAdditions": ["skills to add based on industry/job"],
    "skillsToHighlight": ["most important skills to emphasize"],
    "organizationSuggestion": "<how to organize skills section>"
  },
  "keywordSuggestions": {
    "industryKeywords": ["relevant industry keywords"],
    "actionVerbs": ["powerful action verbs to use"],
    "technicalTerms": ["technical terms to include"]
  },
  "formattingTips": ["formatting improvements"],
  "prioritizedActions": [
    {
      "priority": 1,
      "action": "<specific action>",
      "impact": "high|medium|low",
      "effort": "easy|moderate|significant"
    }
  ]
}`;
  }

  /**
   * Parse optimization response
   * @private
   */
  _parseOptimizationResponse(response) {
    const parsed = this._parseJsonResponse(response, {});
    
    return {
      overallScore: Math.max(0, Math.min(100, parsed.overallScore || 70)),
      summaryOptimization: parsed.summaryOptimization || {},
      experienceOptimization: parsed.experienceOptimization || [],
      skillsOptimization: parsed.skillsOptimization || {},
      keywordSuggestions: parsed.keywordSuggestions || {},
      formattingTips: parsed.formattingTips || [],
      prioritizedActions: parsed.prioritizedActions || [],
      metadata: {
        promptVersion: PROMPT_VERSIONS.RESUME_OPTIMIZATION,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Fallback optimization
   * @private
   */
  _getFallbackOptimization(resumeData) {
    return {
      overallScore: 60,
      summaryOptimization: {
        currentAssessment: 'Unable to analyze',
        suggestedSummary: '',
        improvements: ['Add a professional summary highlighting key achievements']
      },
      experienceOptimization: [],
      skillsOptimization: {
        currentSkills: resumeData.skills || [],
        suggestedAdditions: [],
        skillsToHighlight: [],
        organizationSuggestion: 'Group skills by category (Technical, Soft Skills, Tools)'
      },
      keywordSuggestions: {
        industryKeywords: [],
        actionVerbs: ['Achieved', 'Implemented', 'Led', 'Developed', 'Optimized'],
        technicalTerms: []
      },
      formattingTips: [
        'Use consistent formatting throughout',
        'Keep resume to 1-2 pages',
        'Use bullet points for achievements'
      ],
      prioritizedActions: [
        { priority: 1, action: 'Add quantifiable achievements', impact: 'high', effort: 'moderate' },
        { priority: 2, action: 'Include relevant keywords', impact: 'high', effort: 'easy' }
      ],
      metadata: {
        promptVersion: 'fallback',
        generatedAt: new Date().toISOString(),
        isFallback: true
      }
    };
  }

  /**
   * Generate cover letter
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Job description
   * @param {Object} companyInfo - Company information
   * @returns {Promise<Object>} Generated cover letter
   */
  async generateCoverLetter(resumeData, jobDescription, companyInfo = {}) {
    const prompt = this._buildCoverLetterPrompt(resumeData, jobDescription, companyInfo);
    
    try {
      const response = await this._makeRequest(
        prompt,
        AI_CONFIG.coverLetter,
        'coverLetter'
      );
      
      return this._parseCoverLetterResponse(response);
    } catch (error) {
      console.error('Cover letter generation failed:', error);
      throw new AppError('Failed to generate cover letter', 503);
    }
  }

  /**
   * Build cover letter prompt
   * @private
   */
  _buildCoverLetterPrompt(resumeData, jobDescription, companyInfo) {
    return `You are a professional cover letter writer. Create a compelling, personalized cover letter.

PROMPT VERSION: ${PROMPT_VERSIONS.COVER_LETTER}

CANDIDATE INFORMATION:
Name: ${resumeData.personalInfo?.firstName} ${resumeData.personalInfo?.lastName}
Email: ${resumeData.personalInfo?.email}
Current Role: ${resumeData.experience?.[0]?.position || 'Professional'}
Skills: ${(resumeData.skills || []).join(', ')}
Experience Summary: ${resumeData.experience?.slice(0, 2).map(e => `${e.position} at ${e.company}`).join('; ')}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFO:
Company: ${companyInfo.name || 'the company'}
Industry: ${companyInfo.industry || 'Not specified'}
Values: ${companyInfo.values || 'Not specified'}

Generate a cover letter in this JSON format:

{
  "coverLetter": "<full cover letter text, 3-4 paragraphs>",
  "subject": "<email subject line>",
  "keyHighlights": ["3-4 key points emphasized"],
  "personalizedElements": ["elements customized for this company"],
  "toneAnalysis": "<professional/enthusiastic/formal>",
  "wordCount": <number>
}

GUIDELINES:
1. Opening: Hook with specific interest in the company/role
2. Body: Connect experience to job requirements with specific examples
3. Closing: Strong call to action
4. Tone: Professional but personable
5. Length: 250-400 words`;
  }

  /**
   * Parse cover letter response
   * @private
   */
  _parseCoverLetterResponse(response) {
    const parsed = this._parseJsonResponse(response, {});
    
    return {
      coverLetter: parsed.coverLetter || '',
      subject: parsed.subject || 'Application for Position',
      keyHighlights: parsed.keyHighlights || [],
      personalizedElements: parsed.personalizedElements || [],
      toneAnalysis: parsed.toneAnalysis || 'professional',
      wordCount: parsed.wordCount || (parsed.coverLetter?.split(/\s+/).length || 0),
      metadata: {
        promptVersion: PROMPT_VERSIONS.COVER_LETTER,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Generate interview questions
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generated questions
   */
  async generateInterviewQuestions(params) {
    const { company, role, difficulty, questionType, count = 5 } = params;
    
    const prompt = `You are an expert technical interviewer. Generate realistic interview questions.

PROMPT VERSION: ${PROMPT_VERSIONS.INTERVIEW_QUESTIONS}

PARAMETERS:
Company: ${company || 'Tech Company'}
Role: ${role || 'Software Engineer'}
Difficulty: ${difficulty || 'medium'}
Question Type: ${questionType || 'mixed'}
Count: ${count}

Generate questions in this JSON format:

{
  "questions": [
    {
      "id": <number>,
      "content": "<question text>",
      "type": "technical|behavioral|situational|system-design",
      "difficulty": "easy|medium|hard",
      "expectedDuration": "<time in minutes>",
      "keyPoints": ["points a good answer should cover"],
      "sampleAnswer": "<brief sample answer outline>",
      "followUpQuestions": ["potential follow-up questions"],
      "evaluationCriteria": ["what interviewers look for"]
    }
  ],
  "interviewTips": ["general tips for this type of interview"],
  "companyContext": "<relevant info about interviewing at this company>"
}`;

    try {
      const response = await this._makeRequest(
        prompt,
        AI_CONFIG.interviewQuestions,
        'interviewQuestions'
      );
      
      const parsed = this._parseJsonResponse(response, { questions: [] });
      
      return {
        questions: (parsed.questions || []).slice(0, count),
        interviewTips: parsed.interviewTips || [],
        companyContext: parsed.companyContext || '',
        metadata: {
          promptVersion: PROMPT_VERSIONS.INTERVIEW_QUESTIONS,
          generatedAt: new Date().toISOString(),
          params: { company, role, difficulty, questionType, count }
        }
      };
    } catch (error) {
      console.error('Interview question generation failed:', error);
      throw new AppError('Failed to generate interview questions', 503);
    }
  }

  /**
   * Analyze skill gaps
   * @param {Array} userSkills - Current user skills
   * @param {string} targetRole - Target role
   * @param {string} targetCompany - Target company
   * @returns {Promise<Object>} Skill gap analysis
   */
  async analyzeSkillGaps(userSkills, targetRole, targetCompany = '') {
    const prompt = `You are a career development expert. Analyze skill gaps for career transition.

PROMPT VERSION: ${PROMPT_VERSIONS.SKILL_GAP}

CURRENT SKILLS: ${userSkills.join(', ')}
TARGET ROLE: ${targetRole}
TARGET COMPANY: ${targetCompany || 'General'}

Provide analysis in this JSON format:

{
  "matchScore": <number 0-100>,
  "relevantSkills": [
    {
      "skill": "<skill name>",
      "relevance": "high|medium|low",
      "currentLevel": "beginner|intermediate|advanced",
      "marketDemand": "high|medium|low"
    }
  ],
  "missingSkills": [
    {
      "skill": "<skill name>",
      "priority": "critical|important|nice-to-have",
      "estimatedLearningTime": "<time estimate>",
      "resources": [
        {
          "name": "<resource name>",
          "type": "course|book|tutorial|certification",
          "url": "<optional url>",
          "cost": "free|paid"
        }
      ]
    }
  ],
  "learningPath": {
    "phase1": {
      "duration": "<time>",
      "focus": ["skills to learn first"],
      "milestones": ["checkpoints"]
    },
    "phase2": {
      "duration": "<time>",
      "focus": ["next skills"],
      "milestones": ["checkpoints"]
    }
  },
  "marketInsights": {
    "demandTrend": "growing|stable|declining",
    "salaryRange": "<range>",
    "topEmployers": ["companies hiring for this role"]
  },
  "actionPlan": ["immediate actions to take"]
}`;

    try {
      const response = await this._makeRequest(
        prompt,
        AI_CONFIG.skillGap,
        'skillGap'
      );
      
      const parsed = this._parseJsonResponse(response, {});
      
      return {
        matchScore: Math.max(0, Math.min(100, parsed.matchScore || 50)),
        relevantSkills: parsed.relevantSkills || [],
        missingSkills: parsed.missingSkills || [],
        learningPath: parsed.learningPath || {},
        marketInsights: parsed.marketInsights || {},
        actionPlan: parsed.actionPlan || [],
        metadata: {
          promptVersion: PROMPT_VERSIONS.SKILL_GAP,
          analyzedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Skill gap analysis failed:', error);
      throw new AppError('Failed to analyze skill gaps', 503);
    }
  }

  /**
   * Get credit cost for operation
   * @param {string} operationType - Type of operation
   * @returns {number} Credit cost
   */
  getCreditCost(operationType) {
    return CREDIT_COSTS[operationType] || 1;
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const recentRequests = this.requestLog.slice(-100);
    const successCount = recentRequests.filter(r => r.success).length;
    const avgDuration = recentRequests.length > 0
      ? recentRequests.reduce((sum, r) => sum + (r.duration || 0), 0) / recentRequests.length
      : 0;

    return {
      initialized: this.initialized,
      modelAvailable: !!this.model,
      apiKeysConfigured: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex,
      recentSuccessRate: recentRequests.length > 0 ? (successCount / recentRequests.length * 100).toFixed(1) + '%' : 'N/A',
      averageResponseTime: Math.round(avgDuration) + 'ms',
      totalRequests: this.requestLog.length
    };
  }
}

// Export singleton instance
module.exports = new AIServiceV2();
module.exports.CREDIT_COSTS = CREDIT_COSTS;
module.exports.PROMPT_VERSIONS = PROMPT_VERSIONS;
