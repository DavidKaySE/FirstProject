import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
}

const initialState: AuthState = {
  session: null,
  user: null,
};

export const logoutThunk = createAsyncThunk('auth/logoutThunk', async (_, { dispatch }) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  dispatch(setSession(null));
  dispatch(setUser(null));
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.session = null;
      state.user = null;
    },
  },
});

// Exportera action creators
export const { setSession, setUser, logout } = authSlice.actions;

// Exportera reducer
export default authSlice.reducer;
