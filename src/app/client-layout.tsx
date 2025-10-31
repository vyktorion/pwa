'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Navbar from '@/components/web/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { MobileNav } from '@/components/web/mobile-nav';
import Footer from '@/components/web/Footer';
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
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        retry: 1,
      },
    },
  }));

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
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <div className="min-h-screen bg-background flex flex-col">
            {showNavbar && <Navbar session={session} />}
            <main className={`${showBottomNav ? 'pb-20' : ''} flex-1`}>{children}</main>
            <Footer />
            <Toaster />
            {showBottomNav && <MobileNav />}
          </div>
          <ReactQueryDevtools initialIsOpen={false} />
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
