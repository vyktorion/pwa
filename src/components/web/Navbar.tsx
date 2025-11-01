'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Plus, MessageSquare, User, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThemeToggle } from '../ui/theme-toggle';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  session?: Session | null;
}

export default function Navbar({ session: serverSession }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const currentSession = session || serverSession;
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count on mount and when session changes
  useEffect(() => {
    if (currentSession?.user?.id) {
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

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('navbar-refresh-unread', handleMessagesRefresh);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('navbar-refresh-unread', handleMessagesRefresh);
      };
    }
  }, [currentSession?.user?.id]);




  return (
    <nav className="sticky top-0 z-50 bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/favicon.png"
                alt="favicon"
                width={36}
                height={36}
                className="w-9 h-9"
              />
              <span className="text-lg font-bold text-foreground">Imob.ro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Add Property Button - Always visible */}
            <Link href="/test">
              <Button className="h-9 p-2 rounded-xl gap-0">
                <Plus className="w-5 h-5" />
                Adauga anunt
              </Button>
            </Link>

            {/* Auth Buttons */}
            {currentSession ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/messages"
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                >
                  <MessageSquare className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-semibold">Mesaje</span>
                  {unreadCount > 0 && pathname !== '/messages' && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600 rounded-xl">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                >
                  <User className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-semibold">Profil</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent/80 transition-all duration-200 group"
                >
                  <LogIn className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-semibold group-hover:text-primary transition-colors">Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Always show theme toggle */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

      </div>
    </nav>
  );
}
