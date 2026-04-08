import { ReduxProvider } from '@/redux/provider';
import AuthInitializer from './AuthInitializer';
import AppHeader from '@/components/AppHeader';
import '@/app/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthInitializer>
            <AppHeader />
            {children}
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
