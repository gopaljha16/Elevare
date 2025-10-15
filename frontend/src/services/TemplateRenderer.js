/**
 * Template Renderer Service
 * Converts resume data to HTML/CSS for live preview
 * Supports multiple templates and responsive modes
 */

class TemplateRenderer {
  constructor() {
    this.templates = {
      modern: this.modernTemplate,
      classic: this.classicTemplate,
      creative: this.creativeTemplate,
      minimal: this.minimalTemplate
    };
  }

  /**
   * Main render method
   * @param {Object} resumeData - Resume data object
   * @param {string} templateId - Template identifier
   * @param {string} mode - Responsive mode (desktop, tablet, mobile)
   * @returns {string} - Generated HTML string
   */
  render(resumeData, templateId = 'modern', mode = 'desktop') {
    const template = this.templates[templateId] || this.templates.modern;
    const html = template.call(this, resumeData, mode);
    
    return `
      <div class="resume-preview ${templateId}-template ${mode}-mode">
        ${this.getTemplateStyles(templateId, mode)}
        ${html}
      </div>
    `;
  }

  /**
   * Get template-specific styles
   * @param {string} templateId - Template identifier
   * @param {string} mode - Responsive mode
   * @returns {string} - CSS styles
   */
  getTemplateStyles(templateId, mode) {
    const baseStyles = `
      <style>
        .resume-preview {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
          overflow: hidden;
        }
        
        .desktop-mode { max-width: 8.5in; min-height: 11in; padding: 0.75in; }
        .tablet-mode { max-width: 600px; padding: 1rem; }
        .mobile-mode { max-width: 100%; padding: 0.5rem; }
        
        .resume-header { margin-bottom: 2rem; }
        .resume-name { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .resume-contact { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
        .contact-item { display: flex; align-items: center; gap: 0.25rem; }
        
        .resume-section { margin-bottom: 2rem; }
        .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        
        .experience-item, .education-item, .project-item { margin-bottom: 1.5rem; }
        .item-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem; }
        .item-title { font-weight: 600; }
        .item-company { color: #6b7280; }
        .item-date { color: #9ca3af; font-size: 0.875rem; }
        .item-description { margin-top: 0.5rem; }
        
        .skills-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .skill-tag { background: #f3f4f6; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; }
        
        .achievements-list { list-style: none; padding: 0; }
        .achievement-item { margin-bottom: 0.5rem; position: relative; padding-left: 1rem; }
        .achievement-item::before { content: '•'; position: absolute; left: 0; color: #6366f1; }
        
        @media (max-width: 768px) {
          .resume-name { font-size: 2rem; }
          .resume-contact { flex-direction: column; gap: 0.5rem; }
          .item-header { flex-direction: column; align-items: start; }
        }
      </style>
    `;

    const templateStyles = {
      modern: `
        <style>
          .modern-template .resume-name { color: #6366f1; }
          .modern-template .section-title { color: #6366f1; border-color: #6366f1; }
          .modern-template .skill-tag { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
          .modern-template .contact-item { color: #6b7280; }
        </style>
      `,
      classic: `
        <style>
          .classic-template { font-family: 'Times New Roman', serif; }
          .classic-template .resume-name { color: #1f2937; }
          .classic-template .section-title { color: #1f2937; border-color: #1f2937; }
          .classic-template .skill-tag { background: #f9fafb; border: 1px solid #d1d5db; }
        </style>
      `,
      creative: `
        <style>
          .creative-template .resume-name { 
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .creative-template .section-title { 
            color: #f59e0b; 
            border-color: #f59e0b;
            position: relative;
          }
          .creative-template .skill-tag { 
            background: linear-gradient(135deg, #f59e0b, #ef4444);
            color: white;
          }
        </style>
      `,
      minimal: `
        <style>
          .minimal-template { font-family: 'Helvetica Neue', sans-serif; }
          .minimal-template .resume-name { color: #000; font-weight: 300; }
          .minimal-template .section-title { 
            color: #000; 
            border: none; 
            border-left: 3px solid #000;
            padding-left: 1rem;
          }
          .minimal-template .skill-tag { 
            background: transparent; 
            border: 1px solid #000;
            color: #000;
          }
        </style>
      `
    };

    return baseStyles + (templateStyles[templateId] || '');
  }

  /**
   * Modern template
   */
  modernTemplate(resumeData, mode) {
    return `
      <div class="resume-content">
        ${this.renderHeader(resumeData)}
        ${this.renderExperience(resumeData.experience)}
        ${this.renderEducation(resumeData.education)}
        ${this.renderSkills(resumeData.skills)}
        ${this.renderProjects(resumeData.projects)}
        ${this.renderAchievements(resumeData.achievements)}
      </div>
    `;
  }

  /**
   * Classic template
   */
  classicTemplate(resumeData, mode) {
    return `
      <div class="resume-content">
        ${this.renderHeader(resumeData)}
        ${this.renderExperience(resumeData.experience)}
        ${this.renderEducation(resumeData.education)}
        ${this.renderSkills(resumeData.skills)}
        ${this.renderProjects(resumeData.projects)}
        ${this.renderAchievements(resumeData.achievements)}
      </div>
    `;
  }

