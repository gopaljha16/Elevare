import React, { forwardRef, useState } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/**
 * PDF Preview Panel - Overleaf Style
 * Shows compiled PDF with zoom controls and navigation
 */
const PDFPreviewPanel = forwardRef(({ 
  pdfUrl, 
  isCompiling, 
  error,
  className 
}, ref) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // Will be dynamic when we implement multi-page

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleFitWidth = () => {
    setZoom(100);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)} ref={ref}>
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">PDF Preview</span>
          
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage <= 1}
              className="px-2"
            >
              ←
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage >= totalPages}
              className="px-2"
            >
              →
            </Button>
          </div>
        </div>

        {/* Zoom and Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="px-2"
          >
            🔍-
          </Button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {zoom}%
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="px-2"
          >
            🔍+
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleFitWidth}
            className="px-3"
          >
            Fit
          </Button>
          
          <div className="w-px h-4 bg-gray-300"></div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            disabled={!pdfUrl}
          >
            📥 Download
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {isCompiling ? (
          <CompilationLoader />
        ) : error ? (
          <CompilationError error={error} />
        ) : pdfUrl ? (
          <PDFViewer 
            pdfUrl={pdfUrl} 
            zoom={zoom}
            currentPage={currentPage}
          />
        ) : (
          <EmptyPreview />
        )}
      </div>
    </div>
  );
});

/**
 * Compilation Loader Component
 */
const CompilationLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Compiling LaTeX</h3>
      <p className="text-gray-600">Please wait while we generate your resume...</p>
      <div className="mt-4 bg-gray-200 rounded-full h-2 w-64 mx-auto">
        <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  </div>
);

/**
 * Compilation Error Component
 */
const CompilationError = ({ error }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center max-w-md">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">❌</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Compilation Error</h3>
      <p className="text-gray-600 mb-4">
        There was an error compiling your LaTeX code:
      </p>
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
        <code className="text-sm text-red-800">{error}</code>
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Check your LaTeX syntax and try recompiling.
      </p>
    </div>
  </div>
);

/**
 * Empty Preview Component
 */
const EmptyPreview = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📄</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Preview Available</h3>
      <p className="text-gray-600">
        Start typing LaTeX code to see your resume preview
      </p>
    </div>
  </div>
);

/**
 * PDF Viewer Component
 */
const PDFViewer = ({ pdfUrl, zoom, currentPage }) => {
  return (
    <div className="flex justify-center">
      <div 
        className="bg-white shadow-lg border border-gray-300"
        style={{ 
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease'
        }}
      >
        <iframe
          src={pdfUrl}
          className="w-[595px] h-[842px]" // A4 dimensions
          title="Resume Preview"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};

PDFPreviewPanel.displayName = 'PDFPreviewPanel';

export default PDFPreviewPanel;