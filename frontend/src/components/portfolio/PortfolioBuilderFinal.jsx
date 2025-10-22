import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import {
  Upload,
  FileText,
  Eye,
  Download,
  Sparkles,
  Loader2,
  CheckCircle,
  MessageCircle,
  Send,
  X,
  User,
  Bot,
  RefreshCw
} from 'lucide-react';

const PortfolioBuilderFinal = () => {
  // Core states
  const [resumeData, setResumeData] = useState(null);
  const [portfolioHTML, setPortfolioHTML] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Step 1: Upload and Parse Resume
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Uploading and parsing resume...');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/portfolio/parse-resume', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('📄 Resume parsed:', result);

      if (result.success && result.data) {
        setResumeData(result.data);
        setProcessingStep('Resume parsed! Generating portfolio...');
        
        // Automatically generate portfolio
        await generatePortfolio(result.data);
        
        // Add welcome chat message
        setChatMessages([{
          type: 'bot',
          content: `Hi ${result.data.personal?.name || 'there'}! I've analyzed your resume. I can help you improve your portfolio. Try asking me to "improve my summary" or "add more skills".`,
          timestamp: new Date()
        }]);
        
      } else {
        throw new Error('Failed to parse resume');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Step 2: Generate Portfolio HTML
  const generatePortfolio = async (data = resumeData) => {
    if (!data) return;

    setIsProcessing(true);
    setProcessingStep('Generating your portfolio with AI...');

    try {
      const response = await fetch('/api/portfolio/generate-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioData: data,
          theme: 'modern'
        })
      });

      const result = await response.json();
      console.log('✅ Portfolio generated');

      if (result.success && result.htmlCode) {
        setPortfolioHTML(result.htmlCode);
        setProcessingStep('Portfolio generated successfully!');
        setTimeout(() => setProcessingStep(''), 2000);
      } else {
        throw new Error('Failed to generate portfolio');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 3: Handle Chat Messages
  const sendChatMessage = async () => {
    if (!chatInput.trim() || !resumeData) return;

    const userMessage = {
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          portfolioData: resumeData,
          portfolioId: 'default'
        })
      });

      const result = await response.json();
      console.log('💬 Chat response:', result);

      const botMessage = {
        type: 'bot',
        content: result.response?.content || 'I can help you improve your portfolio!',
        suggestions: result.response?.suggestions || [],
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, botMessage]);

      // If AI suggests improvements, apply them
      if (result.response?.actions?.length > 0) {
        // Handle actions here
        console.log('Actions to apply:', result.response.actions);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, {
        type: 'bot',
        content: 'Sorry, I had trouble processing that. Try asking: "Improve my summary" or "What should I add?"',
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Download Portfolio
  const downloadPortfolio = () => {
    const blob = new Blob([portfolioHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData?.personal?.name || 'portfolio'}-portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Regenerate Portfolio
  const regeneratePortfolio = () => {
    if (resumeData) {
      generatePortfolio(resumeData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      <div className={cn("max-w-7xl mx-auto", isChatOpen && "mr-96")}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Portfolio Builder
          </h1>
          <p className="text-xl text-gray-600">
            Upload your resume → AI generates your portfolio → Chat for improvements
          </p>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-blue-900 font-medium">{processingStep}</span>
            </CardContent>
          </Card>
        )}

        {/* Success Status */}
        {resumeData && !isProcessing && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900 font-medium">
                  Portfolio ready for {resumeData.personal?.name}!
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={regeneratePortfolio}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button size="sm" onClick={() => setIsChatOpen(true)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat for Improvements
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Upload or Resume Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {resumeData ? 'Your Resume Data' : 'Upload Resume'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!resumeData ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-all cursor-pointer hover:bg-blue-50"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Upload Your Resume
                  </h3>
                  <p className="text-gray-600 mb-4">
                    PDF or DOCX (Max 10MB)
                  </p>
                  <Button>Choose File</Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Name</h4>
                    <p className="text-lg">{resumeData.personal?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Contact</h4>
                    <p className="text-sm">{resumeData.personal?.email}</p>
                    <p className="text-sm">{resumeData.personal?.phone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills?.technical?.slice(0, 8).map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-1">Summary</h4>
                    <p className="text-sm text-gray-700">{resumeData.summary}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    Upload Different Resume
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Portfolio Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Portfolio Preview
                </span>
                {portfolioHTML && (
                  <Button size="sm" onClick={downloadPortfolio}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {portfolioHTML ? (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={portfolioHTML}
                    className="w-full h-[500px] border-0"
                    title="Portfolio Preview"
                  />
                </div>
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-gray-500 border-2 border-dashed rounded-lg">
                  <Sparkles className="w-12 h-12 mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Upload a resume to generate portfolio</p>
                  <p className="text-sm">AI will create a beautiful portfolio instantly</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Button */}
        {resumeData && !isChatOpen && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setIsChatOpen(true)}
              className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && resumeData && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Portfolio Assistant</h3>
                    <p className="text-xs opacity-90">Powered by Hugging Face</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3",
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3",
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100'
                  )}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => setChatInput(suggestion)}
                            className="block w-full text-left text-xs bg-white hover:bg-gray-50 px-2 py-1 rounded border"
                          >
                            💡 {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isChatLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Ask me to improve your portfolio..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isChatLoading}
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-3 py-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Improve my summary")}
                  className="text-xs flex-1"
                >
                  Improve Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatInput("Add more skills")}
                  className="text-xs flex-1"
                >
                  Add Skills
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioBuilderFinal;