const express = require('express');
const router = express.Router();
const latexService = require('../services/latexService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route POST /api/overleaf/compile
 * @desc Compile Overleaf LaTeX template to PDF
 */
router.post('/compile', asyncHandler(async (req, res) => {
    const { latex, template, data } = req.body;

    if (!latex && !template) {
        return res.status(400).json({
            success: false,
            message: 'Either LaTeX content or template name is required'
        });
    }

    try {
        let finalLatex = latex;

        // If template is provided, load and process it
        if (template) {
            finalLatex = await latexService.loadTemplate(template, data);
        }

        // Compile to PDF
        const pdfBuffer = await latexService.compileToPDF(finalLatex);

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=resume.pdf');
        res.send(pdfBuffer);

    } catch (error) {
        console.error('LaTeX compilation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to compile LaTeX'
        });
    }
}));

/**
 * @route POST /api/overleaf/validate
 * @desc Validate LaTeX template syntax
 */
router.post('/validate', asyncHandler(async (req, res) => {
    const { latex } = req.body;

    if (!latex) {
        return res.status(400).json({
            success: false,
            message: 'LaTeX content is required'
        });
    }

    try {
        await latexService.validateLatexContent(latex);
        res.json({
            success: true,
            message: 'LaTeX content is valid'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}));

/**
 * @route POST /api/overleaf/preview
 * @desc Generate HTML preview of LaTeX content
 */
router.post('/preview', asyncHandler(async (req, res) => {
    const { latex, template, data } = req.body;

    if (!latex && !template) {
        return res.status(400).json({
            success: false,
            message: 'Either LaTeX content or template name is required'
        });
    }

    try {
        let finalLatex = latex;

        // If template is provided, load and process it
        if (template) {
            finalLatex = await latexService.loadTemplate(template, data);
        }

        // Generate preview
        const html = await latexService.generateHTMLPreview(finalLatex);

        res.json({
            success: true,
            html
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate preview'
        });
    }
}));

/**
 * @route GET /api/overleaf/templates
 * @desc Get list of available LaTeX templates
 */
router.get('/templates', asyncHandler(async (req, res) => {
    try {
        const templates = await latexService.listTemplates();
        res.json({
            success: true,
            templates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch templates'
        });
    }
}));

module.exports = router;