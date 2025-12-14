import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { 
  Code, 
  Eye, 
  Download, 
  Share2, 
  MessageCircle, 
  Sparkles,
  Globe,
  ChevronRight,
  X,
  Send,
  Loader2,
  FileCode,
  Palette,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  Play,
  Bot,
  User,
  Zap
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import '../styles/AIPortfolioBuilder.css';

const AIPortfolioBuilder = () => {
  const { user } = useAuthContext();
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Code editor state
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [previewKey, setPreviewKey] = useState(0);
  
  // Streaming generation states
  const [isGeneratingHtml, setIsGeneratingHtml] = useState(false);
  const [isGeneratingCss, setIsGeneratingCss] = useState(false);
  const [isGeneratingJs, setIsGeneratingJs] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = useState('');
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showImprovement, setShowImprovement] = useState(false);
  const [improvementInput, setImprovementInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const chatEndRef = useRef(null);
  const iframeRef = useRef(null);
  const editorRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const generationAbortRef = useRef(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  useEffect(() => {
    // Prefill userName from authenticated user if available
    if (user && !userName) {
      const derivedName = user.firstName || user.name || (user.email ? user.email.split('@')[0] : '');
      if (derivedName) {
        setUserName(derivedName);
      }
    }
  }, [user, userName]);

  useEffect(() => {
    // Update preview when code changes (debounced)
    const timer = setTimeout(() => {
      if (htmlCode || cssCode || jsCode) {
        console.log('📱 Updating preview with code:', {
          htmlLength: htmlCode?.length || 0,
          cssLength: cssCode?.length || 0,
          jsLength: jsCode?.length || 0
        });
        updatePreview();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      generationAbortRef.current = true;
    };
  }, []);

  const handleStartBuilding = () => {
    if (!userName.trim()) return;
    
    setShowNameInput(false);
    setIsLoading(true);
    
    // Welcome message
    setTimeout(() => {
      setChatMessages([{
        id: 1,
        type: 'ai',
        content: `Hi ${userName}! 👋 I'm your AI Portfolio Builder powered by advanced AI models. I can create stunning, professional portfolio websites tailored to your profession and style. 

Just describe what you'd like:
• Your profession (developer, designer, marketer, etc.)
• Your style preferences (modern, minimal, creative, etc.)
• Any specific features or sections you want
• Colors or themes you prefer

I'll remember our conversation and can make improvements as we go. Let's build something amazing! ✨`,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 1000);
  };

  // Typing effect for smooth text reveal
  const typeText = async (text, setter, speed = 15) => {
    generationAbortRef.current = false;
    
    for (let i = 0; i <= text.length; i++) {
      if (generationAbortRef.current) break;
      
      setter(text.slice(0, i));
      
      // Use requestAnimationFrame for smooth updates
      await new Promise(resolve => {
        typingTimeoutRef.current = setTimeout(resolve, speed);
      });
    }
  };

  // Type code line by line for realistic effect
  const typeCodeLineByLine = async (code, setter, speed = 30) => {
    generationAbortRef.current = false;
    const lines = code.split('\n');
    let currentCode = '';
    
    for (let i = 0; i < lines.length; i++) {
      if (generationAbortRef.current) break;
      
      currentCode += (i > 0 ? '\n' : '') + lines[i];
      setter(currentCode);
      
      // Scroll editor to bottom
      scrollEditorToBottom();
      
      await new Promise(resolve => {
        typingTimeoutRef.current = setTimeout(resolve, speed);
      });
    }
  };

  // Scroll editor to bottom smoothly
  const scrollEditorToBottom = () => {
    if (editorRef.current) {
      const editorElement = editorRef.current;
      editorElement.scrollTop = editorElement.scrollHeight;
    }
  };

  // Sequential code generation with smooth transitions
  const generateCodeSequentially = async (codeData) => {
    try {
      // Reset states
      setHtmlCode('');
      setCssCode('');
      setJsCode('');
      generationAbortRef.current = false;
      
      // Step 1: Generate HTML
      setCurrentGenerationStep('🎨 Generating HTML structure...');
      setGenerationProgress(10);
      setActiveTab('html');
      setIsGeneratingHtml(true);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Smooth transition
      await typeCodeLineByLine(codeData.html, setHtmlCode, 25);
      
      setIsGeneratingHtml(false);
      setGenerationProgress(40);
      
      // Step 2: Generate CSS
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentGenerationStep('🎨 Styling your portfolio...');
      setActiveTab('css');
      setIsGeneratingCss(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await typeCodeLineByLine(codeData.css, setCssCode, 20);
      
      setIsGeneratingCss(false);
      setGenerationProgress(70);
      
      // Step 3: Generate JavaScript
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentGenerationStep('⚡ Adding interactivity...');
      setActiveTab('js');
      setIsGeneratingJs(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await typeCodeLineByLine(codeData.js, setJsCode, 20);
      
      setIsGeneratingJs(false);
      setGenerationProgress(100);
      setCurrentGenerationStep('✨ Portfolio complete! Check the preview →');
      
      // Auto-refresh preview after generation
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🎯 Generation complete, refreshing preview...');
      refreshPreview();
      
      // Force another refresh to ensure it loads
      setTimeout(() => {
        refreshPreview();
        console.log('🔄 Second preview refresh for reliability');
      }, 1000);
      
      // Clear generation state with fade out
      setTimeout(() => {
        setCurrentGenerationStep('');
        setGenerationProgress(0);
      }, 3000);
      
    } catch (error) {
      console.error('Sequential generation error:', error);
      setIsGeneratingHtml(false);
      setIsGeneratingCss(false);
      setIsGeneratingJs(false);
      setCurrentGenerationStep('');
      setGenerationProgress(0);
      throw error;
    }
  };

  const generatePortfolioCode = async (prompt, isImprovement = false) => {
    setIsSending(true);
    
    try {
      console.log('🚀 Requesting portfolio generation...');
      const response = await axiosClient.post('/portfolio/generate-code', {
        prompt,
        userName,
        currentCode: isImprovement ? { html: htmlCode, css: cssCode, js: jsCode } : null,
        isImprovement
      });
      
      console.log('✅ Received response:', {
        aiProvider: response.data.aiProvider,
        message: response.data.message,
        hasCode: !!response.data.code,
        responseTime: response.data.responseTime
      });
      
      const { html, css, js } = response.data.code;
      
      // Use sequential generation for smooth effect
      await generateCodeSequentially({ html, css, js });
      
      // Return message with AI provider info and response time
      const aiProvider = response.data.aiProvider || 'AI';
      const responseTime = response.data.responseTime ? ` (${(response.data.responseTime / 1000).toFixed(1)}s)` : '';
      const contextInfo = response.data.contextUsed ? ' • Using conversation context' : '';
      
      return `✨ ${response.data.message || 'Portfolio generated successfully!'}\n\n🤖 Powered by: ${aiProvider}${responseTime}${contextInfo}`;
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      
      // Provide user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      throw new Error(`Failed to generate portfolio: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isSending) return;
    
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = chatInput;
    setChatInput('');
    
    // Add typing indicator
    const typingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: 'Generating your portfolio...',
      isTyping: true,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, typingMessage]);
    
    try {
      const aiResponse = await generatePortfolioCode(currentMessage, false);
      
      // Remove typing indicator
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage = {
        id: Date.now() + 3,
        type: 'ai',
        content: `I apologize, but I encountered an error: ${error.message}\n\nPlease try again, or try a different description. If the problem persists, the AI services might be temporarily unavailable.`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleImprovement = async () => {
    if (!improvementInput.trim() || isSending) return;
    
    const improvementMessage = {
      id: Date.now(),
      type: 'user',
      content: `Improvement: ${improvementInput}`,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, improvementMessage]);
    setImprovementInput('');
    setShowImprovement(false);
    
    const typingMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: 'Improving your portfolio...',
      isTyping: true,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, typingMessage]);
    
    try {
      const aiResponse = await generatePortfolioCode(improvementInput, true);
      
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      setChatMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const errorMessage = {
        id: Date.now() + 3,
        type: 'ai',
        content: `Failed to improve the portfolio: ${error.message}\n\nPlease try again with a different improvement request.`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const updatePreview = () => {
    if (!iframeRef.current) return;
    
    try {
      const iframe = iframeRef.current;
      
      // Create complete HTML document
      const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Preview</title>
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    
    ${cssCode || `
    /* Default preview styles */
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .preview-placeholder {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 500px;
    }
    .preview-placeholder h2 {
      font-size: 2rem;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, #fff, #f0f0f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .preview-placeholder p {
      opacity: 0.8;
      line-height: 1.6;
    }
    `}
  </style>
</head>
<body>
  ${htmlCode || `
    <div class="preview-placeholder">
      <h2>✨ Portfolio Preview</h2>
      <p>Your stunning portfolio will appear here once generated. Describe what you'd like to create in the chat!</p>
    </div>
  `}
  
  <script>
    try {
      // Prevent any errors from breaking the preview
      ${jsCode || `
        console.log('Portfolio preview ready!');
        
        // Add some basic interactivity if no JS is provided
        document.addEventListener('DOMContentLoaded', function() {
          // Smooth scroll for any anchor links
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
        });
      `}
    } catch (error) {
      console.error('Preview JS Error:', error);
    }
  </script>
</body>
</html>`;
      
      // Force refresh by changing srcdoc
      iframe.srcdoc = '';
      setTimeout(() => {
        iframe.srcdoc = fullCode;
      }, 50);
      
    } catch (error) {
      console.error('Preview update error:', error);
    }
  };

  const refreshPreview = () => {
    console.log('🔄 Refreshing preview...');
    setPreviewKey(prev => prev + 1);
    
    // Force immediate update
    setTimeout(() => {
      updatePreview();
      console.log('✅ Preview refreshed');
    }, 100);
  };

  const copyCode = async () => {
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName}'s Portfolio</title>
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
  <script>
${jsCode}
  </script>
</body>
</html>`;
    
    await navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = async () => {
    const zip = new JSZip();
    
    zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName}'s Portfolio</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
${htmlCode}
  <script src="script.js"></script>
</body>
</html>`);
    
    zip.file('styles.css', cssCode);
    zip.file('script.js', jsCode);
    zip.file('README.md', `# ${userName}'s Portfolio

This portfolio was generated using AI Portfolio Builder.

## How to Use
1. Open index.html in your browser
2. Customize the content as needed
3. Deploy to your favorite hosting platform

## Deployment Options
- Netlify Drop
- Vercel
- GitHub Pages
- Any static hosting service
`);
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${userName.toLowerCase().replace(/\s+/g, '-')}-portfolio.zip`);
  };

  const deployToNetlify = () => {
    // Create a blob with the HTML content
    const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${userName}'s Portfolio</title>
  <style>${cssCode}</style>
</head>
<body>
${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;
    
    // Open Netlify Drop in new tab
    window.open('https://app.netlify.com/drop', '_blank');
    
    // Also download the file for easy drag-and-drop
    downloadCode();
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on'
  };

  // Name Input Screen
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E101A] via-[#1a1f3a] to-[#0E101A] text-white flex items-center justify-center p-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-44 -left-40 h-[520px] w-[520px] rounded-full bg-[#7C3AED]/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#EC4899]/20 blur-3xl" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-2xl w-full"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-4xl font-bold mb-6"
            >
              <Sparkles className="h-10 w-10" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] bg-clip-text text-transparent">
              AI Portfolio Builder
            </h1>
            <p className="text-xl text-white/70 mb-2">
              Create stunning portfolio websites with AI
            </p>
            <p className="text-white/50">
              Just describe what you want, and watch the magic happen ✨
            </p>
          </div>
          
          <div className="bg-[#121625]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            <label className="block text-sm font-medium mb-3 text-white/80">
              What's your name?
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStartBuilding()}
              placeholder="Enter your name..."
              className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#EC4899] transition-colors text-lg"
              autoFocus
            />
            
            <button
              onClick={handleStartBuilding}
              disabled={!userName.trim()}
              className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Start Building
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60 text-center mb-4">What you can create:</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                  Personal Portfolios
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  Developer Showcases
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                  Designer Portfolios
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  Business Websites
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Builder Interface
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white flex flex-col overflow-hidden">
      {/* Professional Header */}
      <header className="h-[60px] flex items-center justify-between px-6 border-b border-white/10 header-gradient flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #ff6b9d, #c44569)'
          }}>
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI Portfolio Builder</h1>
            <p className="text-xs text-gray-400">Powered by Advanced AI • Building for {userName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {chatMessages.length > 1 && (
            <button
              onClick={async () => {
                try {
                  await axiosClient.delete('/portfolio/context');
                  setChatMessages([{
                    id: Date.now(),
                    type: 'ai',
                    content: `Context cleared! I'm ready to help you create a fresh portfolio, ${userName}. What would you like to build?`,
                    timestamp: new Date()
                  }]);
                } catch (error) {
                  console.error('Failed to clear context:', error);
                }
              }}
              className="header-button px-3 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
              title="Clear conversation context"
            >
              <RefreshCw className="h-4 w-4" />
              New Chat
            </button>
          )}
          
          <button
            onClick={copyCode}
            className="header-button px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          
          <button
            onClick={downloadCode}
            className="header-button px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          
          <button
            onClick={deployToNetlify}
            className="deploy-button px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            Deploy
          </button>
        </div>
      </header>

      {/* Main 3-Panel Interface: Chat | Code Editor | Preview */}
      <div className="h-[calc(100vh-60px)] overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          
          {/* LEFT PANEL - Chat Section (35%) */}
          <Panel defaultSize={35} minSize={25} maxSize={45}>
            <div className="h-full flex flex-col glass-panel">
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10" style={{
                background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.5) 0%, rgba(236, 72, 153, 0.5) 100%)'
              }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #10b981, #3b82f6)'
                  }}>
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                    <p className="text-gray-300 text-xs">Describe your portfolio or ask for improvements</p>
                  </div>
                </div>
              </div>
          
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end message-user' : 'justify-start message-ai'}`}
                  >
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0" style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                      }} />
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg border ${
                        message.type === 'user'
                          ? 'text-white'
                          : message.isTyping
                          ? 'text-gray-300'
                          : 'text-gray-200'
                      }`}
                      style={{
                        background: message.type === 'user' 
                          ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                          : 'rgba(31, 41, 55, 0.6)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0" style={{
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                      }} />
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
          
              {/* Chat Input */}
              <div className="p-4 border-t border-white/10" style={{
                background: 'rgba(17, 24, 39, 0.5)'
              }}>
                {/* Context Indicator */}
                {chatMessages.length > 1 && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-purple-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>AI remembers our conversation context</span>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                    placeholder={chatMessages.length > 1 ? "Ask for improvements or changes..." : "Describe your portfolio..."}
                    className="flex-1 px-4 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none text-sm border focus:border-purple-500"
                    style={{
                      background: 'rgba(31, 41, 55, 0.6)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                    disabled={isSending}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim() || isSending}
                    className="px-4 py-2 rounded-lg text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)'
                    }}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Panel>
          
          {/* COOL RESIZABLE HANDLE */}
          <PanelResizeHandle className="resizable-handle-custom">
            <div className="resizable-handle-inner">
              <div className="handle-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </PanelResizeHandle>

          {/* MIDDLE PANEL - Code Editor (40%) */}
          <Panel defaultSize={40} minSize={30} maxSize={50}>
            <div className="h-full flex flex-col glass-panel-dark">
              {/* Code Editor Tabs */}
              <div className="flex border-b border-white/10" style={{
                background: 'rgba(17, 24, 39, 0.4)'
              }}>
                {[
                  { id: 'html', label: 'HTML', icon: FileCode },
                  { id: 'css', label: 'CSS', icon: Palette },
                  { id: 'js', label: 'JavaScript', icon: Code }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium transition-all relative ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={activeTab === tab.id ? {
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      borderRadius: '0'
                    } : {}}
                  >
                    <tab.icon className="h-4 w-4 inline mr-2" />
                    {tab.label}
                  </button>
                ))}
                
                <div className="ml-auto p-3 flex items-center gap-2">
                  {(isGeneratingHtml || isGeneratingCss || isGeneratingJs) && (
                    <div className="flex items-center gap-2 text-purple-400 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Generating...</span>
                    </div>
                  )}
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Expand Editor"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Generation Progress Bar */}
              {currentGenerationStep && generationProgress > 0 && (
                <div className="px-4 py-2 border-b border-white/10" style={{
                  background: 'rgba(139, 92, 246, 0.1)'
                }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-purple-300">{currentGenerationStep}</span>
                    <span className="text-xs text-purple-300">{generationProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-300 ease-out"
                      style={{
                        width: `${generationProgress}%`,
                        background: 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Monaco Code Editor */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'html' && (
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={htmlCode}
                    onChange={(value) => setHtmlCode(value || '')}
                    theme="vs-dark"
                    options={editorOptions}
                    loading={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>}
                  />
                )}
                
                {activeTab === 'css' && (
                  <Editor
                    height="100%"
                    defaultLanguage="css"
                    value={cssCode}
                    onChange={(value) => setCssCode(value || '')}
                    theme="vs-dark"
                    options={editorOptions}
                    loading={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>}
                  />
                )}
                
                {activeTab === 'js' && (
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    value={jsCode}
                    onChange={(value) => setJsCode(value || '')}
                    theme="vs-dark"
                    options={editorOptions}
                    loading={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-purple-400" /></div>}
                  />
                )}
              </div>
            </div>
          </Panel>
          
          {/* COOL RESIZABLE HANDLE 2 */}
          <PanelResizeHandle className="resizable-handle-custom">
            <div className="resizable-handle-inner">
              <div className="handle-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </PanelResizeHandle>

          {/* RIGHT PANEL - Live Preview (25%) */}
          <Panel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full flex flex-col glass-panel-light">
              {/* Preview Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10" style={{
                background: 'rgba(17, 24, 39, 0.4)'
              }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </span>
                </div>
                <button 
                  onClick={refreshPreview}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Refresh Preview"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 overflow-hidden" style={{ background: 'white' }}>
                {!htmlCode && !cssCode && !jsCode ? (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center text-gray-500 p-6">
                      <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))'
                      }}>
                        <Eye className="w-8 h-8 text-purple-400" />
                      </div>
                      <p className="text-sm font-medium">Preview</p>
                      <p className="text-xs mt-1 opacity-60">Your portfolio will appear here</p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    key={previewKey}
                    ref={iframeRef}
                    title="Portfolio Preview"
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    style={{ backgroundColor: 'white', display: 'block' }}
                  />
                )}
              </div>
            </div>
          </Panel>
          
        </PanelGroup>
      </div>
    </div>
  );
};

export default AIPortfolioBuilder;
