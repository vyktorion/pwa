'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  initialTheme?: 'light' | 'dark';
}

export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Use initial theme immediately, then switch to client theme after mount
  const currentTheme = mounted ? theme : (initialTheme || 'light');

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 px-0"
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
      aria-label="Toggle theme"
    >
      {currentTheme === 'light' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
