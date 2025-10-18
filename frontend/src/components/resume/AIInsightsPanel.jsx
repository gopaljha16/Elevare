import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { cn } from '../../utils/cn';
import { useResumeBuilder } from '../../contexts/ResumeBuilderContext';
import { 
  usePerformanceMonitor, 
  useOptimizedCallback, 
  useOptimizedMemo,
  useVirtualScrolling 
} from '../../utils/performance.jsx';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  RefreshCwIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InfoIcon,
  SparklesIcon
} from 'lucide-react';

/**
 * AIInsightsPanel Component
 * Displays AI analysis results with score visualization and actionable feedback
 * Optimized for performance with memoization and virtual scrolling
 */
const AIInsightsPanel = () => {
  const { 
    resumeData, 
    analysis, 
    isAnalyzing, 
    triggerAnalysis 
  } = useResumeBuilder();
  
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    sections: false,
    suggestions: false,
    feedback: true
  });
  
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  
  // Performance monitoring
  const { startTiming, endTiming } = usePerformanceMonitor('AIInsightsPanel');

  // Update last analysis time when analysis completes
  useEffect(() => {
    if (analysis.data && !analysis.isLoading) {
      setLastAnalysisTime(Date.now());
    }
  }, [analysis.data, analysis.isLoading]);

  // Optimized section toggle
  const toggleSection = useOptimizedCallback((section) => {
    startTiming('sectionToggle');
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    endTiming('sectionToggle');
  }, 100, [startTiming, endTiming]);

  // Optimized analysis trigger
  const handleAnalyze = useOptimizedCallback(async () => {
    startTiming('aiAnalysis');
    await triggerAnalysis();
    endTiming('aiAnalysis');
  }, 500, [triggerAnalysis, startTiming, endTiming]);

  // Memoized score color calculation
  const getScoreColor = useOptimizedMemo(() => {
    return (score) => {
      if (score >= 80) return 'text-green-600 dark:text-green-400';
      if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    };
  }, [], 'scoreColor');

  // Memoized score background calculation
  const getScoreBackground = useOptimizedMemo(() => {
    return (score) => {
      if (score >= 80) return 'bg-green-500';
      if (score >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    };
  }, [], 'scoreBackground');

  // Priority icon mapping
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
      case 'medium': return <InfoIcon className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default: return <InfoIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Category icon mapping
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'content': return '📝';
      case 'formatting': return '🎨';
      case 'keywords': return '🔍';
      case 'grammar': return '✏️';
      default: return '💡';
    }
  };

  const analysisData = analysis.data;
  const hasAnalysis = analysisData && !analysis.error;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-500" />
            AI Insights
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
        
        {lastAnalysisTime && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastAnalysisTime).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Loading State */}
        {isAnalyzing && (
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing your resume with AI...
            </p>
          </div>
        )}

        {/* Error State */}
        {analysis.error && !isAnalyzing && (
          <div className="p-6 text-center">
            <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Analysis Failed
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {analysis.error}
            </p>
            <Button onClick={handleAnalyze} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* No Analysis State */}
        {!hasAnalysis && !isAnalyzing && !analysis.error && (
          <div className="p-6 text-center">
            <SparklesIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Get AI Insights
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Analyze your resume to get personalized suggestions and improve your score.
            </p>
            <Button onClick={handleAnalyze} variant="gradient">
              Analyze Resume
            </Button>
          </div>
        )}

        {/* Analysis Results */}
        {hasAnalysis && !isAnalyzing && (
          <div className="p-4 space-y-4">
            {/* Overall Score Section */}
            <CollapsibleSection
              title="Overall Score"
              isExpanded={expandedSections.overview}
              onToggle={() => toggleSection('overview')}
              icon={<TrendingUpIcon className="w-5 h-5" />}
            >
              <div className="space-y-4">
                {/* Main Score */}
                <div className="text-center">
                  <div className={cn(
                    "text-4xl font-bold mb-2",
                    getScoreColor(analysisData.overallScore)
                  )}>
                    {analysisData.overallScore}/100
                  </div>
                  <Progress 
                    value={analysisData.overallScore} 
                    className="h-3 mb-2"
                    indicatorClassName={getScoreBackground(analysisData.overallScore)}
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resume Quality Score
                  </p>
                </div>

                {/* Strengths and Weaknesses */}
                {analysisData.strengths && analysisData.strengths.length > 0 && (
                  <div>
                    <h5 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4" />
                      Strengths
                    </h5>
                    <ul className="space-y-1">
                      {analysisData.strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisData.weaknesses && analysisData.weaknesses.length > 0 && (
                  <div>
                    <h5 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                      <AlertCircleIcon className="w-4 h-4" />
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-1">
                      {analysisData.weaknesses.slice(0, 3).map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Section Analysis */}
            {analysisData.sectionAnalysis && (
              <CollapsibleSection
                title="Section Breakdown"
                isExpanded={expandedSections.sections}
                onToggle={() => toggleSection('sections')}
                icon={<span className="text-lg">📊</span>}
              >
                <div className="space-y-4">
                  {Object.entries(analysisData.sectionAnalysis).map(([section, data]) => (
                    <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                          {section.replace(/([A-Z])/g, ' $1').trim()}
                        </h5>
                        <Badge 
                          variant={data.score >= 80 ? "success" : data.score >= 60 ? "warning" : "destructive"}
                          className="text-xs"
                        >
                          {data.score}/100
                        </Badge>
                      </div>
                      
                      <Progress 
                        value={data.completeness} 
                        className="h-2 mb-2"
                        indicatorClassName={getScoreBackground(data.completeness)}
                      />
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {data.completeness}% complete
                      </p>
                      
                      {data.suggestions && data.suggestions.length > 0 && (
                        <ul className="space-y-1">
                          {data.suggestions.slice(0, 2).map((suggestion, index) => (
                            <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Quick Suggestions */}
            {(analysisData.grammarSuggestions?.length > 0 || 
              analysisData.keywordSuggestions?.length > 0 || 
              analysisData.atsOptimization?.length > 0) && (
              <CollapsibleSection
                title="Quick Fixes"
                isExpanded={expandedSections.suggestions}
                onToggle={() => toggleSection('suggestions')}
                icon={<span className="text-lg">⚡</span>}
              >
                <div className="space-y-3">
                  {analysisData.grammarSuggestions?.length > 0 && (
                    <SuggestionGroup
                      title="Grammar & Language"
                      icon="✏️"
                      suggestions={analysisData.grammarSuggestions.slice(0, 3)}
                      color="text-purple-600 dark:text-purple-400"
                    />
                  )}
                  
                  {analysisData.keywordSuggestions?.length > 0 && (
                    <SuggestionGroup
                      title="Keywords"
                      icon="🔍"
                      suggestions={analysisData.keywordSuggestions.slice(0, 3)}
                      color="text-blue-600 dark:text-blue-400"
                    />
                  )}
                  
                  {analysisData.atsOptimization?.length > 0 && (
                    <SuggestionGroup
                      title="ATS Optimization"
                      icon="🎯"
                      suggestions={analysisData.atsOptimization.slice(0, 3)}
                      color="text-green-600 dark:text-green-400"
                    />
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Actionable Feedback */}
            {analysisData.actionableFeedback && analysisData.actionableFeedback.length > 0 && (
              <CollapsibleSection
                title="Detailed Feedback"
                isExpanded={expandedSections.feedback}
                onToggle={() => toggleSection('feedback')}
                icon={<span className="text-lg">💡</span>}
              >
                <div className="space-y-3">
                  {analysisData.actionableFeedback.slice(0, 5).map((feedback, index) => (
                    <div 
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 mt-0.5">
                          {getPriorityIcon(feedback.priority)}
                          <span className="text-lg">{getCategoryIcon(feedback.category)}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant={
                                feedback.priority === 'high' ? 'destructive' :
                                feedback.priority === 'medium' ? 'warning' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {feedback.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {feedback.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-900 dark:text-white mb-1">
                            {feedback.suggestion}
                          </p>
                          
                          {feedback.impact && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Impact: {feedback.impact}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Next Steps */}
            {analysisData.nextSteps && analysisData.nextSteps.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Next Steps
                </h5>
                <ul className="space-y-1">
                  {analysisData.nextSteps.slice(0, 3).map((step, index) => (
                    <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                      <span className="text-blue-500 mt-1 font-bold">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Industry Alignment */}
            {analysisData.industryAlignment && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  Industry Alignment
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {analysisData.industryAlignment}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Collapsible Section Component
 */
const CollapsibleSection = ({ title, children, isExpanded, onToggle, icon }) => {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader 
        className="pb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={onToggle}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </CardTitle>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              {children}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

/**
 * Suggestion Group Component
 */
const SuggestionGroup = ({ title, icon, suggestions, color }) => {
  return (
    <div>
      <h6 className={cn("font-medium mb-2 flex items-center gap-2", color)}>
        <span>{icon}</span>
        {title}
      </h6>
      <ul className="space-y-1">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <span className={cn("mt-1", color)}>•</span>
            {suggestion}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(AIInsightsPanel);