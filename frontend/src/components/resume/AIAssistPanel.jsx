import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { FormField } from '../ui/FormField';
import { cn } from '../../utils/cn';
import { 
  SparklesIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  SendIcon,
  BotIcon,
  UserIcon,
  WandIcon,
  TargetIcon,
  ZapIcon,
  BrainIcon
} from 'lucide-react';

/**
 * AI Assist Panel Component
 * 
 * Features:
 * - Interactive AI chat for resume improvement
 * - Section-specific suggestions
 * - Content generation and optimization
 * - ATS score improvement tips
 * - Real-time feedback
 * - One-click apply suggestions
 */
const AIAssistPanel = ({
  resumeData,
  aiAnalysis,
  onTriggerAnalysis,
  onUpdateResumeData,
  currentSection,
  className
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'suggestions', 'analysis'
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Initialize with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 1,
        type: 'ai',
        content: "Hi! I'm your AI resume assistant. I can help you improve your resume content, optimize for ATS, and provide personalized suggestions. What would you like to work on?",
        timestamp: new Date(),
        suggestions: [
          "Improve my professional summary",
          "Optimize for ATS scoring",
          "Enhance my work experience",
          "Add relevant skills"
        ]
      }]);
    }
  }, [chatMessages.length]);

  // AI service integration
  const sendMessage = useCallback(async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // Simulate AI response (replace with actual AI service call)
      const aiResponse = await generateAIResponse(message, resumeData, currentSection);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
        isError: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [resumeData, currentSection]);

  // Handle quick suggestions
  const handleQuickSuggestion = useCallback((suggestion) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Apply AI suggestion to resume
  const applySuggestion = useCallback((action) => {
    if (action.type === 'update_section') {
      onUpdateResumeData({ [action.section]: action.content });
    } else if (action.type === 'add_item') {
      const currentItems = resumeData[action.section] || [];
      onUpdateResumeData({ [action.section]: [...currentItems, action.item] });
    } else if (action.type === 'replace_text') {
      // Handle text replacement in specific fields
      const updates = { [action.field]: action.newText };
      onUpdateResumeData(updates);
    }
  }, [onUpdateResumeData, resumeData]);

  // Generate contextual suggestions based on current section
  const contextualSuggestions = useMemo(() => {
    const suggestions = {
      personal: [
        "Write a compelling professional summary",
        "Optimize my contact information",
        "Add a professional headline"
      ],
      experience: [
        "Improve my job descriptions",
        "Add quantifiable achievements",
        "Use stronger action verbs",
        "Optimize for ATS keywords"
      ],
      education: [
        "Highlight relevant coursework",
        "Add academic achievements",
        "Include certifications"
      ],
      skills: [
        "Add industry-relevant skills",
        "Organize skills by category",
        "Include skill proficiency levels"
      ],
      projects: [
        "Describe project impact",
        "Add technical details",
        "Highlight problem-solving"
      ]
    };

    return suggestions[currentSection] || [
      "Analyze my entire resume",
      "Improve ATS compatibility",
      "Enhance overall content"
    ];
  }, [currentSection]);

  // ATS Score visualization
  const atsScore = aiAnalysis?.data?.overallScore || 0;
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Tab content
  const tabs = [
    { id: 'chat', name: 'AI Chat', icon: MessageSquareIcon },
    { id: 'suggestions', name: 'Suggestions', icon: WandIcon },
    { id: 'analysis', name: 'Analysis', icon: TrendingUpIcon }
  ];

  return (
    <div className={cn("h-full flex flex-col bg-white dark:bg-gray-800", className)}>
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-500" />
            AI Assistant
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onTriggerAnalysis}
            disabled={aiAnalysis?.isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={cn("w-4 h-4", aiAnalysis?.isLoading && "animate-spin")} />
            Analyze
          </Button>
        </div>

        {/* ATS Score Display */}
        {atsScore > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ATS Score
              </span>
              <Badge className={cn("text-xs", getScoreColor(atsScore))}>
                {atsScore}/100
              </Badge>
            </div>
            <Progress value={atsScore} className="h-2" />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 text-xs"
              >
                <IconComponent className="w-3 h-3 mr-1" />
                {tab.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onSuggestionClick={handleQuickSuggestion}
                    onActionClick={applySuggestion}
                  />
                ))}
                
                {isProcessing && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <BotIcon className="w-4 h-4" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick Actions for {currentSection}:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {contextualSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSuggestion(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <FormField
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(inputMessage))}
                    placeholder="Ask me anything about your resume..."
                    className="flex-1"
                    variant="glass"
                  />
                  <Button
                    onClick={() => sendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isProcessing}
                    variant="gradient"
                    size="sm"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-auto p-4"
            >
              <SuggestionsPanel
                aiAnalysis={aiAnalysis}
                currentSection={currentSection}
                onApplySuggestion={applySuggestion}
              />
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-auto p-4"
            >
              <AnalysisPanel
                aiAnalysis={aiAnalysis}
                onTriggerAnalysis={onTriggerAnalysis}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Chat Message Component
 */
const ChatMessage = ({ message, onSuggestionClick, onActionClick }) => {
  const isAI = message.type === 'ai';
  
  return (
    <div className={cn("flex gap-3", isAI ? "justify-start" : "justify-end")}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
          <BotIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        isAI 
          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
          : "bg-blue-500 text-white ml-auto"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {/* Quick Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left text-xs justify-start"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.actions.map((action, index) => (
              <Button
                key={index}
                variant="gradient"
                size="sm"
                onClick={() => onActionClick(action)}
                className="w-full text-xs"
              >
                <ZapIcon className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        <div className="mt-2 text-xs opacity-70">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
      
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </div>
      )}
    </div>
  );
};

/**
 * Suggestions Panel Component
 */
const SuggestionsPanel = ({ aiAnalysis, currentSection, onApplySuggestion }) => {
  const suggestions = aiAnalysis?.data?.actionableFeedback || [];
  
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <WandIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Suggestions Yet
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          Run an AI analysis to get personalized suggestions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        AI Suggestions
      </h4>
      
      {suggestions.map((suggestion, index) => (
        <Card key={index} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2 mt-1">
                {suggestion.priority === 'high' && <AlertCircleIcon className="w-4 h-4 text-red-500" />}
                {suggestion.priority === 'medium' && <InfoIcon className="w-4 h-4 text-yellow-500" />}
                {suggestion.priority === 'low' && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant={
                      suggestion.priority === 'high' ? 'destructive' :
                      suggestion.priority === 'medium' ? 'warning' : 'secondary'
                    }
                    className="text-xs"
                  >
                    {suggestion.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-900 dark:text-white mb-2">
                  {suggestion.suggestion}
                </p>
                
                {suggestion.impact && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Impact: {suggestion.impact}
                  </p>
                )}
                
                {suggestion.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplySuggestion(suggestion.action)}
                    className="text-xs"
                  >
                    <ZapIcon className="w-3 h-3 mr-1" />
                    Apply Suggestion
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Analysis Panel Component
 */
const AnalysisPanel = ({ aiAnalysis, onTriggerAnalysis }) => {
  if (aiAnalysis?.isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
        <p className="text-gray-600 dark:text-gray-400">
          Analyzing your resume...
        </p>
      </div>
    );
  }

  if (!aiAnalysis?.data) {
    return (
      <div className="text-center py-8">
        <BrainIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Analysis Available
        </h4>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Run an AI analysis to get detailed insights about your resume
        </p>
        <Button onClick={onTriggerAnalysis} variant="gradient">
          <SparklesIcon className="w-4 h-4 mr-2" />
          Analyze Resume
        </Button>
      </div>
    );
  }

  const analysis = aiAnalysis.data;

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TargetIcon className="w-4 h-4" />
            Overall Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analysis.overallScore}/100
            </div>
            <Progress value={analysis.overallScore} className="mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Resume Quality Score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="w-4 h-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.slice(0, 5).map((strength, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Areas for Improvement */}
      {analysis.weaknesses && analysis.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <AlertCircleIcon className="w-4 h-4" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.slice(0, 5).map((weakness, index) => (
                <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Section Breakdown */}
      {analysis.sectionAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Section Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analysis.sectionAnalysis).map(([section, data]) => (
                <div key={section}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {data.score}/100
                    </Badge>
                  </div>
                  <Progress value={data.completeness} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Mock AI response generator (replace with actual AI service)
const generateAIResponse = async (message, resumeData, currentSection) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses = {
    "improve my professional summary": {
      content: "I can help you create a compelling professional summary. Based on your experience, here's an optimized version that highlights your key strengths and achievements.",
      actions: [{
        type: 'replace_text',
        field: 'summary',
        newText: 'Results-driven professional with 5+ years of experience in software development, specializing in full-stack web applications. Proven track record of delivering high-quality solutions that improve user experience and drive business growth.',
        label: 'Apply Improved Summary'
      }]
    },
    "optimize for ats scoring": {
      content: "I've analyzed your resume for ATS compatibility. Here are the key improvements that will boost your score:",
      suggestions: [
        "Add more industry keywords",
        "Use standard section headings",
        "Include quantifiable achievements",
        "Optimize formatting for parsing"
      ]
    },
    default: {
      content: "I understand you want to improve your resume. Could you be more specific about what section you'd like to focus on? I can help with content optimization, ATS scoring, keyword enhancement, and more.",
      suggestions: [
        "Improve my work experience descriptions",
        "Add relevant skills for my industry",
        "Optimize my resume for ATS systems",
        "Write a better professional summary"
      ]
    }
  };

  return responses[message.toLowerCase()] || responses.default;
};

export default React.memo(AIAssistPanel);