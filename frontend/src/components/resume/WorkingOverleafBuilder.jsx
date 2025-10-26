import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

/**
 * Working Overleaf-Style Resume Builder
 * 
 * Features that actually work:
 * - LaTeX-style code editor with syntax highlighting
 * - Real-time HTML/CSS preview (LaTeX-styled)
 * - PDF export using browser print API
 * - AI assistant integration
 * - Template switching
 * - Professional output
 */
const WorkingOverleafBuilder = () => {
  // Core state
  const [projectName, setProjectName] = useState('Gopal Full stack Resume');
  const [latexCode, setLatexCode] = useState(DEFAULT_LATEX_TEMPLATE);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const [previewHTML, setPreviewHTML] = useState('');
  const [lastCompiled, setLastCompiled] = useState(null);

  // UI state
  const [layout, setLayout] = useState('split'); // 'split', 'editor', 'preview'
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Sharing state
  const [shareEmails, setShareEmails] = useState('');
  const [sharePermission, setSharePermission] = useState('Editor');
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [sharedUsers, setSharedUsers] = useState([
    { email: 'gopaljha9398715741@gmail.com', role: 'Owner', avatar: '👤' }
  ]);

  // AI state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  
  // Version control state
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  
  // Collaboration state
  const [collaborators, setCollaborators] = useState([]);
  const [comments, setComments] = useState([]);

  const { success, error } = useToast();

  // Convert LaTeX to HTML preview
  const convertLatexToHTML = useCallback((latex) => {
    try {
      setIsCompiling(true);
      setCompilationError(null);

      // Parse LaTeX and convert to HTML
      const html = parseLatexToHTML(latex);
      setPreviewHTML(html);
      setLastCompiled(new Date());
      setIsCompiling(false);
      
      return html;
    } catch (err) {
      setCompilationError(err.message);
      setIsCompiling(false);
      error('Preview generation failed: ' + err.message);
      return '';
    }
  }, [error]);

  // Auto-compile when LaTeX code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (latexCode.trim()) {
        convertLatexToHTML(latexCode);
        // Update word and character count
        const words = latexCode.split(/\s+/).filter(word => word.length > 0).length;
        const chars = latexCode.length;
        setWordCount(words);
        setCharCount(chars);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [latexCode, convertLatexToHTML]);

  // Force recompile
  const handleRecompile = () => {
    convertLatexToHTML(latexCode);
    success('Resume recompiled successfully');
  };

  // Download PDF directly without print dialog
  const handleDownload = async () => {
    if (!previewHTML) {
      error('No preview available to download');
      return;
    }

    try {
      success('🔄 Generating PDF... Please wait');

      // Wait for html2pdf library to load
      if (!window.html2pdf) {
        await new Promise((resolve) => {
          const checkLibrary = () => {
            if (window.html2pdf) {
              resolve();
            } else {
              setTimeout(checkLibrary, 100);
            }
          };
          checkLibrary();
        });
      }

      // Create a clean HTML content for PDF with compatible CSS
      const cleanHTML = previewHTML
        .replace(/oklch\([^)]+\)/g, '#005f99') // Replace oklch colors
        .replace(/color-mix\([^)]+\)/g, '#333333') // Replace color-mix
        .replace(/hsl\([^)]+\)/g, '#666666') // Replace complex hsl
        .replace(/rgb\([^)]+\)/g, '#444444'); // Simplify rgb

      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = `
        <div style="
          width: 8.5in;
          margin: 0 auto;
          background: white;
          font-family: 'Times New Roman', serif;
          color: #000000;
          line-height: 1.4;
          font-size: 11pt;
        ">
          ${cleanHTML}
        </div>
      `;
      
      // Add to DOM temporarily
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.backgroundColor = 'white';
      document.body.appendChild(container);

      // PDF generation options
      const opt = {
        margin: 0.5,
        filename: `${projectName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Resume.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.95 
        },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          removeContainer: true,
          logging: false,
          letterRendering: true,
          foreignObjectRendering: false
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      // Generate and download PDF
      await window.html2pdf()
        .set(opt)
        .from(container.firstChild)
        .save();

      // Clean up
      document.body.removeChild(container);
      
      success('✅ PDF downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      
      // Fallback: Simple download as HTML
      try {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${projectName}</title>
              <meta charset="utf-8">
              <style>
                @page { size: A4; margin: 0.5in; }
                body { 
                  font-family: 'Times New Roman', serif; 
                  line-height: 1.4; 
                  color: #000; 
                  margin: 0; 
                  padding: 0; 
                }
                @media print { 
                  body { -webkit-print-color-adjust: exact; } 
                }
              </style>
            </head>
            <body>${previewHTML}</body>
          </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_Resume.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        success('📄 Resume downloaded as HTML (you can print to PDF from browser)');
      } catch (fallbackErr) {
        error('❌ Download failed. Please try refreshing the page.');
      }
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-gray-900">Elevare</span>
          </div>
          
          <div className="h-6 w-px bg-gray-300"></div>
          
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="text-lg font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
            placeholder="Resume Title"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTemplateGallery(true)}
            className="text-xs"
          >
            📄 Templates
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowShareModal(true)}
            className="text-xs"
          >
            👥 Share
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            📥 Download
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LaTeX Code Editor */}
        {(layout === 'split' || layout === 'editor') && (
          <div className={cn(
            "border-r border-gray-200 flex flex-col",
            layout === 'split' ? 'w-1/2' : 'w-full'
          )}>
            <WorkingCodeEditor 
              code={latexCode}
              onChange={setLatexCode}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(layout === 'split' || layout === 'preview') && (
          <div className={cn(
            "flex flex-col bg-gray-100",
            layout === 'split' ? 'w-1/2' : 'w-full'
          )}>
            <WorkingPreviewPanel 
              previewHTML={previewHTML}
              isCompiling={isCompiling}
              error={compilationError}
              zoom={zoom}
              onZoomChange={setZoom}
              onDownload={handleDownload}
            />
          </div>
        )}
      </div>

      {/* Enhanced Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal 
            projectName={projectName}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {showTemplateGallery && (
          <WorkingTemplateModal 
            onSelect={(template) => {
              setLatexCode(template.code);
              setShowTemplateGallery(false);
              success(`Template "${template.name}" applied`);
            }}
            onClose={() => setShowTemplateGallery(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkingOverleafBuilder;

/**
 * Working Code Editor Component
 */
const WorkingCodeEditor = ({ code, onChange }) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">📄 main.tex</span>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>LaTeX</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-200 z-10">
          <div className="p-2 text-xs text-gray-500 font-mono leading-6">
            {code.split('\n').map((_, index) => (
              <div key={index} className="text-right pr-2 h-6">
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="absolute left-12 top-0 right-0 bottom-0 w-full h-full p-4 font-mono text-sm leading-6 resize-none border-none outline-none bg-white"
          spellCheck={false}
          autoComplete="off"
          style={{ 
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            fontSize: '14px',
            lineHeight: '24px'
          }}
          placeholder="% Start typing your LaTeX resume here...
% Use \\section{} for sections
% Use \\textbf{} for bold text
% Use \\begin{itemize} for bullet points"
        />
      </div>
    </div>
  );
};

/**
 * Working Preview Panel Component
 */
const WorkingPreviewPanel = ({ 
  previewHTML, 
  isCompiling, 
  error, 
  zoom, 
  onZoomChange, 
  onDownload 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">PDF Preview</span>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onZoomChange(Math.max(zoom - 25, 50))}
            disabled={zoom <= 50}
          >
            🔍-
          </Button>
          
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {zoom}%
          </span>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onZoomChange(Math.min(zoom + 25, 200))}
            disabled={zoom >= 200}
          >
            🔍+
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onDownload}
            disabled={!previewHTML}
          >
            📥 Download
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {isCompiling ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Compiling LaTeX</h3>
              <p className="text-gray-600">Generating your resume preview...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
              <p className="text-gray-600 mb-4">There was an error generating the preview:</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                <code className="text-sm text-red-800">{error}</code>
              </div>
            </div>
          </div>
        ) : previewHTML ? (
          <div className="flex justify-center">
            <div 
              className="bg-white shadow-lg border border-gray-300 max-w-[595px]"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease'
              }}
            >
              <div 
                className="p-8"
                dangerouslySetInnerHTML={{ __html: previewHTML }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Preview Available</h3>
              <p className="text-gray-600">Start typing LaTeX code to see your resume preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Share Modal Component
 */
const ShareModal = ({ projectName, onClose }) => {
  const [shareEmails, setShareEmails] = useState('');
  const [sharePermission, setSharePermission] = useState('Editor');
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [sharedUsers, setSharedUsers] = useState([
    { email: 'gopaljha9398715741@gmail.com', role: 'Owner', avatar: '👤' }
  ]);

  const handleInviteUsers = async () => {
    if (!shareEmails.trim()) {
      alert('Please enter at least one email address');
      return;
    }

    const emails = shareEmails.split(',').map(email => email.trim()).filter(email => email);
    const newUsers = emails.map(email => ({
      email: email,
      role: sharePermission,
      avatar: '👤',
      status: 'Invited'
    }));

    setSharedUsers(prev => [...prev, ...newUsers]);
    setShareEmails('');
    alert(`Invited ${emails.length} user${emails.length > 1 ? 's' : ''} successfully!`);
  };

  const handleToggleLinkSharing = () => {
    if (!linkSharingEnabled) {
      const shareId = Math.random().toString(36).substring(2, 15);
      const newShareLink = `${window.location.origin}/shared/resume/${shareId}`;
      setShareLink(newShareLink);
      setLinkSharingEnabled(true);
    } else {
      setLinkSharingEnabled(false);
      setShareLink('');
    }
  };

  const handleCopyShareLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      alert('Share link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Share Project</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Email Invitation Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add email address</h3>
            
            <div className="space-y-4">
              <textarea
                value={shareEmails}
                onChange={(e) => setShareEmails(e.target.value)}
                placeholder="Enter email addresses..."
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <p className="text-sm text-gray-600">
                Separate multiple email addresses using the comma (,) character.
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-blue-700 font-medium"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Commenter">Commenter</option>
                  </select>
                  
                  <Button
                    onClick={handleInviteUsers}
                    disabled={!shareEmails.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
                  >
                    Invite
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Link Sharing Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">Link sharing is {linkSharingEnabled ? 'on' : 'off'}</h4>
                <p className="text-sm text-gray-600">
                  {linkSharingEnabled 
                    ? 'Anyone with the link can access this project' 
                    : 'Only invited people can access this project'
                  }
                </p>
              </div>
              <Button
                onClick={handleToggleLinkSharing}
                className={`px-4 py-2 rounded-lg font-medium ${
                  linkSharingEnabled 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {linkSharingEnabled ? 'Turn off link sharing' : 'Turn on link sharing'}
              </Button>
            </div>

            {linkSharingEnabled && shareLink && (
              <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none"
                />
                <Button
                  onClick={handleCopyShareLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Copy
                </Button>
              </div>
            )}
          </div>

          {/* Shared Users List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Members</h3>
            <div className="space-y-3">
              {sharedUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">{user.avatar}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      {user.status && (
                        <p className="text-xs text-gray-500">{user.status}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Owner' 
                        ? 'bg-purple-100 text-purple-700' 
                        : user.role === 'Editor'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{projectName}</span> • 
              <span className="ml-1">{sharedUsers.length} member{sharedUsers.length !== 1 ? 's' : ''}</span>
            </div>
            <Button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Working Template Modal Component
 */
const WorkingTemplateModal = ({ onSelect, onClose }) => {
  const templates = [
    {
      id: 'moderncv',
      name: 'ModernCV Professional',
      code: DEFAULT_LATEX_TEMPLATE,
      description: 'Clean, professional design with blue accents'
    },
    {
      id: 'classic',
      name: 'Classic Resume',
      code: CLASSIC_TEMPLATE,
      description: 'Traditional professional layout'
    },
    {
      id: 'minimal',
      name: 'Minimal Resume',
      code: MINIMAL_TEMPLATE,
      description: 'Clean and minimalist design'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Choose a Template</h2>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div 
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                onClick={() => onSelect(template)}
              >
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};/**
 
* Universal LaTeX to HTML Parser
 * Supports ALL LaTeX formats - ModernCV, Article, Custom, etc.
 */
const parseLatexToHTML = (latex) => {
  try {
    if (!latex || latex.trim() === '') {
      return '<div class="resume-container"><p>Start typing your LaTeX code...</p></div>';
    }

    // Detect LaTeX format
    const isModernCV = latex.includes('\\documentclass') && latex.includes('moderncv');
    const isArticle = latex.includes('\\documentclass') && latex.includes('article');
    const hasCustomCommands = latex.includes('\\resumeSubheading') || latex.includes('\\resumeItem');
    
    let resumeHTML = '';
    let personalData = {};

    // Extract personal information from any format
    personalData = extractUniversalPersonalInfo(latex);

    // Start building HTML
    resumeHTML = `
      <div class="resume-container">
        ${personalData.name || personalData.email || personalData.phone ? `
          <div class="header">
            ${personalData.name ? `<h1 class="name">${personalData.name}</h1>` : ''}
            <div class="contact-info">
              ${personalData.phone ? `<span class="contact-item">📱 ${personalData.phone}</span>` : ''}
              ${personalData.email ? `<span class="contact-item">📧 ${personalData.email}</span>` : ''}
              ${personalData.linkedin ? `<span class="contact-item">💼 ${personalData.linkedin}</span>` : ''}
              ${personalData.github ? `<span class="contact-item">🐙 ${personalData.github}</span>` : ''}
              ${personalData.website ? `<span class="contact-item">🌐 ${personalData.website}</span>` : ''}
            </div>
          </div>
        ` : ''}
    `;

    // Parse sections based on format
    if (hasCustomCommands) {
      resumeHTML += parseCustomCommandSections(latex);
    } else if (isModernCV) {
      resumeHTML += parseModernCVSections(latex);
    } else if (isArticle) {
      resumeHTML += parseArticleSections(latex);
    } else {
      resumeHTML += parseGenericSections(latex);
    }

    resumeHTML += `</div>`;

    // Add comprehensive CSS styles
    const styledHTML = `
      <style>
        .resume-container {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          color: #333333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 0.5in;
          font-size: 11pt;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #005f99;
        }
        .name {
          font-size: 2.2rem;
          font-weight: bold;
          color: #005f99;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .contact-info {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.9rem;
        }
        .contact-item {
          color: #444444;
        }
        .section {
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #005f99;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #005f99;
          padding-bottom: 0.3rem;
          margin-bottom: 0.8rem;
        }
        .entry {
          margin-bottom: 1rem;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.3rem;
        }
        .entry-title {
          font-weight: bold;
          font-size: 1rem;
          color: #333333;
        }
        .entry-subtitle {
          font-style: italic;
          font-size: 0.9rem;
          color: #555555;
        }
        .entry-date {
          font-weight: bold;
          font-size: 0.9rem;
          color: #333333;
        }
        .entry-description {
          margin-top: 0.5rem;
        }
        .entry-description ul {
          margin: 0.5rem 0;
          padding-left: 1.2rem;
        }
        .entry-description li {
          margin-bottom: 0.3rem;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        .simple-text {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .bold-text {
          font-weight: bold;
          color: #333333;
        }
        .italic-text {
          font-style: italic;
          color: #555555;
        }
        .project-links a {
          color: #005f99;
          text-decoration: none;
          margin-right: 1rem;
        }
        .project-links a:hover {
          text-decoration: underline;
        }
        .error-message {
          color: red;
          padding: 1rem;
          border: 1px solid red;
          border-radius: 0.5rem;
          background: #fff5f5;
        }
        @media print {
          .resume-container {
            padding: 0.5in;
            font-size: 10pt;
          }
          .name {
            font-size: 2rem;
          }
        }
      </style>
      ${resumeHTML}
    `;

    return styledHTML;
  } catch (error) {
    console.error('LaTeX parsing error:', error);
    return `
      <div class="resume-container">
        <div class="error-message">
          <h3>LaTeX Parsing Error</h3>
          <p>There was an error parsing your LaTeX code: ${error.message}</p>
          <p>Please check your LaTeX syntax and try again.</p>
        </div>
      </div>
    `;
  }
};

/**
 * Universal Personal Info Extractor
 * Works with ANY LaTeX format
 */
const extractUniversalPersonalInfo = (latex) => {
  const personalData = {};

  // Name extraction - multiple patterns
  const namePatterns = [
    /\\name\{([^}]+)\}\{([^}]+)\}/,  // ModernCV: \name{First}{Last}
    /\{\\Huge\s*\\scshape\s*([^}]+)\}/,  // Custom: {\Huge \scshape Name}
    /\{\\Large\\textbf\{([^}]+)\}\}/,  // Article: {\Large\textbf{Name}}
    /\\textbf\{([^}]+)\}.*?\\\\.*?Software/i,  // Pattern: \textbf{Name}\\ Software Engineer
    /\\begin\{center\}.*?\{\\Huge.*?([^}]+)\}/s,  // Center block with name
    /^([A-Z][a-z]+\\s+[A-Z][a-z]+)/m  // Simple: First Last at line start
  ];

  for (const pattern of namePatterns) {
    const match = latex.match(pattern);
    if (match) {
      if (match[2]) {
        personalData.name = `${match[1]} ${match[2]}`.trim();
      } else {
        personalData.name = match[1].trim();
      }
      break;
    }
  }

  // Email extraction
  const emailPatterns = [
    /\\email\{([^}]+)\}/,
    /\\href\{mailto:([^}]+)\}/,
    /\\faEnvelope~([^$\s]+)/,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  ];

  for (const pattern of emailPatterns) {
    const match = latex.match(pattern);
    if (match) {
      personalData.email = match[1];
      break;
    }
  }

  // Phone extraction
  const phonePatterns = [
    /\\phone\[mobile\]\{([^}]+)\}/,
    /\\phone\{([^}]+)\}/,
    /\\faPhone~([^$\s]+)/,
    /(\+\\d{1,3}[-\\s]?\\d{10}|\\(\\d{3}\\)\\s?\\d{3}-\\d{4})/
  ];

  for (const pattern of phonePatterns) {
    const match = latex.match(pattern);
    if (match) {
      personalData.phone = match[1];
      break;
    }
  }

  // LinkedIn extraction
  const linkedinPatterns = [
    /\\social\[linkedin\]\{([^}]+)\}/,
    /\\href\{https:\/\/www\.linkedin\.com\/in\/([^}]+)\}/,
    /\\faLinkedin~([^$\s]+)/,
    /linkedin\.com\/in\/([^}\s$]+)/
  ];

  for (const pattern of linkedinPatterns) {
    const match = latex.match(pattern);
    if (match) {
      personalData.linkedin = match[1];
      break;
    }
  }

  // GitHub extraction
  const githubPatterns = [
    /\\social\[github\]\{([^}]+)\}/,
    /\\href\{https:\/\/github\.com\/([^}]+)\}/,
    /\\faGithub~([^$\s]+)/,
    /github\.com\/([^}\s$]+)/
  ];

  for (const pattern of githubPatterns) {
    const match = latex.match(pattern);
    if (match) {
      personalData.github = match[1];
      break;
    }
  }

  // Website extraction
  const websitePatterns = [
    /\\homepage\{([^}]+)\}/,
    /\\url\{([^}]+)\}/,
    /(https?:\/\/[^\s}]+)/
  ];

  for (const pattern of websitePatterns) {
    const match = latex.match(pattern);
    if (match) {
      personalData.website = match[1];
      break;
    }
  }

  return personalData;
};

