'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Building, MessageSquare, User, SquarePlus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItem = {
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  badge?: number | null;
  action?: () => void;
};

export function MobileNav({ unreadCount }: { unreadCount: number }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [activePath, setActivePath] = useState(pathname);

  // Sync activePath with actual pathname changes
  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  if (!isMobile) return null;

  const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Acasă' },
    { href: '/sale', icon: Building, label: 'Listate' },
    { href: '/sale/post', icon: SquarePlus, label: 'Adaugă' },
    { href: '/messages', icon: MessageSquare, label: 'Mesaje', badge: unreadCount },
    { href: '/profile', icon: User, label: 'Profil' },
  ];

  const handleNavigation = (href: string) => {
    // Set active state instantly for immediate feedback
    setActivePath(href);
    // Navigate without waiting
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={() => handleNavigation(item.href)}
            className={`flex flex-col items-center justify-center px-2 py-2 transition-colors duration-150 min-w-0 flex-1 touch-manipulation ${
              activePath === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <div className="relative">
              {item.icon && <item.icon className="w-5 h-5" />}
              {item.badge && (
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border border-white shadow-sm">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
