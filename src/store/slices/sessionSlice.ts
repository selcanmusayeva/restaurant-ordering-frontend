import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  activeSession: {
    tableId: number;
    sessionId: string;
    expiresAt: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  activeSession: null,
  loading: false,
  error: null,
};

// Get any existing session from localStorage
try {
  const storedSession = localStorage.getItem('tableSession');
  if (storedSession) {
    const session = JSON.parse(storedSession);
    // Validate session expiry
    if (new Date(session.expiresAt) > new Date()) {
      initialState.activeSession = session;
    } else {
      // Clear expired session
      localStorage.removeItem('tableSession');
    }
  }
} catch (error) {
  // Clear invalid session data
  localStorage.removeItem('tableSession');
}

export const setSession = createAsyncThunk(
  'session/setSession',
  async (sessionData: { tableId: number; sessionId: string; expiresAt: string }, { rejectWithValue }) => {
    try {
      localStorage.setItem('tableSession', JSON.stringify(sessionData));
      return sessionData;
    } catch (error: any) {
      return rejectWithValue('Failed to set session');
    }
  }
);

export const clearSession = createAsyncThunk(
  'session/clearSession',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('tableSession');
      return true;
    } catch (error: any) {
      return rejectWithValue('Failed to clear session');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<{ tableId: number; sessionId: string; expiresAt: string }>) => {
      state.activeSession = action.payload;
    },
    clearActiveSession: (state) => {
      state.activeSession = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload;
      })
      .addCase(setSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(clearSession.fulfilled, (state) => {
        state.activeSession = null;
      });
  },
});

export const { setActiveSession, clearActiveSession } = sessionSlice.actions;
export default sessionSlice.reducer; 