import { ReduxProvider } from '@/redux/provider';
import AuthInitializer from './AuthInitializer';
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
          <AuthInitializer>{children}</AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