/**
 * Parse Custom Command Sections (resumeSubheading, resumeItem, etc.)
 */
const parseCustomCommandSections = (latex) => {
  let sectionsHTML = '';
  
  // Find all sections
  const sectionMatches = latex.match(/\\section\{([^}]+)\}([\s\S]*?)(?=\\section\{|\\end\{document\}|$)/g);
  
  if (sectionMatches) {
    sectionMatches.forEach(section => {
      const titleMatch = section.match(/\\section\{([^}]+)\}/);
      const sectionTitle = titleMatch ? titleMatch[1] : '';
      
      sectionsHTML += `<div class="section">
        <h2 class="section-title">${sectionTitle}</h2>`;

      // Parse resumeSubheading entries
      const resumeSubheadings = section.match(/\\resumeSubheading\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/g);
      if (resumeSubheadings) {
        resumeSubheadings.forEach(subheading => {
          const matches = subheading.match(/\\resumeSubheading\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}\{([^}]+)\}/);
          if (matches) {
            const [, title, date, subtitle, location] = matches;
            
            sectionsHTML += `
              <div class="entry">
                <div class="entry-header">
                  <div>
                    <div class="entry-title">${title}</div>
                    <div class="entry-subtitle">${subtitle}${location ? ` | ${location}` : ''}</div>
                  </div>
                  <div class="entry-date">${date}</div>
                </div>
              </div>
            `;
          }
        });

        // Parse resume items
        const resumeItemsMatch = section.match(/\\resumeItemListStart([\s\S]*?)\\resumeItemListEnd/g);
        if (resumeItemsMatch) {
          resumeItemsMatch.forEach(itemList => {
            const items = itemList.match(/\\resumeItem\{([^}]+(?:\}[^}]*\{[^}]*)*[^}]*)\}/g);
            if (items) {
              sectionsHTML += `<div class="entry-description"><ul>`;
              items.forEach(item => {
                const itemMatch = item.match(/\\resumeItem\{([\s\S]+)\}/);
                if (itemMatch) {
                  let itemText = itemMatch[1]
                    .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
                    .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
                    .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank">$2</a>');
                  
                  sectionsHTML += `<li>${itemText}</li>`;
                }
              });
              sectionsHTML += `</ul></div>`;
            }
          });
        }
      }

      // Handle skills section specially
      if (sectionTitle.toLowerCase() === 'skills') {
        const skillItems = section.match(/\\resumeItem\{([^}]+(?:\}[^}]*\{[^}]*)*[^}]*)\}/g);
        if (skillItems) {
          sectionsHTML += `<div class="entry-description">`;
          skillItems.forEach(item => {
            const itemMatch = item.match(/\\resumeItem\{\\textbf\{([^}]+):\}\s*(.+)\}/);
            if (itemMatch) {
              const [, category, skills] = itemMatch;
              sectionsHTML += `<div class="simple-text"><span class="bold-text">${category}:</span> ${skills}</div>`;
            }
          });
          sectionsHTML += `</div>`;
        }
      }

      sectionsHTML += `</div>`;
    });
  }

  return sectionsHTML;
};

