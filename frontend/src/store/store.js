import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import learningPathReducer from './slices/learningPathSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    learningPath: learningPathReducer,
  },
});

export default store;