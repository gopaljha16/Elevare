import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CircularProgress, AnimatedProgress } from '../ui/Progress';
import { useToast } from '../ui/Toast';
import { cn } from '../../utils/cn';

const AIOptimization = ({ resumeId }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([]);
  const { success, error } = useToast();

  const mockAnalysisResults = {
    atsScore: 78,
    previousScore: 65,
    improvement: 13,
    breakdown: {
      keywords: 85,
      formatting: 72,
      sections: 90,
      length: 65
    },
    suggestions: [
      {
        id: 1,
        type: 'keyword',
        priority: 'high',
        title: 'Add missing keywords',
        description: 'Include "React", "Node.js", and "TypeScript" to match job requirements',
        impact: '+8 ATS points',
        accepted: false
      },
      {
        id: 2,
        type: 'formatting',
        priority: 'medium',
        title: 'Improve bullet points',
        description: 'Use action verbs and quantify achievements with numbers',
        impact: '+5 ATS points',
        accepted: false
      },
      {
        id: 3,
        type: 'content',
        priority: 'high',
        title: 'Add technical skills section',
        description: 'Create a dedicated technical skills section with relevant technologies',
        impact: '+7 ATS points',
        accepted: false
      }
    ],
    missingSkills: [
      'React.js', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'GraphQL'
    ],
    matchPercentage: 72
  };

  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnalysisResults(mockAnalysisResults);
      setOptimizationSuggestions(mockAnalysisResults.suggestions);
      setIsAnalyzing(false);
      success('Resume analysis completed!');
    }, 3000);
  };

  const handleJobDescriptionAnalysis = async () => {
    if (!jobDescription.trim()) {
      error('Please enter a job description');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate job matching analysis
    setTimeout(() => {
      const updatedResults = {
        ...mockAnalysisResults,
        matchPercentage: Math.floor(Math.random() * 30) + 60,
        missingSkills: ['React.js', 'AWS', 'Kubernetes', 'MongoDB']
      };
      setAnalysisResults(updatedResults);
      setIsAnalyzing(false);
      success('Job description analysis completed!');
    }, 2000);
  };

  const handleAcceptSuggestion = (suggestionId) => {
    setOptimizationSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === suggestionId 
          ? { ...suggestion, accepted: true }
          : suggestion
      )
    );
    success('Suggestion applied to resume');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      
      {/* ATS Score Analysis */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ATS Score Analysis</span>
            <Button 
              variant="gradient" 
              onClick={handleAnalyzeResume}
              loading={isAnalyzing}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Analyzing your resume with AI...</p>
            </div>
          ) : analysisResults ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <CircularProgress value={analysisResults.atsScore} size={120} />
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-gray-500">Previous:</span>
                      <span className="text-sm font-medium">{analysisResults.previousScore}%</span>
                      <Badge variant="success" className="text-xs">
                        +{analysisResults.improvement}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysisResults.breakdown).map(([category, score]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className={cn("text-2xl font-bold", getScoreColor(score))}>
                      {score}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🤖</div>
              <p className="text-gray-600 dark:text-gray-400">
                Click "Analyze Resume" to get AI-powered optimization suggestions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description Matching */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle>Job Description Matching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to analyze match percentage and missing skills..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleJobDescriptionAnalysis}
            loading={isAnalyzing}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="w-full"
          >
            Analyze Job Match
          </Button>

          {analysisResults && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {analysisResults.matchPercentage}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Job Description Match
                </div>
                <AnimatedProgress value={analysisResults.matchPercentage} showValue className="mt-4" />
              </div>

              {/* Missing Skills */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResults.missingSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-red-600 border-red-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle>AI Optimization Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <AnimatePresence>
                {optimizationSuggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "p-4 border rounded-lg transition-all duration-200",
                      suggestion.accepted 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <Badge variant="outline">
                            {suggestion.impact}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {suggestion.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {suggestion.description}
                        </p>
                      </div>
                      
                      <div className="ml-4">
                        {suggestion.accepted ? (
                          <Badge variant="success">
                            ✓ Applied
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcceptSuggestion(suggestion.id)}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Before/After Comparison */}
      {analysisResults && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
          <CardHeader>
            <CardTitle>Before vs After Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Before</h4>
                <CircularProgress value={analysisResults.previousScore} size={100} />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  ATS Score: {analysisResults.previousScore}%
                </div>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">After</h4>
                <CircularProgress value={analysisResults.atsScore} size={100} />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  ATS Score: {analysisResults.atsScore}%
                </div>
                <Badge variant="success" className="mt-2">
                  +{analysisResults.improvement}% improvement
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIOptimization;