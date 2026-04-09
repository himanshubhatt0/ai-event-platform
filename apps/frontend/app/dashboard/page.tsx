'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getCookie } from '@/utils/cookies';
import { Toast } from '@/components/Toast';

export default function DashboardPage() {
  const { token, user } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const cookieToken = isHydrated ? getCookie('auth_token') : null;
  const isAuthenticated = Boolean(token || cookieToken);

  const isOrgUser = Boolean(user?.organizationId);

  useEffect(() => {
    const toast = sessionStorage.getItem('toast_message');
    if (toast) {
      const payload = JSON.parse(toast);
      setToastType(payload.type);
      setToastMessage(payload.message);
      sessionStorage.removeItem('toast_message');
    }
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Welcome, {user?.name || user?.email || 'User'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {isOrgUser ? 'Organization Account' : 'Normal User Account'}
              </p>

              {/* --- Organization User --- */}
              {isOrgUser && (
                <>
                  <p className="text-gray-600 mb-6">
                    Manage your organization&apos;s events and products from here.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href={`/organization/${user.organizationId}/events`}>
                      <div className="bg-indigo-50 p-6 rounded-lg hover:shadow-lg transition cursor-pointer border border-indigo-100">
                        <h3 className="text-lg font-medium text-indigo-900 mb-2">My Events</h3>
                        <p className="text-indigo-700">Create and manage events for your organization</p>
                      </div>
                    </Link>
                    <Link href={`/organization/${user.organizationId}/products`}>
                      <div className="bg-green-50 p-6 rounded-lg hover:shadow-lg transition cursor-pointer border border-green-100">
                        <h3 className="text-lg font-medium text-green-900 mb-2">My Products</h3>
                        <p className="text-green-700">Create and manage products for your organization</p>
                      </div>
                    </Link>
                  </div>
                </>
              )}

              {/* --- Normal User --- */}
              {!isOrgUser && (
                <>
                  <p className="text-gray-600 mb-6">
                    Browse events and products, search for what interests you, and interact with content.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/feed">
                      <div className="bg-green-50 p-6 rounded-lg hover:shadow-lg transition cursor-pointer border border-green-100">
                        <h3 className="text-lg font-medium text-green-900 mb-2">Browse Feed</h3>
                        <p className="text-green-700">Explore mixed events and products, like and save items</p>
                      </div>
                    </Link>
                    <Link href="/search">
                      <div className="bg-purple-50 p-6 rounded-lg hover:shadow-lg transition cursor-pointer border border-purple-100">
                        <h3 className="text-lg font-medium text-purple-900 mb-2">AI Search</h3>
                        <p className="text-purple-700">Find relevant content using natural language</p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  href="/feed"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="shrink-0 h-10 w-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    🎯
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Open Feed</p>
                    <p className="text-xs text-gray-500">Browse events and products</p>
                  </div>
                </Link>
                <Link
                  href="/search"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="shrink-0 h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    🔎
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Semantic Search</p>
                    <p className="text-xs text-gray-500">Find relevant items by intent</p>
                  </div>
                </Link>
                {isOrgUser && (
                  <Link
                    href={`/organization/${user.organizationId}/events`}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="shrink-0 h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                      📋
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Manage Events</p>
                      <p className="text-xs text-gray-500">Create and edit your organization&apos;s events</p>
                    </div>
                  </Link>
                )}
                {isOrgUser && (
                  <Link
                    href={`/organization/${user.organizationId}/products`}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="shrink-0 h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      🛍️
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Manage Products</p>
                      <p className="text-xs text-gray-500">Create and edit your organization&apos;s products</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}