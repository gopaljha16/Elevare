import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

/**
 * AI Assistant Panel - Overleaf Style
 * Provides AI-powered suggestions and content generation
 */
const AIAssistantPanel = ({ 
  suggestions = [], 
  insights = null, 
  onApplySuggestion, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'ai',
      message: "Hi! I'm your AI resume assistant. I can help you improve your LaTeX resume with suggestions for content, formatting, and ATS optimization.",
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: 'suggestions', name: 'Suggestions', icon: '💡' },
    { id: 'chat', name: 'AI Chat', icon: '💬' },
    { id: 'analysis', name: 'Analysis', icon: '📊' },
    { id: 'templates', name: 'Templates', icon: '📄' }
  ];

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      type: 'user',
      message: chatMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsProcessing(true);

    try {
      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiResponse = {
          type: 'ai',
          message: generateAIResponse(chatMessage),
          timestamp: new Date()
        };
        setChatHistory(prev => [...prev, aiResponse]);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Assistant
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 text-xs"
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'suggestions' && (
          <SuggestionsTab 
            suggestions={suggestions}
            onApplySuggestion={onApplySuggestion}
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatTab 
            chatHistory={chatHistory}
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        )}
        
        {activeTab === 'analysis' && (
          <AnalysisTab insights={insights} />
        )}
        
        {activeTab === 'templates' && (
          <TemplatesTab onApplySuggestion={onApplySuggestion} />
        )}
      </div>
    </div>
  );
};

/**
 * Suggestions Tab Component
 */
const SuggestionsTab = ({ suggestions, onApplySuggestion }) => {
  const defaultSuggestions = [
    {
      title: "Add Professional Summary",
      description: "Include a compelling professional summary at the top of your resume",
      code: "\\section{Professional Summary}\n\\cvitem{}{Results-driven software engineer with 5+ years of experience in full-stack development...}",
      category: "content",
      priority: "high"
    },
    {
      title: "Improve Section Formatting",
      description: "Use consistent formatting for all sections",
      code: "\\section{Experience}\n\\cventry{2020--Present}{Senior Developer}{Tech Corp}{San Francisco}{}{%\n\\begin{itemize}\n\\item Led development of microservices architecture\n\\item Improved system performance by 40\\%\n\\end{itemize}}",
      category: "formatting",
      priority: "medium"
    },
    {
      title: "Add Skills Section",
      description: "Highlight your technical skills with proper LaTeX formatting",
      code: "\\section{Technical Skills}\n\\cvitem{Languages}{JavaScript, Python, Java, C++}\n\\cvitem{Frameworks}{React, Node.js, Django, Spring}\n\\cvitem{Tools}{Git, Docker, AWS, Jenkins}",
      category: "content",
      priority: "high"
    }
  ];

  const allSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="p-4 space-y-4 overflow-auto">
      <h4 className="font-semibold text-gray-900">AI Suggestions</h4>
      
      {allSuggestions.map((suggestion, index) => (
        <SuggestionCard 
          key={index}
          suggestion={suggestion}
          onApply={() => onApplySuggestion(suggestion)}
        />
      ))}
    </div>
  );
};

/**
 * Chat Tab Component
 */
