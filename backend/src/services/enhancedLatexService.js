const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const sanitizeLatex = require('../utils/sanitizeLatex');

class EnhancedLatexService {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp/latex');
        this.templateDir = path.join(__dirname, '../templates/latex');
        this.ensureTempDir();
    }

    async ensureTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create temp directory:', error);
        }
    }

    /**
     * Validate and sanitize external LaTeX content
     */
    async validateExternalLatex(content) {
        // Check for required document structure
        if (!content.includes('\\documentclass')) {
            throw new Error('Invalid LaTeX: Missing document class');
        }

        if (!content.includes('\\begin{document}')) {
            throw new Error('Invalid LaTeX: Missing document begin');
        }

        // Sanitize content
        return sanitizeLatex(content);
    }

    /**
     * Process external LaTeX template with user data
     */
    async processExternalTemplate(template, userData) {
        try {
            // Validate template
            const sanitizedTemplate = await this.validateExternalLatex(template);

            // Replace variables with user data
            let processedTemplate = sanitizedTemplate;
            for (const [key, value] of Object.entries(userData)) {
                const placeholder = `\\VAR{${key}}`;
                processedTemplate = processedTemplate.replace(
                    new RegExp(placeholder, 'g'),
                    this.escapeLatex(value)
                );
            }

            return processedTemplate;
        } catch (error) {
            throw new Error(`Template processing failed: ${error.message}`);
        }
    }

    /**
     * Escape special LaTeX characters
     */
    escapeLatex(text) {
        if (typeof text !== 'string') return '';

        const escapeMap = {
            '&': '\\&',
            '%': '\\%',
            '$': '\\$',
            '#': '\\#',
            '_': '\\_',
            '{': '\\{',
            '}': '\\}',
            '~': '\\textasciitilde{}',
            '^': '\\textasciicircum{}'
        };

        return text.replace(/[&%$#_{}\~^]/g, char => escapeMap[char] || char);
    }

    /**
     * Compile LaTeX to PDF with enhanced error handling
     */
    async compileToPDF(latexContent, isExternal = false) {
        const timestamp = Date.now();
        const filename = `resume_${timestamp}`;
        const texFile = path.join(this.tempDir, `${filename}.tex`);
        const logFile = path.join(this.tempDir, `${filename}.log`);
        const pdfFile = path.join(this.tempDir, `${filename}.pdf`);

        try {
            // Process content if it's external
            const processedContent = isExternal
                ? await this.processExternalTemplate(latexContent, {})
                : latexContent;

            // Write LaTeX content to file
            await fs.writeFile(texFile, processedContent, 'utf8');

            // Compile LaTeX to PDF
            const command = `pdflatex -interaction=nonstopmode -output-directory="${this.tempDir}" "${texFile}"`;

            try {
                await execAsync(command);

                // Check if PDF was generated
                if (!fs.existsSync(pdfFile)) {
                    const log = await fs.readFile(logFile, 'utf8');
                    throw new Error(`PDF generation failed: ${this.parseLatexErrors(log)}`);
                }

                // Read the generated PDF
                const pdfBuffer = await fs.readFile(pdfFile);
                return pdfBuffer;

            } catch (error) {
                const log = await fs.readFile(logFile, 'utf8');
                throw new Error(`LaTeX compilation failed: ${this.parseLatexErrors(log)}`);
            }

        } catch (error) {
            throw error;
        } finally {
            // Cleanup
            await this.cleanupFiles(filename);
        }
    }

    /**
     * Parse LaTeX compilation errors from log
     */
    parseLatexErrors(log) {
        const errorLines = log.split('\n').filter(line =>
            line.includes('! ') || line.includes('Error:')
        );
        return errorLines.length > 0
            ? errorLines[0].replace(/^!/, '').trim()
            : 'Unknown compilation error';
    }

    /**
     * Clean up temporary files
     */
    async cleanupFiles(filename) {
        const extensions = ['.tex', '.pdf', '.log', '.aux'];
        for (const ext of extensions) {
            try {
                await fs.unlink(path.join(this.tempDir, `${filename}${ext}`));
            } catch (error) {
                // Ignore errors during cleanup
            }
        }
    }
}

module.exports = new EnhancedLatexService();