import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import resumeBuilderReducer from './slices/resumeBuilderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    resumeBuilder: resumeBuilderReducer,
  },
});

export default store;