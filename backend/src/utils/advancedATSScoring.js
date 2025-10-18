/**
 * Advanced ATS Scoring System
 * Professional-grade resume analysis with industry-standard scoring
 */

const { sanitizeInput } = require('./sanitization');

/**
 * Comprehensive ATS Analysis Engine
 * Analyzes resumes like top ATS systems (Workday, Greenhouse, etc.)
 */
class AdvancedATSScorer {
  constructor() {
    // Industry-standard ATS keywords and patterns
    this.industryKeywords = {
      tech: ['javascript', 'python', 'react', 'node', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'git', 'agile', 'scrum', 'api', 'microservices', 'devops', 'ci/cd', 'typescript', 'angular', 'vue', 'spring', 'django', 'flask', 'postgresql', 'redis', 'elasticsearch'],
      business: ['management', 'strategy', 'analysis', 'leadership', 'project management', 'stakeholder', 'budget', 'roi', 'kpi', 'process improvement', 'team lead', 'cross-functional', 'vendor management', 'risk management'],
      marketing: ['seo', 'sem', 'social media', 'content marketing', 'email marketing', 'analytics', 'conversion', 'brand', 'campaign', 'digital marketing', 'ppc', 'google ads', 'facebook ads', 'marketing automation'],
      finance: ['financial analysis', 'budgeting', 'forecasting', 'excel', 'financial modeling', 'accounting', 'gaap', 'sox', 'audit', 'compliance', 'risk assessment', 'investment', 'portfolio'],
      sales: ['sales', 'crm', 'lead generation', 'prospecting', 'closing', 'quota', 'pipeline', 'account management', 'relationship building', 'negotiation', 'salesforce', 'hubspot']
    };

    this.actionVerbs = [
      'achieved', 'improved', 'increased', 'decreased', 'reduced', 'managed', 'led', 'developed', 'created', 'implemented', 'designed', 'built', 'optimized', 'streamlined', 'automated', 'launched', 'delivered', 'executed', 'coordinated', 'supervised', 'trained', 'mentored', 'collaborated', 'analyzed', 'researched', 'established', 'initiated', 'transformed', 'enhanced', 'accelerated'
    ];

    this.quantifiers = [
      /\d+%/, /\$[\d,]+/, /\d+[kmb]?\+?/, /\d+x/, /\d+:\d+/, /\d+\/\d+/,
      /increased.*by.*\d+/, /reduced.*by.*\d+/, /improved.*by.*\d+/,
      /\d+\s*(million|thousand|billion|k|m|b)/i, /over \d+/, /up to \d+/,
      /\d+\s*(years?|months?|weeks?)/i, /\d+\s*(people|employees|team members|clients|customers)/i
    ];
  }  /**
  
 * Main ATS scoring function - analyzes resume comprehensively
   * @param {string} resumeText - Raw resume text
   * @returns {Object} Detailed ATS analysis
   */
  analyzeResume(resumeText) {
    const text = resumeText.toLowerCase();
    const originalText = resumeText;

    console.log('🔍 Starting advanced ATS analysis...');

    // Core analysis components
    const contactInfo = this.analyzeContactInformation(text, originalText);
    const structure = this.analyzeResumeStructure(text, originalText);
    const content = this.analyzeContentQuality(text, originalText);
    const keywords = this.analyzeKeywords(text, originalText);
    const formatting = this.analyzeFormatting(text, originalText);
    const experience = this.analyzeExperience(text, originalText);
    const education = this.analyzeEducation(text, originalText);
    const skills = this.analyzeSkills(text, originalText);

    // Calculate weighted scores
    const scores = {
      contactInfo: contactInfo.score,
      structure: structure.score,
      content: content.score,
      keywords: keywords.score,
      formatting: formatting.score,
      experience: experience.score,
      education: education.score,
      skills: skills.score
    };

    // Industry-standard weighted calculation
    const finalScore = this.calculateWeightedScore(scores);

    // Generate detailed feedback
    const feedback = this.generateDetailedFeedback({
      contactInfo, structure, content, keywords,
      formatting, experience, education, skills, finalScore
    });

    console.log('✅ Advanced ATS analysis completed, score:', finalScore);

    return {
      atsScore: Math.round(finalScore),
      breakdown: {
        contactInfo: { score: contactInfo.score, maxScore: 100, details: contactInfo.details },
        structure: { score: structure.score, maxScore: 100, details: structure.details },
        content: { score: content.score, maxScore: 100, details: content.details },
        keywords: { score: keywords.score, maxScore: 100, details: keywords.details },
        formatting: { score: formatting.score, maxScore: 100, details: formatting.details },
        experience: { score: experience.score, maxScore: 100, details: experience.details },
        education: { score: education.score, maxScore: 100, details: education.details },
        skills: { score: skills.score, maxScore: 100, details: skills.details }
      },
      ...feedback
    };
  }  /**
   * 
Analyze contact information completeness and format
   */
  analyzeContactInformation(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Email detection (more sophisticated)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = originalText.match(emailRegex);
    if (emails && emails.length > 0) {
      score += 25;
      details.push(`Professional email found: ${emails[0]}`);

      // Check for professional email domains
      const professionalDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
      const domain = emails[0].split('@')[1];
      if (!professionalDomains.includes(domain)) {
        score += 5; // Bonus for custom domain
        details.push('Custom domain email (professional)');
      }
    } else {
      issues.push('Missing email address');
    }

    // Phone number detection (multiple formats)
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    if (phoneRegex.test(originalText)) {
      score += 20;
      details.push('Phone number provided');
    } else {
      issues.push('Missing phone number');
    }

    // LinkedIn profile
    if (text.includes('linkedin') || text.includes('linkedin.com')) {
      score += 15;
      details.push('LinkedIn profile included');
    } else {
      issues.push('Missing LinkedIn profile');
    }

    // Location information
    const locationKeywords = ['address', 'city', 'state', 'zip', 'location', 'based in', 'located in'];
    if (locationKeywords.some(keyword => text.includes(keyword))) {
      score += 15;
      details.push('Location information provided');
    }

    // Portfolio/Website
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = originalText.match(urlRegex);
    if (urls && urls.length > 0) {
      score += 10;
      details.push('Portfolio/website links included');
    }

    // GitHub profile (for tech roles)
    if (text.includes('github') || text.includes('github.com')) {
      score += 15;
      details.push('GitHub profile included');
    }

    return { score: Math.min(score, 100), details, issues };
  }  /**

   * Analyze resume structure and organization
   */
  analyzeResumeStructure(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Standard section headers
    const standardSections = {
      'experience': ['experience', 'work experience', 'professional experience', 'employment', 'work history'],
      'education': ['education', 'academic background', 'qualifications'],
      'skills': ['skills', 'technical skills', 'core competencies', 'expertise'],
      'summary': ['summary', 'profile', 'objective', 'about', 'professional summary'],
      'projects': ['projects', 'key projects', 'notable projects'],
      'achievements': ['achievements', 'accomplishments', 'awards', 'honors']
    };

    let sectionsFound = 0;
    Object.entries(standardSections).forEach(([section, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        sectionsFound++;
        score += 15;
        details.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section identified`);
      }
    });

    if (sectionsFound < 3) {
      issues.push('Missing key resume sections');
    }

    // Check for logical flow
    const experienceIndex = text.indexOf('experience');
    const educationIndex = text.indexOf('education');
    const skillsIndex = text.indexOf('skills');

    if (experienceIndex > 0 && educationIndex > experienceIndex) {
      score += 10;
      details.push('Logical section ordering (Experience before Education)');
    }

    // Length analysis
    const wordCount = originalText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 800) {
      score += 10;
      details.push(`Optimal length: ${wordCount} words`);
    } else if (wordCount < 300) {
      issues.push('Resume too short (under 300 words)');
    } else if (wordCount > 1200) {
      issues.push('Resume too long (over 1200 words)');
    }

    return { score: Math.min(score, 100), details, issues };
  }  /*
*
   * Analyze content quality and impact
   */
  analyzeContentQuality(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Action verb usage
    let actionVerbCount = 0;
    this.actionVerbs.forEach(verb => {
      if (text.includes(verb)) {
        actionVerbCount++;
      }
    });

    if (actionVerbCount >= 10) {
      score += 25;
      details.push(`Strong action verbs used: ${actionVerbCount} found`);
    } else if (actionVerbCount >= 5) {
      score += 15;
      details.push(`Good action verb usage: ${actionVerbCount} found`);
    } else {
      issues.push('Limited use of action verbs');
    }

    // Quantifiable achievements
    let quantifierCount = 0;
    this.quantifiers.forEach(pattern => {
      const matches = originalText.match(pattern);
      if (matches) {
        quantifierCount += matches.length;
      }
    });

    if (quantifierCount >= 5) {
      score += 30;
      details.push(`Excellent quantification: ${quantifierCount} metrics found`);
    } else if (quantifierCount >= 3) {
      score += 20;
      details.push(`Good quantification: ${quantifierCount} metrics found`);
    } else if (quantifierCount >= 1) {
      score += 10;
      details.push(`Some quantification: ${quantifierCount} metrics found`);
    } else {
      issues.push('No quantifiable achievements found');
    }

    // Bullet point usage
    const bulletPoints = (originalText.match(/[•·▪▫‣⁃]/g) || []).length;
    const dashes = (originalText.match(/^\s*[-*]\s/gm) || []).length;
    const totalBullets = bulletPoints + dashes;

    if (totalBullets >= 8) {
      score += 15;
      details.push(`Well-structured with ${totalBullets} bullet points`);
    } else if (totalBullets >= 4) {
      score += 10;
      details.push(`Good structure with ${totalBullets} bullet points`);
    }

    // Avoid common mistakes
    const commonMistakes = [
      { pattern: /\bi\b/gi, name: 'First person pronouns' },
      { pattern: /responsible for/gi, name: 'Passive language' },
      { pattern: /duties included/gi, name: 'Duty-focused language' }
    ];

    commonMistakes.forEach(mistake => {
      const matches = originalText.match(mistake.pattern);
      if (matches && matches.length > 2) {
        score -= 5;
        issues.push(`Avoid overusing: ${mistake.name}`);
      }
    });

    return { score: Math.max(0, Math.min(score, 100)), details, issues };
  }  /**

   * Analyze keyword optimization and industry relevance
   */
  analyzeKeywords(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Detect industry based on keywords
    let detectedIndustry = 'general';
    let maxKeywordCount = 0;

    Object.entries(this.industryKeywords).forEach(([industry, keywords]) => {
      let count = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          count++;
        }
      });

      if (count > maxKeywordCount) {
        maxKeywordCount = count;
        detectedIndustry = industry;
      }
    });

    if (maxKeywordCount >= 8) {
      score += 30;
      details.push(`Strong ${detectedIndustry} industry alignment: ${maxKeywordCount} relevant keywords`);
    } else if (maxKeywordCount >= 5) {
      score += 20;
      details.push(`Good ${detectedIndustry} industry alignment: ${maxKeywordCount} relevant keywords`);
    } else if (maxKeywordCount >= 3) {
      score += 10;
      details.push(`Some ${detectedIndustry} industry alignment: ${maxKeywordCount} relevant keywords`);
    } else {
      issues.push('Limited industry-specific keywords');
    }

    // Keyword density analysis
    const totalWords = originalText.split(/\s+/).length;
    const keywordDensity = (maxKeywordCount / totalWords) * 100;

    if (keywordDensity >= 2 && keywordDensity <= 5) {
      score += 15;
      details.push(`Optimal keyword density: ${keywordDensity.toFixed(1)}%`);
    } else if (keywordDensity > 5) {
      score -= 5;
      issues.push('Keyword stuffing detected');
    }

    // Technical skills for tech roles
    if (detectedIndustry === 'tech') {
      const programmingLanguages = ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'];
      const langCount = programmingLanguages.filter(lang => text.includes(lang)).length;

      if (langCount >= 3) {
        score += 15;
        details.push(`Multiple programming languages: ${langCount} found`);
      }

      const frameworks = ['react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel'];
      const frameworkCount = frameworks.filter(fw => text.includes(fw)).length;

      if (frameworkCount >= 2) {
        score += 10;
        details.push(`Modern frameworks: ${frameworkCount} found`);
      }
    }

    // Soft skills balance
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative', 'adaptable'];
    const softSkillCount = softSkills.filter(skill => text.includes(skill)).length;

    if (softSkillCount >= 3) {
      score += 10;
      details.push(`Good soft skills representation: ${softSkillCount} found`);
    }

    return { score: Math.min(score, 100), details, issues };
  }  /**
 
  * Analyze experience section quality
   */
  analyzeExperience(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Job titles and companies
    const jobTitlePatterns = [
      /\b(manager|director|lead|senior|principal|architect|engineer|developer|analyst|specialist|coordinator|supervisor)\b/gi
    ];

    let jobTitleCount = 0;
    jobTitlePatterns.forEach(pattern => {
      const matches = originalText.match(pattern);
      if (matches) {
        jobTitleCount += matches.length;
      }
    });

    if (jobTitleCount >= 3) {
      score += 20;
      details.push(`Clear job progression: ${jobTitleCount} professional titles`);
    } else if (jobTitleCount >= 1) {
      score += 10;
      details.push(`Professional titles present: ${jobTitleCount} found`);
    }

    // Date ranges
    const datePatterns = [
      /\b(20\d{2})\s*[-–—]\s*(20\d{2}|present|current)\b/gi,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+20\d{2}/gi
    ];

    let dateRangeCount = 0;
    datePatterns.forEach(pattern => {
      const matches = originalText.match(pattern);
      if (matches) {
        dateRangeCount += matches.length;
      }
    });

    if (dateRangeCount >= 2) {
      score += 15;
      details.push(`Clear employment timeline: ${dateRangeCount} date ranges`);
    } else if (dateRangeCount >= 1) {
      score += 8;
      details.push(`Some employment dates provided`);
    } else {
      issues.push('Missing employment dates');
    }

    // Company names (look for patterns that suggest company names)
    const companyIndicators = ['inc', 'llc', 'corp', 'ltd', 'company', 'technologies', 'solutions', 'systems', 'group'];
    let companyCount = 0;
    companyIndicators.forEach(indicator => {
      if (text.includes(indicator)) {
        companyCount++;
      }
    });

    if (companyCount >= 2) {
      score += 15;
      details.push('Multiple companies/organizations mentioned');
    }

    // Career progression indicators
    const progressionWords = ['promoted', 'advanced', 'progressed', 'grew', 'expanded role'];
    const hasProgression = progressionWords.some(word => text.includes(word));

    if (hasProgression) {
      score += 20;
      details.push('Career progression demonstrated');
    }

    // Industry experience depth
    const experienceDepthWords = ['years', 'experience', 'background', 'expertise'];
    let depthScore = 0;
    experienceDepthWords.forEach(word => {
      if (text.includes(word)) {
        depthScore += 5;
      }
    });

    score += Math.min(depthScore, 20);
    if (depthScore > 0) {
      details.push('Experience depth communicated');
    }

    return { score: Math.min(score, 100), details, issues };
  }  /**

   * Analyze education section
   */
  analyzeEducation(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Degree types
    const degrees = ['bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma', 'certificate', 'bs', 'ba', 'ms', 'ma', 'mba'];
    let degreeCount = 0;
    degrees.forEach(degree => {
      if (text.includes(degree)) {
        degreeCount++;
      }
    });

    if (degreeCount >= 1) {
      score += 25;
      details.push(`Education credentials: ${degreeCount} degree(s) mentioned`);
    } else {
      issues.push('No formal education mentioned');
    }

    // University/Institution names
    const institutionKeywords = ['university', 'college', 'institute', 'school', 'academy'];
    const hasInstitution = institutionKeywords.some(keyword => text.includes(keyword));

    if (hasInstitution) {
      score += 15;
      details.push('Educational institution mentioned');
    }

    // GPA (if mentioned)
    const gpaPattern = /gpa[:\s]*([3-4]\.\d+)/i;
    const gpaMatch = originalText.match(gpaPattern);
    if (gpaMatch) {
      const gpa = parseFloat(gpaMatch[1]);
      if (gpa >= 3.5) {
        score += 15;
        details.push(`High GPA mentioned: ${gpa}`);
      } else if (gpa >= 3.0) {
        score += 10;
        details.push(`GPA mentioned: ${gpa}`);
      }
    }

    // Academic honors
    const honors = ['magna cum laude', 'summa cum laude', 'cum laude', 'honors', 'dean\'s list', 'phi beta kappa'];
    const hasHonors = honors.some(honor => text.includes(honor));

    if (hasHonors) {
      score += 20;
      details.push('Academic honors mentioned');
    }

    // Relevant coursework or certifications
    const certificationKeywords = ['certified', 'certification', 'coursework', 'training', 'workshop'];
    let certCount = 0;
    certificationKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        certCount++;
      }
    });

    if (certCount >= 2) {
      score += 15;
      details.push('Additional certifications/training mentioned');
    }

    // Recent education (bonus for recent grads)
    const currentYear = new Date().getFullYear();
    const recentYears = [currentYear, currentYear - 1, currentYear - 2];
    const hasRecentEducation = recentYears.some(year => originalText.includes(year.toString()));

    if (hasRecentEducation) {
      score += 10;
      details.push('Recent education mentioned');
    }

    return { score: Math.min(score, 100), details, issues };
  }
  /**
     * Analyze skills section
     */
  analyzeSkills(text, originalText) {
    let score = 0;
    const details = [];
    const issues = [];

    // Count distinct skills
    const skillSeparators = [',', '•', '·', '|', '\n', ';'];
    let skillCount = 0;

    // Look for skills section and count items
    const skillsSection = this.extractSection(originalText, ['skills', 'technical skills', 'core competencies']);
    if (skillsSection) {
      skillSeparators.forEach(separator => {
        const parts = skillsSection.split(separator);
        if (parts.length > skillCount) {
          skillCount = parts.length;
        }
      });
    }

    if (skillCount >= 10) {
      score += 25;
      details.push(`Comprehensive skills list: ${skillCount} skills`);
    } else if (skillCount >= 6) {
      score += 20;
      details.push(`Good skills coverage: ${skillCount} skills`);
    } else if (skillCount >= 3) {
      score += 10;
      details.push(`Basic skills listed: ${skillCount} skills`);
    } else {
      issues.push('Limited skills section');
    }

    // Technical vs soft skills balance
    const technicalKeywords = ['programming', 'software', 'database', 'framework', 'api', 'cloud', 'analytics'];
    const softSkillKeywords = ['leadership', 'communication', 'teamwork', 'management', 'analytical'];

    let techSkillCount = 0;
    let softSkillCount = 0;

    technicalKeywords.forEach(keyword => {
      if (text.includes(keyword)) techSkillCount++;
    });

    softSkillKeywords.forEach(keyword => {
      if (text.includes(keyword)) softSkillCount++;
    });

    if (techSkillCount >= 3 && softSkillCount >= 2) {
      score += 20;
      details.push('Good balance of technical and soft skills');
    } else if (techSkillCount >= 2 || softSkillCount >= 2) {
      score += 10;
      details.push('Skills categories represented');
    }

    // Industry-specific skills depth
    const industrySkillDepth = this.analyzeIndustrySkillDepth(text);
    score += industrySkillDepth.score;
    details.push(...industrySkillDepth.details);

    // Skill proficiency levels
    const proficiencyWords = ['expert', 'advanced', 'proficient', 'intermediate', 'beginner', 'years experience'];
    const hasProficiency = proficiencyWords.some(word => text.includes(word));

    if (hasProficiency) {
      score += 15;
      details.push('Skill proficiency levels indicated');
    }

    return { score: Math.min(score, 100), details, issues };
  }
  /**
     * Analyze formatting and ATS compatibility
     */
  analyzeFormatting(text, originalText) {
    let score = 50; // Start with baseline
    const details = [];
    const issues = [];

    // Check for ATS-friendly formatting
    const problematicChars = ['†', '‡', '§', '¶', '©', '®', '™'];
    let problematicCount = 0;
    problematicChars.forEach(char => {
      if (originalText.includes(char)) {
        problematicCount++;
      }
    });

    if (problematicCount === 0) {
      score += 15;
      details.push('ATS-friendly characters used');
    } else {
      score -= problematicCount * 5;
      issues.push(`${problematicCount} problematic characters found`);
    }

    // Check for consistent formatting
    const bulletPoints = (originalText.match(/[•·▪▫‣⁃-]/g) || []).length;
    if (bulletPoints >= 5) {
      score += 10;
      details.push('Consistent bullet point usage');
    }

    // Check for proper spacing
    const doubleSpaces = (originalText.match(/  +/g) || []).length;
    if (doubleSpaces < 3) {
      score += 10;
      details.push('Clean spacing');
    } else {
      issues.push('Inconsistent spacing detected');
    }

    // Check for standard fonts (can't detect, but assume good)
    score += 15;
    details.push('Standard formatting assumed');

    return { score: Math.min(score, 100), details, issues };
  }

  /**
   * Calculate industry-specific skill depth
   */
  analyzeIndustrySkillDepth(text) {
    let score = 0;
    const details = [];

    // Technology stack depth
    const techStacks = {
      'frontend': ['react', 'angular', 'vue', 'html', 'css', 'javascript'],
      'backend': ['node', 'python', 'java', 'php', 'ruby', 'go'],
      'database': ['sql', 'mongodb', 'postgresql', 'mysql', 'redis'],
      'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes'],
      'devops': ['ci/cd', 'jenkins', 'git', 'linux', 'bash']
    };

    Object.entries(techStacks).forEach(([stack, skills]) => {
      const stackSkills = skills.filter(skill => text.includes(skill));
      if (stackSkills.length >= 3) {
        score += 10;
        details.push(`Strong ${stack} skills: ${stackSkills.length} technologies`);
      } else if (stackSkills.length >= 2) {
        score += 5;
        details.push(`Good ${stack} skills: ${stackSkills.length} technologies`);
      }
    });

    return { score: Math.min(score, 30), details };
  }  /**

   * Calculate weighted final score (industry-standard weights)
   */
  calculateWeightedScore(scores) {
    const weights = {
      contactInfo: 0.10,    // 10% - Basic requirement
      structure: 0.15,      // 15% - Organization matters
      content: 0.25,        // 25% - Most important - impact and achievements
      keywords: 0.20,       // 20% - Industry relevance
      formatting: 0.05,     // 5% - ATS compatibility
      experience: 0.15,     // 15% - Professional background
      education: 0.05,      // 5% - Educational background
      skills: 0.05          // 5% - Technical abilities
    };

    let weightedScore = 0;
    Object.entries(weights).forEach(([category, weight]) => {
      weightedScore += (scores[category] || 0) * weight;
    });

    return Math.max(0, Math.min(100, weightedScore));
  }

  /**
   * Generate detailed feedback and suggestions
   */
  generateDetailedFeedback(analysis) {
    const { finalScore } = analysis;
    const recommendations = [];
    const strengths = [];
    const weaknesses = [];
    const actionableFeedback = [];
    const nextSteps = [];

    // Collect all issues and strengths
    Object.values(analysis).forEach(section => {
      if (section.details) {
        strengths.push(...section.details);
      }
      if (section.issues) {
        weaknesses.push(...section.issues);
        section.issues.forEach(issue => {
          recommendations.push(this.getRecommendationForIssue(issue));
        });
      }
    });

    // Generate priority actionable feedback
    if (finalScore < 60) {
      actionableFeedback.push({
        priority: 'high',
        category: 'overall',
        suggestion: 'Focus on adding quantifiable achievements and industry keywords',
        impact: 'Can improve ATS score by 20-30 points'
      });
    }

    if (analysis.content.score < 70) {
      actionableFeedback.push({
        priority: 'high',
        category: 'content',
        suggestion: 'Add more action verbs and quantifiable results',
        impact: 'Significantly improves resume impact and ATS parsing'
      });
    }

    if (analysis.keywords.score < 60) {
      actionableFeedback.push({
        priority: 'medium',
        category: 'keywords',
        suggestion: 'Include more industry-specific keywords and skills',
        impact: 'Improves matching with job requirements'
      });
    }

    // Generate next steps based on score
    if (finalScore >= 80) {
      nextSteps.push('Your resume is well-optimized! Consider tailoring for specific roles');
      nextSteps.push('Review and update regularly to maintain relevance');
    } else if (finalScore >= 60) {
      nextSteps.push('Add more quantifiable achievements to boost impact');
      nextSteps.push('Include additional industry-relevant keywords');
      nextSteps.push('Ensure all contact information is complete');
    } else {
      nextSteps.push('Focus on restructuring with clear section headers');
      nextSteps.push('Add quantifiable achievements with specific numbers');
      nextSteps.push('Include comprehensive skills section');
      nextSteps.push('Ensure complete contact information');
    }

    return {
      recommendations: recommendations.filter(r => r).slice(0, 10),
      keywordSuggestions: this.generateKeywordSuggestions(analysis),
      grammarSuggestions: this.generateGrammarSuggestions(analysis),
      atsOptimization: this.generateATSOptimizations(analysis),
      actionableFeedback: actionableFeedback.slice(0, 5),
      strengths: strengths.slice(0, 8),
      weaknesses: weaknesses.slice(0, 8),
      nextSteps: nextSteps.slice(0, 5)
    };
  }

  /**
   * Helper methods for feedback generation
  */
  getRecommendationForIssue(issue) {
    const recommendations = {
      'Missing email address': 'Add a professional email address',
      'Missing phone number': 'Include your phone number with area code',
      'Missing LinkedIn profile': 'Add your LinkedIn profile URL',
      'Missing employment dates': 'Include start and end dates for all positions',
      'Limited use of action verbs': 'Start bullet points with strong action verbs',
      'No quantifiable achievements found': 'Add specific numbers, percentages, and metrics',
      'Limited industry-specific keywords': 'Include more relevant industry terminology',
      'Resume too short': 'Expand with more detailed achievements and experiences',
      'Resume too long': 'Condense content to focus on most relevant information'
    };

    return recommendations[issue] || 'Review and improve this section';
  }

  generateKeywordSuggestions(analysis) {
    return [
      'Include job-specific keywords from target job descriptions',
      'Add industry-standard terminology and acronyms',
      'Use both spelled-out and abbreviated forms of key terms',
      'Include relevant software, tools, and technologies'
    ];
  }

  generateGrammarSuggestions(analysis) {
    return [
      'Use consistent verb tenses throughout',
      'Avoid first-person pronouns (I, me, my)',
      'Keep bullet points concise and parallel in structure',
      'Proofread for spelling and grammatical errors'
    ];
  }

  generateATSOptimizations(analysis) {
    return [
      'Use standard section headers (Experience, Education, Skills)',
      'Avoid special characters and complex formatting',
      'Save as both PDF and Word document formats',
      'Use standard fonts like Arial, Calibri, or Times New Roman'
    ];
  }

  /**
   * Extract specific section from resume text
   */
  extractSection(text, sectionHeaders) {
    const lowerText = text.toLowerCase();

    for (const header of sectionHeaders) {
      const headerIndex = lowerText.indexOf(header.toLowerCase());
      if (headerIndex !== -1) {
        // Find the next section or end of text
        const nextSectionIndex = this.findNextSectionIndex(lowerText, headerIndex + header.length);
        return text.substring(headerIndex, nextSectionIndex);
      }
    }

    return null;
  }

  findNextSectionIndex(text, startIndex) {
    const commonHeaders = ['experience', 'education', 'skills', 'projects', 'achievements', 'summary'];
    let minIndex = text.length;

    commonHeaders.forEach(header => {
      const index = text.indexOf(header, startIndex);
      if (index !== -1 && index < minIndex) {
        minIndex = index;
      }
    });

    return minIndex;
  }
}

module.exports = AdvancedATSScorer;