  /**
   * Creative template
   */
  creativeTemplate(resumeData, mode) {
    return `
      <div class="resume-content">
        ${this.renderHeader(resumeData)}
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
          <div>
            ${this.renderExperience(resumeData.experience)}
            ${this.renderProjects(resumeData.projects)}
          </div>
          <div>
            ${this.renderEducation(resumeData.education)}
            ${this.renderSkills(resumeData.skills)}
            ${this.renderAchievements(resumeData.achievements)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Minimal template
   */
  minimalTemplate(resumeData, mode) {
    return `
      <div class="resume-content">
        ${this.renderHeader(resumeData)}
        ${this.renderExperience(resumeData.experience)}
        ${this.renderEducation(resumeData.education)}
        ${this.renderSkills(resumeData.skills)}
        ${this.renderProjects(resumeData.projects)}
        ${this.renderAchievements(resumeData.achievements)}
      </div>
    `;
  }

  /**
   * Render header section
   */
  renderHeader(resumeData) {
    const { personalInfo } = resumeData;
    if (!personalInfo) return '';

    const fullName = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
    
    return `
      <div class="resume-header">
        <h1 class="resume-name">${this.escapeHtml(fullName) || 'Your Name'}</h1>
        <div class="resume-contact">
          ${personalInfo.email ? `<div class="contact-item">📧 ${this.escapeHtml(personalInfo.email)}</div>` : ''}
          ${personalInfo.phone ? `<div class="contact-item">📱 ${this.escapeHtml(personalInfo.phone)}</div>` : ''}
          ${personalInfo.location ? `<div class="contact-item">📍 ${this.escapeHtml(personalInfo.location)}</div>` : ''}
          ${personalInfo.linkedin ? `<div class="contact-item">💼 ${this.escapeHtml(personalInfo.linkedin)}</div>` : ''}
          ${personalInfo.website ? `<div class="contact-item">🌐 ${this.escapeHtml(personalInfo.website)}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render experience section
   */
  renderExperience(experience) {
    if (!experience || experience.length === 0) return '';

    return `
      <div class="resume-section">
        <h2 class="section-title">Experience</h2>
        ${experience.map(exp => `
          <div class="experience-item">
            <div class="item-header">
              <div>
                <div class="item-title">${this.escapeHtml(exp.position || 'Position')}</div>
                <div class="item-company">${this.escapeHtml(exp.company || 'Company')}</div>
              </div>
              <div class="item-date">
                ${this.formatDate(exp.startDate)} - ${exp.endDate ? this.formatDate(exp.endDate) : 'Present'}
              </div>
            </div>
            ${exp.description ? `<div class="item-description">${this.escapeHtml(exp.description)}</div>` : ''}
            ${exp.achievements && exp.achievements.length > 0 ? `
              <ul class="achievements-list">
                ${exp.achievements.map(achievement => `
                  <li class="achievement-item">${this.escapeHtml(achievement)}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render education section
   */
  renderEducation(education) {
    if (!education || education.length === 0) return '';

    return `
      <div class="resume-section">
        <h2 class="section-title">Education</h2>
        ${education.map(edu => `
          <div class="education-item">
            <div class="item-header">
              <div>
                <div class="item-title">${this.escapeHtml(edu.degree || 'Degree')}</div>
                <div class="item-company">${this.escapeHtml(edu.institution || 'Institution')}</div>
                ${edu.field ? `<div style="color: #6b7280;">${this.escapeHtml(edu.field)}</div>` : ''}
              </div>
              <div class="item-date">
                ${edu.graduationDate ? this.formatDate(edu.graduationDate) : 'Expected'}
              </div>
            </div>
            ${edu.gpa ? `<div style="margin-top: 0.5rem; color: #6b7280;">GPA: ${edu.gpa}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render skills section
   */
  renderSkills(skills) {
    if (!skills || skills.length === 0) return '';

    return `
      <div class="resume-section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-list">
          ${skills.map(skill => `
            <span class="skill-tag">${this.escapeHtml(skill)}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render projects section
   */
  renderProjects(projects) {
    if (!projects || projects.length === 0) return '';

    return `
      <div class="resume-section">
        <h2 class="section-title">Projects</h2>
        ${projects.map(project => `
          <div class="project-item">
            <div class="item-header">
              <div>
                <div class="item-title">${this.escapeHtml(project.name || 'Project Name')}</div>
                ${project.link ? `<a href="${this.escapeHtml(project.link)}" style="color: #6366f1; text-decoration: none;">View Project</a>` : ''}
              </div>
            </div>
            ${project.description ? `<div class="item-description">${this.escapeHtml(project.description)}</div>` : ''}
            ${project.technologies && project.technologies.length > 0 ? `
              <div style="margin-top: 0.5rem;">
                <strong>Technologies:</strong> ${project.technologies.map(tech => this.escapeHtml(tech)).join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Render achievements section
   */
  renderAchievements(achievements) {
    if (!achievements || achievements.length === 0) return '';

    return `
      <div class="resume-section">
        <h2 class="section-title">Achievements</h2>
        <ul class="achievements-list">
          ${achievements.map(achievement => `
            <li class="achievement-item">${this.escapeHtml(achievement)}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Utility methods
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return [
      { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
      { id: 'classic', name: 'Classic', description: 'Traditional professional layout' },
      { id: 'creative', name: 'Creative', description: 'Bold and eye-catching design' },
      { id: 'minimal', name: 'Minimal', description: 'Simple and elegant layout' }
    ];
  }

  /**
   * Validate template ID
   */
  isValidTemplate(templateId) {
    return Object.keys(this.templates).includes(templateId);
  }
}

export default new TemplateRenderer();