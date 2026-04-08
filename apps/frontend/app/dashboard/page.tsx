'use client';

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCookie } from '@/utils/cookies';
import { Toast } from '@/components/Toast';

export default function DashboardPage() {
  const { user, token } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const authToken = getCookie('auth_token');
  const isAuthenticated = Boolean(token || authToken);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }

    const toast = sessionStorage.getItem('toast_message');
    if (toast) {
      const payload = JSON.parse(toast);
      setToastType(payload.type);
      setToastMessage(payload.message);
      sessionStorage.removeItem('toast_message');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Event Platform</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name || user?.email}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Dashboard Overview
              </h2>
              <p className="text-gray-600 mb-6">
                You are successfully logged in to the AI Event Platform. This is your personal dashboard where you can manage your events, interactions, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Events</h3>
                  <p className="text-blue-700">Manage and discover AI-powered events</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Interactions</h3>
                  <p className="text-green-700">Track your engagement and feedback</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Organizations</h3>
                  <p className="text-purple-700">Connect with event organizers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}