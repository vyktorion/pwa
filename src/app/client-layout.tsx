'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';
import InstallPrompt from '@/components/InstallPrompt';
import Pwa from '@/components/pwa';
import { Session } from 'next-auth';
import { useEffect } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function ClientLayout({
  children,
  session,
}: ClientLayoutProps) {
  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return (
    <ThemeProvider>
      <SessionProvider session={session}>
        <div className="min-h-screen bg-background">
          <Navbar session={session} />
          <main>{children}</main>
          <Toaster />
          <InstallPrompt />
          <Pwa />
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
}
