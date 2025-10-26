const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const enhancedLatexService = require('../services/enhancedLatexService');

// Validate LaTeX content
router.post('/validate', asyncHandler(async (req, res) => {
    const { latex, isExternal } = req.body;

    if (!latex) {
        return res.status(400).json({
            success: false,
            message: 'LaTeX content is required'
        });
    }

    try {
        // Validate and sanitize if external
        if (isExternal) {
            await enhancedLatexService.validateExternalLatex(latex);
        }

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

// Compile LaTeX to PDF
router.post('/compile', asyncHandler(async (req, res) => {
    const { latex, isExternal } = req.body;

    if (!latex) {
        return res.status(400).json({
            success: false,
            message: 'LaTeX content is required'
        });
    }

    try {
        const pdfBuffer = await enhancedLatexService.compileToPDF(latex, isExternal);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=resume.pdf'
        });

        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}));

module.exports = router;