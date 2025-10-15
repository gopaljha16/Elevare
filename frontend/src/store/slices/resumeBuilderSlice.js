import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for resume builder
const initialResumeData = {
    id: null,
    title: 'My Resume',
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        portfolio: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: [],
    templateId: 'modern'
};

const initialState = {
    // Resume data
    resumeData: initialResumeData,

    // UI state
    ui: {
        currentStep: 0,
        activeSection: 'personal',
        previewMode: 'desktop', // desktop, tablet, mobile
        isPreviewVisible: true,
        isAIAnalysisVisible: true,
        isSidebarCollapsed: false
    },

    // AI Analysis state
    analysis: {
        data: null,
        isLoading: false,
        lastAnalyzed: null,
        autoAnalyze: true,
        error: null,
        history: []
    },

    // Performance and sync state
    performance: {
        lastSaved: null,
        isDirty: false,
        saveInProgress: false,
        autoSaveEnabled: true,
        lastAutoSave: null
    },

    // Template and preview state
    templates: {
        available: ['modern', 'classic', 'creative', 'minimal'],
        selected: 'modern',
        isLoading: false
    }
};

// Async thunks for API operations
export const saveResumeData = createAsyncThunk(
    'resumeBuilder/saveResumeData',
    async (resumeData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/resumes', {
                method: resumeData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(resumeData)
            });

            if (!response.ok) {
                throw new Error('Failed to save resume');
            }

            const result = await response.json();
            return result.data.resume;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loadResumeData = createAsyncThunk(
    'resumeBuilder/loadResumeData',
    async (resumeId, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/resumes/${resumeId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load resume');
            }

            const result = await response.json();
            return result.data.resume;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const analyzeResume = createAsyncThunk(
    'resumeBuilder/analyzeResume',
    async (resumeData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/resumes/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(resumeData)
            });

            if (!response.ok) {
                throw new Error('Failed to analyze resume');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const resumeBuilderSlice = createSlice({
    name: 'resumeBuilder',
    initialState,
    reducers: {
        // Resume data updates
        updateResumeData: (state, action) => {
            state.resumeData = { ...state.resumeData, ...action.payload };
            state.performance.isDirty = true;
            state.performance.lastAutoSave = null;
        },

        updatePersonalInfo: (state, action) => {
            state.resumeData.personalInfo = { ...state.resumeData.personalInfo, ...action.payload };
            state.performance.isDirty = true;
        },

        updateExperience: (state, action) => {
            state.resumeData.experience = action.payload;
            state.performance.isDirty = true;
        },

        addExperience: (state, action) => {
            state.resumeData.experience.push(action.payload);
            state.performance.isDirty = true;
        },

        removeExperience: (state, action) => {
            state.resumeData.experience = state.resumeData.experience.filter((_, index) => index !== action.payload);
            state.performance.isDirty = true;
        },

        updateEducation: (state, action) => {
            state.resumeData.education = action.payload;
            state.performance.isDirty = true;
        },

        addEducation: (state, action) => {
            state.resumeData.education.push(action.payload);
            state.performance.isDirty = true;
        },

        removeEducation: (state, action) => {
            state.resumeData.education = state.resumeData.education.filter((_, index) => index !== action.payload);
            state.performance.isDirty = true;
        },

        updateSkills: (state, action) => {
            state.resumeData.skills = action.payload;
            state.performance.isDirty = true;
        },

        addSkill: (state, action) => {
            if (!state.resumeData.skills.includes(action.payload)) {
                state.resumeData.skills.push(action.payload);
                state.performance.isDirty = true;
            }
        },

        removeSkill: (state, action) => {
            state.resumeData.skills = state.resumeData.skills.filter(skill => skill !== action.payload);
            state.performance.isDirty = true;
        },

        updateProjects: (state, action) => {
            state.resumeData.projects = action.payload;
            state.performance.isDirty = true;
        },

        addProject: (state, action) => {
            state.resumeData.projects.push(action.payload);
            state.performance.isDirty = true;
        },

        removeProject: (state, action) => {
            state.resumeData.projects = state.resumeData.projects.filter((_, index) => index !== action.payload);
            state.performance.isDirty = true;
        },

        // UI state updates
        setCurrentStep: (state, action) => {
            state.ui.currentStep = action.payload;
        },

        setActiveSection: (state, action) => {
            state.ui.activeSection = action.payload;
        },

        setPreviewMode: (state, action) => {
            state.ui.previewMode = action.payload;
        },

        togglePreviewVisibility: (state) => {
            state.ui.isPreviewVisible = !state.ui.isPreviewVisible;
        },

        toggleAIAnalysisVisibility: (state) => {
            state.ui.isAIAnalysisVisible = !state.ui.isAIAnalysisVisible;
        },

        toggleSidebar: (state) => {
            state.ui.isSidebarCollapsed = !state.ui.isSidebarCollapsed;
        },

        // Template updates
        setSelectedTemplate: (state, action) => {
            state.templates.selected = action.payload;
            state.resumeData.templateId = action.payload;
            state.performance.isDirty = true;
        },

        // Performance and sync updates
        markAsSaved: (state) => {
            state.performance.isDirty = false;
            state.performance.lastSaved = new Date().toISOString();
            state.performance.saveInProgress = false;
        },

        markAutoSaved: (state) => {
            state.performance.lastAutoSave = new Date().toISOString();
        },

        setSaveInProgress: (state, action) => {
            state.performance.saveInProgress = action.payload;
        },

        setAutoSaveEnabled: (state, action) => {
            state.performance.autoSaveEnabled = action.payload;
        },

        // AI Analysis updates
        setAutoAnalyze: (state, action) => {
            state.analysis.autoAnalyze = action.payload;
        },

        clearAnalysisError: (state) => {
            state.analysis.error = null;
        },

        // Analysis history management
        setAnalysisHistory: (state, action) => {
            state.analysis.history = action.payload;
        },

        addAnalysisToHistory: (state, action) => {
            if (!state.analysis.history) {
                state.analysis.history = [];
            }
            state.analysis.history.unshift(action.payload);
            // Keep only last 10 analyses
            if (state.analysis.history.length > 10) {
                state.analysis.history = state.analysis.history.slice(0, 10);
            }
        },

        // Reset state
        resetResumeBuilder: (state) => {
            return initialState;
        },

        loadResumeFromData: (state, action) => {
            state.resumeData = { ...initialResumeData, ...action.payload };
            state.performance.isDirty = false;
            state.performance.lastSaved = new Date().toISOString();
        }
    },

    extraReducers: (builder) => {
        // Save resume data
        builder
            .addCase(saveResumeData.pending, (state) => {
                state.performance.saveInProgress = true;
            })
            .addCase(saveResumeData.fulfilled, (state, action) => {
                state.resumeData = action.payload;
                state.performance.isDirty = false;
                state.performance.lastSaved = new Date().toISOString();
                state.performance.saveInProgress = false;
            })
            .addCase(saveResumeData.rejected, (state, action) => {
                state.performance.saveInProgress = false;
                // Handle error (could add error state if needed)
            });

        // Load resume data
        builder
            .addCase(loadResumeData.pending, (state) => {
                // Could add loading state if needed
            })
            .addCase(loadResumeData.fulfilled, (state, action) => {
                state.resumeData = action.payload;
                state.performance.isDirty = false;
                state.performance.lastSaved = new Date().toISOString();
            })
            .addCase(loadResumeData.rejected, (state, action) => {
                // Handle error
            });

        // Analyze resume
        builder
            .addCase(analyzeResume.pending, (state) => {
                state.analysis.isLoading = true;
                state.analysis.error = null;
            })
            .addCase(analyzeResume.fulfilled, (state, action) => {
                state.analysis.data = action.payload;
                state.analysis.isLoading = false;
                state.analysis.lastAnalyzed = new Date().toISOString();
                state.analysis.error = null;
            })
            .addCase(analyzeResume.rejected, (state, action) => {
                state.analysis.isLoading = false;
                state.analysis.error = action.payload;
            });
    }
});

export const {
    updateResumeData,
    updatePersonalInfo,
    updateExperience,
    addExperience,
    removeExperience,
    updateEducation,
    addEducation,
    removeEducation,
    updateSkills,
    addSkill,
    removeSkill,
    updateProjects,
    addProject,
    removeProject,
    setCurrentStep,
    setActiveSection,
    setPreviewMode,
    togglePreviewVisibility,
    toggleAIAnalysisVisibility,
    toggleSidebar,
    setSelectedTemplate,
    markAsSaved,
    markAutoSaved,
    setSaveInProgress,
    setAutoSaveEnabled,
    setAutoAnalyze,
    clearAnalysisError,
    setAnalysisHistory,
    addAnalysisToHistory,
    resetResumeBuilder,
    loadResumeFromData
} = resumeBuilderSlice.actions;

// Selectors
export const selectResumeData = (state) => state.resumeBuilder.resumeData;
export const selectUI = (state) => state.resumeBuilder.ui;
export const selectAnalysis = (state) => state.resumeBuilder.analysis;
export const selectPerformance = (state) => state.resumeBuilder.performance;
export const selectTemplates = (state) => state.resumeBuilder.templates;
export const selectIsDirty = (state) => state.resumeBuilder.performance.isDirty;
export const selectIsAnalyzing = (state) => state.resumeBuilder.analysis.isLoading;

export default resumeBuilderSlice.reducer;