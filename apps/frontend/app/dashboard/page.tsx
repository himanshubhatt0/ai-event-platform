'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCookie } from '@/utils/cookies';
import { Toast } from '@/components/Toast';

export default function DashboardPage() {
  const { token } = useSelector((state: any) => state.auth);
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Dashboard Overview
              </h2>
              <p className="text-gray-600 mb-6">
                You are successfully logged in to the AI Event Platform. This is your personal dashboard where you can manage your events, interactions, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/organization">
                  <div className="bg-blue-50 p-6 rounded-lg hover:shadow-lg transition cursor-pointer">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Organizations</h3>
                    <p className="text-blue-700">Manage organizations and their events/products</p>
                  </div>
                </Link>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-green-900 mb-2">Interactions</h3>
                  <p className="text-green-700">Track your engagement and feedback</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">Profile</h3>
                  <p className="text-purple-700">Manage your profile and settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/organization"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    📋
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Manage Organizations</p>
                    <p className="text-xs text-gray-500">Create, view, and manage organizations</p>
                  </div>
                </Link>
                <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="shrink-0 h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    🎯
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Explore Events</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}