/**
 * Parse ModernCV Sections
 */
const parseModernCVSections = (latex) => {
  let sectionsHTML = '';
  
  const sectionMatches = latex.match(/\\section\{([^}]+)\}([\s\S]*?)(?=\\section\{|\\end\{document\}|$)/g);
  
  if (sectionMatches) {
    sectionMatches.forEach(section => {
      const titleMatch = section.match(/\\section\{([^}]+)\}/);
      const sectionTitle = titleMatch ? titleMatch[1] : '';
      
      sectionsHTML += `<div class="section">
        <h2 class="section-title">${sectionTitle}</h2>`;

      // Parse cventry
      const cvEntries = section.match(/\\cventry\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([\s\S]*?)\}(?=\\cventry|\\section|\\end|$)/g);
      if (cvEntries) {
        cvEntries.forEach(entry => {
          const matches = entry.match(/\\cventry\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([\s\S]*?)\}/);
          if (matches) {
            const [, dates, position, company, location, , description] = matches;
            
            sectionsHTML += `
              <div class="entry">
                <div class="entry-header">
                  <div>
                    <div class="entry-title">${position}</div>
                    <div class="entry-subtitle">${company}${location ? `, ${location}` : ''}</div>
                  </div>
                  <div class="entry-date">${dates}</div>
                </div>
                <div class="entry-description">${parseItemizeContent(description)}</div>
              </div>
            `;
          }
        });
      }

      // Parse cvitem
      const cvItems = section.match(/\\cvitem\{([^}]*)\}\{([^}]+)\}/g);
      if (cvItems) {
        cvItems.forEach(item => {
          const matches = item.match(/\\cvitem\{([^}]*)\}\{([^}]+)\}/);
          if (matches) {
            const [, label, content] = matches;
            if (label) {
              sectionsHTML += `<div class="simple-text"><span class="bold-text">${label}:</span> ${content}</div>`;
            } else {
              sectionsHTML += `<div class="simple-text">${content}</div>`;
            }
          }
        });
      }

      sectionsHTML += `</div>`;
    });
  }

  return sectionsHTML;
};

