'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Navbar from '@/components/web/Navbar';
import { Toaster } from '@/components/ui/sonner';
import InstallPrompt from '@/components/InstallPrompt';
import Pwa from '@/components/pwa';
import { MobileNav } from '@/components/ui/mobile-nav';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';

interface ClientLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function ClientLayout({
  children,
  session,
}: ClientLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Removed Service Worker registration - no longer needed for simple badge updates

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show navbar on all devices
  const showNavbar = true;
  const showBottomNav = isMobile;

  return (
    <ThemeProvider>
      <SessionProvider session={session}>
        <div className="min-h-screen bg-background">
          {showNavbar && <Navbar session={session} />}
          <main className={`${showBottomNav ? 'pb-20' : ''}`}>{children}</main>
          <Toaster />
          <InstallPrompt />
          <Pwa />
          {showBottomNav && <MobileNav />}
        </div>
      </SessionProvider>
    </ThemeProvider>
  );
}
