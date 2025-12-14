/**
 * Response Parser Service
 * Parses and validates AI responses for all features
 * @version 2.0.0
 */

class ResponseParser {
  /**
   * Parse JSON from AI response with error handling
   */
  static parseJSON(text) {
    try {
      // Clean the response
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?|\n?```/g, '');
      cleanedText = cleanedText.replace(/```\n?|\n?```/g, '');
      
      // Find JSON object or array in the response
      const jsonMatch = cleanedText.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('JSON parsing failed:', error.message);
      console.log('Raw text:', text.substring(0, 500));
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Parse resume content response
   */
  static parseResumeContent(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        summary: parsed.summary || '',
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        skills: parsed.skills || { technical: [], soft: [] },
        education: parsed.education || [],
        projects: parsed.projects || []
      };
    } catch (error) {
      console.error('Resume content parsing failed:', error);
      return {
        summary: '',
        experience: [],
        skills: { technical: [], soft: [] },
        education: [],
        projects: [],
        error: error.message
      };
    }
  }

  /**
   * Parse ATS analysis response
   */
  static parseATSAnalysis(text) {
    try {
      const parsed = this.parseJSON(text);
      
      // Validate and normalize scores
      const normalizeScore = (score) => {
        const num = parseInt(score, 10);
        return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
      };

      return {
        overallScore: normalizeScore(parsed.overallScore),
        categoryScores: {
          keywords: {
            score: normalizeScore(parsed.categoryScores?.keywords?.score),
            maxScore: 100,
            feedback: parsed.categoryScores?.keywords?.feedback || 'No feedback available'
          },
          formatting: {
            score: normalizeScore(parsed.categoryScores?.formatting?.score),
            maxScore: 100,
            feedback: parsed.categoryScores?.formatting?.feedback || 'No feedback available'
          },
          achievements: {
            score: normalizeScore(parsed.categoryScores?.achievements?.score),
            maxScore: 100,
            feedback: parsed.categoryScores?.achievements?.feedback || 'No feedback available'
          },
          actionVerbs: {
            score: normalizeScore(parsed.categoryScores?.actionVerbs?.score),
            maxScore: 100,
            feedback: parsed.categoryScores?.actionVerbs?.feedback || 'No feedback available'
          },
          skills: {
            score: normalizeScore(parsed.categoryScores?.skills?.score),
            maxScore: 100,
            feedback: parsed.categoryScores?.skills?.feedback || 'No feedback available'
          },
          sections: {
            score: normalizeScore(parsed.categoryScores?.sections?.score),
            maxScore: 100,
            feedback: parsed.categoryScores?.sections?.feedback || 'No feedback available'
          }
        },
        keywordsFound: Array.isArray(parsed.keywordsFound) ? parsed.keywordsFound : [],
        missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        summary: parsed.summary || 'Analysis complete'
      };
    } catch (error) {
      console.error('ATS analysis parsing failed:', error);
      return {
        overallScore: 0,
        categoryScores: {},
        keywordsFound: [],
        missingKeywords: [],
        improvements: [],
        strengths: [],
        summary: 'Failed to parse analysis',
        error: error.message
      };
    }
  }

  /**
   * Parse portfolio code response
   */
  static parsePortfolioCode(text) {
    try {
      // First, try to clean and parse as JSON
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if the entire response is wrapped
      cleanedText = cleanedText.replace(/^```json\s*\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```\s*$/i, '');
      cleanedText = cleanedText.replace(/^```\s*\n?/i, '');
      
      // Try to find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanedText);
      
      // Validate we have the required fields
      if (!parsed.html && !parsed.css && !parsed.js) {
        throw new Error('Missing required code fields in response');
      }
      
      return {
        html: parsed.html || '',
        css: parsed.css || '',
        js: parsed.js || parsed.javascript || '',
        message: parsed.message || 'Portfolio generated successfully'
      };
    } catch (error) {
      console.error('Portfolio code JSON parsing failed:', error.message);
      console.log('Attempting to extract code blocks from response...');
      
      // Try to extract code blocks directly (fallback method)
      const htmlMatch = text.match(/```html\n?([\s\S]*?)\n?```/i);
      const cssMatch = text.match(/```css\n?([\s\S]*?)\n?```/i);
      const jsMatch = text.match(/```(?:javascript|js)\n?([\s\S]*?)\n?```/i);
      
      if (htmlMatch || cssMatch || jsMatch) {
        console.log('Successfully extracted code from markdown blocks');
        return {
          html: htmlMatch ? htmlMatch[1].trim() : '',
          css: cssMatch ? cssMatch[1].trim() : '',
          js: jsMatch ? jsMatch[1].trim() : '',
          message: 'Portfolio extracted from code blocks'
        };
      }
      
      // Try to find HTML-like content directly
      const htmlContentMatch = text.match(/<(?:section|div|header|main)[^>]*>[\s\S]*<\/(?:section|div|header|main)>/i);
      if (htmlContentMatch) {
        console.log('Found HTML content directly in response');
        return {
          html: htmlContentMatch[0],
          css: '',
          js: '',
          message: 'Portfolio HTML extracted (CSS/JS may need to be added)'
        };
      }
      
      throw new Error(`Failed to parse portfolio code: ${error.message}. The AI response may not be in the expected format.`);
    }
  }

  /**
   * Parse interview questions response
   */
  static parseInterviewQuestions(text) {
    try {
      const parsed = this.parseJSON(text);
      
      const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
      
      return questions.map((q, index) => ({
        id: q.id || index + 1,
        question: q.question || '',
        type: q.type || 'general',
        difficulty: q.difficulty || 'medium',
        category: q.category || 'General',
        expectedAnswer: q.expectedAnswer || '',
        followUps: Array.isArray(q.followUps) ? q.followUps : [],
        tips: q.tips || ''
      }));
    } catch (error) {
      console.error('Interview questions parsing failed:', error);
      return [];
    }
  }

  /**
   * Parse answer evaluation response
   */
  static parseAnswerEvaluation(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        overallScore: parseInt(parsed.overallScore, 10) || 0,
        scores: {
          completeness: parseInt(parsed.scores?.completeness, 10) || 0,
          clarity: parseInt(parsed.scores?.clarity, 10) || 0,
          relevance: parseInt(parsed.scores?.relevance, 10) || 0,
          examples: parseInt(parsed.scores?.examples, 10) || 0,
          technicalAccuracy: parseInt(parsed.scores?.technicalAccuracy, 10) || 0
        },
        feedback: parsed.feedback || 'No feedback available',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        suggestedAnswer: parsed.suggestedAnswer || ''
      };
    } catch (error) {
      console.error('Answer evaluation parsing failed:', error);
      return {
        overallScore: 0,
        scores: {},
        feedback: 'Failed to evaluate answer',
        strengths: [],
        improvements: [],
        suggestedAnswer: '',
        error: error.message
      };
    }
  }

  /**
   * Parse cover letter response
   */
  static parseCoverLetter(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        coverLetter: parsed.coverLetter || '',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        tone: parsed.tone || 'professional',
        wordCount: parseInt(parsed.wordCount, 10) || 0
      };
    } catch (error) {
      console.error('Cover letter parsing failed:', error);
      
      // If JSON parsing fails, return the raw text as the cover letter
      if (text && text.length > 100) {
        return {
          coverLetter: text,
          keyPoints: [],
          tone: 'professional',
          wordCount: text.split(/\s+/).length
        };
      }
      
      return {
        coverLetter: '',
        keyPoints: [],
        tone: 'professional',
        wordCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Parse polished content response
   */
  static parsePolishedContent(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        polished: parsed.polished || '',
        changes: Array.isArray(parsed.changes) ? parsed.changes : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
      };
    } catch (error) {
      console.error('Polished content parsing failed:', error);
      return {
        polished: text,
        changes: [],
        suggestions: [],
        error: error.message
      };
    }
  }

  /**
   * Parse skills response
   */
  static parseSkills(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        technical: Array.isArray(parsed.technical) ? parsed.technical : [],
        soft: Array.isArray(parsed.soft) ? parsed.soft : [],
        tools: Array.isArray(parsed.tools) ? parsed.tools : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : []
      };
    } catch (error) {
      console.error('Skills parsing failed:', error);
      return {
        technical: [],
        soft: [],
        tools: [],
        certifications: [],
        error: error.message
      };
    }
  }

  /**
   * Parse learning roadmap response
   */
  static parseRoadmap(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
        phases: Array.isArray(parsed.phases) ? parsed.phases.map(phase => ({
          name: phase.name || 'Phase',
          duration: phase.duration || 'TBD',
          skills: Array.isArray(phase.skills) ? phase.skills : [],
          resources: Array.isArray(phase.resources) ? phase.resources : [],
          milestone: phase.milestone || ''
        })) : [],
        totalDuration: parsed.totalDuration || 'TBD',
        tips: Array.isArray(parsed.tips) ? parsed.tips : []
      };
    } catch (error) {
      console.error('Roadmap parsing failed:', error);
      return {
        skillGaps: [],
        phases: [],
        totalDuration: 'TBD',
        tips: [],
        error: error.message
      };
    }
  }

  /**
   * Parse project description response
   */
  static parseProjectDescription(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        shortDescription: parsed.shortDescription || '',
        fullDescription: parsed.fullDescription || '',
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
        metrics: Array.isArray(parsed.metrics) ? parsed.metrics : []
      };
    } catch (error) {
      console.error('Project description parsing failed:', error);
      return {
        shortDescription: '',
        fullDescription: text,
        highlights: [],
        technologies: [],
        metrics: [],
        error: error.message
      };
    }
  }

  /**
   * Parse skill gap analysis response
   */
  static parseSkillGapAnalysis(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
        skillsToImprove: Array.isArray(parsed.skillsToImprove) ? parsed.skillsToImprove : [],
        newSkillsNeeded: Array.isArray(parsed.newSkillsNeeded) ? parsed.newSkillsNeeded : [],
        overallReadiness: parseInt(parsed.overallReadiness, 10) || 0,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      };
    } catch (error) {
      console.error('Skill gap analysis parsing failed:', error);
      return {
        matchingSkills: [],
        skillsToImprove: [],
        newSkillsNeeded: [],
        overallReadiness: 0,
        recommendations: [],
        error: error.message
      };
    }
  }

  /**
   * Parse chat response
   */
  static parseChatResponse(text) {
    try {
      const parsed = this.parseJSON(text);
      
      return {
        response: parsed.response || text,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : []
      };
    } catch (error) {
      // If JSON parsing fails, return the raw text as the response
      return {
        response: text,
        suggestions: [],
        followUpQuestions: []
      };
    }
  }
}

module.exports = ResponseParser;