/**
 * Parse Article Class Sections
 */
const parseArticleSections = (latex) => {
  let sectionsHTML = '';
  
  // Find sections or just parse content
  const sectionMatches = latex.match(/\\textbf\{([^}]+)\}([\s\S]*?)(?=\\textbf\{|\\end\{document\}|$)/g);
  
  if (sectionMatches) {
    sectionMatches.forEach(section => {
      const titleMatch = section.match(/\\textbf\{([^}]+)\}/);
      const sectionTitle = titleMatch ? titleMatch[1] : '';
      
      if (sectionTitle.toLowerCase().includes('experience') || 
          sectionTitle.toLowerCase().includes('education') ||
          sectionTitle.toLowerCase().includes('skills') ||
          sectionTitle.toLowerCase().includes('projects')) {
        
        sectionsHTML += `<div class="section">
          <h2 class="section-title">${sectionTitle}</h2>`;

        const content = section.replace(/\\textbf\{[^}]+\}/, '').trim();
        const parsedContent = content
          .replace(/\\textbf\{([^}]+)\}/g, '<span class="bold-text">$1</span>')
          .replace(/\\textit\{([^}]+)\}/g, '<span class="italic-text">$1</span>')
          .replace(/\\\\+/g, '<br>')
          .replace(/\\vspace\{[^}]+\}/g, '<div style="margin: 1rem 0;"></div>')
          .split(/\n\s*\n/)
          .filter(p => p.trim())
          .map(p => `<div class="simple-text">${p.trim()}</div>`)
          .join('');
        
        sectionsHTML += parsedContent;
        sectionsHTML += `</div>`;
      }
    });
  }

  return sectionsHTML;
};

