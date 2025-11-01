'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, MessageSquare, User, SquarePlus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSession } from 'next-auth/react';

type NavItem = {
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  badge?: number | null;
  action?: () => void;
};

export function MobileNav() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [activePath, setActivePath] = useState(pathname);

  // Sincronizează activePath cu pathname
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  // Fetch unread count la mount și când sesiunea se schimbă
  useEffect(() => {
    if (!session?.user?.id) return;

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

    // Evenimente pentru refresh
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount();
    };
    const handleTouchStart = () => fetchUnreadCount();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [session?.user?.id]);

  if (!isMobile) return null;

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Acasă', active: activePath === '/' },
    {
      href: '/sale',
      icon: Building,
      label: 'Listate',
      active:
        activePath === '/sale' ||
        (activePath.startsWith('/sale/') && !activePath.startsWith('/sale/post')),
    },
    { href: '/test', icon: SquarePlus, label: 'Adauga', active: activePath === '/test' },
    {
      href: '/messages',
      icon: MessageSquare,
      label: 'Mesaje',
      active: activePath === '/messages',
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { href: '/profile', icon: User, label: 'Profil', active: activePath === '/profile' },
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
                {item.icon && <item.icon className="w-5 h-5" />}
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActivePath(item.href)}
              className={`flex flex-col items-center justify-center px-2 py-2 transition-colors duration-150 min-w-0 flex-1 touch-manipulation ${
                item.active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <div className="relative">
                {item.icon && <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : ''}`} />}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full border border-white shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-1 font-medium ${item.active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
