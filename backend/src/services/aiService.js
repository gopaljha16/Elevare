const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError } = require('../middleware/errorHandler');
const { cacheService } = require('./cacheService');
const aiConfig = require('../config/aiConfig');
const pdfParseModule = require('pdf-parse');
const mammoth = require('mammoth');

const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : pdfParseModule?.default;

class AIService {
  constructor() {
    console.log('🚀 Initializing AI Service...');
    
    // Initialize with robust error handling
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        console.log('💡 Please set GEMINI_API_KEY in your .env file');
        this.genAI = null;
        this.model = null;
        return;
      }
      
      console.log('🔑 API Key found, initializing Gemini AI...');
      this.genAI = new GoogleGenerativeAI(apiKey);
      
      // Try multiple models with fallback
      try {
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('✅ Successfully initialized with gemini-1.5-flash');
      } catch (error) {
        console.warn('⚠️ gemini-1.5-flash failed, trying gemini-pro...');
        try {
          this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
          console.log('✅ Successfully initialized with gemini-pro (fallback)');
        } catch (fallbackError) {
          console.error('❌ Failed to initialize any Gemini model:', fallbackError.message);
          console.error('💡 Check your API key permissions and quota');
          this.genAI = null;
          this.model = null;
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Generative AI:', error.message);
      this.genAI = null;
      this.model = null;
    }
    
    this.generationConfig = {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    };
    
    // Simple default configuration
    this.retryConfig = { attempts: 3, delay: 1000, timeout: 30000 };
    this.requestLoggingEnabled = true;
    this.logLevel = 'info';
  }

  /**
   * Analyze resume text specifically for ATS compatibility
   * @param {string} resumeText - Resume text content
   * @returns {Promise<Object>} ATS analysis results
   */
  async analyzeResumeForATS(resumeText) {
    // If AI is not available, use fallback immediately
    if (!this.model || !this.genAI) {
      console.warn('⚠️ AI service not available, using fallback analysis');
      return this.getFallbackATSAnalysis(resumeText);
    }

    const prompt = this.createATSAnalysisPrompt(resumeText);
    
    try {
      const response = await this._makeAIRequest(prompt, {
        temperature: 0.4,
        maxOutputTokens: 3000
      });
      
      return this.parseATSAnalysisResponse(response);
    } catch (error) {
      console.error('ATS analysis failed:', error);
      // Return fallback analysis
      return this.getFallbackATSAnalysis(resumeText);
    }
  }

  /**
   * Create structured prompt for ATS analysis
   * @param {string} resumeText - Resume text content
   * @returns {string} Formatted prompt
   * @private
   */
  createATSAnalysisPrompt(resumeText) {
    return `
Analyze the following resume for ATS (Applicant Tracking System) compatibility and provide a comprehensive assessment.

RESUME TEXT:
${resumeText}

Please provide a detailed analysis in the following JSON format:

{
  "overallScore": <number 0-100>,
  "sectionAnalysis": {
    "personalInfo": {
      "score": <number 0-25>,
      "issues": ["list of specific issues"],
      "suggestions": ["list of specific improvements"]
    },
    "experience": {
      "score": <number 0-30>,
      "issues": ["list of specific issues"],
      "suggestions": ["list of specific improvements"]
    },
    "education": {
      "score": <number 0-15>,
      "issues": ["list of specific issues"],
      "suggestions": ["list of specific improvements"]
    },
    "skills": {
      "score": <number 0-20>,
      "issues": ["list of specific issues"],
      "suggestions": ["list of specific improvements"]
    },
    "structure": {
      "score": <number 0-10>,
      "issues": ["list of specific issues"],
      "suggestions": ["list of specific improvements"]
    }
  },
  "keywordAnalysis": {
    "presentKeywords": ["list of good keywords found"],
    "missingKeywords": ["list of important keywords missing"],
    "keywordDensity": "assessment of keyword usage"
  },
  "atsCompatibility": {
    "formatIssues": ["list of formatting problems"],
    "parsingConcerns": ["list of potential parsing issues"],
    "recommendations": ["list of ATS optimization suggestions"]
  },
  "strengths": ["list of resume strengths"],
  "criticalIssues": ["list of high-priority problems"],
  "actionableSteps": [
    {
      "priority": "high|medium|low",
      "category": "content|format|keywords|structure",
      "action": "specific action to take",
      "impact": "expected improvement"
    }
  ]
}

Focus on:
1. ATS parsing compatibility
2. Keyword optimization
3. Standard section headers
4. Contact information completeness
5. Quantifiable achievements
6. Professional formatting
7. Industry-specific terminology

Provide specific, actionable feedback that will improve ATS pass-through rates.
`;
  }

