/**
 * Prompt Builder - Creates feature-specific prompts with quality guidelines
 * All prompts are optimized for gemini-2.5-pro model
 */

class PromptBuilder {
  /**
   * Build resume content generation prompt
   */
  static buildResumePrompt(resumeData, context = '') {
    const personalInfo = resumeData.personalInfo || {};
    const experience = resumeData.experience || [];
    const education = resumeData.education || [];
    const skills = resumeData.skills || [];
    const projects = resumeData.projects || [];

    return `You are an expert resume writer and career coach. Generate professional, ATS-friendly resume content.

CURRENT RESUME DATA:
Name: ${personalInfo.firstName} ${personalInfo.lastName}
Email: ${personalInfo.email || 'Not provided'}
Phone: ${personalInfo.phone || 'Not provided'}
Location: ${personalInfo.location || 'Not provided'}

Experience: ${experience.length} entries
Education: ${education.length} entries
Skills: ${skills.join(', ') || 'Not provided'}
Projects: ${projects.length} entries

${context ? `CONTEXT/JOB DESCRIPTION:\n${context}\n` : ''}

REQUIREMENTS:
1. Use professional, confident tone
2. Write in ATS-friendly format with clear keywords
3. Use bullet points for achievements and responsibilities
4. Include quantifiable results where possible (numbers, percentages, metrics)
5. Use action verbs (Led, Developed, Implemented, Achieved, etc.)
6. Separate skills clearly by category
7. Focus on impact and outcomes

Return your response as JSON:
{
  "summary": "Professional summary (2-3 sentences)",
  "experience": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "description": "Brief role description",
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"]
}`;
  }

  /**
   * Build ATS analysis prompt
   */
  static buildATSAnalysisPrompt(resumeText) {
    return `Analyze this resume for ATS (Applicant Tracking System) compatibility and provide comprehensive feedback.

RESUME TEXT:
${resumeText}

Provide detailed analysis in JSON format:
{
  "overallScore": <number 0-100>,
  "sectionAnalysis": {
    "personalInfo": {
      "score": <number 0-25>,
      "issues": ["specific issue 1", "specific issue 2"],
      "suggestions": ["specific improvement 1", "specific improvement 2"]
    },
    "experience": {
      "score": <number 0-30>,
      "issues": [],
      "suggestions": []
    },
    "education": {
      "score": <number 0-15>,
      "issues": [],
      "suggestions": []
    },
    "skills": {
      "score": <number 0-20>,
      "issues": [],
      "suggestions": []
    },
    "structure": {
      "score": <number 0-10>,
      "issues": [],
      "suggestions": []
    }
  },
  "keywordAnalysis": {
    "presentKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["keyword1", "keyword2"],
    "keywordDensity": "assessment"
  },
  "atsCompatibility": {
    "formatIssues": ["issue1", "issue2"],
    "parsingConcerns": ["concern1", "concern2"],
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "strengths": ["strength1", "strength2"],
  "criticalIssues": ["issue1", "issue2"],
  "actionableSteps": [
    {
      "priority": "high|medium|low",
      "category": "content|format|keywords|structure",
      "action": "specific action",
      "impact": "expected improvement"
    }
  ]
}

Focus on: ATS parsing, keyword optimization, standard headers, contact info, quantifiable achievements, professional formatting, industry terminology.`;
  }

  /**
   * Build resume optimization prompt
   */
  static buildResumeOptimizationPrompt(resumeData, jobDescription) {
    return `Optimize this resume for the target job description.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

TARGET JOB DESCRIPTION:
${jobDescription}

Provide optimization suggestions in JSON:
{
  "grammarImprovements": ["improvement1", "improvement2"],
  "keywordSuggestions": ["keyword1", "keyword2"],
  "contentEnhancements": ["enhancement1", "enhancement2"],
  "atsImprovements": ["improvement1", "improvement2"],
  "effectivenessScore": <number 0-100>,
  "summary": "Overall assessment and key recommendations"
}`;
  }

