/**
 * LaTeX Service
 * Handles LaTeX generation, compilation, and PDF export
 */

class LaTeXService {
  constructor() {
    this.templates = {
      modern: this.modernTemplate,
      professional: this.professionalTemplate,
      minimalist: this.minimalistTemplate,
      creative: this.creativeTemplate,
      'ats-optimized': this.atsOptimizedTemplate
    };
  }

  /**
   * Generate LaTeX code from resume data
   * @param {Object} resumeData - Resume data object
   * @param {string} templateType - Template identifier
   * @returns {string} - Generated LaTeX code
   */
  async generateLatex(resumeData, templateType = 'modern') {
    const template = this.templates[templateType] || this.templates.modern;
    return template.call(this, resumeData);
  }

  /**
   * Generate HTML preview from LaTeX
   * @param {string} latexContent - LaTeX source code
   * @returns {string} - HTML preview
   */
  async generateHTMLPreview(latexContent) {
    // Convert LaTeX to HTML for preview
    // This is a simplified conversion - in production, you'd use a proper LaTeX to HTML converter
    return this.convertLatexToHTML(latexContent);
  }

  /**
   * Compile LaTeX to PDF
   * @param {string} latexContent - LaTeX source code
   * @returns {Blob} - PDF blob
   */
  async compileToPDF(latexContent) {
    try {
      const response = await fetch('/api/latex/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ latex: latexContent })
      });

      if (!response.ok) {
        throw new Error('PDF compilation failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF compilation error:', error);
      throw error;
    }
  }

  /**
   * Modern Template
   */
  modernTemplate(resumeData) {
    const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;
    
    return `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}
\\usepackage{import}

% Personal data
\\name{${this.escapeLatex(personalInfo?.firstName || '')}}{${this.escapeLatex(personalInfo?.lastName || '')}}
\\title{${this.escapeLatex(summary || 'Professional Resume')}}
\\address{${this.escapeLatex(personalInfo?.location || '')}}{}{}
\\phone[mobile]{${this.escapeLatex(personalInfo?.phone || '')}}
\\email{${this.escapeLatex(personalInfo?.email || '')}}
${personalInfo?.linkedin ? `\\social[linkedin]{${this.escapeLatex(personalInfo.linkedin)}}` : ''}
${personalInfo?.website ? `\\homepage{${this.escapeLatex(personalInfo.website)}}` : ''}

\\begin{document}
\\makecvtitle

${summary ? `\\section{Professional Summary}
\\cvitem{}{${this.escapeLatex(summary)}}
` : ''}

${experience && experience.length > 0 ? `\\section{Experience}
${experience.map(exp => `\\cventry{${this.formatDate(exp.startDate)}--${exp.current ? 'Present' : this.formatDate(exp.endDate)}}{${this.escapeLatex(exp.position || '')}}{${this.escapeLatex(exp.company || '')}}{}{}{${this.escapeLatex(exp.description || '')}${exp.achievements && exp.achievements.length > 0 ? '\\\\' + exp.achievements.map(ach => `\\item ${this.escapeLatex(ach)}`).join('\\\\') : ''}}`).join('\n')}
` : ''}

${education && education.length > 0 ? `\\section{Education}
${education.map(edu => `\\cventry{${this.formatDate(edu.graduationDate)}}{${this.escapeLatex(edu.degree || '')}}{${this.escapeLatex(edu.institution || '')}}{}{${edu.gpa ? `GPA: ${edu.gpa}` : ''}}{${this.escapeLatex(edu.field || '')}}`).join('\n')}
` : ''}

${skills && skills.length > 0 ? `\\section{Skills}
\\cvitem{}{${skills.map(skill => typeof skill === 'string' ? this.escapeLatex(skill) : this.escapeLatex(skill.name || '')).join(', ')}}
` : ''}

${projects && projects.length > 0 ? `\\section{Projects}
${projects.map(proj => `\\cventry{${proj.startDate ? this.formatDate(proj.startDate) : ''}${proj.endDate ? '--' + this.formatDate(proj.endDate) : ''}}{${this.escapeLatex(proj.name || '')}}{}{}{}{${this.escapeLatex(proj.description || '')}${proj.technologies && proj.technologies.length > 0 ? '\\\\Technologies: ' + proj.technologies.map(tech => this.escapeLatex(tech)).join(', ') : ''}}`).join('\n')}
` : ''}

${certifications && certifications.length > 0 ? `\\section{Certifications}
${certifications.map(cert => `\\cventry{${this.formatDate(cert.date)}}{${this.escapeLatex(cert.name || '')}}{${this.escapeLatex(cert.issuer || '')}}{}{}{${cert.credentialId ? 'ID: ' + this.escapeLatex(cert.credentialId) : ''}}`).join('\n')}
` : ''}

\\end{document}`;
  }

