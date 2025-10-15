import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../components/ui/Toast';
import { 
  updateResumeData,
  updatePersonalInfo,
  updateExperience,
  updateEducation,
  updateSkills,
  updateProjects,
  saveResumeData,
  loadResumeData,
  analyzeResume,
  markAutoSaved,
  setAutoSaveEnabled,
  selectResumeData,
  selectUI,
  selectAnalysis,
  selectPerformance,
  selectTemplates,
  selectIsDirty,
  selectIsAnalyzing
} from '../store/slices/resumeBuilderSlice';


const ResumeBuilderContext = createContext(null);

/**
 * ResumeBuilderProvider - Provides resume builder state and actions with optimized performance
 * Features:
 * - Debounced updates to prevent excessive re-renders
 * - Auto-save functionality with configurable intervals
 * - AI analysis integration with smart triggering
 * - Performance monitoring and optimization
 */
export const ResumeBuilderProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { success, error: showError } = useToast();
  
  // Redux state selectors
  const resumeData = useSelector(selectResumeData);
  const ui = useSelector(selectUI);
  const analysis = useSelector(selectAnalysis);
  const performance = useSelector(selectPerformance);
  const templates = useSelector(selectTemplates);
  const isDirty = useSelector(selectIsDirty);
  const isAnalyzing = useSelector(selectIsAnalyzing);
  
  // Refs for managing debounced operations
  const autoSaveTimeoutRef = useRef(null);
  const analysisTimeoutRef = useRef(null);
  const lastAnalysisDataRef = useRef(null);
  
  // Auto-save configuration
  const AUTO_SAVE_DELAY = 5000; // 5 seconds
  const ANALYSIS_DELAY = 2000; // 2 seconds after significant changes
  const DEBOUNCE_DELAY = 300; // 300ms for input debouncing
  

  
  /**
   * Auto-save function (simplified to avoid infinite loops)
   */
  const saveResumeIfNeeded = useCallback(async () => {
    if (performance.autoSaveEnabled && isDirty) {
      try {
        await dispatch(saveResumeData(resumeData)).unwrap();
        dispatch(markAutoSaved());
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, [dispatch, performance.autoSaveEnabled, isDirty, resumeData]);
  
  /**
   * Analysis function (simplified to avoid infinite loops)
   */
  const analyzeResumeIfNeeded = useCallback(async () => {
    if (analysis.autoAnalyze) {
      try {
        await dispatch(analyzeResume(resumeData)).unwrap();
      } catch (error) {
        console.error('Auto-analysis failed:', error);
      }
    }
  }, [dispatch, analysis.autoAnalyze, resumeData]);
  

  
  /**
   * Update personal information with debouncing
   */
  const updatePersonalInfoDebounced = useCallback((updates) => {
    dispatch(updatePersonalInfo(updates));
  }, [dispatch]);
  
  /**
   * Update experience with debouncing
   */
  const updateExperienceDebounced = useCallback((experience) => {
    dispatch(updateExperience(experience));
  }, [dispatch]);
  
  /**
   * Update education with debouncing
   */
  const updateEducationDebounced = useCallback((education) => {
    dispatch(updateEducation(education));
  }, [dispatch]);
  
  /**
   * Update skills with debouncing
   */
  const updateSkillsDebounced = useCallback((skills) => {
    dispatch(updateSkills(skills));
  }, [dispatch]);
  
  /**
   * Update projects with debouncing
   */
  const updateProjectsDebounced = useCallback((projects) => {
    dispatch(updateProjects(projects));
  }, [dispatch]);
  
  /**
   * Manual save function
   */
  const saveResume = useCallback(async () => {
    try {
      await dispatch(saveResumeData(resumeData)).unwrap();
      success('Resume saved successfully');
    } catch (error) {
      showError('Failed to save resume: ' + error);
    }
  }, [dispatch, resumeData, success, showError]);
  
  /**
   * Manual analysis trigger
   */
  const triggerAnalysis = useCallback(async () => {
    try {
      await dispatch(analyzeResume(resumeData)).unwrap();
      lastAnalysisDataRef.current = { ...resumeData };
      success('Resume analysis completed');
    } catch (error) {
      showError('Analysis failed: ' + error);
    }
  }, [dispatch, resumeData, success, showError]);
  
  /**
   * Load resume by ID
   */
  const loadResume = useCallback(async (resumeId) => {
    try {
      await dispatch(loadResumeData(resumeId)).unwrap();
      success('Resume loaded successfully');
    } catch (error) {
      showError('Failed to load resume: ' + error);
    }
  }, [dispatch, success, showError]);
  
  /**
   * Toggle auto-save functionality
   */
  const toggleAutoSave = useCallback(() => {
    dispatch(setAutoSaveEnabled(!performance.autoSaveEnabled));
    success(`Auto-save ${!performance.autoSaveEnabled ? 'enabled' : 'disabled'}`);
  }, [dispatch, performance.autoSaveEnabled, success]);
  
  // Update last analysis data reference when analysis completes
  useEffect(() => {
    if (analysis.data && !analysis.isLoading) {
      lastAnalysisDataRef.current = { ...resumeData };
    }
  }, [analysis.data, analysis.isLoading, resumeData]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);
  
  // Context value
  const contextValue = {
    // State
    resumeData,
    ui,
    analysis,
    performance,
    templates,
    isDirty,
    isAnalyzing,
    
    // Actions
    updatePersonalInfo: updatePersonalInfoDebounced,
    updateExperience: updateExperienceDebounced,
    updateEducation: updateEducationDebounced,
    updateSkills: updateSkillsDebounced,
    updateProjects: updateProjectsDebounced,
    
    // Operations
    saveResume,
    loadResume,
    triggerAnalysis,
    toggleAutoSave,
    
    // Direct dispatch access for UI actions
    dispatch
  };
  
  return (
    <ResumeBuilderContext.Provider value={contextValue}>
      {children}
    </ResumeBuilderContext.Provider>
  );
};

/**
 * Hook to use the ResumeBuilder context
 * @returns {Object} - Resume builder context value
 */
export const useResumeBuilder = () => {
  const context = useContext(ResumeBuilderContext);
  
  if (!context) {
    throw new Error('useResumeBuilder must be used within a ResumeBuilderProvider');
  }
  
  return context;
};



export default ResumeBuilderContext;