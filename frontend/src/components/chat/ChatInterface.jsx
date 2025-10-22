import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import chatService from '../../services/chatService';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  Lightbulb,
  Code,
  Palette,
  Zap,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const ChatInterface = ({ 
  portfolioData, 
  onPortfolioUpdate, 
  onSuggestionApply,
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm your AI portfolio assistant. I can help you improve your portfolio, suggest content, answer questions, and provide personalized recommendations. What would you like to work on?",
      timestamp: new Date(),
      suggestions: [
        "Improve my portfolio summary",
        "Suggest missing sections",
        "Help with project descriptions",
        "Optimize for my industry"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to AI service
      const response = await chatService.sendMessage(message, portfolioData, 'default', {
        currentSection: 'portfolio-builder',
        userIntent: 'portfolio-improvement'
      });
      
      const aiResponse = response.success ? response.data : response.data; // Fallback data
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions,
        isError: !response.success
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update chat history
      setChatHistory(prev => [...prev, userMessage, botMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };





  const applySuggestion = (action) => {
    if (action.type === 'update_summary' && onPortfolioUpdate) {
      onPortfolioUpdate({
        ...portfolioData,
        summary: action.data
      });
    }
    
    if (onSuggestionApply) {
      onSuggestionApply(action);
    }
  };

  const clearChat = async () => {
    try {
      await chatService.clearChatHistory('default');
      setMessages([messages[0]]); // Keep welcome message
      setChatHistory([]);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      // Still clear locally even if server fails
      setMessages([messages[0]]);
      setChatHistory([]);
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          onClick={onToggleMinimize}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 z-40 flex flex-col"
    >
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI Portfolio Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="text-white hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : message.isError
                    ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    : 'bg-gray-100 dark:bg-gray-800'
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.suggestions && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(suggestion)}
                        className="w-full text-left justify-start text-xs"
                      >
                        <Lightbulb className="w-3 h-3 mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                )}
                
                {message.actions && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        onClick={() => applySuggestion(action)}
                        className="w-full text-xs bg-green-500 hover:bg-green-600"
                      >
                        <Zap className="w-3 h-3 mr-2" />
                        Apply Change
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.type === 'bot' && !message.isError && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your portfolio..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("Improve my portfolio summary")}
            className="text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Improve Summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendMessage("What sections am I missing?")}
            className="text-xs"
          >
            <Code className="w-3 h-3 mr-1" />
            Missing Sections
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatInterface;