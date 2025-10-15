const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError } = require('../middleware/errorHandler');
const { cacheService } = require('./cacheService');
const aiConfig = require('../config/aiConfig');

class AIService {
  constructor() {
    // Validate configuration on initialization
    if (!aiConfig.isConfigurationValid()) {
      throw new Error('AI configuration is invalid or not validated');
    }
    
    this.genAI = new GoogleGenerativeAI(aiConfig.getApiKey());
    this.model = this.genAI.getGenerativeModel({ 
      model: aiConfig.getConfig().gemini.model
    });
    
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
    
    this.retryConfig = aiConfig.getRetryConfig();
    this.requestLoggingEnabled = aiConfig.isRequestLoggingEnabled();
    this.logLevel = aiConfig.getLogLevel();
  }

  /**
   * Make a request to the AI service with retry logic and error handling
   * @param {string} prompt - The prompt to send to the AI
   * @param {Object} config - Generation configuration
   * @returns {Promise<string>} AI response text
   * @private
   */
  async _makeAIRequest(prompt, config = {}) {
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

  // rate limiting and cost management
  async checkRateLimit() {
    return true;
  }
}

module.exports = new AIService();