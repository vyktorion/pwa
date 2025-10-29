'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, MessageSquare, User, Badge, Sun, Moon } from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from "next-themes";

export function MobileNav() {
  const isPWA = usePWA();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastFetchRef = useRef<number>(0);
  const cacheRef = useRef<{ count: number; timestamp: number } | null>(null);

  const fetchUnreadCount = useCallback(async (force = false) => {
    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 seconds cache
    const DEBOUNCE_DELAY = 2000; // 2 seconds debounce

    // Check cache first
    if (!force && cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setUnreadCount(cacheRef.current.count);
      return;
    }

    // Check debounce
    if (!force && (now - lastFetchRef.current) < DEBOUNCE_DELAY) {
      return;
    }

    lastFetchRef.current = now;

    try {
      const response = await fetch('/api/messages/unread');
      if (response.ok) {
        const data = await response.json();
        const count = data.unreadCount;
        setUnreadCount(count);
        cacheRef.current = { count, timestamp: now };
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  useEffect(() => {
    // Only fetch and listen when mobile AND PWA
    if (!isMobile || !isPWA) return;

    fetchUnreadCount();

    // Prefetch critical routes for better performance
    const prefetchRoutes = () => {
      const routes = ['/messages', '/sale', '/profile'];
      routes.forEach(route => {
        if (route !== pathname) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          link.as = 'document';
          document.head.appendChild(link);
        }
      });
    };

    // Prefetch after a short delay to not block initial load
    const prefetchTimer = setTimeout(prefetchRoutes, 1000);

    // Listen for messages viewed events
    const handleMessagesViewed = () => {
      fetchUnreadCount(true); // Force refresh when messages are viewed
    };

    window.addEventListener('messagesViewed', handleMessagesViewed);

    return () => {
      clearTimeout(prefetchTimer);
      window.removeEventListener('messagesViewed', handleMessagesViewed);
    };
  }, [isMobile, isPWA, fetchUnreadCount, pathname]);

  // Only show on mobile PWA
  if (!isMobile || !isPWA) {
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
      badge: unreadCount > 0 ? unreadCount : null,
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
                className="flex flex-col items-center justify-center px-2 py-2 transition-colors duration-150 min-w-0 flex-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 touch-manipulation"
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
              className={`flex flex-col items-center justify-center px-2 py-2 transition-colors duration-150 min-w-0 flex-1 touch-manipulation ${
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
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
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