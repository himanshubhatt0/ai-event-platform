'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { getCookie } from '@/utils/cookies';
import { RootState } from '@/redux/store';

const HIDDEN_ROUTES = new Set(['/login', '/register']);

type Breadcrumb = {
  label: string;
  href?: string;
};

function toTitleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ label: 'Dashboard' }];
  }

  if (segments[0] === 'organization') {
    if (segments.length === 1) {
      return [{ label: 'Organization' }];
    }

    if (segments.length >= 3 && (segments[2] === 'events' || segments[2] === 'products')) {
      return [
        { label: 'Organization', href: '/organization' },
        { label: toTitleCase(segments[2]) },
      ];
    }

    return [{ label: 'Organization' }];
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    return {
      label: toTitleCase(segment),
      href: index < segments.length - 1 ? href : undefined,
    };
  });
}

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const authToken = getCookie('auth_token');
  const isAuthenticated = Boolean(token || authToken);
  const breadcrumbs = getBreadcrumbs(pathname);

  if (HIDDEN_ROUTES.has(pathname) || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition">
              AI Event Platform
            </Link>
            <p className="text-sm text-gray-600">{user?.name || user?.email || 'Welcome'}</p>
            <nav className="mt-1 flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                  {index > 0 && <span className="text-gray-400">&gt;</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-gray-700 transition">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/organization"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Organizations
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
