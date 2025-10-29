'use client';

import { useEffect, useState } from 'react';

export function usePWA(): boolean {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const checkPWA = () => {
      // Combined PWA detection for all platforms
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches || // Android, desktop PWA
        (window.navigator as { standalone?: boolean }).standalone || // iOS Safari
        window.location.search.includes('pwa=true'); // fallback URL param for testing

      setIsPWA(!!isStandalone);
    };

    checkPWA();
  }, []);

  return isPWA;
}