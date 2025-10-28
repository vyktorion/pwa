'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 5 seconds of user engagement
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install outcome:', outcome);
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('installDismissed', Date.now().toString());
  };

  // Don't show if already dismissed recently
  const [dismissed, setDismissed] = useState<string | null>(null);

  useEffect(() => {
    const dismissedValue = localStorage.getItem('installDismissed');
    setDismissed(dismissedValue);
  }, []);

  if (dismissed && (Date.now() - parseInt(dismissed)) < 24 * 60 * 60 * 1000) {
    return null;
  }

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">📱 Instalează Imob.ro</h3>
          <p className="text-sm opacity-90 mb-3">
            Adaugă aplicația pe ecranul principal pentru acces rapid și offline.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="bg-white text-primary hover:bg-gray-100">
              Instalează
            </Button>
            <Button onClick={handleDismiss} variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              Mai târziu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}