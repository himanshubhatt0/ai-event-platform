'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/utils/cookies';

export default function OrganizationRedirectPage() {
  const { user, token } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const authToken = getCookie('auth_token');
  const isAuthenticated = Boolean(token || authToken);
  const isUserLoaded = Boolean(user);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Wait until redux user is hydrated by AuthInitializer
    if (!isUserLoaded) return;

    if (user?.organizationId) {
      router.replace(`/organization/${user.organizationId}/events`);
    } else {
      // Normal users cannot manage organizations
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isUserLoaded, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl font-semibold text-gray-900">Redirecting...</div>
    </div>
  );
}
