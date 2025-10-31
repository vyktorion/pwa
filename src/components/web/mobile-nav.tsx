'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, MessageSquare, User, Badge, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from "next-themes";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

export function MobileNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  // Use React Query for unread count with global caching
  const { data: unreadData } = useQuery({
    queryKey: ['unread-messages', session?.user?.id],
    queryFn: async () => {
      const response = await fetch('/api/messages/unread');
      if (!response.ok) throw new Error('Failed to fetch unread count');
      return response.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute when tab is active
    refetchOnWindowFocus: true,
  });

  const unreadCount = unreadData?.unreadCount || 0;

  // Invalidate unread count when messages page trigger refresh
  useEffect(() => {
    const handleMessagesRefresh = () => {
      // React Query will automatically refetch when this event fires
      // No need for manual fetch anymore
    };

    window.addEventListener('navbar-refresh-unread', handleMessagesRefresh);
    return () => window.removeEventListener('navbar-refresh-unread', handleMessagesRefresh);
  }, []);

  // Only show on mobile devices
  if (!isMobile) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Acasă',
      active: pathname === '/',
    },
    {
      href: '/sale',
      icon: Building,
      label: 'Listare',
      active: pathname === '/sale' || pathname.startsWith('/sale/'),
    },
    {
      href: '/theme',
      icon: theme === 'dark' ? Moon : Sun,
      label: 'Theme',
      active: false,
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Mesaje',
      active: pathname === '/messages',
      badge: (session?.user && unreadCount > 0) ? unreadCount : null,
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profil',
      active: pathname === '/profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          if (item.action) {
            return (
              <button
                key={item.href}
                onClick={item.action}
                className="flex flex-col items-center justify-center px-2 py-2 transition-colors duration-75 min-w-0 flex-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 touch-manipulation active:bg-accent"
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 font-medium">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-2 py-2 transition-colors duration-75 min-w-0 flex-1 touch-manipulation active:bg-accent ${
                item.active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <div className="relative">
                <item.icon
                  className={`w-5 h-5 ${item.active ? 'text-primary' : ''}`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full border border-white shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                item.active ? 'text-primary' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}