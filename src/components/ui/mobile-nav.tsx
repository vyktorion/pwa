'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, MessageSquare, User, Badge, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from "next-themes";
import { useSession } from 'next-auth/react';
import { useNotificationsStore } from '@/stores/notifications.store';

export function MobileNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const unreadCount = useNotificationsStore(state => state.unreadCount);

  // Mobile nav uses the same global state as desktop nav
  // No additional effects needed since Zustand handles reactivity

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