  /**
   * Build portfolio creation prompt
   */
  static buildPortfolioPrompt(description, userName) {
    return `Create a stunning, professional portfolio website for ${userName}.

USER REQUEST: "${description}"

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no markdown, no code blocks
2. Create modern, responsive HTML/CSS/JS
3. Include: Hero, About, Skills, Projects, Contact sections
4. Use professional design with gradients and animations
5. Make it mobile-responsive (320px to 1920px+)
6. Use clean, semantic HTML5
7. Include smooth scrolling and hover effects

Return JSON in this EXACT format:
{
  "html": "complete HTML body content (no DOCTYPE, html, head, or body tags)",
  "css": "complete responsive CSS with modern styling",
  "js": "complete vanilla JavaScript with smooth interactions",
  "message": "Brief description of portfolio created"
}

Design Guidelines:
- Modern gradient backgrounds (#667eea, #764ba2, #EC4899)
- Professional typography (system fonts)
- Smooth animations and transitions
- Clean spacing and visual hierarchy
- Accessible and SEO-friendly
- Fast loading and performant`;
  }

  /**
   * Build portfolio improvement prompt
   */
  static buildPortfolioImprovementPrompt(currentCode, request) {
    return `Improve this existing portfolio based on the specific request.

CURRENT CODE:
HTML: ${currentCode.html?.substring(0, 1000)}...
CSS: ${currentCode.css?.substring(0, 1000)}...
JS: ${currentCode.js?.substring(0, 500)}...

USER REQUEST: "${request}"

IMPORTANT:
- Make ONLY the changes requested
- Keep all existing content and structure not mentioned
- Preserve the overall design unless asked to change it
- Make targeted, surgical improvements

Return JSON:
{
  "html": "updated HTML with requested changes",
  "css": "updated CSS with requested changes",
  "js": "updated JavaScript with requested changes",
  "message": "Description of specific changes made"
}`;
  }

  /**
   * Build interview question generation prompt
   */
  static buildQuestionGenerationPrompt(params) {
    const { company, role, difficulty, questionType, count = 5 } = params;

    return `Generate ${count} realistic ${difficulty} level ${questionType} interview questions for a ${role} position at ${company}.

REQUIREMENTS:
- Questions appropriate for ${difficulty} difficulty
- Relevant to ${company} and ${role}
- Include suggested answers or key points
- For technical: include coding/system design scenarios
- For behavioral: use STAR method format

Return JSON:
{
  "questions": [
    {
      "content": "Question text",
      "type": "${questionType}",
      "difficulty": "${difficulty}",
      "suggestedAnswer": "Key points or sample answer",
      "hints": ["hint1", "hint2"],
      "category": "relevant category"
    }
  ]
}`;
  }

  /**
   * Build interview answer evaluation prompt
   */
  static buildAnswerEvaluationPrompt(question, userAnswer, questionType) {
    return `Evaluate this interview answer constructively.

QUESTION: ${question}
QUESTION TYPE: ${questionType}
USER ANSWER: ${userAnswer}

Provide fair, constructive evaluation in JSON:
{
  "score": <number 0-100>,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "feedback": "Overall constructive feedback",
  "detailedAnalysis": {
    "clarity": <number 0-100>,
    "completeness": <number 0-100>,
    "relevance": <number 0-100>,
    "technicalAccuracy": <number 0-100>
  }
}

Be encouraging but honest about areas for improvement.`;
  }

  /**
   * Build cover letter generation prompt
   */
  static buildCoverLetterPrompt(resumeData, jobDescription, companyInfo) {
    return `Generate a professional, personalized cover letter.

CANDIDATE INFO:
Name: ${resumeData.personalInfo?.firstName} ${resumeData.personalInfo?.lastName}
Skills: ${resumeData.skills?.join(', ')}
Experience: ${JSON.stringify(resumeData.experience?.slice(0, 2))}
Education: ${JSON.stringify(resumeData.education)}

JOB DESCRIPTION:
${jobDescription}

COMPANY INFO:
${companyInfo || 'Research company values and culture'}

Create a compelling cover letter that:
1. Shows genuine interest in the company
2. Highlights relevant experience
3. Demonstrates value proposition
4. Maintains professional tone
5. Is 3-4 paragraphs long

Return JSON:
{
  "content": "Full cover letter text (3-4 paragraphs)",
  "keyHighlights": ["highlight1", "highlight2"],
  "personalizedElements": ["element1", "element2"],
  "tone": "professional|enthusiastic|formal",
  "wordCount": <number>
}`;
  }

