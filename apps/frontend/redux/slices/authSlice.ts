import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginApi, registerApi, getMeApi } from '@/services/auth.service';
import { setCookie, deleteCookie } from '@/utils/cookies';
import { extractApiErrorMessage } from '@/utils/apiError';

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  success: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await loginApi(email, password);
      setCookie('auth_token', response.access_token, 1);
      const user = await getMeApi();
      return { access_token: response.access_token, user, message: response.message };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Login failed'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await registerApi(email, password, name);
      return { user: response.user, message: response.message };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Registration failed'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.success = null;
      deleteCookie('auth_token');
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.success = null;
    },
    clearFeedback(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.message;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error = (action.payload as string) || action.error.message || 'Login failed';
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.success = null;
        state.error = (action.payload as string) || action.error.message || 'Registration failed';
      });
  },
});

export const { logout, setToken, setUser, clearAuth, clearFeedback } = authSlice.actions;
export default authSlice.reducer;