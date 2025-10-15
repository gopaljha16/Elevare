import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Progress } from '../ui/Progress';
import { useToast } from '../ui/Toast';
import { cn } from '../../lib/utils';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { 
  SparklesIcon, 
  EyeIcon, 
  DownloadIcon, 
  EditIcon, 
  CopyIcon, 
  TrashIcon,
  TrendingUpIcon,
  CalendarIcon,
  LayoutTemplate
} from 'lucide-react';
import ErrorBoundary, { FeatureErrorBoundary } from '../ErrorBoundary';

const ResumeManagement = () => {
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('lastModified');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingResumes, setAnalyzingResumes] = useState(new Set());
  const { success, error } = useToast();
  const { getAnalysisStats } = useAIAnalysis();

  // Load resumes from API
  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load resumes');
      }

      const result = await response.json();
      
      // Enhanced resume data with AI analysis metadata
      const enhancedResumes = result.data.resumes.map(resume => ({
        ...resume,
        aiAnalysis: resume.aiAnalysis || null,
        lastAnalyzed: resume.lastAnalyzed || null,
        analysisScore: resume.aiAnalysis?.overallScore || null,
        improvementTrend: resume.improvementTrend || 0,
        templateName: getTemplateName(resume.templateId)
      }));

      setResumes(enhancedResumes);
    } catch (err) {
      error('Failed to load resumes: ' + err.message);
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        const mockResumes = [
          {
            id: 1,
            title: 'Software Engineer Resume',
            atsScore: 85,
            analysisScore: 88,
            lastModified: '2024-01-15',
            lastAnalyzed: '2024-01-14',
            views: 24,
            downloads: 5,
            templateId: 'modern',
            templateName: 'Modern',
            status: 'active',
            improvementTrend: 5,
            aiAnalysis: {
              overallScore: 88,
              strengths: ['Clear contact information', 'Good experience descriptions'],
              weaknesses: ['Missing quantifiable achievements', 'Could use more keywords']
            }
          },
          {
            id: 2,
            title: 'Frontend Developer CV',
            atsScore: 92,
            analysisScore: 94,
            lastModified: '2024-01-10',
            lastAnalyzed: '2024-01-09',
            views: 18,
            downloads: 3,
            templateId: 'classic',
            templateName: 'Classic',
            status: 'draft',
            improvementTrend: 2,
            aiAnalysis: {
              overallScore: 94,
              strengths: ['Excellent technical skills', 'Strong project portfolio'],
              weaknesses: ['Could improve formatting', 'Add more soft skills']
            }
          }
        ];
        setResumes(mockResumes);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplateName = (templateId) => {
    const templates = {
      modern: 'Modern',
      classic: 'Classic',
      creative: 'Creative',
      minimal: 'Minimal'
    };
    return templates[templateId] || 'Modern';
  };

  const filteredAndSortedResumes = resumes
    .filter(resume => {
      const matchesSearch = resume.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || resume.status === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'atsScore':
          return (b.atsScore || 0) - (a.atsScore || 0);
        case 'analysisScore':
          return (b.analysisScore || 0) - (a.analysisScore || 0);
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'lastAnalyzed':
          return new Date(b.lastAnalyzed || 0) - new Date(a.lastAnalyzed || 0);
        default:
          return new Date(b.lastModified) - new Date(a.lastModified);
      }
    });

  const handleSelectResume = (resumeId) => {
    setSelectedResumes(prev => 
      prev.includes(resumeId) 
        ? prev.filter(id => id !== resumeId)
        : [...prev, resumeId]
    );
  };

  const handleBulkAction = async (action) => {
    try {
      switch (action) {
        case 'delete':
          await Promise.all(selectedResumes.map(id => deleteResume(id)));
          setResumes(prev => prev.filter(resume => !selectedResumes.includes(resume.id)));
          success(`Deleted ${selectedResumes.length} resume(s)`);
          break;
        case 'duplicate':
          await Promise.all(selectedResumes.map(id => duplicateResume(id)));
          await loadResumes(); // Reload to get updated data
          success(`Duplicated ${selectedResumes.length} resume(s)`);
          break;
        case 'analyze':
          await Promise.all(selectedResumes.map(id => analyzeResume(id)));
          success(`Started AI analysis for ${selectedResumes.length} resume(s)`);
          break;
        default:
          break;
      }
    } catch (err) {
      error(`Failed to ${action} resumes: ${err.message}`);
    }
    setSelectedResumes([]);
  };

  const deleteResume = async (resumeId) => {
    const response = await fetch(`/api/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }
  };

  const duplicateResume = async (resumeId) => {
    const response = await fetch(`/api/resumes/${resumeId}/duplicate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to duplicate resume');
    }
  };

  const analyzeResume = async (resumeId) => {
    try {
      setAnalyzingResumes(prev => new Set([...prev, resumeId]));
      
      const resume = resumes.find(r => r.id === resumeId);
      if (!resume) return;

      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(resume)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const result = await response.json();
      
      // Update resume with analysis results
      setResumes(prev => prev.map(r => 
        r.id === resumeId 
          ? {
              ...r,
              aiAnalysis: result.data,
              analysisScore: result.data.overallScore,
              lastAnalyzed: new Date().toISOString()
            }
          : r
      ));

    } catch (err) {
      error(`Failed to analyze resume: ${err.message}`);
    } finally {
      setAnalyzingResumes(prev => {
        const newSet = new Set(prev);
        newSet.delete(resumeId);
        return newSet;
      });
    }
  };

  const handleEditResume = (resumeId) => {
    window.location.href = `/resume-builder?id=${resumeId}`;
  };

  const handlePreviewResume = (resumeId) => {
    window.open(`/resume-preview/${resumeId}`, '_blank');
  };

  const handleDownloadResume = async (resumeId) => {
    try {
      const response = await fetch(`/api/resumes/${resumeId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download resume');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume-${resumeId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      success('Resume downloaded successfully');
    } catch (err) {
      error(`Failed to download resume: ${err.message}`);
    }
  };

  const getATSScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getATSScoreBadge = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-6">
        <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                My Resumes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and optimize your professional resumes
              </p>
            </div>
            <Button variant="gradient" size="lg" onClick={() => window.location.href = '/resume-builder'}>
              Create New Resume
            </Button>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <Input
                    placeholder="Search resumes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="lastModified">Last Modified</option>
                    <option value="title">Title</option>
                    <option value="atsScore">ATS Score</option>
                    <option value="analysisScore">AI Analysis Score</option>
                    <option value="views">Views</option>
                    <option value="lastAnalyzed">Last Analyzed</option>
                  </select>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                
                {selectedResumes.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('analyze')}>
                      <SparklesIcon className="w-4 h-4 mr-1" />
                      Analyze ({selectedResumes.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('duplicate')}>
                      <CopyIcon className="w-4 h-4 mr-1" />
                      Duplicate ({selectedResumes.length})
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Delete ({selectedResumes.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resume Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredAndSortedResumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={cn(
                  "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer",
                  selectedResumes.includes(resume.id) && "ring-2 ring-blue-500"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {resume.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant={getATSScoreBadge(resume.atsScore)}>
                            ATS: {resume.atsScore || 0}%
                          </Badge>
                          {resume.analysisScore && (
                            <Badge variant={getATSScoreBadge(resume.analysisScore)} className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                              <SparklesIcon className="w-3 h-3 mr-1" />
                              AI: {resume.analysisScore}%
                            </Badge>
                          )}
                          <Badge variant="outline">
                            <LayoutTemplate className="w-3 h-3 mr-1" />
                            {resume.templateName}
                          </Badge>
                          <Badge variant={resume.status === 'active' ? 'success' : 'secondary'}>
                            {resume.status}
                          </Badge>
                          {resume.improvementTrend > 0 && (
                            <Badge variant="success" className="text-xs">
                              <TrendingUpIcon className="w-3 h-3 mr-1" />
                              +{resume.improvementTrend}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedResumes.includes(resume.id)}
                        onChange={() => handleSelectResume(resume.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* AI Analysis Progress */}
                      {resume.analysisScore && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              AI Analysis Score
                            </span>
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {resume.analysisScore}%
                            </span>
                          </div>
                          <Progress 
                            value={resume.analysisScore} 
                            className="h-2"
                            indicatorClassName="bg-gradient-to-r from-purple-500 to-blue-500"
                          />
                        </div>
                      )}

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center mb-3">
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{resume.views || 0}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">{resume.downloads || 0}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Downloads</div>
                        </div>
                        <div>
                          <div className={cn("text-lg font-bold", getATSScoreColor(resume.atsScore))}>
                            {resume.atsScore || 0}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ATS Score</div>
                        </div>
                      </div>

                      {/* AI Insights Preview */}
                      {resume.aiAnalysis && (
                        <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-xs font-medium text-purple-800 dark:text-purple-300 mb-1">
                            Latest AI Insights:
                          </div>
                          {resume.aiAnalysis.strengths?.slice(0, 1).map((strength, index) => (
                            <div key={index} className="text-xs text-green-600 dark:text-green-400">
                              ✓ {strength}
                            </div>
                          ))}
                          {resume.aiAnalysis.weaknesses?.slice(0, 1).map((weakness, index) => (
                            <div key={index} className="text-xs text-orange-600 dark:text-orange-400">
                              • {weakness}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          Modified: {new Date(resume.lastModified).toLocaleDateString()}
                        </div>
                        {resume.lastAnalyzed && (
                          <div className="flex items-center gap-1">
                            <SparklesIcon className="w-3 h-3" />
                            Analyzed: {new Date(resume.lastAnalyzed).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditResume(resume.id)}
                          >
                            <EditIcon className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handlePreviewResume(resume.id)}
                          >
                            <EyeIcon className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button 
                            variant="gradient" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleDownloadResume(resume.id)}
                          >
                            <DownloadIcon className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                        
                        {/* AI Analysis Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800"
                          onClick={() => analyzeResume(resume.id)}
                          disabled={analyzingResumes.has(resume.id)}
                        >
                          {analyzingResumes.has(resume.id) ? (
                            <>
                              <div className="w-3 h-3 mr-2 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="w-3 h-3 mr-1" />
                              {resume.lastAnalyzed ? 'Re-analyze with AI' : 'Analyze with AI'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedResumes.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No resumes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first resume to get started'}
            </p>
            <Button variant="gradient" onClick={() => window.location.href = '/resume-builder'}>
              Create Your First Resume
            </Button>
          </motion.div>
        )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ResumeManagement;