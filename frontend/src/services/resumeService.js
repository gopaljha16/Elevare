/**
 * Resume Service
 * Handles all resume-related API interactions
 */

class ResumeService {
  constructor() {
    this.baseURL = '/api/resumes';
  }

  /**
   * Get authentication headers
   * @returns {Object} - Headers with auth token
   */
  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
  }

  /**
   * Create a new resume
   * @param {Object} resumeData - Resume data object
   * @returns {Promise<Object>} - Created resume
   */
  async createResume(resumeData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error('Failed to create resume');
      }

      const result = await response.json();
      return result.data.resume;
    } catch (error) {
      console.error('Create resume error:', error);
      throw error;
    }
  }

  /**
   * Update an existing resume
   * @param {string} resumeId - Resume ID
   * @param {Object} resumeData - Updated resume data
   * @returns {Promise<Object>} - Updated resume
   */
  async updateResume(resumeId, resumeData) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      const result = await response.json();
      return result.data.resume;
    } catch (error) {
      console.error('Update resume error:', error);
      throw error;
    }
  }

  /**
   * Save resume (create or update based on ID)
   * @param {Object} resumeData - Resume data object
   * @returns {Promise<Object>} - Saved resume
   */
  async saveResume(resumeData) {
    if (resumeData.id) {
      return this.updateResume(resumeData.id, resumeData);
    } else {
      return this.createResume(resumeData);
    }
  }

  /**
   * Get a specific resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Object>} - Resume data
   */
  async getResume(resumeId) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get resume');
      }

      const result = await response.json();
      return result.data.resume;
    } catch (error) {
      console.error('Get resume error:', error);
      throw error;
    }
  }

  /**
   * Get all user resumes
   * @param {Object} options - Query options (page, limit, search, etc.)
   * @returns {Promise<Object>} - Resumes list with pagination
   */
  async getResumes(options = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.page) queryParams.append('page', options.page);
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.search) queryParams.append('search', options.search);
      if (options.sortBy) queryParams.append('sortBy', options.sortBy);
      if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);

      const url = `${this.baseURL}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get resumes');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get resumes error:', error);
      throw error;
    }
  }

  /**
   * Delete a resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteResume(resumeId) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      return true;
    } catch (error) {
      console.error('Delete resume error:', error);
      throw error;
    }
  }

  /**
   * Duplicate a resume
   * @param {string} resumeId - Resume ID to duplicate
   * @returns {Promise<Object>} - Duplicated resume
   */
  async duplicateResume(resumeId) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/duplicate`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to duplicate resume');
      }

      const result = await response.json();
      return result.data.resume;
    } catch (error) {
      console.error('Duplicate resume error:', error);
      throw error;
    }
  }

  /**
   * Get resume analytics
   * @returns {Promise<Object>} - Analytics data
   */
  async getAnalytics() {
    try {
      const response = await fetch(`${this.baseURL}/analytics`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get analytics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      throw error;
    }
  }

  /**
   * Calculate ATS score for a resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Object>} - ATS score and breakdown
   */
  async calculateATSScore(resumeId) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/ats-score`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to calculate ATS score');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('ATS score error:', error);
      throw error;
    }
  }

  /**
   * Match resume against job description
   * @param {string} resumeId - Resume ID
   * @param {string} jobDescription - Job description text
   * @returns {Promise<Object>} - Match analysis
   */
  async matchJobDescription(resumeId, jobDescription) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/match-job`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ jobDescription })
      });

      if (!response.ok) {
        throw new Error('Failed to match job description');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Job match error:', error);
      throw error;
    }
  }

  /**
   * Optimize resume using AI
   * @param {string} resumeId - Resume ID
   * @param {string} jobDescription - Optional job description for context
   * @returns {Promise<Object>} - Optimization suggestions
   */
  async optimizeResume(resumeId, jobDescription = '') {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/optimize`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ jobDescription })
      });

      if (!response.ok) {
        throw new Error('Failed to optimize resume');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Optimize resume error:', error);
      throw error;
    }
  }

  /**
   * Generate PDF for a resume
   * @param {string} resumeId - Resume ID
   * @param {Object} options - PDF generation options
   * @returns {Promise<Blob>} - PDF blob
   */
  async generatePDF(resumeId, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/generate-pdf`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('Generate PDF error:', error);
      throw error;
    }
  }

  /**
   * Download PDF for a resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise<Blob>} - PDF blob
   */
  async downloadPDF(resumeId) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/download`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download PDF error:', error);
      throw error;
    }
  }

  /**
   * Preview resume with template
   * @param {string} resumeId - Resume ID
   * @param {string} templateId - Template ID
   * @returns {Promise<string>} - Preview HTML
   */
  async previewWithTemplate(resumeId, templateId) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/preview`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ templateId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const result = await response.json();
      return result.data.html;
    } catch (error) {
      console.error('Preview error:', error);
      throw error;
    }
  }

  /**
   * Get PDF generation history
   * @returns {Promise<Array>} - PDF history
   */
  async getPDFHistory() {
    try {
      const response = await fetch(`${this.baseURL}/pdf/history`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get PDF history');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('PDF history error:', error);
      throw error;
    }
  }

  /**
   * Get available templates
   * @returns {Promise<Array>} - Available templates
   */
  async getTemplates() {
    try {
      const response = await fetch(`${this.baseURL}/templates`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get templates');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get templates error:', error);
      throw error;
    }
  }

  /**
   * Get template categories
   * @returns {Promise<Array>} - Template categories
   */
  async getTemplateCategories() {
    try {
      const response = await fetch(`${this.baseURL}/templates/categories`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get template categories');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get template categories error:', error);
      throw error;
    }
  }

  /**
   * Get specific template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} - Template data
   */
  async getTemplate(templateId) {
    try {
      const response = await fetch(`${this.baseURL}/templates/${templateId}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get template');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get template error:', error);
      throw error;
    }
  }

  /**
   * Auto-save resume data
   * @param {Object} resumeData - Resume data to save
   * @returns {Promise<Object>} - Save result
   */
  async autoSave(resumeData) {
    try {
      // Use a shorter timeout for auto-save
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseURL}/auto-save`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(resumeData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Auto-save failed');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Auto-save timeout');
      } else {
        console.error('Auto-save error:', error);
      }
      throw error;
    }
  }

  /**
   * Share resume publicly
   * @param {string} resumeId - Resume ID
   * @param {Object} shareOptions - Share configuration
   * @returns {Promise<Object>} - Share link and settings
   */
  async shareResume(resumeId, shareOptions = {}) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/share`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(shareOptions)
      });

      if (!response.ok) {
        throw new Error('Failed to share resume');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Share resume error:', error);
      throw error;
    }
  }

  /**
   * Get shared resume (public access)
   * @param {string} shareToken - Share token
   * @returns {Promise<Object>} - Shared resume data
   */
  async getSharedResume(shareToken) {
    try {
      const response = await fetch(`/api/shared/resume/${shareToken}`);

      if (!response.ok) {
        throw new Error('Failed to get shared resume');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Get shared resume error:', error);
      throw error;
    }
  }

  /**
   * Export resume to various formats
   * @param {string} resumeId - Resume ID
   * @param {string} format - Export format (pdf, docx, txt, etc.)
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} - Exported file blob
   */
  async exportResume(resumeId, format = 'pdf', options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/export`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ format, ...options })
      });

      if (!response.ok) {
        throw new Error(`Failed to export resume as ${format}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Export resume error:', error);
      throw error;
    }
  }
}

export default new ResumeService();