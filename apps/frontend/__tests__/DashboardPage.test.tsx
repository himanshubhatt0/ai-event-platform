import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from '@/redux/slices/authSlice';
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
    localStorage.clear();
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

    expect(screen.getByText('AI Event Platform')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('renders dashboard with email when name is not available', () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });

    renderWithProviders(<DashboardPage />, store);

    expect(screen.getByText('Welcome back, test@example.com!')).toBeInTheDocument();
  });

  it('handles logout', () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });
    localStorage.setItem('token', 'mock-token');

    renderWithProviders(<DashboardPage />, store);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(store.getState().auth.user).toBe(null);
    expect(store.getState().auth.token).toBe(null);
    expect(localStorage.getItem('token')).toBe(null);
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });

  it('displays dashboard sections', () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const store = createMockStore({ user: mockUser, token: 'mock-token' });

    renderWithProviders(<DashboardPage />, store);

    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Interactions')).toBeInTheDocument();
    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });
});