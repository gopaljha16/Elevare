const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AppError } = require('../middleware/errorHandler');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    });
    
    this.generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    };
  }

  // optimize resume content using ai
  async optimizeResumeContent(resumeData, jobDescription = '') {
    try {
      const systemPrompt = 'You are an expert resume writer and career coach. Provide specific, actionable feedback to improve resumes for ATS compatibility and human readability.';
      const userPrompt = this.createResumeOptimizationPrompt(resumeData, jobDescription);
      
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: this.generationConfig,
      });

      const response = await result.response;
      const text = response.text();
      
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

  // rate limiting and cost management
  async checkRateLimit() {
    return true;
  }
}

module.exports = new AIService();