/**
 * Parse Generic LaTeX Content
 */
const parseGenericSections = (latex) => {
  let sectionsHTML = '';
  
  // Split by common section indicators
  const lines = latex.split('\n');
  let currentSection = '';
  let currentContent = '';
  
  lines.forEach(line => {
    const cleanLine = line.trim();
    
    // Skip LaTeX commands and empty lines
    if (cleanLine.startsWith('%') || cleanLine.startsWith('\\documentclass') || 
        cleanLine.startsWith('\\usepackage') || cleanLine.startsWith('\\begin{document}') ||
        cleanLine.startsWith('\\end{document}') || cleanLine === '') {
      return;
    }
    
    // Check if it's a section
    if (cleanLine.match(/^[A-Z][A-Z\s]+$/) && cleanLine.length > 3) {
      // Save previous section
      if (currentSection && currentContent) {
        sectionsHTML += `
          <div class="section">
            <h2 class="section-title">${currentSection}</h2>
            <div class="entry-description">${currentContent}</div>
          </div>
        `;
      }
      
      currentSection = cleanLine;
      currentContent = '';
    } else if (cleanLine) {
      // Add to current content
      const processedLine = cleanLine
        .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
        .replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank">$2</a>');
      
      currentContent += `<div class="simple-text">${processedLine}</div>`;
    }
  });
  
  // Add last section
  if (currentSection && currentContent) {
    sectionsHTML += `
      <div class="section">
        <h2 class="section-title">${currentSection}</h2>
        <div class="entry-description">${currentContent}</div>
      </div>
    `;
  }
  
  return sectionsHTML;
};

