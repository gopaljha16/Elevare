import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../components/ui/Toast';
import { 
  analyzeResume,
  selectAnalysis,
  selectIsAnalyzing,
  setAnalysisHistory,
  addAnalysisToHistory
} from '../store/slices/resumeBuilderSlice';

/**
 * Custom hook for AI analysis integration
 * Provides comprehensive AI analysis functionality with caching, history, and auto-analysis
 */
export const useAIAnalysis = () => {
  const dispatch = useDispatch();
  const { success, error: showError } = useToast();
  
  // Redux state
  const analysis = useSelector(selectAnalysis);
  const isAnalyzing = useSelector(selectIsAnalyzing);
  
  // Local state
  const [analysisHistory, setAnalysisHistoryLocal] = useState([]);
  const [autoAnalyzeEnabled, setAutoAnalyzeEnabled] = useState(true);
  const [lastAnalyzedData, setLastAnalyzedData] = useState(null);
  const [analysisCache, setAnalysisCache] = useState(new Map());
  
  // Refs for managing timers and preventing memory leaks
  const autoAnalyzeTimeoutRef = useRef(null);
  const analysisRequestIdRef = useRef(0);
  
  // Configuration
  const AUTO_ANALYZE_DELAY = 3000; // 3 seconds after significant changes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const MAX_HISTORY_ITEMS = 10;
  
  /**
   * Generate cache key from resume data
   * @param {Object} resumeData - Resume data object
   * @returns {string} - Cache key
   */
  const generateCacheKey = useCallback((resumeData) => {
    const keyData = {
      personalInfo: resumeData.personalInfo,
      experience: resumeData.experience,
      education: resumeData.education,
      skills: resumeData.skills,
      projects: resumeData.projects,
      achievements: resumeData.achievements
    };
    return JSON.stringify(keyData);
  }, []);
  
  /**
   * Check if resume data has significant changes
   * @param {Object} newData - New resume data
   * @param {Object} oldData - Previous resume data
   * @returns {boolean} - Whether there are significant changes
   */
  const hasSignificantChanges = useCallback((newData, oldData) => {
    if (!oldData) return true;
    
    const significantFields = [
      'personalInfo.firstName',
      'personalInfo.lastName',
      'personalInfo.email',
      'experience',
      'education',
      'skills',
      'projects',
      'achievements'
    ];
    
    return significantFields.some(field => {
      const fieldPath = field.split('.');
      const newValue = fieldPath.reduce((obj, key) => obj?.[key], newData);
      const oldValue = fieldPath.reduce((obj, key) => obj?.[key], oldData);
      
      if (Array.isArray(newValue) && Array.isArray(oldValue)) {
        return JSON.stringify(newValue) !== JSON.stringify(oldValue);
      }
      
      return newValue !== oldValue;
    });
  }, []);
  
  /**
   * Get cached analysis result
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} - Cached analysis or null
   */
  const getCachedAnalysis = useCallback((cacheKey) => {
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [analysisCache]);
  
  /**
   * Set cached analysis result
   * @param {string} cacheKey - Cache key
   * @param {Object} analysisData - Analysis data to cache
   */
  const setCachedAnalysis = useCallback((cacheKey, analysisData) => {
    setAnalysisCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cacheKey, {
        data: analysisData,
        timestamp: Date.now()
      });
      
      // Limit cache size
      if (newCache.size > 20) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }
      
      return newCache;
    });
  }, []);
  
  /**
   * Perform AI analysis
   * @param {Object} resumeData - Resume data to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Analysis result
   */
  const performAnalysis = useCallback(async (resumeData, options = {}) => {
    const {
      useCache = true,
      addToHistory = true,
      showToast = true
    } = options;
    
    try {
      // Generate cache key
      const cacheKey = generateCacheKey(resumeData);
      
      // Check cache first
      if (useCache) {
        const cachedResult = getCachedAnalysis(cacheKey);
        if (cachedResult) {
          if (showToast) {
            success('Analysis loaded from cache');
          }
          return cachedResult;
        }
      }
      
      // Generate unique request ID to handle concurrent requests
      const requestId = ++analysisRequestIdRef.current;
      
      // Perform analysis
      const result = await dispatch(analyzeResume(resumeData)).unwrap();
      
      // Check if this is still the latest request
      if (requestId !== analysisRequestIdRef.current) {
        return null; // Ignore outdated requests
      }
      
      // Cache the result
      if (useCache) {
        setCachedAnalysis(cacheKey, result);
      }
      
      // Add to history
      if (addToHistory) {
        const historyItem = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          resumeData: { ...resumeData },
          analysis: result,
          overallScore: result.overallScore,
          cacheKey
        };
        
        setAnalysisHistoryLocal(prev => {
          const newHistory = [historyItem, ...prev.slice(0, MAX_HISTORY_ITEMS - 1)];
          dispatch(setAnalysisHistory(newHistory));
          return newHistory;
        });
      }
      
      // Update last analyzed data
      setLastAnalyzedData(resumeData);
      
      if (showToast) {
        success(`Analysis completed! Score: ${result.overallScore}/100`);
      }
      
      return result;
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      if (showToast) {
        showError(`Analysis failed: ${error.message || 'Unknown error'}`);
      }
      
      throw error;
    }
  }, [
    dispatch, 
    generateCacheKey, 
    getCachedAnalysis, 
    setCachedAnalysis, 
    success, 
    showError
  ]);
  
  /**
   * Trigger manual analysis
   * @param {Object} resumeData - Resume data to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Analysis result
   */
  const triggerAnalysis = useCallback(async (resumeData, options = {}) => {
    return performAnalysis(resumeData, {
      useCache: false, // Force fresh analysis for manual triggers
      addToHistory: true,
      showToast: true,
      ...options
    });
  }, [performAnalysis]);
  
  /**
   * Schedule auto-analysis
   * @param {Object} resumeData - Resume data to analyze
   */
  const scheduleAutoAnalysis = useCallback((resumeData) => {
    if (!autoAnalyzeEnabled) return;
    
    // Clear existing timeout
    if (autoAnalyzeTimeoutRef.current) {
      clearTimeout(autoAnalyzeTimeoutRef.current);
    }
    
    // Check if analysis is needed
    if (!hasSignificantChanges(resumeData, lastAnalyzedData)) {
      return;
    }
    
    // Schedule new analysis
    autoAnalyzeTimeoutRef.current = setTimeout(() => {
      performAnalysis(resumeData, {
        useCache: true,
        addToHistory: true,
        showToast: false // Don't show toast for auto-analysis
      }).catch(error => {
        console.error('Auto-analysis failed:', error);
        // Silently fail for auto-analysis
      });
    }, AUTO_ANALYZE_DELAY);
  }, [
    autoAnalyzeEnabled, 
    hasSignificantChanges, 
    lastAnalyzedData, 
    performAnalysis
  ]);
  
  /**
   * Compare two analysis results
   * @param {Object} analysis1 - First analysis
   * @param {Object} analysis2 - Second analysis
   * @returns {Object} - Comparison result
   */
  const compareAnalyses = useCallback((analysis1, analysis2) => {
    if (!analysis1 || !analysis2) return null;
    
    const scoreDiff = analysis2.overallScore - analysis1.overallScore;
    const sectionComparisons = {};
    
    // Compare section scores
    if (analysis1.sectionAnalysis && analysis2.sectionAnalysis) {
      Object.keys(analysis2.sectionAnalysis).forEach(section => {
        const oldScore = analysis1.sectionAnalysis[section]?.score || 0;
        const newScore = analysis2.sectionAnalysis[section]?.score || 0;
        sectionComparisons[section] = {
          oldScore,
          newScore,
          difference: newScore - oldScore,
          improved: newScore > oldScore
        };
      });
    }
    
    return {
      overallScoreDiff: scoreDiff,
      improved: scoreDiff > 0,
      sectionComparisons,
      timestamp: new Date().toISOString()
    };
  }, []);
  
  /**
   * Get analysis by ID from history
   * @param {string} analysisId - Analysis ID
   * @returns {Object|null} - Analysis from history
   */
  const getAnalysisFromHistory = useCallback((analysisId) => {
    return analysisHistory.find(item => item.id === analysisId) || null;
  }, [analysisHistory]);
  
  /**
   * Clear analysis history
   */
  const clearAnalysisHistory = useCallback(() => {
    setAnalysisHistoryLocal([]);
    dispatch(setAnalysisHistory([]));
    success('Analysis history cleared');
  }, [dispatch, success]);
  
  /**
   * Clear analysis cache
   */
  const clearAnalysisCache = useCallback(() => {
    setAnalysisCache(new Map());
    success('Analysis cache cleared');
  }, [success]);
  
  /**
   * Toggle auto-analysis
   */
  const toggleAutoAnalyze = useCallback(() => {
    setAutoAnalyzeEnabled(prev => {
      const newValue = !prev;
      success(`Auto-analysis ${newValue ? 'enabled' : 'disabled'}`);
      return newValue;
    });
  }, [success]);
  
  /**
   * Get analysis statistics
   * @returns {Object} - Analysis statistics
   */
  const getAnalysisStats = useCallback(() => {
    if (analysisHistory.length === 0) {
      return {
        totalAnalyses: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        improvementTrend: 0
      };
    }
    
    const scores = analysisHistory.map(item => item.overallScore);
    const totalAnalyses = analysisHistory.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAnalyses;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    
    // Calculate improvement trend (recent vs older scores)
    const recentScores = scores.slice(0, Math.ceil(totalAnalyses / 2));
    const olderScores = scores.slice(Math.ceil(totalAnalyses / 2));
    
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const olderAvg = olderScores.length > 0 
      ? olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length 
      : recentAvg;
    
    const improvementTrend = recentAvg - olderAvg;
    
    return {
      totalAnalyses,
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      improvementTrend: Math.round(improvementTrend)
    };
  }, [analysisHistory]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoAnalyzeTimeoutRef.current) {
        clearTimeout(autoAnalyzeTimeoutRef.current);
      }
    };
  }, []);
  
  return {
    // State
    analysis,
    isAnalyzing,
    analysisHistory,
    autoAnalyzeEnabled,
    lastAnalyzedData,
    
    // Actions
    triggerAnalysis,
    scheduleAutoAnalysis,
    performAnalysis,
    
    // History and comparison
    compareAnalyses,
    getAnalysisFromHistory,
    clearAnalysisHistory,
    
    // Cache management
    clearAnalysisCache,
    getCachedAnalysis,
    
    // Settings
    toggleAutoAnalyze,
    
    // Statistics
    getAnalysisStats,
    
    // Utilities
    hasSignificantChanges,
    generateCacheKey
  };
};

/**
 * Hook for simplified AI analysis usage
 * @param {Object} resumeData - Resume data to analyze
 * @param {Object} options - Hook options
 * @returns {Object} - Simplified analysis interface
 */
export const useSimpleAIAnalysis = (resumeData, options = {}) => {
  const {
    autoAnalyze = true,
    cacheResults = true,
    showToasts = true
  } = options;
  
  const {
    analysis,
    isAnalyzing,
    triggerAnalysis,
    scheduleAutoAnalysis,
    getAnalysisStats
  } = useAIAnalysis();
  
  // Auto-analyze when resume data changes
  useEffect(() => {
    if (autoAnalyze && resumeData) {
      scheduleAutoAnalysis(resumeData);
    }
  }, [resumeData, autoAnalyze, scheduleAutoAnalysis]);
  
  // Manual analysis trigger
  const analyze = useCallback(() => {
    if (resumeData) {
      return triggerAnalysis(resumeData, {
        useCache: cacheResults,
        showToast: showToasts
      });
    }
  }, [resumeData, triggerAnalysis, cacheResults, showToasts]);
  
  return {
    analysis,
    isAnalyzing,
    analyze,
    stats: getAnalysisStats()
  };
};

export default useAIAnalysis;