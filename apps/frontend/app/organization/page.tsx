'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getCookie } from '@/utils/cookies';

export default function OrganizationRedirectPage() {
  const { user, token } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const cookieToken = isHydrated ? getCookie('auth_token') : null;
  const isAuthenticated = Boolean(token || cookieToken);
  const isUserLoaded = Boolean(user);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

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
  }, [isHydrated, isAuthenticated, isUserLoaded, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-xl font-semibold text-gray-900">Redirecting...</div>
    </div>
  );
}
