const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Enhanced LaTeX Service for Backend
 * Handles LaTeX compilation and PDF generation with support for Overleaf templates
 */
class LaTeXService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp/latex');
    this.resourcesDir = path.join(__dirname, '../../temp/latex/resources');
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.resourcesDir, { recursive: true });
      // Copy required LaTeX packages and resources
      await this.setupLatexResources();
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  /**
   * Setup necessary LaTeX resources and packages
   */
  async setupLatexResources() {
    // Create basic moderncv class file if it doesn't exist
    const moderncvPath = path.join(this.resourcesDir, 'moderncv.cls');
    if (!(await this.fileExists(moderncvPath))) {
      const basicModerncv = `\\NeedsTeXFormat{LaTeX2e}
\\ProvidesClass{moderncv}[2015/07/28 v2.0.0 modern curriculum vitae class]
\\LoadClass{article}
\\RequirePackage{geometry}
\\RequirePackage{hyperref}`;
      await fs.writeFile(moderncvPath, basicModerncv);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Compile LaTeX to PDF
   * @param {string} latexContent - LaTeX source code
   * @param {boolean} isExternal - Whether this is external LaTeX content
   * @returns {Buffer} - PDF buffer
   */
  async compileToPDF(latexContent, isExternal = false) {
    // Validate content first
    if (isExternal) {
      this.validateLatexContent(latexContent);
    }

    const timestamp = Date.now();
    const filename = `resume_${timestamp}`;
    const workDir = path.join(this.tempDir, filename);
    const texFile = path.join(workDir, `${filename}.tex`);
    const pdfFile = path.join(workDir, `${filename}.pdf`);

    try {
      // Create working directory for this compilation
      await fs.mkdir(workDir, { recursive: true });

      // Write processed content to file
      await fs.writeFile(texFile, latexContent, 'utf8');

      // Set up compilation environment
      const env = {
        ...process.env,
        TEXINPUTS: `${this.resourcesDir}:${workDir}:${process.env.TEXINPUTS || ''}`
      };

      // Compile LaTeX to PDF using pdflatex with proper environment
      const command = `pdflatex -shell-escape -interaction=nonstopmode -output-directory="${workDir}" "${texFile}"`;

      try {
        // First pass
        await execAsync(command, { env });
        // Second pass for references
        await execAsync(command, { env });
      } catch (error) {
        const log = await this.readLogFile(workDir, filename);
        throw new Error(this.parseLatexError(log));
      }

      // Check if PDF was generated
      if (!(await this.fileExists(pdfFile))) {
        const log = await this.readLogFile(workDir, filename);
        throw new Error(this.parseLatexError(log));
      }

      // Read the generated PDF
      const pdfBuffer = await fs.readFile(pdfFile);
      return pdfBuffer;

    } catch (error) {
      throw error;
    } finally {
      // Clean up
      await this.cleanupCompilation(workDir);
    }
  }

  /**
   * Generate HTML preview from LaTeX
   * @param {string} latexContent - LaTeX source code
   * @returns {string} - HTML preview
   */
  async generateHTMLPreview(latexContent) {
    try {
      // First validate if it's external content
      this.validateLatexContent(latexContent);
      return this.convertLatexToHTML(latexContent);
    } catch (error) {
      console.error('Preview generation failed:', error);
      throw error;
    }
  }

  /**
   * Read LaTeX log file
   */
  async readLogFile(workDir, filename) {
    try {
      const logFile = path.join(workDir, `${filename}.log`);
      return await fs.readFile(logFile, 'utf8');
    } catch {
      return '';
    }
  }

  /**
   * Parse LaTeX compilation error from log
   */
  parseLatexError(log) {
    const errorLines = log.split('\n').filter(line =>
      line.includes('! ') ||
      line.includes('Error:') ||
      line.includes('Fatal error')
    );

    if (errorLines.length > 0) {
      return errorLines[0]
        .replace(/^!/, '')
        .trim();
    }

    return 'Unknown LaTeX compilation error';
  }

  /**
   * Clean up compilation files
   */
  async cleanupCompilation(workDir) {
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Validate LaTeX content
   */
  validateLatexContent(content) {
    // Check for required document structure
    if (!content.includes('\\documentclass')) {
      throw new Error('Missing \\documentclass declaration');
    }

    if (!content.includes('\\begin{document}')) {
      throw new Error('Missing \\begin{document}');
    }

    if (!content.includes('\\end{document}')) {
      throw new Error('Missing \\end{document}');
    }

    // Check for potentially dangerous commands
    const dangerousCommands = [
      '\\write18',
      '\\immediate\\write18',
      '\\input',
      '\\include',
      '\\includeonly',
      '\\openin',
      '\\openout',
      '\\read',
      '\\catcode'
    ];

    for (const cmd of dangerousCommands) {
      if (content.includes(cmd)) {
        throw new Error(`Forbidden LaTeX command detected: ${cmd}`);
      }
    }

    return true;
  }

  /**
   * Convert LaTeX to HTML for preview
   */
  convertLatexToHTML(latexContent) {
    let html = latexContent;

    // Handle document structure
    html = html.replace(/\\documentclass.*?\n/g, '');
    html = html.replace(/\\usepackage.*?\n/g, '');
    html = html.replace(/\\begin{document}/g, '<div class="latex-document">');
    html = html.replace(/\\end{document}/g, '</div>');

    // Handle sections and formatting
    html = html.replace(/\\section{([^}]+)}/g, '<h2 class="section-title">$1</h2>');
    html = html.replace(/\\subsection{([^}]+)}/g, '<h3 class="subsection-title">$1</h3>');
    html = html.replace(/\\textbf{([^}]+)}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit{([^}]+)}/g, '<em>$1</em>');

    // Handle lists
    html = html.replace(/\\begin{itemize}/g, '<ul>');
    html = html.replace(/\\end{itemize}/g, '</ul>');
    html = html.replace(/\\item\s+/g, '<li>');

    // Handle CV-specific commands
    html = html.replace(/\\cventry{([^}]*)}{([^}]*)}{([^}]*)}{([^}]*)}{([^}]*)}{([^}]*)}/g,
      '<div class="cv-entry"><div class="cv-title">$2</div><div class="cv-period">$1</div><div class="cv-place">$3</div><div class="cv-desc">$6</div></div>');

    // Add styling
    html = `
      <div class="resume-preview">
        <style>
          .resume-preview {
            font-family: "Times New Roman", serif;
            line-height: 1.6;
            padding: 2em;
            max-width: 800px;
            margin: 0 auto;
          }
          .section-title {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            margin: 1.5em 0 1em;
          }
          .cv-entry {
            margin: 1em 0;
            padding: 0.5em 0;
          }
          .cv-title {
            font-weight: bold;
            color: #2c3e50;
          }
          .cv-period {
            color: #7f8c8d;
            font-style: italic;
          }
          .cv-place {
            color: #34495e;
          }
          .cv-desc {
            margin-top: 0.5em;
          }
          ul {
            list-style-type: disc;
            margin-left: 1.5em;
          }
        </style>
        ${html}
      </div>
    `;

    return html;
  }

  /**
   * Ensure temp directory exists
   */
  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }


  /**
   * Clean up temporary files
   * @param {string} filename - Base filename without extension
   */
  async cleanupFiles(filename) {
    const extensions = ['.tex', '.pdf', '.aux', '.log', '.out'];
    
    for (const ext of extensions) {
      try {
        await fs.unlink(path.join(this.tempDir, `${filename}${ext}`));
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Check if LaTeX is available
   * @returns {Promise<boolean>} - Whether LaTeX is available
   */
  async isLatexAvailable() {
    try {
      await execAsync('pdflatex --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get LaTeX installation instructions
   * @returns {Object} - Installation instructions
   */
  getInstallationInstructions() {
    return {
      windows: 'Install MiKTeX from https://miktex.org/',
      mac: 'Install MacTeX from https://www.tug.org/mactex/',
      linux: 'Install texlive-full package: sudo apt-get install texlive-full',
      docker: 'Use a LaTeX Docker image for containerized compilation'
    };
  }

  /**
   * Validate LaTeX content
   * @param {string} latexContent - LaTeX source code
   * @returns {Object} - Validation result
   */
  validateLatex(latexContent) {
    const issues = [];

    // Check for required document structure
    if (!latexContent.includes('\\documentclass')) {
      issues.push('Missing \\documentclass declaration');
    }

    if (!latexContent.includes('\\begin{document}')) {
      issues.push('Missing \\begin{document}');
    }

    if (!latexContent.includes('\\end{document}')) {
      issues.push('Missing \\end{document}');
    }

    // Check for balanced braces
    const openBraces = (latexContent.match(/\{/g) || []).length;
    const closeBraces = (latexContent.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      issues.push('Unbalanced braces detected');
    }

    // Check for common problematic characters
    const problematicChars = /[&%$#^_{}~\\]/g;
    const matches = latexContent.match(problematicChars);

    if (matches && matches.length > 20) {
      issues.push('Many special characters detected - ensure they are properly escaped');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings: []
    };
  }
}

module.exports = new LaTeXService();