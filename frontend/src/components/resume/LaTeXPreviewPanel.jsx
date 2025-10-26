import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { cn } from '../../utils/cn';
import {
    FileTextIcon,
    DownloadIcon,
    PrinterIcon,
    MaximizeIcon,
    MonitorIcon,
    TabletIcon,
    SmartphoneIcon,
    RefreshCwIcon,
    EyeIcon,
    CodeIcon,
    ZoomInIcon,
    ZoomOutIcon
} from 'lucide-react';

/**
 * LaTeX Preview Panel Component
 * 
 * Features:
 * - Real-time LaTeX compilation and preview
 * - Multiple view modes (desktop, tablet, mobile)
 * - Template switching with live preview
 * - Export to PDF functionality
 * - Zoom controls
 * - LaTeX source code view
 * - ATS score visualization
 */
const LaTeXPreviewPanel = ({
    latexContent,
    previewHTML,
    isGenerating,
    templateType,
    onTemplateChange,
    onExportPDF,
    previewMode = 'desktop',
    onPreviewModeChange,
    atsScore = 0,
    className
}) => {
    const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'latex'
    const [zoomLevel, setZoomLevel] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

    // Available templates
    const templates = [
        { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
        { id: 'professional', name: 'Professional', description: 'Traditional corporate' },
        { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant' },
        { id: 'creative', name: 'Creative', description: 'Bold and artistic' },
        { id: 'ats-optimized', name: 'ATS Optimized', description: 'Maximum compatibility' }
    ];

    // View modes for responsive preview
    const viewModes = [
        { id: 'desktop', name: 'Desktop', icon: MonitorIcon, width: '8.5in' },
        { id: 'tablet', name: 'Tablet', icon: TabletIcon, width: '600px' },
        { id: 'mobile', name: 'Mobile', icon: SmartphoneIcon, width: '375px' }
    ];

    // Update timestamp when content changes
    useEffect(() => {
        if (previewHTML) {
            setLastUpdateTime(Date.now());
        }
    }, [previewHTML]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 10, 50));
    }, []);

    const resetZoom = useCallback(() => {
        setZoomLevel(100);
    }, []);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    // Export handlers
    const handlePrint = useCallback(() => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume Preview</title>
            <style>
              @media print {
                body { margin: 0; }
                .resume-preview { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            ${previewHTML}
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    }, [previewHTML]);

    const handleFullscreenPreview = useCallback(() => {
        const fullscreenWindow = window.open('', '_blank');
        if (fullscreenWindow) {
            fullscreenWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume Preview - Fullscreen</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5; 
                display: flex; 
                justify-content: center; 
                align-items: flex-start;
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              }
              .resume-container {
                background: white;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            <div class="resume-container">
              ${previewHTML}
            </div>
          </body>
        </html>
      `);
            fullscreenWindow.document.close();
        }
    }, [previewHTML]);

    // ATS Score color
    const getATSScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    // Memoized preview content with zoom
    const previewContent = useMemo(() => {
        if (!previewHTML) return null;

        return (
            <div
                className="resume-preview-wrapper"
                style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease'
                }}
            >
                <div
                    className={cn(
                        "resume-preview bg-white shadow-lg mx-auto transition-all duration-300",
                        previewMode === 'desktop' && "max-w-[8.5in] min-h-[11in]",
                        previewMode === 'tablet' && "max-w-[600px]",
                        previewMode === 'mobile' && "max-w-[375px]"
                    )}
                    dangerouslySetInnerHTML={{ __html: previewHTML }}
                />
            </div>
        );
    }, [previewHTML, zoomLevel, previewMode]);

    return (
        <div className={cn("h-full flex flex-col bg-gray-50 dark:bg-gray-900", className)}>

            {/* Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5" />
                        Live Preview
                    </h3>

                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <Button
                                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('preview')}
                                className="px-3 py-1 text-xs"
                            >
                                <EyeIcon className="w-3 h-3 mr-1" />
                                Preview
                            </Button>
                            <Button
                                variant={viewMode === 'latex' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('latex')}
                                className="px-3 py-1 text-xs"
                            >
                                <CodeIcon className="w-3 h-3 mr-1" />
                                LaTeX
                            </Button>
                        </div>

                        {/* Export Actions */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="hidden sm:flex"
                        >
                            <PrinterIcon className="w-4 h-4 mr-1" />
                            Print
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExportPDF}
                            className="hidden sm:flex"
                        >
                            <DownloadIcon className="w-4 h-4 mr-1" />
                            PDF
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFullscreenPreview}
                        >
                            <MaximizeIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {templates.map((template) => (
                            <Button
                                key={template.id}
                                variant={templateType === template.id ? "default" : "outline"}
                                size="sm"
                                onClick={() => onTemplateChange(template.id)}
                                className="text-xs"
                                title={template.description}
                            >
                                {template.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* View Mode and Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Responsive View Modes */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            {viewModes.map((mode) => {
                                const IconComponent = mode.icon;
                                return (
                                    <Button
                                        key={mode.id}
                                        variant={previewMode === mode.id ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => onPreviewModeChange(mode.id)}
                                        className="px-2 py-1"
                                        title={mode.name}
                                    >
                                        <IconComponent className="w-4 h-4" />
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Zoom Controls */}
                        {viewMode === 'preview' && (
                            <div className="flex items-center gap-1 ml-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleZoomOut}
                                    disabled={zoomLevel <= 50}
                                    className="px-2 py-1"
                                >
                                    <ZoomOutIcon className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetZoom}
                                    className="px-2 py-1 text-xs min-w-[50px]"
                                >
                                    {zoomLevel}%
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleZoomIn}
                                    disabled={zoomLevel >= 200}
                                    className="px-2 py-1"
                                >
                                    <ZoomInIcon className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {isGenerating && (
                            <div className="flex items-center gap-1">
                                <RefreshCwIcon className="w-3 h-3 animate-spin" />
                                <span>Generating...</span>
                            </div>
                        )}

                        {atsScore > 0 && (
                            <Badge className={cn("text-xs", getATSScoreColor(atsScore))}>
                                ATS: {atsScore}/100
                            </Badge>
                        )}

                        <span>
                            Updated: {new Date(lastUpdateTime).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                <AnimatePresence mode="wait">
                    {viewMode === 'preview' ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 h-full"
                        >
                            {/* Loading State */}
                            {isGenerating && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Generating preview...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Preview Content */}
                            {!isGenerating && previewHTML && (
                                <div className="flex justify-center">
                                    {previewContent}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isGenerating && !previewHTML && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <FileTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            No Preview Available
                                        </h4>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Start filling out your resume to see the preview
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="latex"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 h-full"
                        >
                            {/* LaTeX Source Code */}
                            <div className="h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        LaTeX Source Code
                                    </h4>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(latexContent)}
                                        className="text-xs"
                                    >
                                        Copy LaTeX
                                    </Button>
                                </div>

                                <div className="bg-gray-900 dark:bg-gray-800 rounded-lg p-4 h-full overflow-auto">
                                    <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                                        {latexContent || '% LaTeX code will appear here as you fill out your resume'}
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-xs">
                            {templateType} template
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {previewMode} view
                        </Badge>
                        {viewMode === 'preview' && (
                            <Badge variant="outline" className="text-xs">
                                {zoomLevel}% zoom
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">
                            Real-time sync
                        </span>
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isGenerating ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                        )}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(LaTeXPreviewPanel);