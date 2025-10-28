'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Menu, X, User, LogOut, Plus, MessageSquare } from 'lucide-react';
import { LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ThemeToggle } from './ui/theme-toggle';
import { Session } from 'next-auth';

interface NavbarProps {
  session?: Session | null;
}

export default function Navbar({ session: serverSession }: NavbarProps) {
  const { data: session } = useSession();
  const currentSession = session || serverSession;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!(currentSession?.user as any)?.id) return;

    try {
      // Check if user is currently on messages page
      const isOnMessagesPage = window.location.pathname === '/messages';

      const response = await fetch('/api/messages/unread');
      if (response.ok) {
        const data = await response.json();
        // If user is on messages page, don't show navbar badge
        setUnreadCount(isOnMessagesPage ? 0 : data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if ((currentSession?.user as any)?.id) {
      // Întârzie fetch-ul mesajelor pentru a prioritiza proprietățile
      const timer = setTimeout(() => {
        fetchUnreadCount();
      }, 1000); // Întârzie cu 1 secundă

      // Listen for messages viewed events only
      const handleMessagesViewed = () => {
        // Small delay to ensure messages are marked as read
        setTimeout(fetchUnreadCount, 1000);
      };

      window.addEventListener('messagesViewed', handleMessagesViewed);

      // Refresh when window regains focus
      const handleFocus = () => {
        fetchUnreadCount();
      };

      window.addEventListener('focus', handleFocus);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('messagesViewed', handleMessagesViewed);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [(currentSession?.user as any)?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold text-foreground">Imob.ro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons */}
             {currentSession ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/sale/post" >
                  <Button
                    // variant="secondary" (mutat pe Button)
                    className="h-9 p-2 rounded-xl gap-0"
                  >
                    <Plus className="w-5 h-5" />
                    Adauga anunt
                  </Button>
                </Link>
                <Link
                  href="/messages"
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                >
                  <MessageSquare className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-semibold">Mesaje</span>
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
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
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                >
                  <Plus className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-semibold">Signup</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                >
                  <LogIn className="h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-semibold">Login</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {currentSession ? (
                <>
                  <Link
                    href="/messages"
                    className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 group-hover:text-primary transition-colors" />
                    <span>Mesaje</span>
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5 group-hover:text-primary transition-colors" />
                    <span>Profil</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Deconectare</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Button asChild variant="ghost" className="w-full justify-center text-center h-11 rounded-xl font-semibold hover:bg-accent/80">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Autentificare
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-center text-center h-11 rounded-xl font-semibold shadow-lg">
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      Înregistrează-te
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}