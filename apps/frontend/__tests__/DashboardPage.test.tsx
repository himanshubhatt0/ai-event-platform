import type React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/redux/slices/authSlice';
import DashboardPage from '@/app/dashboard/page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  push: jest.fn(),
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

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when no token', () => {
    const store = createMockStore({ token: null });
    renderWithProviders(<DashboardPage />, store);

    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('renders dashboard when authenticated', () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });

    renderWithProviders(<DashboardPage />, store);

    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    expect(screen.getByText('Normal User Account')).toBeInTheDocument();
    expect(screen.getByText('Browse Feed')).toBeInTheDocument();
    expect(screen.getByText('AI Search')).toBeInTheDocument();
  });

  it('renders dashboard with email when name is not available', () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });

    renderWithProviders(<DashboardPage />, store);

    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
  });

  it('displays normal user sections', () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });

    renderWithProviders(<DashboardPage />, store);

    expect(screen.getByText('Browse Feed')).toBeInTheDocument();
    expect(screen.getByText('AI Search')).toBeInTheDocument();
  });

  it('displays organization user sections', () => {
    const mockUser = {
      id: '1',
      email: 'org@example.com',
      name: 'Org User',
      organizationId: 'org-1',
    };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });

    renderWithProviders(<DashboardPage />, store);

    expect(screen.getByText('Organization Account')).toBeInTheDocument();
    expect(screen.getByText('My Events')).toBeInTheDocument();
    expect(screen.getByText('My Products')).toBeInTheDocument();
  });
});