  /**
   * Professional Template
   */
  professionalTemplate(resumeData) {
    const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;
    
    return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}

% Section formatting
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{12pt}{6pt}

\\begin{document}

% Header
\\begin{center}
{\\LARGE\\bfseries ${this.escapeLatex(personalInfo?.firstName || '')} ${this.escapeLatex(personalInfo?.lastName || '')}}\\\\[2pt]
${personalInfo?.location ? this.escapeLatex(personalInfo.location) + ' $\\bullet$ ' : ''}${personalInfo?.phone ? this.escapeLatex(personalInfo.phone) + ' $\\bullet$ ' : ''}${personalInfo?.email ? this.escapeLatex(personalInfo.email) : ''}\\\\
${personalInfo?.linkedin ? this.escapeLatex(personalInfo.linkedin) : ''}${personalInfo?.website ? ' $\\bullet$ ' + this.escapeLatex(personalInfo.website) : ''}
\\end{center}

${summary ? `\\section{Professional Summary}
${this.escapeLatex(summary)}
` : ''}

${experience && experience.length > 0 ? `\\section{Professional Experience}
${experience.map(exp => `\\textbf{${this.escapeLatex(exp.position || '')}} \\hfill ${this.formatDate(exp.startDate)} -- ${exp.current ? 'Present' : this.formatDate(exp.endDate)}\\\\
\\textit{${this.escapeLatex(exp.company || '')}}\\\\
${exp.description ? this.escapeLatex(exp.description) + '\\\\' : ''}
${exp.achievements && exp.achievements.length > 0 ? '\\begin{itemize}[leftmargin=*,noitemsep]' + exp.achievements.map(ach => `\\item ${this.escapeLatex(ach)}`).join('') + '\\end{itemize}' : ''}
\\vspace{6pt}`).join('\n\n')}
` : ''}

${education && education.length > 0 ? `\\section{Education}
${education.map(edu => `\\textbf{${this.escapeLatex(edu.degree || '')}} \\hfill ${this.formatDate(edu.graduationDate)}\\\\
\\textit{${this.escapeLatex(edu.institution || '')}}${edu.field ? ', ' + this.escapeLatex(edu.field) : ''}${edu.gpa ? ' $\\bullet$ GPA: ' + edu.gpa : ''}\\\\
\\vspace{6pt}`).join('\n')}
` : ''}

${skills && skills.length > 0 ? `\\section{Technical Skills}
${skills.map(skill => typeof skill === 'string' ? this.escapeLatex(skill) : this.escapeLatex(skill.name || '')).join(' $\\bullet$ ')}
` : ''}

${projects && projects.length > 0 ? `\\section{Projects}
${projects.map(proj => `\\textbf{${this.escapeLatex(proj.name || '')}} \\hfill ${proj.startDate ? this.formatDate(proj.startDate) : ''}${proj.endDate ? ' -- ' + this.formatDate(proj.endDate) : ''}\\\\
${proj.description ? this.escapeLatex(proj.description) + '\\\\' : ''}
${proj.technologies && proj.technologies.length > 0 ? '\\textit{Technologies: ' + proj.technologies.map(tech => this.escapeLatex(tech)).join(', ') + '}\\\\' : ''}
\\vspace{6pt}`).join('\n\n')}
` : ''}

\\end{document}`;
  }

  /**
   * Minimalist Template
   */
  minimalistTemplate(resumeData) {
    const { personalInfo, summary, experience, education, skills, projects } = resumeData;
    
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\begin{document}

% Header
{\\Large\\textbf{${this.escapeLatex(personalInfo?.firstName || '')} ${this.escapeLatex(personalInfo?.lastName || '')}}}

\\vspace{2pt}
${personalInfo?.email ? this.escapeLatex(personalInfo.email) : ''} ${personalInfo?.phone ? '$\\bullet$ ' + this.escapeLatex(personalInfo.phone) : ''} ${personalInfo?.location ? '$\\bullet$ ' + this.escapeLatex(personalInfo.location) : ''}

${personalInfo?.linkedin ? this.escapeLatex(personalInfo.linkedin) : ''}

\\vspace{12pt}

${summary ? `${this.escapeLatex(summary)}

\\vspace{12pt}
` : ''}

${experience && experience.length > 0 ? `\\textbf{Experience}

${experience.map(exp => `\\textbf{${this.escapeLatex(exp.position || '')}} at ${this.escapeLatex(exp.company || '')} \\hfill ${this.formatDate(exp.startDate)} -- ${exp.current ? 'Present' : this.formatDate(exp.endDate)}

${exp.description ? this.escapeLatex(exp.description) : ''}
${exp.achievements && exp.achievements.length > 0 ? exp.achievements.map(ach => `$\\bullet$ ${this.escapeLatex(ach)}`).join('\n\n') : ''}

`).join('\n')}
` : ''}

${education && education.length > 0 ? `\\textbf{Education}

${education.map(edu => `\\textbf{${this.escapeLatex(edu.degree || '')}} from ${this.escapeLatex(edu.institution || '')} \\hfill ${this.formatDate(edu.graduationDate)}

`).join('')}
` : ''}

${skills && skills.length > 0 ? `\\textbf{Skills}

${skills.map(skill => typeof skill === 'string' ? this.escapeLatex(skill) : this.escapeLatex(skill.name || '')).join(' $\\bullet$ ')}

` : ''}

\\end{document}`;
  }

  /**
   * Creative Template
   */
  creativeTemplate(resumeData) {
    // Similar structure but with more creative formatting
    return this.modernTemplate(resumeData); // Simplified for now
  }

  /**
   * ATS Optimized Template
   */
  atsOptimizedTemplate(resumeData) {
    // Optimized for ATS parsing - simple formatting, standard sections
    return this.professionalTemplate(resumeData); // Simplified for now
  }

  /**
   * Convert LaTeX to HTML for preview
   */
  convertLatexToHTML(latexContent) {
    // This is a simplified conversion
    // In production, you'd use a proper LaTeX to HTML converter like MathJax or KaTeX
    
    let html = latexContent;
    
    // Basic conversions
    html = html.replace(/\\documentclass.*?\n/g, '');
    html = html.replace(/\\usepackage.*?\n/g, '');
    html = html.replace(/\\begin{document}/g, '<div class="latex-document">');
    html = html.replace(/\\end{document}/g, '</div>');
    html = html.replace(/\\makecvtitle/g, '');
    
    // Sections
    html = html.replace(/\\section\{([^}]+)\}/g, '<h2 class="section-title">$1</h2>');
    
    // Text formatting
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\Large/g, '');
    html = html.replace(/\\large/g, '');
    
    // Line breaks
    html = html.replace(/\\\\/g, '<br>');
    html = html.replace(/\\vspace\{[^}]+\}/g, '<div style="margin: 12px 0;"></div>');
    
    // Lists
    html = html.replace(/\\begin\{itemize\}.*?/g, '<ul>');
    html = html.replace(/\\end\{itemize\}/g, '</ul>');
    html = html.replace(/\\item\s+/g, '<li>');
    
    // Clean up
    html = html.replace(/\$\\bullet\$/g, '•');
    html = html.replace(/\\hfill/g, '');
    html = html.replace(/\{([^}]+)\}/g, '$1');
    html = html.replace(/\\\w+/g, ''); // Remove remaining LaTeX commands
    
    return `
      <div class="resume-preview" style="
        font-family: 'Times New Roman', serif;
        line-height: 1.6;
        color: #333;
        background: white;
        padding: 1in;
        max-width: 8.5in;
        margin: 0 auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <style>
          .section-title {
            font-size: 1.2em;
            font-weight: bold;
            margin: 20px 0 10px 0;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
          }
          .latex-document ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .latex-document li {
            margin: 5px 0;
          }
        </style>
        ${html}
      </div>
    `;
  }

  /**
   * Utility methods
   */
  escapeLatex(text) {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
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
      { 
        id: 'modern', 
        name: 'Modern', 
        description: 'Clean and contemporary design with modern styling',
        preview: '/templates/modern-preview.png'
      },
      { 
        id: 'professional', 
        name: 'Professional', 
        description: 'Traditional corporate layout for business environments',
        preview: '/templates/professional-preview.png'
      },
      { 
        id: 'minimalist', 
        name: 'Minimalist', 
        description: 'Simple and elegant layout with minimal styling',
        preview: '/templates/minimalist-preview.png'
      },
      { 
        id: 'creative', 
        name: 'Creative', 
        description: 'Bold and artistic design for creative professionals',
        preview: '/templates/creative-preview.png'
      },
      { 
        id: 'ats-optimized', 
        name: 'ATS Optimized', 
        description: 'Maximum compatibility with applicant tracking systems',
        preview: '/templates/ats-preview.png'
      }
    ];
  }

  /**
   * Validate template ID
   */
  isValidTemplate(templateId) {
    return Object.keys(this.templates).includes(templateId);
  }
}

export default new LaTeXService();