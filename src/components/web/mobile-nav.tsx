'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, MessageSquare, User, Badge, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from "next-themes";
import { useSession } from 'next-auth/react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function MobileNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Acasă',
      active: pathname === '/',
      prefetch: false, // Dezactivăm prefetch pentru răspuns instant
    },
    {
      href: '/sale',
      icon: Building,
      label: 'Listare',
      active: pathname === '/sale' || pathname.startsWith('/sale/'),
      prefetch: false,
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
      prefetch: false,
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profil',
      active: pathname === '/profile',
      prefetch: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg" style={{ touchAction: 'manipulation' }}>
      <div className="flex items-center justify-around px-1 py-1" style={{ contain: 'layout style' }}>
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
            <button
              key={item.href}
              className={`tap-btn flex flex-col items-center justify-center px-2 py-2 min-w-0 flex-1 ${
                item.active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                } ${isPending && item.active ? 'opacity-60' : ''}`}
              onClick={() => {
                // Feedback vizual instant (< 16ms) cu useTransition
                startTransition(() => router.push(item.href));
              }}
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}