  /**
   * Build content polishing prompt
   */
  static buildContentPolishPrompt(content, type = 'general') {
    return `Polish and improve this ${type} content while preserving its original meaning.

CONTENT:
${content}

REQUIREMENTS:
1. Improve grammar and punctuation
2. Enhance flow and readability
3. Keep original meaning intact
4. Use professional language
5. Fix any spelling errors
6. Improve sentence structure

Return JSON:
{
  "polishedContent": "improved content",
  "changes": ["change1", "change2"],
  "improvementScore": <number 0-100>
}`;
  }

  /**
   * Build skill generation prompt
   */
  static buildSkillGenerationPrompt(role, experienceLevel) {
    return `Generate relevant skills for a ${role} position at ${experienceLevel} level.

REQUIREMENTS:
1. Use industry-standard terminology
2. Avoid repetition
3. Include both technical and soft skills
4. Categorize appropriately
5. Match experience level

Return JSON:
{
  "technical": ["skill1", "skill2", "skill3"],
  "soft": ["skill1", "skill2", "skill3"],
  "tools": ["tool1", "tool2", "tool3"],
  "certifications": ["cert1", "cert2"]
}`;
  }

  /**
   * Build learning roadmap prompt
   */
  static buildRoadmapPrompt(currentSkills, targetRole, targetCompany = '') {
    return `Create a learning roadmap for transitioning to ${targetRole}${targetCompany ? ` at ${targetCompany}` : ''}.

CURRENT SKILLS: ${currentSkills.join(', ')}
TARGET ROLE: ${targetRole}

Create actionable learning path in JSON:
{
  "title": "Learning Roadmap Title",
  "targetRole": "${targetRole}",
  "duration": "estimated time",
  "phases": [
    {
      "name": "Phase name",
      "duration": "time estimate",
      "skills": ["skill1", "skill2"],
      "projects": ["project1", "project2"],
      "resources": ["resource1", "resource2"]
    }
  ],
  "milestones": [
    {
      "name": "Milestone name",
      "description": "What to achieve",
      "timeframe": "when to achieve"
    }
  ],
  "resources": [
    {
      "name": "Resource name",
      "type": "course|book|tutorial|project",
      "url": "link if available",
      "priority": "high|medium|low"
    }
  ]
}`;
  }

  /**
   * Build project description prompt
   */
  static buildProjectDescriptionPrompt(project) {
    return `Write a professional project description.

PROJECT INFO:
Name: ${project.name || 'Project'}
Technologies: ${project.technologies?.join(', ') || 'Not specified'}
Brief: ${project.brief || project.description || 'No description'}

Create compelling description in JSON:
{
  "description": "Clear, professional description (2-3 sentences)",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "technologiesUsed": ["tech1", "tech2"],
  "impact": "Impact and outcomes achieved",
  "challenges": "Technical challenges overcome"
}

Focus on: clear explanation, technologies used, impact and outcomes.`;
  }

  /**
   * Build skill gap analysis prompt
   */
  static buildSkillGapAnalysisPrompt(userSkills, targetRole, targetCompany = '') {
    return `Analyze skill gaps for career transition.

CURRENT SKILLS: ${userSkills.join(', ')}
TARGET ROLE: ${targetRole}
${targetCompany ? `TARGET COMPANY: ${targetCompany}` : ''}

Provide comprehensive analysis in JSON:
{
  "relevantSkills": ["skill1", "skill2"],
  "missingSkills": [
    {
      "skill": "skill name",
      "priority": "high|medium|low",
      "estimatedLearningTime": "X weeks/months",
      "resources": ["resource1", "resource2"],
      "reasoning": "why this skill is important"
    }
  ],
  "learningPath": "Recommended sequence and timeline",
  "marketDemand": "Analysis of skill demand in the market",
  "recommendations": ["recommendation1", "recommendation2"]
}`;
  }

  /**
   * Build chat prompt with context
   */
  static buildChatPrompt(message, context, history = []) {
    const historyText = history.length > 0
      ? history.map(h => `${h.role}: ${h.content}`).join('\n')
      : 'No previous conversation';

    return `You are a helpful AI assistant for the Elevare career platform.

CONTEXT:
${JSON.stringify(context, null, 2)}

CONVERSATION HISTORY:
${historyText}

USER MESSAGE: ${message}

Provide helpful, contextual response. Be conversational, professional, and actionable.

Return JSON:
{
  "response": "Your helpful response",
  "suggestions": ["suggestion1", "suggestion2"],
  "followUpQuestions": ["question1", "question2"]
}`;
  }
}

module.exports = PromptBuilder;