  /**
   * Parse AI response for ATS analysis
   * @param {string} response - Raw AI response
   * @returns {Object} Parsed analysis data
   * @private
   */
  parseATSAnalysisResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      return {
        overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
        sectionAnalysis: parsed.sectionAnalysis || {},
        keywordAnalysis: parsed.keywordAnalysis || {},
        atsCompatibility: parsed.atsCompatibility || {},
        strengths: parsed.strengths || [],
        criticalIssues: parsed.criticalIssues || [],
        actionableSteps: parsed.actionableSteps || []
      };
    } catch (error) {
      console.error('Failed to parse ATS analysis response:', error);
      throw new Error('Invalid AI response format');
    }
  }

  /**
   * Provide fallback ATS analysis when AI fails
   * @param {string} resumeText - Resume text content
   * @returns {Object} Basic analysis results
   * @private
   */
  getFallbackATSAnalysis(resumeText) {
    const text = resumeText.toLowerCase();
    let score = 0;
    const issues = [];
    const suggestions = [];

    // Basic scoring
    if (text.includes('@')) score += 15;
    else issues.push('Missing email address');

    if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) score += 10;
    else issues.push('Missing phone number');

    if (text.includes('experience')) score += 20;
    else issues.push('No clear experience section');

    if (text.includes('education')) score += 15;
    else suggestions.push('Add education section');

    if (text.includes('skills')) score += 15;
    else suggestions.push('Add skills section');

    return {
      overallScore: Math.min(score, 100),
      sectionAnalysis: {
        personalInfo: { score: score >= 25 ? 25 : score, issues, suggestions },
        experience: { score: text.includes('experience') ? 20 : 0, issues: [], suggestions: [] },
        education: { score: text.includes('education') ? 15 : 0, issues: [], suggestions: [] },
        skills: { score: text.includes('skills') ? 15 : 0, issues: [], suggestions: [] },
        structure: { score: 5, issues: [], suggestions: [] }
      },
      strengths: score > 50 ? ['Basic structure present'] : [],
      criticalIssues: issues,
      actionableSteps: suggestions.map(s => ({ priority: 'medium', action: s }))
    };
  }

  /**
   * Make a request to the AI service with retry logic and error handling
   * @param {string} prompt - The prompt to send to the AI
   * @param {Object} config - Generation configuration
   * @returns {Promise<string>} AI response text
   * @private
   */
  async _makeAIRequest(prompt, config = {}) {
    if (!this.model || !this.genAI) {
      throw new Error('AI service is not properly initialized');
    }
    
    const finalConfig = { ...this.generationConfig, ...config };
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryConfig.attempts; attempt++) {
      try {
        if (this.requestLoggingEnabled && this.logLevel === 'debug') {
          console.log(`🤖 AI Request (attempt ${attempt}):`, {
            promptLength: prompt.length,
            config: finalConfig,
            timestamp: new Date().toISOString()
          });
        }
        
        const startTime = Date.now();
        
        const result = await Promise.race([
          this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: finalConfig,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.retryConfig.timeout)
          )
        ]);

        const response = await result.response;
        const text = response.text();
        
        const processingTime = Date.now() - startTime;
        
        if (this.requestLoggingEnabled && (this.logLevel === 'debug' || this.logLevel === 'info')) {
          console.log(`✅ AI Request successful (attempt ${attempt}):`, {
            processingTime,
            responseLength: text.length,
            timestamp: new Date().toISOString()
          });
        }
        
        return text;
        
      } catch (error) {
        lastError = error;
        
        if (this.requestLoggingEnabled && (this.logLevel === 'debug' || this.logLevel === 'warn')) {
          console.warn(`⚠️ AI Request failed (attempt ${attempt}/${this.retryConfig.attempts}):`, {
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
        
        // Don't retry on certain errors
        if (error.message.includes('API key') || error.message.includes('quota')) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < this.retryConfig.attempts) {
          const delay = this.retryConfig.delay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All attempts failed
    if (this.requestLoggingEnabled) {
      console.error('❌ All AI request attempts failed:', {
        error: lastError.message,
        attempts: this.retryConfig.attempts,
        timestamp: new Date().toISOString()
      });
    }
    
    throw new AppError('AI service temporarily unavailable', 503);
  }

  // optimize resume content using ai
  async optimizeResumeContent(resumeData, jobDescription = '') {
    try {
      const systemPrompt = 'You are an expert resume writer and career coach. Provide specific, actionable feedback to improve resumes for ATS compatibility and human readability.';
      const userPrompt = this.createResumeOptimizationPrompt(resumeData, jobDescription);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const text = await this._makeAIRequest(fullPrompt);
      
      return this.parseResumeOptimizationResponse(text);
    } catch (error) {
      console.error('AI Resume Optimization Error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  // generate interview questions using ai
  async generateInterviewQuestions(params) {
    try {
      const { company, role, difficulty, questionType, count = 5 } = params;
      const systemPrompt = 'You are an expert technical interviewer. Generate realistic, challenging interview questions that companies actually ask. Include difficulty-appropriate questions and provide suggested answers.';
      const userPrompt = this.createQuestionGenerationPrompt(company, role, difficulty, questionType, count);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { ...this.generationConfig, temperature: 0.8 },
      });

      const response = await result.response;
      const text = response.text();
      
      return this.parseQuestionGenerationResponse(text);
    } catch (error) {
      console.error('AI Question Generation Error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  // evaluate interview answers using ai
  async evaluateInterviewAnswer(question, userAnswer, questionType) {
    try {
      const systemPrompt = 'You are an experienced technical interviewer. Evaluate answers fairly, provide constructive feedback, and suggest improvements. Be encouraging but honest about areas for improvement.';
      const userPrompt = this.createAnswerEvaluationPrompt(question, userAnswer, questionType);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { ...this.generationConfig, temperature: 0.6, maxOutputTokens: 1024 },
      });

      const response = await result.response;
      const text = response.text();
      
      return this.parseAnswerEvaluationResponse(text);
    } catch (error) {
      console.error('AI Answer Evaluation Error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  // generate cover letter using ai
  async generateCoverLetter(resumeData, jobDescription, companyInfo) {
    try {
      const systemPrompt = 'You are a professional career writer specializing in cover letters. Create compelling, personalized cover letters that highlight relevant experience and show genuine interest in the company.';
      const userPrompt = this.createCoverLetterPrompt(resumeData, jobDescription, companyInfo);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { ...this.generationConfig, maxOutputTokens: 1500 },
      });

      const response = await result.response;
      const text = response.text();
      
      return this.parseCoverLetterResponse(text);
    } catch (error) {
      console.error('AI Cover Letter Generation Error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  // analyze skill gaps using ai
  async analyzeSkillGaps(userSkills, targetRole, targetCompany) {
    try {
      const systemPrompt = 'You are a career development expert. Analyze skill gaps and provide actionable learning recommendations based on current market demands and company requirements.';
      const userPrompt = this.createSkillGapAnalysisPrompt(userSkills, targetRole, targetCompany);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: { ...this.generationConfig, temperature: 0.6, maxOutputTokens: 1200 },
      });

      const response = await result.response;
      const text = response.text();
      
      return this.parseSkillGapAnalysisResponse(text);
    } catch (error) {
      console.error('AI Skill Gap Analysis Error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  // comprehensive resume analysis using ai (NEW METHOD) with caching
  async analyzeResumeComprehensive(resumeData) {
    // Generate cache key based on resume content
    const cacheKey = cacheService.generateKey('ai_analysis', resumeData);
    
    try {
      // Try to get cached result first
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          const startTime = Date.now();
          
          const systemPrompt = 'You are an expert resume analyst and career coach. Provide comprehensive, actionable feedback to improve resumes for both ATS compatibility and human readability. Focus on specific, measurable improvements.';
          const userPrompt = this.createResumeAnalysisPrompt(resumeData);
          
          const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
          
          const text = await this._makeAIRequest(fullPrompt, { 
            temperature: 0.4, // Lower temperature for more consistent analysis
            maxOutputTokens: 3000 
          });
          
          const analysisResult = this.parseResumeAnalysisResponse(text);
          
          // Add performance metadata
          analysisResult.metadata = {
            ...analysisResult.metadata,
            processingTime: Date.now() - startTime,
            cached: false,
            cacheKey
          };
          
          return analysisResult;
        },
        {
          memoryTTL: 300,   // 5 minutes in memory
          redisTTL: 7200,   // 2 hours in Redis
          refreshThreshold: 0.8
        }
      );
    } catch (error) {
      console.error('AI Resume Analysis Error:', error);
      throw new AppError('AI service temporarily unavailable', 503);
    }
  }

  // helper methods for creating prompts
  createResumeOptimizationPrompt(resumeData, jobDescription) {
    return `
Please analyze and optimize this resume for ATS compatibility and effectiveness:

RESUME DATA:
Name: ${resumeData.personalInfo?.name || 'Not provided'}
Current Skills: ${resumeData.skills?.join(', ') || 'Not provided'}
Experience: ${JSON.stringify(resumeData.experience || [])}
Education: ${JSON.stringify(resumeData.education || [])}
Projects: ${JSON.stringify(resumeData.projects || [])}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ''}

Please provide:
1. Grammar and language improvements
2. Keyword optimization suggestions
3. Content enhancement recommendations
4. ATS compatibility improvements
5. Overall effectiveness score (1-100)

Format your response as JSON with the following structure:
{
  "grammarImprovements": ["improvement1", "improvement2"],
  "keywordSuggestions": ["keyword1", "keyword2"],
  "contentEnhancements": ["enhancement1", "enhancement2"],
  "atsImprovements": ["improvement1", "improvement2"],
  "effectivenessScore": 85,
  "summary": "Overall assessment and key recommendations"
}
    `;
  }

  createQuestionGenerationPrompt(company, role, difficulty, questionType, count) {
    return `
Generate ${count} realistic ${difficulty} level ${questionType} interview questions for a ${role} position at ${company}.

Requirements:
- Questions should be appropriate for ${difficulty} difficulty level
- Include questions that ${company} might actually ask
- For technical questions, include coding problems or system design scenarios
- For behavioral questions, use STAR method format
- Provide suggested answers or key points to cover

Format your response as JSON:
{
  "questions": [
    {
      "content": "Question text here",
      "type": "${questionType}",
      "difficulty": "${difficulty}",
      "suggestedAnswer": "Key points or sample answer",
      "hints": ["hint1", "hint2"],
      "category": "relevant category"
    }
  ]
}
    `;
  }

  createAnswerEvaluationPrompt(question, userAnswer, questionType) {
    return `
Evaluate this interview answer:

QUESTION: ${question}
QUESTION TYPE: ${questionType}
USER ANSWER: ${userAnswer}

Please provide:
1. Score out of 100
2. Strengths in the answer
3. Areas for improvement
4. Specific suggestions for better answers
5. Overall feedback

Format as JSON:
{
  "score": 75,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "feedback": "Overall constructive feedback"
}
    `;
  }

  createCoverLetterPrompt(resumeData, jobDescription, companyInfo) {
    return `
Generate a professional cover letter:

CANDIDATE INFO:
Name: ${resumeData.personalInfo?.name}
Skills: ${resumeData.skills?.join(', ')}
Experience: ${JSON.stringify(resumeData.experience?.slice(0, 2))}
Education: ${JSON.stringify(resumeData.education)}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFO:
${companyInfo || 'Research the company values and culture'}

Create a compelling cover letter that:
1. Shows genuine interest in the company
2. Highlights relevant experience
3. Demonstrates value proposition
4. Maintains professional tone
5. Is 3-4 paragraphs long

Format as JSON:
{
  "coverLetter": "Full cover letter text",
  "keyHighlights": ["highlight1", "highlight2"],
  "personalizedElements": ["element1", "element2"]
}
    `;
  }

  createSkillGapAnalysisPrompt(userSkills, targetRole, targetCompany) {
    return `
Analyze skill gaps for career transition:

CURRENT SKILLS: ${userSkills.join(', ')}
TARGET ROLE: ${targetRole}
TARGET COMPANY: ${targetCompany}

Provide:
1. Skills the user already has that are relevant
2. Missing skills needed for the target role
3. Priority order for learning missing skills
4. Recommended learning resources
5. Timeline for skill development

Format as JSON:
{
  "relevantSkills": ["skill1", "skill2"],
  "missingSkills": [
    {
      "skill": "skill name",
      "priority": "high/medium/low",
      "estimatedLearningTime": "X weeks",
      "resources": ["resource1", "resource2"]
    }
  ],
  "learningPath": "Recommended sequence and timeline",
  "marketDemand": "Analysis of skill demand in the market"
}
    `;
  }

  // NEW: Create comprehensive resume analysis prompt
  createResumeAnalysisPrompt(resumeData) {
    const personalInfo = resumeData.personalInfo || {};
    const experience = resumeData.experience || [];
    const education = resumeData.education || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];
    const achievements = resumeData.achievements || [];

    return `
Analyze this resume comprehensively and provide detailed feedback:

PERSONAL INFORMATION:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Email: ${personalInfo.email || 'Not provided'}
Phone: ${personalInfo.phone || 'Not provided'}
Location: ${personalInfo.location || 'Not provided'}
LinkedIn: ${personalInfo.linkedin || 'Not provided'}
Portfolio: ${personalInfo.portfolio || 'Not provided'}

WORK EXPERIENCE (${experience.length} entries):
${experience.map((exp, index) => `
${index + 1}. ${exp.position || 'Position not specified'} at ${exp.company || 'Company not specified'}
   Duration: ${exp.startDate || 'Start date not specified'} - ${exp.current ? 'Present' : (exp.endDate || 'End date not specified')}
   Description: ${exp.description || 'No description provided'}
   Achievements: ${exp.achievements ? exp.achievements.join(', ') : 'None listed'}
`).join('')}

EDUCATION (${education.length} entries):
${education.map((edu, index) => `
${index + 1}. ${edu.degree || 'Degree not specified'} in ${edu.field || 'Field not specified'}
   Institution: ${edu.institution || 'Institution not specified'}
   Graduation: ${edu.graduationDate || 'Date not specified'}
   GPA: ${edu.gpa || 'Not provided'}
`).join('')}

SKILLS (${skills.length} total):
${skills.join(', ') || 'No skills listed'}

PROJECTS (${projects.length} entries):
${projects.map((proj, index) => `
${index + 1}. ${proj.name || 'Project name not specified'}
   Description: ${proj.description || 'No description provided'}
   Technologies: ${proj.technologies ? proj.technologies.join(', ') : 'None listed'}
   Link: ${proj.link || 'No link provided'}
`).join('')}

ACHIEVEMENTS (${achievements.length} entries):
${achievements.join(', ') || 'No achievements listed'}

Please provide a comprehensive analysis in the following JSON format:
{
  "overallScore": number (0-100),
  "sectionAnalysis": {
    "personalInfo": {
      "completeness": number (0-100),
      "suggestions": ["suggestion1", "suggestion2"],
      "score": number (0-100)
    },
    "experience": {
      "completeness": number (0-100),
      "suggestions": ["suggestion1", "suggestion2"],
      "score": number (0-100)
    },
    "education": {
      "completeness": number (0-100),
      "suggestions": ["suggestion1", "suggestion2"],
      "score": number (0-100)
    },
    "skills": {
      "completeness": number (0-100),
      "suggestions": ["suggestion1", "suggestion2"],
      "score": number (0-100)
    },
    "projects": {
      "completeness": number (0-100),
      "suggestions": ["suggestion1", "suggestion2"],
      "score": number (0-100)
    }
  },
  "grammarSuggestions": ["grammar improvement 1", "grammar improvement 2"],
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3"],
  "atsOptimization": ["ats improvement 1", "ats improvement 2"],
  "actionableFeedback": [
    {
      "priority": "high|medium|low",
      "category": "content|formatting|keywords|grammar",
      "suggestion": "specific actionable suggestion",
      "impact": "description of expected impact"
    }
  ],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "industryAlignment": "assessment of how well the resume aligns with modern industry standards",
  "nextSteps": ["immediate action 1", "immediate action 2"]
}

Focus on:
1. ATS (Applicant Tracking System) compatibility
2. Content quality and quantifiable achievements
3. Professional formatting and structure
4. Industry-relevant keywords
5. Grammar and language improvements
6. Missing critical information
7. Overall professional presentation
    `;
  }

  // helper methods for parsing ai responses
  parseResumeOptimizationResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      // fallback parsing if json is malformed
      return {
        grammarImprovements: [],
        keywordSuggestions: [],
        contentEnhancements: [],
        atsImprovements: [],
        effectivenessScore: 70,
        summary: response.substring(0, 500)
      };
    }
  }

  parseQuestionGenerationResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      return { questions: [] };
    }
  }

  parseAnswerEvaluationResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        score: 70,
        strengths: [],
        improvements: [],
        suggestions: [],
        feedback: response.substring(0, 300)
      };
    }
  }

  parseCoverLetterResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        coverLetter: response,
        keyHighlights: [],
        personalizedElements: []
      };
    }
  }

  parseSkillGapAnalysisResponse(response) {
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        relevantSkills: [],
        missingSkills: [],
        learningPath: response.substring(0, 500),
        marketDemand: 'Analysis unavailable'
      };
    }
  }

  // NEW: Parse comprehensive resume analysis response
  parseResumeAnalysisResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate and sanitize the response
        return {
          overallScore: Math.max(0, Math.min(100, parsed.overallScore || 0)),
          sectionAnalysis: {
            personalInfo: {
              completeness: Math.max(0, Math.min(100, parsed.sectionAnalysis?.personalInfo?.completeness || 0)),
              suggestions: Array.isArray(parsed.sectionAnalysis?.personalInfo?.suggestions) 
                ? parsed.sectionAnalysis.personalInfo.suggestions.slice(0, 5) 
                : [],
              score: Math.max(0, Math.min(100, parsed.sectionAnalysis?.personalInfo?.score || 0))
            },
            experience: {
              completeness: Math.max(0, Math.min(100, parsed.sectionAnalysis?.experience?.completeness || 0)),
              suggestions: Array.isArray(parsed.sectionAnalysis?.experience?.suggestions) 
                ? parsed.sectionAnalysis.experience.suggestions.slice(0, 5) 
                : [],
              score: Math.max(0, Math.min(100, parsed.sectionAnalysis?.experience?.score || 0))
            },
            education: {
              completeness: Math.max(0, Math.min(100, parsed.sectionAnalysis?.education?.completeness || 0)),
              suggestions: Array.isArray(parsed.sectionAnalysis?.education?.suggestions) 
                ? parsed.sectionAnalysis.education.suggestions.slice(0, 5) 
                : [],
              score: Math.max(0, Math.min(100, parsed.sectionAnalysis?.education?.score || 0))
            },
            skills: {
              completeness: Math.max(0, Math.min(100, parsed.sectionAnalysis?.skills?.completeness || 0)),
              suggestions: Array.isArray(parsed.sectionAnalysis?.skills?.suggestions) 
                ? parsed.sectionAnalysis.skills.suggestions.slice(0, 5) 
                : [],
              score: Math.max(0, Math.min(100, parsed.sectionAnalysis?.skills?.score || 0))
            },
            projects: {
              completeness: Math.max(0, Math.min(100, parsed.sectionAnalysis?.projects?.completeness || 0)),
              suggestions: Array.isArray(parsed.sectionAnalysis?.projects?.suggestions) 
                ? parsed.sectionAnalysis.projects.suggestions.slice(0, 5) 
                : [],
              score: Math.max(0, Math.min(100, parsed.sectionAnalysis?.projects?.score || 0))
            }
          },
          grammarSuggestions: Array.isArray(parsed.grammarSuggestions) 
            ? parsed.grammarSuggestions.slice(0, 10) 
            : [],
          keywordSuggestions: Array.isArray(parsed.keywordSuggestions) 
            ? parsed.keywordSuggestions.slice(0, 15) 
            : [],
          atsOptimization: Array.isArray(parsed.atsOptimization) 
            ? parsed.atsOptimization.slice(0, 10) 
            : [],
          actionableFeedback: Array.isArray(parsed.actionableFeedback) 
            ? parsed.actionableFeedback.slice(0, 10).map(feedback => ({
                priority: ['high', 'medium', 'low'].includes(feedback.priority) ? feedback.priority : 'medium',
                category: ['content', 'formatting', 'keywords', 'grammar'].includes(feedback.category) ? feedback.category : 'content',
                suggestion: String(feedback.suggestion || '').substring(0, 200),
                impact: String(feedback.impact || '').substring(0, 200)
              }))
            : [],
          strengths: Array.isArray(parsed.strengths) 
            ? parsed.strengths.slice(0, 8) 
            : [],
          weaknesses: Array.isArray(parsed.weaknesses) 
            ? parsed.weaknesses.slice(0, 8) 
            : [],
          industryAlignment: String(parsed.industryAlignment || '').substring(0, 500),
          nextSteps: Array.isArray(parsed.nextSteps) 
            ? parsed.nextSteps.slice(0, 5) 
            : []
        };
      }
      
      throw new Error('No valid JSON found in response');
    } catch (error) {
      console.error('Failed to parse comprehensive resume analysis:', error);
      
      // Return fallback analysis
      return this.getFallbackComprehensiveAnalysis(response);
    }
  }

  // NEW: Fallback analysis when AI parsing fails
  getFallbackComprehensiveAnalysis(originalResponse = '') {
    return {
      overallScore: 65,
      sectionAnalysis: {
        personalInfo: {
          completeness: 70,
          suggestions: ["Ensure all contact information is complete", "Add LinkedIn profile if missing"],
          score: 70
        },
        experience: {
          completeness: 60,
          suggestions: ["Add more quantifiable achievements", "Include specific technologies used"],
          score: 60
        },
        education: {
          completeness: 80,
          suggestions: ["Consider adding relevant coursework", "Include GPA if above 3.5"],
          score: 80
        },
        skills: {
          completeness: 50,
          suggestions: ["Add more technical skills", "Include both hard and soft skills"],
          score: 50
        },
        projects: {
          completeness: 40,
          suggestions: ["Add more project details", "Include links to live projects or repositories"],
          score: 40
        }
      },
      grammarSuggestions: [
        "Review for consistent verb tense usage",
        "Check for proper punctuation in bullet points"
      ],
      keywordSuggestions: [
        "Add industry-specific keywords",
        "Include relevant technical terms",
        "Use action verbs in experience descriptions"
      ],
      atsOptimization: [
        "Use standard section headings",
        "Avoid graphics and complex formatting",
        "Include keywords from job descriptions"
      ],
      actionableFeedback: [
        {
          priority: "high",
          category: "content",
          suggestion: "Add quantifiable achievements to experience section",
          impact: "Helps recruiters understand your impact and value"
        },
        {
          priority: "medium",
          category: "keywords",
          suggestion: "Include more industry-relevant keywords",
          impact: "Improves ATS compatibility and searchability"
        }
      ],
      strengths: [
        "Clear contact information provided",
        "Professional structure and formatting"
      ],
      weaknesses: [
        "Limited quantifiable achievements",
        "Could benefit from more specific examples"
      ],
      industryAlignment: "Resume shows good potential but could be enhanced with more specific achievements and industry keywords.",
      nextSteps: [
        "Add specific metrics to experience descriptions",
        "Include more relevant technical skills",
        "Review and optimize for ATS compatibility"
      ]
    };
  }

  // Parse resume file using AI with improved extraction
  async parseResumeFile(file) {
    let extractedText = '';
    
    try {
      console.log('🔍 Starting resume file parsing...');
      console.log('File details:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });
      
      
      // Extract text based on file type
      if (file.mimetype === 'application/pdf') {
        console.log('📄 Extracting text from PDF...');
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('📄 Extracting text from DOCX...');
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = docxData.value;
      } else if (file.mimetype === 'application/msword') {
        console.log('📄 Extracting text from DOC...');
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = docxData.value;
      } else {
        throw new Error(`Unsupported file format: ${file.mimetype}`);
      }
      
      if (!extractedText || extractedText.trim().length === 0) {
        console.error('❌ No text could be extracted from the file');
        throw new Error('No text could be extracted from the file');
      }
      
      console.log('✅ Text extraction successful');
      console.log('📊 Extracted text stats:', {
        length: extractedText.length,
        lines: extractedText.split('\n').length,
        words: extractedText.split(/\s+/).length
      });
      console.log('📝 First 500 characters:', extractedText.substring(0, 500));
      
      // Try AI parsing first
      if (this.model) {
        try {
          console.log('🤖 Attempting AI-powered parsing...');
          const aiResult = await this.parseWithAI(extractedText);
          if (this.isValidResumeData(aiResult)) {
            console.log('✅ AI parsing successful!');
            return aiResult;
          } else {
            console.warn('⚠️ AI parsing returned invalid data, trying fallback...');
          }
        } catch (aiError) {
          console.error('❌ AI parsing failed:', aiError.message);
        }
      } else {
        console.warn('⚠️ AI model not available, using text parsing...');
      }
      
      // Fallback to enhanced text parsing
      console.log('🔧 Using enhanced text parsing fallback...');
      const textResult = await this.enhancedTextParsing(extractedText);
      console.log('✅ Text parsing completed');
      return textResult;
      
    } catch (error) {
      console.error('❌ Resume parsing failed completely:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }
  
  // AI-powered parsing with enhanced prompts for complete extraction
  async parseWithAI(extractedText) {
    console.log('🤖 Starting AI-powered resume parsing...');
    
    const prompt = `You are an expert resume parser with advanced text analysis capabilities. Your task is to extract ALL available information from this resume text and structure it properly.

CRITICAL INSTRUCTIONS:
1. Extract EVERY piece of information you can find in the text
2. Look for contact details, skills, experience, education, projects, and social links
3. Be thorough - scan the entire text multiple times if needed
4. For missing information, use empty strings or empty arrays (do NOT make up data)
5. Return ONLY valid JSON with no markdown formatting or additional text
6. Pay special attention to different resume formats and layouts

RESUME TEXT TO ANALYZE:
${extractedText}

EXTRACTION REQUIREMENTS:
- Personal Info: Find name, email, phone, location, LinkedIn, GitHub, portfolio links
- Summary: Look for objective, summary, about me, or professional statement sections
- Skills: Categorize into technical skills, soft skills, and tools/software
- Experience: Extract job titles, companies, dates, descriptions, and achievements
- Projects: Find project names, descriptions, technologies used, and links
- Education: Get degrees, institutions, graduation dates, and GPA if mentioned

Return the data in this EXACT JSON structure:
{
  "personalInfo": {
    "name": "Full Name (required - extract from resume)",
    "email": "email@domain.com (extract if found)",
    "phone": "phone number (extract if found)",
    "location": "city, state/country (extract if found)",
    "social": {
      "linkedin": "LinkedIn profile URL",
      "github": "GitHub profile URL", 
      "portfolio": "Personal website/portfolio URL"
    }
  },
  "summary": "Professional summary or objective statement (extract full text)",
  "skills": {
    "technical": ["React", "Node.js", "Python", "etc - list ALL technical skills found"],
    "soft": ["Leadership", "Communication", "etc - list ALL soft skills found"],
    "tools": ["VS Code", "Git", "Docker", "etc - list ALL tools/software mentioned"]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "Work Location",
      "startDate": "Start Date (YYYY-MM format if possible)",
      "endDate": "End Date or Present",
      "current": true/false,
      "description": "Full job description and responsibilities",
      "achievements": ["List specific achievements and accomplishments"],
      "technologies": ["Technologies used in this role"]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Detailed project description and your role",
      "technologies": ["Tech stack used - React, Node.js, etc"],
      "links": {
        "github": "GitHub repository URL if mentioned",
        "live": "Live demo URL if mentioned"
      },
      "featured": true
    }
  ],
  "education": [
    {
      "degree": "Degree Name (B.Tech, M.S., etc)",
      "institution": "College/University Name",
      "location": "Institution Location",
      "startDate": "Start Year",
      "endDate": "Graduation Year",
      "gpa": "GPA if mentioned"
    }
  ]
}

IMPORTANT: Scan the text thoroughly and extract as much information as possible. This is critical for generating a complete portfolio.`;
    
    const result = await this.model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean and parse JSON response
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
    cleanedResponse = cleanedResponse.replace(/```\s*|\s*```/g, '');
    
    // Find JSON object
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    const parsedData = JSON.parse(cleanedResponse);
    return this.validateAndCleanResumeData(parsedData);
  }
  
  // Basic text parsing fallback
  basicTextParsing(text) {
    console.log('Using basic text parsing fallback');
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to basicTextParsing');
      text = '';
    }
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract basic information using regex patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    
    let name = '';
    let email = '';
    let phone = '';
    let location = '';
    const skills = [];
    
    // Try to find name (usually first non-empty line or line with common name patterns)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 2 && line.length < 50 && 
          !emailRegex.test(line) && !phoneRegex.test(line) &&
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv')) {
        name = line;
        break;
      }
    }
    
    // Extract email
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      email = emailMatch[0];
    }
    
    // Extract phone
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      phone = phoneMatch[0];
    }
    
    // Look for common skill keywords
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML', 'CSS', 'MongoDB', 
      'SQL', 'Git', 'Docker', 'AWS', 'TypeScript', 'Vue', 'Angular', 'Express',
      'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST', 'API', 'Linux', 'Ubuntu'
    ];
    
    const textLower = text.toLowerCase();
    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });
    
    return this.validateAndCleanResumeData({
      personalInfo: {
        name: name || 'Name not found',
        email: email,
        phone: phone,
        location: location,
        social: {}
      },
      summary: '',
      skills: {
        technical: skills,
        soft: [],
        tools: []
      },
      experience: [],
      projects: [],
      education: []
    });
  }
  
  // Validate and clean resume data
  validateAndCleanResumeData(data) {
    const cleanData = {
      personalInfo: {
        name: data.personalInfo?.name || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        social: {
          linkedin: data.personalInfo?.social?.linkedin || '',
          github: data.personalInfo?.social?.github || '',
          portfolio: data.personalInfo?.social?.portfolio || ''
        }
      },
      summary: data.summary || '',
      skills: {
        technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
        soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        tools: Array.isArray(data.skills?.tools) ? data.skills.tools : []
      },
      experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : []
      })) : [],
      projects: Array.isArray(data.projects) ? data.projects.map(proj => ({
        title: proj.title || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        links: {
          github: proj.links?.github || '',
          live: proj.links?.live || ''
        },
        featured: proj.featured || false
      })) : [],
      education: Array.isArray(data.education) ? data.education.map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        gpa: edu.gpa || ''
      })) : []
    };
    
    return cleanData;
  }

  // Enhanced text parsing with better extraction
  async enhancedTextParsing(text) {
    console.log('🔧 Starting enhanced text parsing...');
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to enhancedTextParsing');
      return this.getEmptyResumeData();
    }
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const textLower = text.toLowerCase();
    
    // Enhanced regex patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/profile\/view\?id=)([a-zA-Z0-9-]+)/gi;
    const githubRegex = /(?:github\.com\/)([a-zA-Z0-9-]+)/gi;
    
    // Extract personal information
    const personalInfo = {
      name: this.extractName(lines),
      email: this.extractEmail(text, emailRegex),
      phone: this.extractPhone(text, phoneRegex),
      location: this.extractLocation(lines),
      social: {
        linkedin: this.extractSocialLink(text, linkedinRegex, 'linkedin'),
        github: this.extractSocialLink(text, githubRegex, 'github'),
        portfolio: ''
      }
    };
    
    // Extract skills with better categorization
    const skills = this.extractSkills(text);
    
    // Extract experience
    const experience = this.extractExperience(text, lines);
    
    // Extract education
    const education = this.extractEducation(text, lines);
    
    // Extract projects
    const projects = this.extractProjects(text, lines);
    
    // Extract summary
    const summary = this.extractSummary(text, lines);
    
    const result = {
      personalInfo,
      summary,
      skills,
      experience,
      projects,
      education
    };
    
    console.log('✅ Enhanced text parsing completed');
    return this.validateAndCleanResumeData(result);
  }
  
  // Helper methods for enhanced text parsing
  extractName(lines) {
    // Look for name in first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 2 && line.length < 60 && 
          !line.includes('@') && 
          !line.match(/\d{3}/) &&
          !line.toLowerCase().includes('resume') &&
          !line.toLowerCase().includes('cv') &&
          !line.toLowerCase().includes('curriculum')) {
        // Check if it looks like a name (has spaces, proper case)
        if (line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) || line.match(/^[A-Z][a-z]+$/)) {
          return line;
        }
      }
    }
    return '';
  }
  
  extractEmail(text, emailRegex) {
    const matches = text.match(emailRegex);
    return matches ? matches[0] : '';
  }
  
  extractPhone(text, phoneRegex) {
    const matches = text.match(phoneRegex);
    return matches ? matches[0] : '';
  }
  
  extractLocation(lines) {
    // Look for location patterns (City, State or City, Country)
    for (const line of lines) {
      if (line.match(/^[A-Za-z\s]+,\s*[A-Za-z\s]+$/)) {
        return line;
      }
    }
    return '';
  }
  
  extractSocialLink(text, regex, platform) {
    const matches = text.match(regex);
    if (matches && matches[0]) {
      return matches[0].includes('http') ? matches[0] : `https://${matches[0]}`;
    }
    return '';
  }
  
  extractSkills(text) {
    const technicalSkills = [
      // Programming Languages
      'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
      // Frontend Technologies
      'React', 'Vue', 'Angular', 'HTML', 'CSS', 'SCSS', 'SASS', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'Chakra UI', 'Next.js', 'Nuxt.js', 'Gatsby', 'Svelte',
      // Backend Technologies
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'ASP.NET', 'FastAPI', 'NestJS',
      // Databases
      'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Cassandra', 'DynamoDB', 'Firebase', 'Supabase',
      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible', 'Heroku', 'Netlify', 'Vercel',
      // Other Technologies
      'GraphQL', 'REST API', 'Git', 'Linux', 'Ubuntu', 'Microservices', 'Machine Learning', 'AI', 'Blockchain', 'Web3'
    ];
    
    const softSkills = [
      'Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Project Management',
      'Critical Thinking', 'Creativity', 'Adaptability', 'Time Management', 'Collaboration',
      'Analytical Skills', 'Decision Making', 'Conflict Resolution', 'Mentoring', 'Public Speaking',
      'Negotiation', 'Strategic Planning', 'Customer Service', 'Attention to Detail', 'Multitasking'
    ];
    
    const tools = [
      // Development Tools
      'VS Code', 'IntelliJ', 'Eclipse', 'Sublime Text', 'Atom', 'Vim', 'Emacs', 'WebStorm', 'PyCharm',
      // Design Tools
      'Photoshop', 'Illustrator', 'Figma', 'Sketch', 'Adobe XD', 'Canva', 'InVision', 'Zeplin',
      // Project Management
      'Jira', 'Trello', 'Asana', 'Monday.com', 'Notion', 'Confluence',
      // Communication
      'Slack', 'Discord', 'Zoom', 'Teams', 'Skype',
      // Testing
      'Jest', 'Cypress', 'Selenium', 'Postman', 'Insomnia',
      // Version Control
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN'
    ];
    
    const textLower = text.toLowerCase();
    
    // More sophisticated matching
    const foundTechnical = technicalSkills.filter(skill => {
      const skillLower = skill.toLowerCase();
      return textLower.includes(skillLower) || 
             textLower.includes(skillLower.replace(/\./g, '')) || // Handle Node.js -> nodejs
             textLower.includes(skillLower.replace(/\s+/g, '')); // Handle spaces
    });
    
    const foundSoft = softSkills.filter(skill => {
      const skillLower = skill.toLowerCase();
      return textLower.includes(skillLower) || 
             textLower.includes(skillLower.replace(/\s+/g, ''));
    });
    
    const foundTools = tools.filter(tool => {
      const toolLower = tool.toLowerCase();
      return textLower.includes(toolLower) || 
             textLower.includes(toolLower.replace(/\s+/g, ''));
    });
    
    return {
      technical: foundTechnical,
      soft: foundSoft,
      tools: foundTools
    };
  }
  
  extractExperience(text, lines) {
    const experience = [];
    const textLower = text.toLowerCase();
    
    // Look for experience section
    const experienceIndex = lines.findIndex(line => 
      line.toLowerCase().includes('experience') || 
      line.toLowerCase().includes('work history') ||
      line.toLowerCase().includes('employment')
    );
    
    if (experienceIndex !== -1) {
      // Simple extraction - look for company patterns after experience section
      for (let i = experienceIndex + 1; i < lines.length && i < experienceIndex + 20; i++) {
        const line = lines[i];
        if (line.length > 10 && line.includes('|') || line.includes('-')) {
          // Try to parse job entry
          const parts = line.split(/[|-]/);
          if (parts.length >= 2) {
            experience.push({
              title: parts[0].trim(),
              company: parts[1].trim(),
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: '',
              achievements: [],
              technologies: []
            });
          }
        }
      }
    }
    
    return experience;
  }
  
  extractEducation(text, lines) {
    const education = [];
    const textLower = text.toLowerCase();
    
    // Look for education section
    const educationIndex = lines.findIndex(line => 
      line.toLowerCase().includes('education') || 
      line.toLowerCase().includes('academic') ||
      line.toLowerCase().includes('qualification')
    );
    
    if (educationIndex !== -1) {
      // Look for degree patterns
      const degreeKeywords = ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate'];
      
      for (let i = educationIndex + 1; i < lines.length && i < educationIndex + 10; i++) {
        const line = lines[i];
        const lineLower = line.toLowerCase();
        
        if (degreeKeywords.some(keyword => lineLower.includes(keyword))) {
          education.push({
            degree: line,
            institution: '',
            location: '',
            startDate: '',
            endDate: '',
            gpa: ''
          });
        }
      }
    }
    
    return education;
  }
  
  extractProjects(text, lines) {
    const projects = [];
    
    // Look for projects section
    const projectIndex = lines.findIndex(line => 
      line.toLowerCase().includes('project') || 
      line.toLowerCase().includes('portfolio')
    );
    
    if (projectIndex !== -1) {
      // Simple project extraction
      for (let i = projectIndex + 1; i < lines.length && i < projectIndex + 15; i++) {
        const line = lines[i];
        if (line.length > 5 && !line.includes('@') && !line.match(/\d{3}/)) {
          projects.push({
            title: line,
            description: '',
            technologies: [],
            links: {
              github: '',
              live: ''
            },
            featured: false
          });
        }
      }
    }
    
    return projects;
  }
  
  extractSummary(text, lines) {
    // Look for summary/objective section
    const summaryIndex = lines.findIndex(line => 
      line.toLowerCase().includes('summary') || 
      line.toLowerCase().includes('objective') ||
      line.toLowerCase().includes('about')
    );
    
    if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
      // Take next few lines as summary
      const summaryLines = lines.slice(summaryIndex + 1, summaryIndex + 4);
      return summaryLines.join(' ').substring(0, 300);
    }
    
    return '';
  }
  
  // Validate if resume data has meaningful content
  isValidResumeData(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Check if we have at least a name or email
    const hasPersonalInfo = data.personalInfo && 
      (data.personalInfo.name && data.personalInfo.name !== 'Name not found' && data.personalInfo.name.length > 0) ||
      (data.personalInfo.email && data.personalInfo.email.length > 0);
    
    // Check if we have some content (skills, experience, education, or projects)
    const hasContent = 
      (data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0 || data.skills.tools?.length > 0)) ||
      (data.experience && data.experience.length > 0) ||
      (data.education && data.education.length > 0) ||
      (data.projects && data.projects.length > 0) ||
      (data.summary && data.summary.length > 10);
    
    return hasPersonalInfo || hasContent;
  }
  
  // Get empty resume data structure
  getEmptyResumeData() {
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        social: {
          linkedin: '',
          github: '',
          portfolio: ''
        }
      },
      summary: '',
      skills: {
        technical: [],
        soft: [],
        tools: []
      },
      experience: [],
      projects: [],
      education: []
    };
  }

  // rate limiting and cost management
  async checkRateLimit() {
    return true;
  }

  /**
   * Generate interview questions based on company, role, and difficulty
   * @param {Object} params - Question generation parameters
   * @returns {Promise<Object>} Generated questions
   */
  async generateInterviewQuestions({ company, role, difficulty, questionType, count = 5 }) {
    if (!this.model || !this.genAI) {
      console.warn('⚠️ AI service not available, using fallback questions');
      return this.getFallbackInterviewQuestions({ company, role, difficulty, questionType, count });
    }

    const prompt = `Generate ${count} ${difficulty} level ${questionType} interview questions for a ${role} position at ${company}.

For each question, provide:
1. The question content
2. Type (technical, behavioral, coding, system-design)
3. Difficulty level
4. A suggested answer or approach
5. 2-3 hints for the candidate
6. Category/topic

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "content": "question text here",
      "type": "${questionType}",
      "difficulty": "${difficulty}",
      "suggestedAnswer": "detailed answer or approach",
      "hints": ["hint 1", "hint 2"],
      "category": "topic/category"
    }
  ]
}

Make questions realistic and relevant to ${company}'s interview process.`;

    try {
      const response = await this._makeAIRequest(prompt, {
        temperature: 0.7,
        maxOutputTokens: 3000
      });

      return this.parseInterviewQuestionsResponse(response);
    } catch (error) {
      console.error('Interview question generation failed:', error);
      return this.getFallbackInterviewQuestions({ company, role, difficulty, questionType, count });
    }
  }

  /**
   * Parse AI response for interview questions
   */
  parseInterviewQuestionsResponse(response) {
    try {
      let cleanedText = response.trim();
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return {
            questions: parsed.questions.map(q => ({
              content: String(q.content || '').substring(0, 500),
              type: q.type || 'technical',
              difficulty: q.difficulty || 'medium',
              suggestedAnswer: String(q.suggestedAnswer || '').substring(0, 1000),
              hints: Array.isArray(q.hints) ? q.hints.slice(0, 3) : [],
              category: String(q.category || 'general')
            }))
          };
        }
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse interview questions:', error);
      return { questions: [] };
    }
  }

  /**
   * Fallback interview questions when AI is unavailable
   */
  getFallbackInterviewQuestions({ company, role, difficulty, questionType, count }) {
    const technicalQuestions = [
      {
        content: "Explain the difference between REST and GraphQL APIs. When would you use each?",
        type: "technical",
        difficulty: "medium",
        suggestedAnswer: "REST uses multiple endpoints with fixed data structures, while GraphQL uses a single endpoint with flexible queries. Use REST for simple, cacheable APIs and GraphQL for complex data requirements with multiple relationships.",
        hints: ["Think about data fetching efficiency", "Consider caching strategies"],
        category: "API Design"
      },
      {
        content: "What is the time complexity of searching in a balanced binary search tree?",
        type: "technical",
        difficulty: "easy",
        suggestedAnswer: "O(log n) - In a balanced BST, the height is logarithmic, so search operations take O(log n) time.",
        hints: ["Consider the tree height", "Think about binary search"],
        category: "Data Structures"
      },
      {
        content: "Implement a function to reverse a linked list iteratively.",
        type: "coding",
        difficulty: "medium",
        suggestedAnswer: "Use three pointers (prev, current, next) to reverse the links while traversing the list.",
        hints: ["Use three pointers", "Reverse links as you traverse"],
        category: "Algorithms"
      },
      {
        content: "Design a URL shortening service like bit.ly. What are the key components?",
        type: "system-design",
        difficulty: "hard",
        suggestedAnswer: "Key components: URL generation service, database for mappings, caching layer, load balancer, analytics service. Consider scalability, collision handling, and custom URLs.",
        hints: ["Think about scalability", "Consider database design"],
        category: "System Design"
      },
      {
        content: "Explain the concept of closures in JavaScript with an example.",
        type: "technical",
        difficulty: "medium",
        suggestedAnswer: "A closure is a function that has access to variables in its outer scope even after the outer function has returned. Example: function outer() { let count = 0; return function inner() { return ++count; } }",
        hints: ["Think about scope chain", "Consider function returning function"],
        category: "JavaScript"
      }
    ];

    const behavioralQuestions = [
      {
        content: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
        type: "behavioral",
        difficulty: "medium",
        suggestedAnswer: "Use STAR method: Describe the Situation, Task, Action you took, and Result. Focus on communication, empathy, and problem-solving skills.",
        hints: ["Use STAR method", "Focus on resolution"],
        category: "Teamwork"
      },
      {
        content: "Describe a challenging project you worked on and how you overcame obstacles.",
        type: "behavioral",
        difficulty: "medium",
        suggestedAnswer: "Highlight technical challenges, your problem-solving approach, collaboration with team, and measurable outcomes.",
        hints: ["Quantify your impact", "Show problem-solving"],
        category: "Problem Solving"
      },
      {
        content: "Give an example of when you had to learn a new technology quickly for a project.",
        type: "behavioral",
        difficulty: "easy",
        suggestedAnswer: "Describe the technology, your learning approach (documentation, tutorials, practice), timeline, and how you successfully applied it.",
        hints: ["Show learning agility", "Mention resources used"],
        category: "Learning"
      },
      {
        content: "Tell me about a time you failed. What did you learn from it?",
        type: "behavioral",
        difficulty: "medium",
        suggestedAnswer: "Be honest about the failure, focus on lessons learned, and demonstrate growth. Show how you applied those lessons in future situations.",
        hints: ["Be authentic", "Focus on growth"],
        category: "Self-Awareness"
      },
      {
        content: "How do you prioritize tasks when working on multiple projects?",
        type: "behavioral",
        difficulty: "easy",
        suggestedAnswer: "Discuss your prioritization framework (urgency/importance matrix), communication with stakeholders, and time management techniques.",
        hints: ["Mention specific frameworks", "Show organization skills"],
        category: "Time Management"
      }
    ];

    const questions = questionType === 'behavioral' ? behavioralQuestions : technicalQuestions;
    
    return {
      questions: questions.slice(0, Math.min(count, questions.length))
    };
  }

  /**
   * Evaluate interview answer using AI
   * @param {string} question - The interview question
   * @param {string} answer - User's answer
   * @param {string} questionType - Type of question
   * @returns {Promise<Object>} Evaluation results
   */
  async evaluateInterviewAnswer(question, answer, questionType) {
    if (!this.model || !this.genAI) {
      console.warn('⚠️ AI service not available, using fallback evaluation');
      return this.getFallbackEvaluation(answer);
    }

    const prompt = `Evaluate this interview answer:

Question: ${question}
Question Type: ${questionType}
Candidate's Answer: ${answer}

Provide a comprehensive evaluation with:
1. Score (0-100)
2. Detailed feedback
3. Strengths (what was good)
4. Areas for improvement
5. Suggestions for better answers

Return ONLY valid JSON in this format:
{
  "score": 85,
  "feedback": "detailed feedback here",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    try {
      const response = await this._makeAIRequest(prompt, {
        temperature: 0.5,
        maxOutputTokens: 1500
      });

      return this.parseEvaluationResponse(response);
    } catch (error) {
      console.error('Answer evaluation failed:', error);
      return this.getFallbackEvaluation(answer);
    }
  }

  /**
   * Parse AI evaluation response
   */
  parseEvaluationResponse(response) {
    try {
      let cleanedText = response.trim();
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          score: Math.max(0, Math.min(100, parsed.score || 70)),
          feedback: String(parsed.feedback || 'Good effort!').substring(0, 500),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : []
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse evaluation:', error);
      return this.getFallbackEvaluation('');
    }
  }

  /**
   * Fallback evaluation when AI is unavailable
   */
  getFallbackEvaluation(answer) {
    const wordCount = answer.split(/\s+/).length;
    const hasStructure = answer.includes('\n') || answer.length > 100;
    
    let score = 70;
    if (wordCount > 50) score += 10;
    if (hasStructure) score += 10;
    if (wordCount > 100) score += 5;
    
    return {
      score: Math.min(score, 95),
      feedback: "Your answer demonstrates understanding of the topic. Consider adding more specific examples and quantifiable results to strengthen your response.",
      strengths: [
        "Clear communication",
        "Addressed the main question"
      ],
      improvements: [
        "Add more specific examples",
        "Include quantifiable results"
      ],
      suggestions: [
        "Use the STAR method for behavioral questions",
        "Provide concrete examples from your experience"
      ]
    };
  }

  // ==================== RESUME BUILDER AI METHODS ====================

  /**
   * Parse uploaded resume file and extract structured data
   * @param {Buffer} fileBuffer - Resume file buffer
   * @param {string} fileType - File type (pdf or docx)
   * @returns {Promise<Object>} Extracted resume data
   */
  async parseResumeFile(fileBuffer, fileType) {
    try {
      // Extract text from file
      let resumeText = '';
      
      if (fileType === 'pdf' || fileType === 'application/pdf') {
        const pdfData = await pdfParse(fileBuffer);
        resumeText = pdfData.text;
      } else if (fileType === 'docx' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        resumeText = result.value;
      } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX.');
      }

      if (!resumeText || resumeText.trim().length < 50) {
        throw new Error('Could not extract text from resume. Please ensure the file is not corrupted.');
      }

      // Use AI to structure the data
      if (this.model && this.genAI) {
        return await this.extractResumeDataWithAI(resumeText);
      } else {
        return this.extractResumeDataFallback(resumeText);
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }

  /**
   * Extract structured resume data using AI
   * @param {string} resumeText - Raw resume text
   * @returns {Promise<Object>} Structured resume data
   */
  async extractResumeDataWithAI(resumeText) {
    const prompt = `Extract structured data from this resume text and return ONLY valid JSON.

Resume Text:
${resumeText}

Return data in this exact JSON format:
{
  "personalInfo": {
    "fullName": "extracted name",
    "jobTitle": "extracted job title or desired position",
    "email": "extracted email",
    "phone": "extracted phone",
    "address": "extracted address",
    "socialLinks": {
      "linkedin": "url if found",
      "github": "url if found",
      "portfolio": "url if found"
    }
  },
  "professionalSummary": "extracted professional summary or objective",
  "experience": [
    {
      "jobTitle": "position title",
      "company": "company name",
      "location": "location",
      "startDate": "start date",
      "endDate": "end date or Present",
      "current": false,
      "description": "role description",
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "degree name",
      "institution": "institution name",
      "location": "location",
      "startDate": "start date",
      "endDate": "end date",
      "gpa": "gpa if mentioned"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1", "language2"],
    "tools": ["tool1", "tool2"]
  },
  "projects": [
    {
      "title": "project name",
      "description": "project description",
      "technologies": ["tech1", "tech2"],
      "link": "project link if available"
    }
  ],
  "certifications": [
    {
      "name": "certification name",
      "issuer": "issuing organization",
      "date": "date obtained"
    }
  ]
}

Extract all available information. If a field is not found, use empty string or empty array.`;

    try {
      const response = await this._makeAIRequest(prompt, {
        temperature: 0.3,
        maxOutputTokens: 4096
      });

      return this.parseResumeDataResponse(response);
    } catch (error) {
      console.error('AI extraction failed:', error);
      return this.extractResumeDataFallback(resumeText);
    }
  }

  /**
   * Parse AI response for resume data
   */
  parseResumeDataResponse(response) {
    try {
      let cleanedText = response.trim();
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateResumeData(parsed);
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse resume data:', error);
      return this.getDefaultResumeStructure();
    }
  }

  /**
   * Validate and sanitize resume data
   */
  validateResumeData(data) {
    return {
      personalInfo: {
        fullName: String(data.personalInfo?.fullName || ''),
        jobTitle: String(data.personalInfo?.jobTitle || ''),
        email: String(data.personalInfo?.email || ''),
        phone: String(data.personalInfo?.phone || ''),
        address: String(data.personalInfo?.address || ''),
        socialLinks: {
          linkedin: String(data.personalInfo?.socialLinks?.linkedin || ''),
          github: String(data.personalInfo?.socialLinks?.github || ''),
          portfolio: String(data.personalInfo?.socialLinks?.portfolio || ''),
          dribbble: String(data.personalInfo?.socialLinks?.dribbble || ''),
          instagram: String(data.personalInfo?.socialLinks?.instagram || ''),
          twitter: String(data.personalInfo?.socialLinks?.twitter || ''),
          website: String(data.personalInfo?.socialLinks?.website || '')
        }
      },
      professionalSummary: String(data.professionalSummary || ''),
      experience: Array.isArray(data.experience) ? data.experience : [],
      education: Array.isArray(data.education) ? data.education : [],
      skills: {
        technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
        soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        languages: Array.isArray(data.skills?.languages) ? data.skills.languages : [],
        tools: Array.isArray(data.skills?.tools) ? data.skills.tools : []
      },
      projects: Array.isArray(data.projects) ? data.projects : [],
      certifications: Array.isArray(data.certifications) ? data.certifications : []
    };
  }

  /**
   * Fallback resume data extraction (basic parsing)
   */
  extractResumeDataFallback(resumeText) {
    const lines = resumeText.split('\n').filter(line => line.trim());
    
    // Basic extraction logic
    const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = resumeText.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
    
    return {
      personalInfo: {
        fullName: lines[0] || '',
        jobTitle: lines[1] || '',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        address: '',
        socialLinks: {}
      },
      professionalSummary: '',
      experience: [],
      education: [],
      skills: { technical: [], soft: [], languages: [], tools: [] },
      projects: [],
      certifications: []
    };
  }

  /**
   * Generate AI-enhanced resume content
   * @param {Object} resumeData - Current resume data
   * @param {string} targetRole - Target job role (optional)
   * @returns {Promise<Object>} Enhanced resume data
   */
  async generateResumeContent(resumeData, targetRole = '') {
    if (!this.model || !this.genAI) {
      console.warn('⚠️ AI service not available, returning original data');
      return resumeData;
    }

    const prompt = `You are an expert resume writer and career coach. Enhance this resume content to make it more professional, ATS-friendly, and impactful.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

${targetRole ? `Target Role: ${targetRole}` : ''}

Provide enhanced content with:
1. Compelling professional summary (2-3 sentences, achievement-focused)
2. Improved experience descriptions (use action verbs, quantify achievements)
3. Optimized skills categorization
4. Professional tone and ATS-friendly keywords

Return ONLY valid JSON in this format:
{
  "professionalSummary": "enhanced summary here",
  "experienceImprovements": [
    {
      "index": 0,
      "improvedDescription": "enhanced description",
      "improvedAchievements": ["achievement 1", "achievement 2"]
    }
  ],
  "skillRecommendations": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "generalTips": ["tip 1", "tip 2", "tip 3"]
}`;

    try {
      const response = await this._makeAIRequest(prompt, {
        temperature: 0.5,
        maxOutputTokens: 3000
      });

      return this.parseResumeEnhancementResponse(response);
    } catch (error) {
      console.error('Resume enhancement failed:', error);
      return this.getFallbackEnhancement();
    }
  }

  /**
   * Parse resume enhancement response
   */
  parseResumeEnhancementResponse(response) {
    try {
      let cleanedText = response.trim();
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          professionalSummary: String(parsed.professionalSummary || ''),
          experienceImprovements: Array.isArray(parsed.experienceImprovements) ? parsed.experienceImprovements : [],
          skillRecommendations: parsed.skillRecommendations || { technical: [], soft: [] },
          generalTips: Array.isArray(parsed.generalTips) ? parsed.generalTips : []
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse enhancement:', error);
      return this.getFallbackEnhancement();
    }
  }

  /**
   * Calculate ATS score for resume
   * @param {Object} resumeData - Resume data
   * @param {string} jobDescription - Target job description (optional)
   * @returns {Promise<Object>} ATS analysis
   */
  async calculateATSScore(resumeData, jobDescription = '') {
    if (!this.model || !this.genAI) {
      console.warn('⚠️ AI service not available, using fallback ATS analysis');
      return this.getFallbackATSScore(resumeData);
    }

    const resumeText = this.convertResumeToText(resumeData);
    
    const prompt = `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a comprehensive score.

Resume Content:
${resumeText}

${jobDescription ? `Target Job Description:\n${jobDescription}` : ''}

Evaluate based on:
1. Keyword optimization
2. Formatting and structure
3. Content quality and relevance
4. Quantifiable achievements
5. Professional language

Return ONLY valid JSON in this format:
{
  "score": 85,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "missingKeywords": ["keyword1", "keyword2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

    try {
      const response = await this._makeAIRequest(prompt, {
        temperature: 0.4,
        maxOutputTokens: 2000
      });

      return this.parseATSScoreResponse(response);
    } catch (error) {
      console.error('ATS scoring failed:', error);
      return this.getFallbackATSScore(resumeData);
    }
  }

  /**
   * Convert resume data to text format
   */
  convertResumeToText(resumeData) {
    let text = '';
    
    if (resumeData.personalInfo) {
      text += `${resumeData.personalInfo.fullName}\n`;
      text += `${resumeData.personalInfo.jobTitle}\n`;
      text += `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}\n\n`;
    }
    
    if (resumeData.professionalSummary) {
      text += `PROFESSIONAL SUMMARY\n${resumeData.professionalSummary}\n\n`;
    }
    
    if (resumeData.experience && resumeData.experience.length > 0) {
      text += `EXPERIENCE\n`;
      resumeData.experience.forEach(exp => {
        text += `${exp.jobTitle} at ${exp.company}\n`;
        text += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
        if (exp.description) text += `${exp.description}\n`;
        if (exp.achievements) {
          exp.achievements.forEach(ach => text += `• ${ach}\n`);
        }
        text += '\n';
      });
    }
    
    if (resumeData.skills) {
      text += `SKILLS\n`;
      if (resumeData.skills.technical) text += `Technical: ${resumeData.skills.technical.join(', ')}\n`;
      if (resumeData.skills.soft) text += `Soft Skills: ${resumeData.skills.soft.join(', ')}\n`;
    }
    
    return text;
  }

  /**
   * Parse ATS score response
   */
  parseATSScoreResponse(response) {
    try {
      let cleanedText = response.trim();
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(0, Math.min(100, parsed.score || 70)),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 5) : [],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements.slice(0, 5) : [],
          missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords.slice(0, 10) : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : []
        };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Failed to parse ATS score:', error);
      return this.getFallbackATSScore({});
    }
  }

  /**
   * Fallback ATS score calculation
   */
  getFallbackATSScore(resumeData) {
    let score = 60;
    
    if (resumeData.personalInfo?.email) score += 5;
    if (resumeData.personalInfo?.phone) score += 5;
    if (resumeData.professionalSummary) score += 10;
    if (resumeData.experience?.length > 0) score += 10;
    if (resumeData.education?.length > 0) score += 5;
    if (resumeData.skills?.technical?.length > 0) score += 5;
    
    return {
      score: Math.min(score, 85),
      strengths: [
        "Resume contains essential contact information",
        "Experience section is present",
        "Skills are listed"
      ],
      improvements: [
        "Add quantifiable achievements to experience section",
        "Include relevant keywords for target role",
        "Enhance professional summary with specific accomplishments"
      ],
      missingKeywords: [],
      recommendations: [
        "Use action verbs to start bullet points",
        "Quantify achievements with numbers and percentages",
        "Tailor resume to specific job descriptions"
      ]
    };
  }

  /**
   * Fallback enhancement
   */
  getFallbackEnhancement() {
    return {
      professionalSummary: '',
      experienceImprovements: [],
      skillRecommendations: { technical: [], soft: [] },
      generalTips: [
        "Use strong action verbs to describe your accomplishments",
        "Quantify your achievements with specific numbers and metrics",
        "Tailor your resume to match the job description",
        "Keep your resume concise and focused on relevant experience"
      ]
    };
  }

  /**
   * Get default resume structure
   */
  getDefaultResumeStructure() {
    return {
      personalInfo: {
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        address: '',
        socialLinks: {}
      },
      professionalSummary: '',
      experience: [],
      education: [],
      skills: { technical: [], soft: [], languages: [], tools: [] },
      projects: [],
      certifications: []
    };
  }
}

module.exports = new AIService();