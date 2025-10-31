'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, MessageSquare, User, Badge, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from "next-themes";
import { useSession } from 'next-auth/react';

export function MobileNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/messages/unread');
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.unreadCount);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();

      // Fetch on tab focus/visibility change
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          fetchUnreadCount();
        }
      };

      const handleFocus = () => {
        fetchUnreadCount();
      };

      // Listen for messages page refresh trigger
      const handleMessagesRefresh = () => {
        fetchUnreadCount();
      };

      // Additional mobile-specific events
      const handleTouchStart = () => {
        fetchUnreadCount();
      };

      const handleOrientationChange = () => {
        fetchUnreadCount();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('navbar-refresh-unread', handleMessagesRefresh);
      window.addEventListener('touchstart', handleTouchStart);
      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('navbar-refresh-unread', handleMessagesRefresh);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('orientationchange', handleOrientationChange);
      };
    }
  }, [session?.user?.id]);

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