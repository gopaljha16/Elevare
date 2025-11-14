/**
 * Response Parser - Parses and validates AI responses
 * Handles multiple parsing strategies for robust extraction
 */

class ResponseParser {
  /**
   * Parse JSON from AI response with multiple strategies
   */
  static parseJSON(response) {
    if (!response || typeof response !== 'string') {
      throw new Error('Invalid response: must be a non-empty string');
    }

    // Strategy 1: Direct JSON parse
    try {
      return JSON.parse(response);
    } catch (e) {
      // Continue to next strategy
    }

    // Strategy 2: Extract JSON from markdown code blocks
    try {
      const cleaned = response
        .replace(/```json\s*/gi, '')
        .replace(/```javascript\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      
      return JSON.parse(cleaned);
    } catch (e) {
      // Continue to next strategy
    }

    // Strategy 3: Find JSON object using regex
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonString = this.fixJsonString(jsonMatch[0]);
        return JSON.parse(jsonString);
      }
    } catch (e) {
      // Continue to next strategy
    }

    // Strategy 4: Find JSON object with brace counting
    try {
      const jsonStart = response.indexOf('{');
      if (jsonStart !== -1) {
        const jsonString = this.extractJsonWithBraceCounting(response, jsonStart);
        const fixed = this.fixJsonString(jsonString);
        return JSON.parse(fixed);
      }
    } catch (e) {
      console.error('All JSON parsing strategies failed:', e.message);
    }

