import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import config from '../../config/environment';

const API_URL = config.apiUrl;

// Async thunks
export const fetchAllPaths = createAsyncThunk(
  'learningPath/fetchAll',
  async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/learning-paths/paths?${params}`);
    return response.data.data;
  }
);

export const fetchPathById = createAsyncThunk(
  'learningPath/fetchById',
  async (pathId) => {
    const response = await axios.get(`${API_URL}/learning-paths/paths/${pathId}`);
    return response.data.data;
  }
);

export const enrollInPath = createAsyncThunk(
  'learningPath/enroll',
  async ({ userId, pathId }) => {
    const response = await axios.post(`${API_URL}/learning-paths/progress/enroll`, {
      userId,
      pathId
    });
    return response.data.data;
  }
);

export const fetchUserProgress = createAsyncThunk(
  'learningPath/fetchProgress',
  async (userId) => {
    const response = await axios.get(`${API_URL}/learning-paths/progress/${userId}`);
    return response.data.data;
  }
);

export const fetchPathProgress = createAsyncThunk(
  'learningPath/fetchPathProgress',
  async ({ userId, pathId }) => {
    const response = await axios.get(`${API_URL}/learning-paths/progress/${userId}/paths/${pathId}`);
    return response.data.data;
  }
);

export const completeNode = createAsyncThunk(
  'learningPath/completeNode',
  async ({ userId, pathId, nodeId, timeSpent }) => {
    const response = await axios.put(
      `${API_URL}/learning-paths/progress/${userId}/paths/${pathId}/nodes/${nodeId}/complete`,
      { timeSpent }
    );
    return response.data.data;
  }
);

export const fetchRecommendations = createAsyncThunk(
  'learningPath/fetchRecommendations',
  async (userId) => {
    const response = await axios.get(`${API_URL}/learning-paths/recommendations/${userId}`);
    return response.data.data;
  }
);

const learningPathSlice = createSlice({
  name: 'learningPath',
  initialState: {
    paths: [],
    currentPath: null,
    userProgress: [],
    currentProgress: null,
    recommendations: [],
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentPath: (state) => {
      state.currentPath = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all paths
      .addCase(fetchAllPaths.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPaths.fulfilled, (state, action) => {
        state.loading = false;
        state.paths = action.payload;
      })
      .addCase(fetchAllPaths.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch path by ID
      .addCase(fetchPathById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPathById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPath = action.payload;
      })
      .addCase(fetchPathById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Enroll in path
      .addCase(enrollInPath.fulfilled, (state, action) => {
        state.userProgress.push(action.payload);
      })
      // Fetch user progress
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.userProgress = action.payload;
      })
      // Fetch path progress
      .addCase(fetchPathProgress.fulfilled, (state, action) => {
        state.currentProgress = action.payload.progress;
        state.currentPath = action.payload.path;
      })
      // Complete node
      .addCase(completeNode.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeNode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProgress = action.payload;
        console.log('Node completion saved:', action.payload);
      })
      .addCase(completeNode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error('Failed to complete node:', action.error);
      })
      // Fetch recommendations
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });
  }
});

export const { clearCurrentPath, clearError } = learningPathSlice.actions;
export default learningPathSlice.reducer;
