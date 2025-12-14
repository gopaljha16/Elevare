/**
 * Prompt Builder Service
 * Centralized prompt templates for all AI features
 * @version 2.0.0
 */

class PromptBuilder {
  /**
   * Build resume generation prompt
   */
  static buildResumePrompt(resumeData, context = '') {
    return `You are an expert resume writer and career coach. Generate professional resume content based on the following data.

${context ? `Context: ${context}\n` : ''}

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Generate a polished, ATS-friendly resume with:
1. A compelling professional summary (2-3 sentences)
2. Enhanced job descriptions with quantified achievements
3. Skills organized by category
4. Action verbs and industry keywords

Return ONLY valid JSON in this format:
{
  "summary": "Professional summary text",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  }
}`;
  }

  /**
   * Build ATS analysis prompt
   */
  static buildATSAnalysisPrompt(resumeText, jobDescription = '') {
    const jobContext = jobDescription 
      ? `\nJob Description to match against:\n${jobDescription}\n` 
      : '';

    return `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume for ATS compatibility and provide detailed feedback.

Resume Text:
${resumeText}
${jobContext}

Analyze the resume for:
1. Keyword optimization (industry-specific terms)
2. Format compatibility (headers, sections, bullet points)
3. Quantified achievements (numbers, percentages, metrics)
4. Action verbs usage
5. Skills match (if job description provided)
6. Section completeness
7. Contact information presence
8. Education and certifications

Return ONLY valid JSON in this exact format:
{
  "overallScore": 75,
  "categoryScores": {
    "keywords": { "score": 80, "maxScore": 100, "feedback": "Good keyword usage" },
    "formatting": { "score": 70, "maxScore": 100, "feedback": "Formatting feedback" },
    "achievements": { "score": 65, "maxScore": 100, "feedback": "Achievements feedback" },
    "actionVerbs": { "score": 85, "maxScore": 100, "feedback": "Action verbs feedback" },
    "skills": { "score": 75, "maxScore": 100, "feedback": "Skills feedback" },
    "sections": { "score": 80, "maxScore": 100, "feedback": "Sections feedback" }
  },
  "keywordsFound": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "improvements": [
    { "priority": "high", "category": "keywords", "suggestion": "Add more industry keywords" },
    { "priority": "medium", "category": "achievements", "suggestion": "Quantify more achievements" }
  ],
  "strengths": ["Strong technical skills section", "Good use of action verbs"],
  "summary": "Overall assessment summary"
}`;
  }

  /**
   * Build resume optimization prompt
   */
  static buildResumeOptimizationPrompt(resumeData, jobDescription) {
    return `You are an expert resume optimizer. Optimize this resume to better match the target job description while maintaining authenticity.

Current Resume:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
${jobDescription}

Optimize the resume by:
1. Aligning skills with job requirements
2. Rewriting experience to highlight relevant achievements
3. Adding missing keywords naturally
4. Improving the professional summary
5. Reorganizing sections for impact

Return ONLY valid JSON with the optimized resume in the same structure as the input, plus an "optimizationNotes" array explaining changes made.`;
  }

  /**
   * Build portfolio generation prompt
   */
  static buildPortfolioPrompt(description, userName) {
    return `You are an expert web developer and designer. Create a stunning, modern portfolio website for ${userName}.

User's Request: ${description}

Create a complete, production-ready portfolio with:
1. Modern, responsive design
2. Smooth animations and transitions
3. Professional color scheme
4. Mobile-first approach
5. Accessibility best practices

Return ONLY valid JSON in this exact format:
{
  "html": "<!-- Complete HTML structure with semantic elements -->",
  "css": "/* Complete CSS with modern styling, animations, and responsive design */",
  "js": "// Complete JavaScript for interactivity and animations",
  "message": "Brief description of what was created"
}

Requirements:
- Use modern CSS (flexbox, grid, custom properties)
- Include smooth scroll and scroll animations
- Add hover effects and micro-interactions
- Ensure mobile responsiveness
- Use a cohesive color palette
- Include sections: Hero, About, Skills, Projects, Contact`;
  }