    throw new Error('Could not parse JSON from response');
  }

  /**
   * Extract JSON using brace counting
   */
  static extractJsonWithBraceCounting(text, startIndex) {
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = startIndex; i < text.length; i++) {
      const char = text[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            return text.substring(startIndex, i + 1);
          }
        }
      }
    }

    throw new Error('Incomplete JSON object');
  }

  /**
   * Fix common JSON string issues
   */
  static fixJsonString(jsonString) {
    let result = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString[i];

      if (escapeNext) {
        result += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        result += char;
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }

      if (inString) {
        // Inside string, escape problematic characters
        if (char === '\n') result += '\\n';
        else if (char === '\r') result += '\\r';
        else if (char === '\t') result += '\\t';
        else if (char === '\b') result += '\\b';
        else if (char === '\f') result += '\\f';
        else result += char;
      } else {
        // Outside string, keep as is
        if (char.charCodeAt(0) >= 32 || char === '\n' || char === '\r' || char === '\t') {
          result += char;
        }
      }
    }

    return result;
  }

  /**
   * Parse plain text response
   */
  static parseText(response) {
    if (!response || typeof response !== 'string') {
      throw new Error('Invalid response: must be a non-empty string');
    }
    return response.trim();
  }

  /**
   * Extract code blocks from response
   */
  static extractCodeBlocks(response) {
    const blocks = [];
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = regex.exec(response)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }

    return blocks;
  }

  /**
   * Sanitize response text
   */
  static sanitizeResponse(response) {
    if (!response) return '';
    
    return response
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .trim();
  }

  /**
   * Parse resume content response
   */
  static parseResumeContent(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        summary: parsed.summary || '',
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        skills: parsed.skills || { technical: [], soft: [] },
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : []
      };
    } catch (error) {
      console.error('Failed to parse resume content:', error.message);
      throw new Error('Invalid resume content format');
    }
  }

  /**
   * Parse portfolio code response
   */
  static parsePortfolioCode(response) {
    try {
      const parsed = this.parseJSON(response);
      
      if (!parsed.html || !parsed.css || !parsed.js) {
        throw new Error('Missing required fields: html, css, or js');
      }

      return {
        html: this.sanitizeResponse(parsed.html),
        css: parsed.css,
        js: parsed.js,
        message: parsed.message || 'Portfolio generated successfully'
      };
    } catch (error) {
      console.error('Failed to parse portfolio code:', error.message);
      
      // Try alternative extraction
      const codeBlocks = this.extractCodeBlocks(response);
      const html = codeBlocks.find(b => b.language === 'html')?.code || '';
      const css = codeBlocks.find(b => b.language === 'css')?.code || '';
      const js = codeBlocks.find(b => b.language === 'javascript' || b.language === 'js')?.code || '';

      if (html && css) {
        return { html, css, js, message: 'Portfolio extracted from code blocks' };
      }

      throw new Error('Invalid portfolio code format');
    }
  }

  /**
   * Parse interview questions response
   */
  static parseInterviewQuestions(response) {
    try {
      const parsed = this.parseJSON(response);
      
      if (!Array.isArray(parsed.questions)) {
        throw new Error('Questions must be an array');
      }

      return parsed.questions.map(q => ({
        content: q.content || '',
        type: q.type || 'general',
        difficulty: q.difficulty || 'medium',
        suggestedAnswer: q.suggestedAnswer || '',
        hints: Array.isArray(q.hints) ? q.hints : [],
        category: q.category || 'general'
      }));
    } catch (error) {
      console.error('Failed to parse interview questions:', error.message);
      throw new Error('Invalid interview questions format');
    }
  }

  /**
   * Parse interview answer evaluation response
   */
  static parseAnswerEvaluation(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        score: Math.max(0, Math.min(100, parsed.score || 0)),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        feedback: parsed.feedback || '',
        detailedAnalysis: parsed.detailedAnalysis || {
          clarity: 0,
          completeness: 0,
          relevance: 0,
          technicalAccuracy: 0
        }
      };
    } catch (error) {
      console.error('Failed to parse answer evaluation:', error.message);
      throw new Error('Invalid answer evaluation format');
    }
  }

  /**
   * Parse ATS analysis response
   */
  static parseATSAnalysis(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        overallScore: Math.max(0, Math.min(100, parsed.overallScore || 0)),
        sectionAnalysis: parsed.sectionAnalysis || {},
        keywordAnalysis: parsed.keywordAnalysis || {
          presentKeywords: [],
          missingKeywords: [],
          keywordDensity: 'Not analyzed'
        },
        atsCompatibility: parsed.atsCompatibility || {
          formatIssues: [],
          parsingConcerns: [],
          recommendations: []
        },
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        criticalIssues: Array.isArray(parsed.criticalIssues) ? parsed.criticalIssues : [],
        actionableSteps: Array.isArray(parsed.actionableSteps) ? parsed.actionableSteps : []
      };
    } catch (error) {
      console.error('Failed to parse ATS analysis:', error.message);
      throw new Error('Invalid ATS analysis format');
    }
  }

  /**
   * Parse cover letter response
   */
  static parseCoverLetter(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        content: parsed.content || parsed.coverLetter || '',
        keyHighlights: Array.isArray(parsed.keyHighlights) ? parsed.keyHighlights : [],
        personalizedElements: Array.isArray(parsed.personalizedElements) ? parsed.personalizedElements : [],
        tone: parsed.tone || 'professional',
        wordCount: parsed.wordCount || 0
      };
    } catch (error) {
      console.error('Failed to parse cover letter:', error.message);
      // Fallback: treat entire response as cover letter content
      return {
        content: this.parseText(response),
        keyHighlights: [],
        personalizedElements: [],
        tone: 'professional',
        wordCount: response.split(/\s+/).length
      };
    }
  }

  /**
   * Parse skills response
   */
  static parseSkills(response) {
    try {
      const parsed = this.parseJSON(response);
      
      if (Array.isArray(parsed)) {
        return parsed;
      }

      const skills = [];
      if (Array.isArray(parsed.technical)) skills.push(...parsed.technical);
      if (Array.isArray(parsed.soft)) skills.push(...parsed.soft);
      if (Array.isArray(parsed.tools)) skills.push(...parsed.tools);
      
      return skills;
    } catch (error) {
      console.error('Failed to parse skills:', error.message);
      throw new Error('Invalid skills format');
    }
  }

  /**
   * Parse learning roadmap response
   */
  static parseRoadmap(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        title: parsed.title || 'Learning Roadmap',
        targetRole: parsed.targetRole || '',
        duration: parsed.duration || 'Not specified',
        phases: Array.isArray(parsed.phases) ? parsed.phases : [],
        milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
        resources: Array.isArray(parsed.resources) ? parsed.resources : []
      };
    } catch (error) {
      console.error('Failed to parse roadmap:', error.message);
      throw new Error('Invalid roadmap format');
    }
  }

  /**
   * Parse project description response
   */
  static parseProjectDescription(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        description: parsed.description || '',
        keyFeatures: Array.isArray(parsed.keyFeatures) ? parsed.keyFeatures : [],
        technologiesUsed: Array.isArray(parsed.technologiesUsed) ? parsed.technologiesUsed : [],
        impact: parsed.impact || '',
        challenges: parsed.challenges || ''
      };
    } catch (error) {
      console.error('Failed to parse project description:', error.message);
      // Fallback: treat entire response as description
      return {
        description: this.parseText(response),
        keyFeatures: [],
        technologiesUsed: [],
        impact: '',
        challenges: ''
      };
    }
  }

  /**
   * Parse content polishing response
   */
  static parsePolishedContent(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        polishedContent: parsed.polishedContent || parsed.content || '',
        changes: Array.isArray(parsed.changes) ? parsed.changes : [],
        improvementScore: parsed.improvementScore || 0
      };
    } catch (error) {
      console.error('Failed to parse polished content:', error.message);
      // Fallback: treat entire response as polished content
      return {
        polishedContent: this.parseText(response),
        changes: [],
        improvementScore: 0
      };
    }
  }

  /**
   * Parse skill gap analysis response
   */
  static parseSkillGapAnalysis(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        relevantSkills: Array.isArray(parsed.relevantSkills) ? parsed.relevantSkills : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
        learningPath: parsed.learningPath || '',
        marketDemand: parsed.marketDemand || '',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      console.error('Failed to parse skill gap analysis:', error.message);
      throw new Error('Invalid skill gap analysis format');
    }
  }

  /**
   * Parse chat response
   */
  static parseChatResponse(response) {
    try {
      const parsed = this.parseJSON(response);
      
      return {
        response: parsed.response || parsed.message || '',
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : []
      };
    } catch (error) {
      console.error('Failed to parse chat response:', error.message);
      // Fallback: treat entire response as chat message
      return {
        response: this.parseText(response),
        suggestions: [],
        followUpQuestions: []
      };
    }
  }

  /**
   * Validate response against schema (basic validation)
   */
  static validateResponse(response, requiredFields = []) {
    if (!response || typeof response !== 'object') {
      return {
        valid: false,
        errors: ['Response must be an object']
      };
    }

    const errors = [];
    for (const field of requiredFields) {
      if (!(field in response)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = ResponseParser;
