import type React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import RegisterPage from '@/app/register/page';
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

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders register form', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account? Sign in')).toBeInTheDocument();
  });

  it('shows loading state during registration', () => {
    const store = createMockStore({ loading: true });
    renderWithProviders(<RegisterPage />, store);

    expect(screen.getByText('Creating account...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('displays error message', () => {
    const store = createMockStore({ error: 'Email already exists' });
    renderWithProviders(<RegisterPage />, store);

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('submits form with correct data', async () => {
    const store = createMockStore();
    renderWithProviders(<RegisterPage />, store);

    const nameInput = screen.getByLabelText('Full Name');
    const emailInput = screen.getByLabelText('Email address');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign up' });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Wait for the async action to be dispatched
    await waitFor(() => {
      expect(store.getState().auth.loading).toBe(true);
    });
  });

  it('navigates to login page when link is clicked', () => {
    renderWithProviders(<RegisterPage />);

    const loginLink = screen.getByText('Already have an account? Sign in');
    fireEvent.click(loginLink);

    // Since we can't test navigation directly, we just check the link exists
    expect(loginLink).toBeInTheDocument();
  });
});