  /**
   * Build portfolio improvement prompt
   */
  static buildPortfolioImprovementPrompt(currentCode, improvementRequest) {
    return `You are an expert web developer. Improve this existing portfolio based on the user's request.

Current Code:
HTML: ${currentCode.html}
CSS: ${currentCode.css}
JS: ${currentCode.js}

Improvement Request: ${improvementRequest}

Make the requested improvements while:
1. Maintaining existing functionality
2. Keeping the overall design cohesive
3. Ensuring code quality and best practices
4. Preserving responsive design

Return ONLY valid JSON in this exact format:
{
  "html": "<!-- Improved HTML -->",
  "css": "/* Improved CSS */",
  "js": "// Improved JavaScript",
  "message": "Description of improvements made"
}`;
  }

  /**
   * Build interview question generation prompt
   */
  static buildQuestionGenerationPrompt(params) {
    const { role, company, difficulty, questionType, count = 5 } = params;

    return `You are an expert technical interviewer. Generate ${count} interview questions for a ${role} position${company ? ` at ${company}` : ''}.

Parameters:
- Difficulty: ${difficulty || 'medium'}
- Question Type: ${questionType || 'mixed'}

Generate questions that:
1. Are relevant to the role and industry
2. Test both technical and soft skills
3. Include follow-up questions
4. Have clear evaluation criteria

Return ONLY valid JSON in this format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "type": "technical|behavioral|situational",
      "difficulty": "easy|medium|hard",
      "category": "Category name",
      "expectedAnswer": "Key points to look for",
      "followUps": ["Follow-up question 1", "Follow-up question 2"],
      "tips": "Tips for answering"
    }
  ]
}`;
  }

  /**
   * Build answer evaluation prompt
   */
  static buildAnswerEvaluationPrompt(question, userAnswer, questionType) {
    return `You are an expert interview coach. Evaluate this interview answer.

Question: ${question}
Question Type: ${questionType}

User's Answer:
${userAnswer}

Evaluate the answer on:
1. Completeness (did they address all parts?)
2. Clarity (was it well-structured?)
3. Relevance (did they stay on topic?)
4. Examples (did they provide concrete examples?)
5. Technical accuracy (if applicable)

Return ONLY valid JSON in this format:
{
  "overallScore": 85,
  "scores": {
    "completeness": 80,
    "clarity": 90,
    "relevance": 85,
    "examples": 75,
    "technicalAccuracy": 90
  },
  "feedback": "Detailed feedback on the answer",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "suggestedAnswer": "An example of a strong answer"
}`;
  }

  /**
   * Build cover letter generation prompt
   */
  static buildCoverLetterPrompt(resumeData, jobDescription, companyInfo = '') {
    return `You are an expert cover letter writer. Create a compelling, personalized cover letter.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

${companyInfo ? `Company Information: ${companyInfo}` : ''}

Create a cover letter that:
1. Opens with a strong, attention-grabbing hook
2. Highlights relevant experience and achievements
3. Shows knowledge of the company
4. Demonstrates enthusiasm for the role
5. Includes a clear call to action
6. Is professional yet personable

Return ONLY valid JSON in this format:
{
  "coverLetter": "Full cover letter text with proper formatting",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "tone": "professional|enthusiastic|formal",
  "wordCount": 350
}`;
  }

  /**
   * Build content polish prompt
   */
  static buildContentPolishPrompt(content, type = 'general') {
    const typeInstructions = {
      summary: 'Make it concise, impactful, and highlight key achievements',
      experience: 'Use strong action verbs and quantify achievements',
      skills: 'Organize logically and ensure relevance',
      general: 'Improve clarity, grammar, and professional tone'
    };

    return `You are an expert content editor. Polish this ${type} content for a professional resume/portfolio.

Original Content:
${content}

Instructions: ${typeInstructions[type] || typeInstructions.general}

Return ONLY valid JSON in this format:
{
  "polished": "The polished content",
  "changes": ["Change 1", "Change 2"],
  "suggestions": ["Additional suggestion 1"]
}`;
  }

