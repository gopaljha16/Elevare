import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

// Import additional components
import LaTeXCodeEditor from './LaTeXCodeEditor';
import PDFPreviewPanel from './PDFPreviewPanel';
import AIAssistantPanel from './AIAssistantPanel';
import TemplateGalleryModal from './TemplateGalleryModal';

// Default LaTeX Template
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
\\cvitem{Cloud \& DevOps}{AWS, Docker, Kubernetes, Jenkins, Git}
\\cvitem{AI \& Machine Learning}{TensorFlow, PyTorch, Natural Language Processing}

\\section{Projects}
\\cventry{2024}{AI-Powered Resume Builder}{Personal Project}{}{}{
\\begin{itemize}
\\item Built comprehensive resume creation platform with LaTeX compilation
\\item Integrated AI for content generation and ATS optimization
\\item Implemented real-time collaboration and version control features
\\item Technologies: React, Node.js, MongoDB, OpenAI API, LaTeX
\\end{itemize}}

\\cventry{2023}{E-commerce Platform}{Freelance}{}{}{
\\begin{itemize}
\\item Developed full-stack e-commerce solution with payment integration
\\item Implemented inventory management and order tracking systems
\\item Achieved 99.9\\% uptime with automated deployment pipeline
\\item Technologies: MERN Stack, Stripe API, AWS EC2, Docker
\\end{itemize}}

\\section{Certifications}
\\cventry{2023}{AWS Certified Solutions Architect}{Amazon Web Services}{}{}{Professional level certification demonstrating cloud architecture expertise}
\\cventry{2022}{Google Cloud Professional Developer}{Google Cloud}{}{}{Certification in developing scalable applications on Google Cloud Platform}

\\section{Achievements}
\\cvitem{}{Winner of CodeArmy Hackathon 2023 - Built AI-powered coding assistant}
\\cvitem{}{Published 5+ technical articles on Medium with 10K+ views}
\\cvitem{}{Contributed to 15+ open-source projects on GitHub}
\\cvitem{}{Mentored 20+ junior developers through coding bootcamps}