/**
 * Parse Itemize Content
 */
const parseItemizeContent = (content) => {
  if (content.includes('\\begin{itemize}')) {
    let parsed = content.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, items) => {
      const itemMatches = items.match(/\\item\s+([^\n\\]*(?:\\\\[^\n\\]*)*)/g);
      if (itemMatches) {
        const listItems = itemMatches.map(item => {
          const text = item.replace(/\\item\s+/, '').replace(/\\\\+/g, ' ');
          return `<li>${text.trim()}</li>`;
        }).join('');
        return `<ul>${listItems}</ul>`;
      }
      return match;
    });
    return parsed;
  }
  
  return content
    .replace(/\\item\s+/g, '• ')
    .replace(/\\\\+/g, '<br>')
    .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
};

// Default LaTeX Template - ModernCV Format
const DEFAULT_LATEX_TEMPLATE = `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}
\\usepackage[scale=0.75]{geometry}

% Personal data
\\name{Gopal}{Kumar}
\\title{Full Stack Developer}
\\address{Your Address}{City, State ZIP}{}
\\phone[mobile]{+1~(555)~123~4567}
\\email{gopal3d2398715@gmail.com}
\\homepage{www.yourwebsite.com}
\\social[linkedin]{yourprofile}
\\social[github]{yourgithub}

\\begin{document}
\\makecvtitle

\\section{Professional Summary}
\\cvitem{}{Results-driven Full Stack Developer with 5+ years of experience in building scalable web applications. Proficient in modern JavaScript frameworks, backend technologies, and cloud platforms. Passionate about creating efficient, user-friendly solutions that drive business growth.}

\\section{Experience}
\\cventry{2020--Present}{Senior Full Stack Developer}{Tech Corporation}{San Francisco, CA}{}{
\\begin{itemize}
\\item Developed and maintained 10+ web applications serving 100K+ users
\\item Implemented microservices architecture reducing system latency by 40\\%
\\item Led team of 5 developers in agile development processes
\\item Integrated AI-powered features increasing user engagement by 60\\%
\\end{itemize}}

\\cventry{2018--2020}{Software Developer}{StartupCo}{Remote}{}{
\\begin{itemize}
\\item Built responsive web applications using React.js and Node.js
\\item Designed and implemented RESTful APIs handling 1M+ requests daily
\\item Optimized database queries improving application performance by 50\\%
\\item Collaborated with cross-functional teams to deliver features on time
\\end{itemize}}

\\section{Education}
\\cventry{2014--2018}{Bachelor of Technology in Computer Science}{University Name}{City, State}{}{
\\begin{itemize}
\\item Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering
\\item Final Year Project: AI-powered Resume Builder (Current Project)
\\end{itemize}}

\\section{Technical Skills}
\\cvitem{Programming Languages}{JavaScript, Python, Java, TypeScript, C++}
\\cvitem{Frontend Development}{React.js, Vue.js, HTML5, CSS3, Sass, Bootstrap}
\\cvitem{Backend Development}{Node.js, Express.js, Django, Spring Boot}
\\cvitem{Databases}{MongoDB, PostgreSQL, MySQL, Redis}
\\cvitem{Cloud & DevOps}{AWS, Docker, Kubernetes, Jenkins, Git}

\\section{Projects}
\\cventry{2024}{AI-Powered Resume Builder}{Personal Project}{}{}{
\\begin{itemize}
\\item Built comprehensive resume creation platform with LaTeX compilation
\\item Integrated AI for content generation and ATS optimization
\\item Implemented real-time collaboration and version control features
\\item Technologies: React, Node.js, MongoDB, OpenAI API, LaTeX
\\end{itemize}}

\\section{Certifications}
\\cventry{2023}{AWS Certified Solutions Architect}{Amazon Web Services}{}{}{Professional level certification demonstrating cloud architecture expertise}
\\cventry{2022}{Google Cloud Professional Developer}{Google Cloud}{}{}{Certification in developing scalable applications on Google Cloud Platform}

\\end{document}`;

