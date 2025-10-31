'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Footer() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isiOS, setIsiOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
    setIsiOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for install prompt (Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const handleIOSInstructions = () => {
    // Show instructions modal or page for iOS
    alert('Pentru a instala aplicația pe iOS:\n1. Apăsați butonul Share (📤)\n2. Selectați "Adaugă pe ecranul principal"\n3. Confirmați adăugarea');
  };

  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">Imob.ro</h3>
          <p className="text-muted-foreground">Platforma imobiliară modernă pentru România</p>
        </div>

        {/* Download Section */}
        <div className="flex flex-col items-center gap-6">
          <h4 className="text-lg font-semibold text-foreground">Descarcă Aplicația</h4>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Android Button */}
            {isAndroid && (
              <Button
                onClick={handleAndroidInstall}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:scale-105"
                disabled={!deferredPrompt}
              >
                <span className="text-2xl">🤖</span>
                <div className="text-left">
                  <div className="font-semibold">Android</div>
                  <div className="text-sm opacity-90">Instalează direct</div>
                </div>
              </Button>
            )}

            {/* iOS Button */}
            {isiOS && (
              <Button
                onClick={handleIOSInstructions}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 hover:scale-105"
              >
                <span className="text-2xl">🍎</span>
                <div className="text-left">
                  <div className="font-semibold">iOS</div>
                  <div className="text-sm opacity-75">Instrucțiuni</div>
                </div>
              </Button>
            )}

            {/* Desktop - Show both */}
            {!isAndroid && !isiOS && (
              <>
                <Button
                  onClick={handleAndroidInstall}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-105"
                  disabled={!deferredPrompt}
                >
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="font-semibold">Android</div>
                    <div className="text-sm opacity-90">Instalează direct</div>
                  </div>
                </Button>

                <Button
                  onClick={handleIOSInstructions}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-105"
                >
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <div className="font-semibold">iOS</div>
                    <div className="text-sm opacity-75">Instrucțiuni</div>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Link-uri și informații suplimentare */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-8 border-t border-border/50">
          {/* Link-uri utile */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-foreground mb-4">Link-uri utile</h4>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Despre noi</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Cum funcționează</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Termeni și condiții</a>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Politica de confidențialitate</a>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 contact@imob.ro</p>
              <p>📱 +40 123 456 789</p>
              <p>📍 București, România</p>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-foreground mb-4">Urmărește-ne</h4>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors text-xl" title="Facebook">f</a>
              <a href="#" className="text-muted-foreground hover:text-pink-600 transition-colors text-xl" title="Instagram">📷</a>
              <a href="#" className="text-muted-foreground hover:text-blue-400 transition-colors text-xl" title="Twitter">𝕏</a>
              <a href="#" className="text-muted-foreground hover:text-black transition-colors text-xl" title="TikTok">🎵</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">© 2025 Imob.ro - Toate drepturile rezervate</p>
        </div>
      </div>
    </footer>
  );
}