\\end{document}`;

/**
 * Overleaf-Style Resume Builder
 * 
 * Features:
 * - LaTeX code editor with syntax highlighting
 * - Real-time PDF compilation and preview
 * - Professional LaTeX templates
 * - AI-powered content generation and suggestions
 * - Collaboration and sharing features
 * - Export to multiple formats
 */
const OverleafResumeBuilder = () => {
  // Core state
  const [projectName, setProjectName] = useState('Gopal Full stack Resume');
  const [latexCode, setLatexCode] = useState(DEFAULT_LATEX_TEMPLATE);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationError, setCompilationError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [lastCompiled, setLastCompiled] = useState(null);

  // UI state
  const [layout, setLayout] = useState('split'); // 'split', 'editor', 'preview'
  const [editorTheme, setEditorTheme] = useState('light');
  const [fontSize, setFontSize] = useState(14);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);

  // AI state
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  // Refs
  const editorRef = useRef(null);
  const previewRef = useRef(null);

  const { success, error } = useToast();

  // Auto-compile when LaTeX code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (latexCode.trim()) {
        compileLatex();
      }
    }, 1500); // Debounce compilation

    return () => clearTimeout(timer);
  }, [latexCode]);

  // Compile LaTeX to PDF
  const compileLatex = useCallback(async () => {
    if (!latexCode.trim()) return;

    setIsCompiling(true);
    setCompilationError(null);

    try {
      const response = await fetch('/api/resumes/latex/compile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ latex: latexCode })
      });

      if (!response.ok) {
        throw new Error('Compilation failed');
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setLastCompiled(new Date());
      success('Resume compiled successfully');
    } catch (err) {
      setCompilationError(err.message);
      error('Compilation failed: ' + err.message);
    } finally {
      setIsCompiling(false);
    }
  }, [latexCode, success, error]);

  // Force recompile
  const handleRecompile = () => {
    compileLatex();
  };

  // Download PDF
  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${projectName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // AI Analysis
  const handleAIAnalysis = async () => {
    setIsAIAnalyzing(true);
    try {
      const response = await fetch('/api/resumes/ai/analyze-latex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ latex: latexCode })
      });

      const result = await response.json();
      setAiInsights(result.data);
      setAiSuggestions(result.data.suggestions || []);
      success('AI analysis completed');
    } catch (err) {
      error('AI analysis failed');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  // Template selection
  const handleTemplateSelect = (template) => {
    setLatexCode(template.code);
    setShowTemplateGallery(false);
    success(`Template "${template.name}" applied`);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header - Overleaf Style */}
      <OverleafHeader 
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onDownload={handleDownload}
        onShowTemplates={() => setShowTemplateGallery(true)}
        isCompiling={isCompiling}
      />

      {/* Toolbar */}
      <OverleafToolbar 
        layout={layout}
        onLayoutChange={setLayout}
        onRecompile={handleRecompile}
        onAIAnalysis={handleAIAnalysis}
        onShowAI={() => setShowAIPanel(!showAIPanel)}
        isCompiling={isCompiling}
        isAIAnalyzing={isAIAnalyzing}
        lastCompiled={lastCompiled}
        compilationError={compilationError}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* LaTeX Code Editor */}
        {(layout === 'split' || layout === 'editor') && (
          <div className={cn(
            "border-r border-gray-200 flex flex-col",
            layout === 'split' ? 'w-1/2' : 'w-full'
          )}>
            <LaTeXCodeEditor 
              code={latexCode}
              onChange={setLatexCode}
              theme={editorTheme}
              fontSize={fontSize}
              ref={editorRef}
            />
          </div>
        )}

        {/* PDF Preview */}
        {(layout === 'split' || layout === 'preview') && (
          <div className={cn(
            "flex flex-col bg-gray-100",
            layout === 'split' ? 'w-1/2' : 'w-full'
          )}>
            <PDFPreviewPanel 
              pdfUrl={pdfUrl}
              isCompiling={isCompiling}
              error={compilationError}
              ref={previewRef}
            />
          </div>
        )}

        {/* AI Panel */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-80 border-l border-gray-200 bg-white"
            >
              <AIAssistantPanel 
                suggestions={aiSuggestions}
                insights={aiInsights}
                onApplySuggestion={(suggestion) => {
                  setLatexCode(prev => prev + '\n' + suggestion.code);
                }}
                onClose={() => setShowAIPanel(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Template Gallery Modal */}
      <AnimatePresence>
        {showTemplateGallery && (
          <TemplateGalleryModal 
            onSelect={handleTemplateSelect}
            onClose={() => setShowTemplateGallery(false)}
          />
        )}
      </AnimatePresence>

      {/* Status Bar */}
      <OverleafStatusBar 
        isCompiling={isCompiling}
        lastCompiled={lastCompiled}
        error={compilationError}
        wordCount={latexCode.split(/\s+/).length}
      />
    </div>
  );
};

/**
 * Overleaf-style Header Component
 */
const OverleafHeader = ({ 
  projectName, 
  onProjectNameChange, 
  onDownload, 
  onShowTemplates,
  isCompiling 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      {/* Left side - Menu and Project */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          <span className="font-semibold text-gray-900">Resume Builder</span>
        </div>
        
        <div className="h-6 w-px bg-gray-300"></div>
        
        {isEditing ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="text-lg font-medium bg-transparent border-none outline-none"
            autoFocus
          />
        ) : (
          <h1 
            className="text-lg font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => setIsEditing(true)}
          >
            {projectName}
          </h1>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowTemplates}
        >
          📄 Templates
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
        >
          👥 Share
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
        >
          📝 Review
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
        >
          📤 Submit
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
        >
          📜 History
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
        >
          ⚙️ Layout
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          onClick={onDownload}
          disabled={isCompiling}
          className="bg-green-600 hover:bg-green-700"
        >
          💬 Download
        </Button>
      </div>
    </div>
  );
};

/**
 * Overleaf-style Toolbar Component
 */
const OverleafToolbar = ({ 
  layout, 
  onLayoutChange, 
  onRecompile, 
  onAIAnalysis,
  onShowAI,
  isCompiling, 
  isAIAnalyzing,
  lastCompiled,
  compilationError 
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      {/* Left side - Compile actions */}
      <div className="flex items-center space-x-3">
        <Button 
          variant="default" 
          size="sm"
          onClick={onRecompile}
          disabled={isCompiling}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isCompiling ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Compiling...
            </>
          ) : (
            <>▶️ Recompile</>
          )}
        </Button>

        {lastCompiled && (
          <span className="text-sm text-gray-600">
            Last compiled: {lastCompiled.toLocaleTimeString()}
          </span>
        )}

        {compilationError && (
          <span className="text-sm text-red-600 flex items-center">
            ❌ Error: {compilationError}
          </span>
        )}
      </div>

      {/* Center - Layout controls */}
      <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
        <Button
          variant={layout === 'editor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('editor')}
          className="px-3"
        >
          📝 Code Editor
        </Button>
        <Button
          variant={layout === 'split' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('split')}
          className="px-3"
        >
          🔄 Visual Editor
        </Button>
        <Button
          variant={layout === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('preview')}
          className="px-3"
        >
          👁️ Preview
        </Button>
      </div>

      {/* Right side - AI and other tools */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAIAnalysis}
          disabled={isAIAnalyzing}
          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
        >
          {isAIAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Analyzing...
            </>
          ) : (
            <>🤖 AI Analysis</>
          )}
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          onClick={onShowAI}
          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
        >
          ✨ AI Assistant
        </Button>

        <Button 
          variant="outline" 
          size="sm"
        >
          📊 98%
        </Button>
      </div>
    </div>
  );
};

export default OverleafResumeBuilder;
/**
 * 
Overleaf-style Status Bar Component
 */
const OverleafStatusBar = ({ 
  isCompiling, 
  lastCompiled, 
  error, 
  wordCount 
}) => {
  return (
    <div className="bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
      {/* Left side - Compilation status */}
      <div className="flex items-center space-x-4">
        {isCompiling ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span>Compiling...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-2 text-red-600">
            <span>❌</span>
            <span>Compilation failed</span>
          </div>
        ) : lastCompiled ? (
          <div className="flex items-center space-x-2 text-green-600">
            <span>✅</span>
            <span>Compiled successfully at {lastCompiled.toLocaleTimeString()}</span>
          </div>
        ) : (
          <span>Ready to compile</span>
        )}
      </div>

      {/* Right side - Stats */}
      <div className="flex items-center space-x-4">
        <span>Words: {wordCount}</span>
        <span>LaTeX</span>
        <span>UTF-8</span>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>
    </div>
  );
};