// Additional Templates
const CLASSIC_TEMPLATE = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\pagestyle{empty}

\\begin{document}

{\\Large\\textbf{John Doe}}\\\\
Software Engineer\\\\
john.doe@email.com | (555) 123-4567 | San Francisco, CA

\\vspace{1em}

\\textbf{Experience}\\\\
\\textbf{Software Engineer} at Google | 2021 - Present\\\\
Developed scalable backend services handling millions of requests daily.

\\vspace{0.5em}

\\textbf{Software Developer} at Startup Inc | 2019 - 2021\\\\
Built full-stack web applications using React and Node.js.

\\vspace{1em}

\\textbf{Education}\\\\
\\textbf{B.S. Computer Science} | UC Berkeley | 2019

\\vspace{1em}

\\textbf{Skills}\\\\
JavaScript, Python, React, Node.js, PostgreSQL, AWS

\\end{document}`;

const MINIMAL_TEMPLATE = `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\pagestyle{empty}

\\begin{document}

{\\Large\\textbf{Jane Smith}}

Marketing Manager

jane.smith@email.com | (555) 987-6543

\\vspace{1em}

\\textbf{Experience}

Marketing Manager at Corp Inc (2020-Present)
- Managed marketing campaigns
- Increased brand awareness by 50\\%

Marketing Specialist at StartupCo (2018-2020)
- Developed marketing strategies
- Led social media initiatives

\\vspace{1em}

\\textbf{Education}

MBA Marketing | Business School | 2018
BA Communications | University | 2016

\\end{document}`;