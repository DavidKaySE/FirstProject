import { configureStore } from '@reduxjs/toolkit';
import canvasReducer from './canvasSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
