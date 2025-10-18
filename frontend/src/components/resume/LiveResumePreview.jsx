import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import TemplateRenderer from '../../services/TemplateRenderer';
import { 
  usePerformanceMonitor, 
  useOptimizedCallback, 
  useOptimizedMemo 
} from '../../utils/performance.jsx';

/**
 * LiveResumePreview Component
 * Provides real-time preview of resume with template switching and responsive modes
 * Optimized for performance with memoization and debouncing
 */
const LiveResumePreview = () => {
  const { resumeData, ui, dispatch } = useResumeBuilder();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [viewMode, setViewMode] = useState('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // Performance monitoring
  const { startTiming, endTiming } = usePerformanceMonitor('LiveResumePreview');

  // Available templates from TemplateRenderer
  const availableTemplates = useMemo(() => 
    TemplateRenderer.getAvailableTemplates(), []
  );

  // Available view modes
  const viewModes = [
    { id: 'desktop', name: 'Desktop', icon: '🖥️' },
    { id: 'tablet', name: 'Tablet', icon: '📱' },
    { id: 'mobile', name: 'Mobile', icon: '📱' }
  ];

  // Debounced resume data to prevent excessive re-renders
  const [debouncedResumeData, setDebouncedResumeData] = useState(resumeData);

  // Debounce resume data updates (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResumeData(resumeData);
      setLastUpdateTime(Date.now());
    }, 300);

    return () => clearTimeout(timer);
  }, [resumeData]);

  // Optimized HTML generation with performance monitoring
  const previewHTML = useOptimizedMemo(() => {
    if (!debouncedResumeData) return '';
    
    try {
      startTiming('templateRender');
      setIsLoading(true);
      const html = TemplateRenderer.render(debouncedResumeData, selectedTemplate, viewMode);
      setIsLoading(false);
      endTiming('templateRender');
      return html;
    } catch (error) {
      console.error('Template rendering error:', error);
      setIsLoading(false);
      endTiming('templateRender');
      return '<div class="error">Preview unavailable</div>';
    }
  }, [debouncedResumeData, selectedTemplate, viewMode], 'previewHTML');

  // Optimized template change handler
  const handleTemplateChange = useOptimizedCallback((templateId) => {
    if (TemplateRenderer.isValidTemplate(templateId)) {
      startTiming('templateChange');
      setSelectedTemplate(templateId);
      endTiming('templateChange');
    }
  }, 100, [startTiming, endTiming]);

  // Optimized view mode change handler
  const handleViewModeChange = useOptimizedCallback((mode) => {
    startTiming('viewModeChange');
    setViewMode(mode);
    endTiming('viewModeChange');
  }, 100, [startTiming, endTiming]);

  // Handle print/export
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume - ${debouncedResumeData?.personalInfo?.firstName || 'Resume'}</title>
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
  }, [previewHTML, debouncedResumeData]);

  // Handle full screen preview
  const handleFullScreen = useCallback(() => {
    const fullScreenWindow = window.open('', '_blank');
    if (fullScreenWindow) {
      fullScreenWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Resume Preview - ${debouncedResumeData?.personalInfo?.firstName || 'Resume'}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                background: #f5f5f5; 
                display: flex; 
                justify-content: center; 
                align-items: flex-start;
                min-height: 100vh;
              }
            </style>
          </head>
          <body>
            ${previewHTML}
          </body>
        </html>
      `);
      fullScreenWindow.document.close();
    }
  }, [previewHTML, debouncedResumeData]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Preview Header */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live Preview
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="hidden sm:flex"
            >
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullScreen}
              className="hidden sm:flex"
            >
              Full Screen
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Template
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTemplates.map((template) => (
              <Button
                key={template.id}
                variant={selectedTemplate === template.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleTemplateChange(template.id)}
                className="text-xs"
              >
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        {/* View Mode Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            View Mode
          </label>
          <div className="flex gap-2">
            {viewModes.map((mode) => (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange(mode.id)}
                className="text-xs"
              >
                <span className="mr-1">{mode.icon}</span>
                {mode.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Template: {selectedTemplate}</span>
            <span>Mode: {viewMode}</span>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Updating...</span>
              </div>
            )}
            <span>
              Updated: {new Date(lastUpdateTime).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className={cn(
          "mx-auto transition-all duration-300",
          viewMode === 'desktop' && "max-w-4xl",
          viewMode === 'tablet' && "max-w-2xl",
          viewMode === 'mobile' && "max-w-sm"
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedTemplate}-${viewMode}-${lastUpdateTime}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Rendering preview...</span>
                  </div>
                </div>
              )}

              {/* Preview Content */}
              <div 
                className={cn(
                  "resume-preview-container transition-all duration-200",
                  isLoading && "opacity-50"
                )}
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Preview Footer */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-xs">
              {selectedTemplate} template
            </Badge>
            <Badge variant="outline" className="text-xs">
              {viewMode} view
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">
              Real-time sync enabled
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiveResumePreview);