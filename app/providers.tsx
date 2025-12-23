'use client';

import { ThemeProvider } from './context/Themecontext';
import { AuthProvider } from './context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}