import { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeBuilder } from '../contexts/ResumeBuilderContext';

/**
 * Custom hook for managing auto-save functionality with visual feedback
 * @param {Object} options - Configuration options
 * @returns {Object} - Auto-save state and controls
 */
export const useAutoSave = (options = {}) => {
  const {
    interval = 5000, // 5 seconds default
    showNotifications = false,
    onSaveSuccess,
    onSaveError
  } = options;
  
  const { 
    resumeData, 
    performance, 
    saveResume, 
    toggleAutoSave 
  } = useResumeBuilder();
  
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [nextSaveIn, setNextSaveIn] = useState(null);
  
  const saveTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  
  /**
   * Perform auto-save operation
   */
  const performAutoSave = useCallback(async () => {
    if (!performance.autoSaveEnabled || !performance.isDirty) {
      return;
    }
    
    setSaveStatus('saving');
    
    try {
      await saveResume();
      setSaveStatus('saved');
      setLastSaveTime(new Date());
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      // Reset to idle after showing saved status
      setTimeout(() => setSaveStatus('idle'), 2000);
      
    } catch (error) {
      setSaveStatus('error');
      
      if (onSaveError) {
        onSaveError(error);
      }
      
      // Reset to idle after showing error status
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [performance.autoSaveEnabled, performance.isDirty, saveResume, onSaveSuccess, onSaveError]);
  

  
  /**
   * Force immediate save
   */
  const forceSave = useCallback(async () => {
    // Clear scheduled auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    setNextSaveIn(null);
    await performAutoSave();
  }, [performAutoSave]);
  
  // Effect to handle auto-save scheduling when data changes
  useEffect(() => {
    const now = Date.now();
    
    // Debounce rapid updates (prevent infinite loops)
    if (now - lastUpdateRef.current < 1000) {
      return;
    }
    lastUpdateRef.current = now;
    
    if (performance.isDirty && performance.autoSaveEnabled) {
      // Clear existing timeout and countdown
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      // Start countdown
      let timeLeft = interval / 1000;
      setNextSaveIn(timeLeft);
      
      countdownIntervalRef.current = setInterval(() => {
        timeLeft -= 1;
        setNextSaveIn(timeLeft);
        
        if (timeLeft <= 0) {
          clearInterval(countdownIntervalRef.current);
          setNextSaveIn(null);
        }
      }, 1000);
      
      // Schedule auto-save
      saveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, interval);
      
    } else {
      // Clear timers if auto-save is disabled or no changes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setNextSaveIn(null);
    }
  }, [performance.isDirty, performance.autoSaveEnabled, interval]);
  
  // Update last save time when performance data changes
  useEffect(() => {
    if (performance.lastSaved) {
      setLastSaveTime(new Date(performance.lastSaved));
    }
  }, [performance.lastSaved]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);
  
  return {
    // Status
    saveStatus,
    lastSaveTime,
    nextSaveIn,
    isAutoSaveEnabled: performance.autoSaveEnabled,
    isDirty: performance.isDirty,
    
    // Actions
    forceSave,
    toggleAutoSave,
    
    // Computed values
    canSave: performance.isDirty,
    isSaving: saveStatus === 'saving' || performance.saveInProgress,
    
    // Helper functions
    formatTimeUntilSave: () => {
      if (!nextSaveIn) return null;
      return `${Math.ceil(nextSaveIn)}s`;
    },
    
    formatLastSaveTime: () => {
      if (!lastSaveTime) return 'Never';
      const now = new Date();
      const diff = now - lastSaveTime;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s ago`;
      }
      return `${seconds}s ago`;
    }
  };
};

export default useAutoSave;