  /**
   * Build skill generation prompt
   */
  static buildSkillGenerationPrompt(role, experienceLevel) {
    return `You are a career expert. Generate relevant skills for a ${experienceLevel} ${role}.

Generate skills that are:
1. Industry-relevant and in-demand
2. Appropriate for the experience level
3. A mix of technical and soft skills
4. ATS-friendly keywords

Return ONLY valid JSON in this format:
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
    return `You are a career development expert. Create a learning roadmap.

Current Skills: ${JSON.stringify(currentSkills)}
Target Role: ${targetRole}
${targetCompany ? `Target Company: ${targetCompany}` : ''}

Create a structured learning path with:
1. Skill gaps to address
2. Recommended resources
3. Timeline estimates
4. Milestones and checkpoints

Return ONLY valid JSON in this format:
{
  "skillGaps": ["gap1", "gap2"],
  "phases": [
    {
      "name": "Phase 1",
      "duration": "2-4 weeks",
      "skills": ["skill1", "skill2"],
      "resources": [
        { "name": "Resource name", "type": "course|book|project", "url": "optional url" }
      ],
      "milestone": "What you'll achieve"
    }
  ],
  "totalDuration": "3-6 months",
  "tips": ["Tip 1", "Tip 2"]
}`;
  }

  /**
   * Build project description prompt
   */
  static buildProjectDescriptionPrompt(project) {
    return `You are a technical writer. Create a compelling project description.

Project Details:
${JSON.stringify(project, null, 2)}

Create a description that:
1. Explains the problem solved
2. Highlights technical challenges
3. Showcases your contributions
4. Mentions technologies used
5. Includes measurable outcomes

Return ONLY valid JSON in this format:
{
  "shortDescription": "One-liner for portfolio cards",
  "fullDescription": "Detailed 2-3 paragraph description",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "technologies": ["tech1", "tech2"],
  "metrics": ["metric1", "metric2"]
}`;
  }

  /**
   * Build skill gap analysis prompt
   */
  static buildSkillGapAnalysisPrompt(userSkills, targetRole, targetCompany = '') {
    return `You are a career advisor. Analyze skill gaps for career transition.

Current Skills: ${JSON.stringify(userSkills)}
Target Role: ${targetRole}
${targetCompany ? `Target Company: ${targetCompany}` : ''}

Analyze:
1. Skills the user already has that are relevant
2. Skills that need improvement
3. New skills to acquire
4. Priority order for learning

Return ONLY valid JSON in this format:
{
  "matchingSkills": [
    { "skill": "skill name", "relevance": "high|medium|low", "notes": "How it applies" }
  ],
  "skillsToImprove": [
    { "skill": "skill name", "currentLevel": "beginner|intermediate|advanced", "targetLevel": "level", "priority": "high|medium|low" }
  ],
  "newSkillsNeeded": [
    { "skill": "skill name", "importance": "critical|important|nice-to-have", "timeToLearn": "estimate" }
  ],
  "overallReadiness": 65,
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;
  }

  /**
   * Build chat prompt
   */
  static buildChatPrompt(message, context = {}, history = []) {
    const historyText = history.length > 0
      ? `\nConversation History:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n`
      : '';

    const contextText = Object.keys(context).length > 0
      ? `\nContext: ${JSON.stringify(context)}\n`
      : '';

    return `You are Elevare AI, a helpful career assistant specializing in resumes, portfolios, interviews, and career development.
${contextText}${historyText}
User Message: ${message}

Provide helpful, actionable advice. Be concise but thorough. If the user asks about their resume or portfolio, reference the context provided.

Return ONLY valid JSON in this format:
{
  "response": "Your helpful response",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "followUpQuestions": ["Question 1", "Question 2"]
}`;
  }
}

module.exports = PromptBuilder;