const ChatTab = ({ 
  chatHistory, 
  chatMessage, 
  setChatMessage, 
  onSendMessage, 
  isProcessing 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        
        {isProcessing && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder="Ask me about your resume..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button 
            onClick={onSendMessage}
            disabled={!chatMessage.trim() || isProcessing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Analysis Tab Component
 */
const AnalysisTab = ({ insights }) => {
  const defaultInsights = {
    overallScore: 85,
    strengths: [
      "Good use of LaTeX formatting",
      "Clear section structure",
      "Professional layout"
    ],
    improvements: [
      "Add more quantifiable achievements",
      "Include relevant keywords",
      "Optimize for ATS compatibility"
    ],
    atsScore: 78
  };

  const data = insights || defaultInsights;

  return (
    <div className="p-4 space-y-6 overflow-auto">
      {/* Overall Score */}
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {data.overallScore}/100
        </div>
        <p className="text-gray-600">Overall Resume Score</p>
      </div>

      {/* ATS Score */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h5 className="font-semibold text-gray-900 mb-2">ATS Compatibility</h5>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${data.atsScore}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">{data.atsScore}%</span>
        </div>
      </div>

      {/* Strengths */}
      <div>
        <h5 className="font-semibold text-green-700 mb-2 flex items-center">
          <span className="mr-2">✅</span>
          Strengths
        </h5>
        <ul className="space-y-1">
          {data.strengths.map((strength, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-green-500 mr-2">•</span>
              {strength}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div>
        <h5 className="font-semibold text-orange-700 mb-2 flex items-center">
          <span className="mr-2">🔧</span>
          Areas for Improvement
        </h5>
        <ul className="space-y-1">
          {data.improvements.map((improvement, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              {improvement}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Templates Tab Component
 */
const TemplatesTab = ({ onApplySuggestion }) => {
  const templates = [
    {
      name: "Modern Professional",
      description: "Clean, modern design with blue accents",
      code: "% Modern Professional Template\n\\documentclass[11pt,a4paper,sans]{moderncv}\n\\moderncvstyle{banking}\n\\moderncvcolor{blue}",
      preview: "🎨"
    },
    {
      name: "Academic",
      description: "Traditional academic CV format",
      code: "% Academic Template\n\\documentclass[11pt,a4paper]{article}\n\\usepackage{academicCV}",
      preview: "🎓"
    },
    {
      name: "Tech Resume",
      description: "Optimized for software engineering roles",
      code: "% Tech Resume Template\n\\documentclass[letterpaper,11pt]{article}\n\\usepackage{techresume}",
      preview: "💻"
    }
  ];

  return (
    <div className="p-4 space-y-4 overflow-auto">
      <h4 className="font-semibold text-gray-900">LaTeX Templates</h4>
      
      {templates.map((template, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{template.preview}</span>
              <div>
                <h5 className="font-medium text-gray-900">{template.name}</h5>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onApplySuggestion(template)}
            className="w-full mt-2"
          >
            Apply Template
          </Button>
        </div>
      ))}
    </div>
  );
};

/**
 * Suggestion Card Component
 */
const SuggestionCard = ({ suggestion, onApply }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          getPriorityColor(suggestion.priority)
        )}>
          {suggestion.priority}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onApply}
        className="w-full"
      >
        Apply Suggestion
      </Button>
    </div>
  );
};

/**
 * Chat Message Component
 */
const ChatMessage = ({ message }) => {
  const isAI = message.type === 'ai';
  
  return (
    <div className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">🤖</span>
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        isAI 
          ? "bg-gray-100 text-gray-900" 
          : "bg-blue-500 text-white ml-auto"
      )}>
        <p className="text-sm">{message.message}</p>
        <div className="mt-1 text-xs opacity-70">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">👤</span>
        </div>
      )}
    </div>
  );
};

// Helper function to generate AI responses
const generateAIResponse = (userMessage) => {
  const responses = {
    "help": "I can help you with LaTeX formatting, content suggestions, and ATS optimization. What specific area would you like to improve?",
    "format": "For better formatting, try using \\cventry for experience sections and \\cvitem for skills. Would you like me to show you an example?",
    "ats": "To improve ATS compatibility, use standard section headers like 'Experience', 'Education', and 'Skills'. Avoid complex formatting and stick to common fonts.",
    "default": "I understand you want to improve your resume. Could you be more specific about what you'd like help with? I can assist with content, formatting, or ATS optimization."
  };

  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('help')) return responses.help;
  if (lowerMessage.includes('format')) return responses.format;
  if (lowerMessage.includes('ats')) return responses.ats;
  
  return responses.default;
};

export default AIAssistantPanel;