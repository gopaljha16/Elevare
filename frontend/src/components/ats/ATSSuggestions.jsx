import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  SparklesIcon,
  KeyIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ATSSuggestions = ({ analysisData }) => {
  const [copiedSuggestion, setCopiedSuggestion] = useState(null);
  
  const { 
    recommendations = [], 
    keywordSuggestions = [], 
    grammarSuggestions = [], 
    atsOptimization = [],
    actionableFeedback = [],
    nextSteps = []
  } = analysisData;

  const handleCopySuggestion = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedSuggestion(index);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  const priorityColors = {
    high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' }
  };

  const SuggestionCard = ({ suggestion, index, type = 'general' }) => {
    const isActionable = suggestion.priority && suggestion.category;
    const priority = isActionable ? suggestion.priority : 'medium';
    const colors = priorityColors[priority];

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {isActionable && (
                <Badge variant={priority === 'high' ? 'destructive' : priority === 'medium' ? 'warning' : 'default'} size="sm">
                  {priority.toUpperCase()}
                </Badge>
              )}
              {isActionable && suggestion.category && (
                <Badge variant="outline" size="sm">
                  {suggestion.category}
                </Badge>
              )}
            </div>
            
            <p className={`font-medium ${colors.text}`}>
              {isActionable ? suggestion.suggestion : suggestion}
            </p>
            
            {isActionable && suggestion.impact && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Impact:</span> {suggestion.impact}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopySuggestion(isActionable ? suggestion.suggestion : suggestion, `${type}-${index}`)}
            className="flex-shrink-0"
          >
            {copiedSuggestion === `${type}-${index}` ? (
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
            ) : (
              <ClipboardDocumentCheckIcon className="w-4 h-4" />
            )}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-yellow-500" />
          Improvement Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="actionable" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="actionable" className="flex items-center gap-1">
              <SparklesIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Priority</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="flex items-center gap-1">
              <KeyIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="format" className="flex items-center gap-1">
              <DocumentTextIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Format</span>
            </TabsTrigger>
            <TabsTrigger value="next" className="flex items-center gap-1">
              <ArrowRightIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Next Steps</span>
            </TabsTrigger>
          </TabsList>

          {/* Priority Suggestions */}
          <TabsContent value="actionable" className="space-y-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Priority Improvements
              </h3>
            </div>
            
            {actionableFeedback.length > 0 ? (
              <div className="space-y-3">
                {actionableFeedback.map((feedback, index) => (
                  <SuggestionCard 
                    key={index} 
                    suggestion={feedback} 
                    index={index} 
                    type="actionable"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Great job! No high-priority issues found.</p>
              </div>
            )}
          </TabsContent>

          {/* Keyword Suggestions */}
          <TabsContent value="keywords" className="space-y-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <KeyIcon className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Keyword Optimization
              </h3>
            </div>
            
            {keywordSuggestions.length > 0 ? (
              <div className="space-y-3">
                {keywordSuggestions.map((suggestion, index) => (
                  <SuggestionCard 
                    key={index} 
                    suggestion={suggestion} 
                    index={index} 
                    type="keywords"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <KeyIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Your keyword usage looks good!</p>
              </div>
            )}
          </TabsContent>

          {/* Format & ATS Optimization */}
          <TabsContent value="format" className="space-y-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Format & ATS Optimization
              </h3>
            </div>
            
            <div className="space-y-4">
              {atsOptimization.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">ATS Compatibility</h4>
                  {atsOptimization.map((suggestion, index) => (
                    <SuggestionCard 
                      key={index} 
                      suggestion={suggestion} 
                      index={index} 
                      type="ats"
                    />
                  ))}
                </div>
              )}
              
              {grammarSuggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Grammar & Language</h4>
                  {grammarSuggestions.map((suggestion, index) => (
                    <SuggestionCard 
                      key={index} 
                      suggestion={suggestion} 
                      index={index} 
                      type="grammar"
                    />
                  ))}
                </div>
              )}
            </div>
            
            {atsOptimization.length === 0 && grammarSuggestions.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Your resume format looks great!</p>
              </div>
            )}
          </TabsContent>

          {/* Next Steps */}
          <TabsContent value="next" className="space-y-4 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightIcon className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recommended Next Steps
              </h3>
            </div>
            
            {nextSteps.length > 0 ? (
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>You're all set! Your resume is well-optimized.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ATSSuggestions;