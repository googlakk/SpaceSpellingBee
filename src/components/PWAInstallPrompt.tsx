import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { X, Download, Smartphone } from 'lucide-react';
import { shouldShowIOSInstallPrompt, promptInstallPWA, isPWA, getInstallPrompt } from '@/registerSW';

export const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    if (isPWA()) {
      return; // Already installed
    }

    // Check for iOS
    const showIOSPrompt = shouldShowIOSInstallPrompt();
    setIsIOS(showIOSPrompt);

    if (showIOSPrompt) {
      // Show iOS instructions after a delay
      const timer = setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timer);
    }

    // For Android/Chrome - check if install prompt is available
    const checkInstallPrompt = () => {
      const prompt = getInstallPrompt();
      if (prompt) {
        setCanInstall(true);
      }
    };

    // Check immediately
    checkInstallPrompt();

    // Listen for custom event when install prompt becomes available
    const handlePromptAvailable = () => {
      checkInstallPrompt();
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
      if (!hasSeenPrompt) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener('pwa-install-available', handlePromptAvailable);

    return () => {
      window.removeEventListener('pwa-install-available', handlePromptAvailable);
    };
  }, []);

  const handleInstall = async () => {
    if (canInstall) {
      const accepted = await promptInstallPWA();
      if (accepted) {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-prompt-seen', 'true');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
      <div className="glass-card rounded-2xl p-4 md:p-6 border-2 border-primary/30 glow-cyan shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-primary flex items-center justify-center glow-cyan">
              <Smartphone className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-bold text-glow-cyan font-display mb-1">
              Install Spelling Bee
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {isIOS
                ? 'Add to your home screen for the best experience!'
                : 'Install our app for quick access and offline learning!'}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="space-y-2 text-xs md:text-sm">
            <p className="font-medium">How to install on iOS:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Tap the Share button <span className="inline-block">📤</span></li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" to confirm</li>
            </ol>
            <Button
              onClick={handleDismiss}
              className="w-full mt-3 rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all"
              size="sm"
            >
              Got it!
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleInstall}
              className="flex-1 rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all"
              size="sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="rounded-full glass-card border-primary/30"
              size="sm"
            >
              Later
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
