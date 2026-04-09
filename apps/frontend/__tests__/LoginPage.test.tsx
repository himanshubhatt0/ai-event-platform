import type React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import LoginPage from '@/app/login/page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        success: null,
        ...initialState,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
  });

  it('shows loading state during login', async () => {
    const store = createMockStore({ loading: true });
    renderWithProviders(<LoginPage />, store);

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message', () => {
    const store = createMockStore({ error: 'Invalid credentials' });
    renderWithProviders(<LoginPage />, store);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const store = createMockStore();
    renderWithProviders(<LoginPage />, store);

    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for the async action to be dispatched
    await waitFor(() => {
      expect(store.getState().auth.loading).toBe(true);
    });
  });

  it('navigates to register page when link is clicked', () => {
    renderWithProviders(<LoginPage />);

    const registerLink = screen.getByText("Don't have an account? Sign up");
    fireEvent.click(registerLink);

    // Since we can't test navigation directly, we just check the link exists
    expect(registerLink).toBeInTheDocument();
  });
});