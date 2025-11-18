import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { shouldShowIOSInstallPrompt, promptInstallPWA, isPWA, getInstallPrompt } from '@/registerSW';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export const InstallButton = ({
  variant = 'default',
  size = 'default',
  className = '',
  fullWidth = false
}: InstallButtonProps) => {
  const [showButton, setShowButton] = useState(false);
  const [showIOSDialog, setShowIOSDialog] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      setShowButton(false);
      return;
    }

    // Check for iOS
    const isIOSDevice = shouldShowIOSInstallPrompt();
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      setShowButton(true);
      return;
    }

    // For Android/Chrome - check if install prompt is available
    const checkInstallPrompt = () => {
      const prompt = getInstallPrompt();
      if (prompt) {
        setCanInstall(true);
        setShowButton(true);
        console.log('✅ Install prompt is ready!');
      }
    };

    // Check immediately
    checkInstallPrompt();

    // Listen for custom event when install prompt becomes available
    const handlePromptAvailable = () => {
      console.log('📱 PWA install available event received');
      checkInstallPrompt();
    };

    window.addEventListener('pwa-install-available', handlePromptAvailable);

    // Show button after a delay even if event hasn't fired yet (for testing)
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2000);

    return () => {
      window.removeEventListener('pwa-install-available', handlePromptAvailable);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    console.log('🔘 Install button clicked');
    console.log('Platform:', isIOS ? 'iOS' : 'Android/Desktop');
    console.log('Can install:', canInstall);

    if (isIOS) {
      // Show iOS instructions dialog
      console.log('📱 Showing iOS instructions');
      setShowIOSDialog(true);
    } else if (canInstall) {
      // Show Android/Chrome native install dialog
      console.log('🚀 Attempting to show native install dialog...');
      const accepted = await promptInstallPWA();
      if (accepted) {
        setShowButton(false);
        console.log('✅ PWA installed successfully!');
      } else {
        console.log('❌ User cancelled installation');
      }
    } else {
      // Fallback: show instructions
      console.log('⚠️ Install prompt not available, showing instructions');
      setShowIOSDialog(true);
    }
  };

  if (!showButton) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleInstall}
        variant={variant}
        size={size}
        className={`${fullWidth ? 'w-full' : ''} ${className}`}
      >
        {isIOS ? (
          <>
            <Smartphone className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Установить приложение
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Установить приложение
          </>
        )}
      </Button>

      {/* iOS Installation Instructions Dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="glass-card max-w-md border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-display text-glow-cyan flex items-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              Установка на {isIOS ? 'iOS' : 'Android'}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Следуйте инструкциям ниже для установки приложения
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {isIOS ? (
              // iOS Instructions
              <div className="space-y-3">
                <div className="glass-card rounded-xl p-4 border border-primary/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">1</span>
                    Нажмите кнопку "Поделиться"
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Найдите кнопку <span className="inline-block text-xl">📤</span> внизу экрана Safari и нажмите на нее
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 border border-primary/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">2</span>
                    Прокрутите вниз
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Прокрутите список вниз и найдите опцию <strong>"На экран «Домой»"</strong>
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 border border-primary/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">3</span>
                    Подтвердите установку
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Нажмите <strong>"Добавить"</strong> в правом верхнем углу
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 bg-success/10 border border-success/30">
                  <p className="text-sm text-center">
                    <strong className="text-success">✓</strong> Готово! Приложение появится на главном экране вашего устройства
                  </p>
                </div>
              </div>
            ) : (
              // Android/Generic Instructions
              <div className="space-y-3">
                <div className="glass-card rounded-xl p-4 border border-primary/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">1</span>
                    Откройте меню браузера
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Нажмите на три точки <strong>⋮</strong> в правом верхнем углу Chrome
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 border border-primary/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">2</span>
                    Установите приложение
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Выберите <strong>"Добавить на главный экран"</strong> или <strong>"Установить приложение"</strong>
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 border border-primary/20">
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm">3</span>
                    Подтвердите
                  </h4>
                  <p className="text-sm text-muted-foreground ml-8">
                    Нажмите <strong>"Установить"</strong> или <strong>"Добавить"</strong>
                  </p>
                </div>

                <div className="glass-card rounded-xl p-4 bg-success/10 border border-success/30">
                  <p className="text-sm text-center">
                    <strong className="text-success">✓</strong> Готово! Приложение появится на главном экране
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setShowIOSDialog(false)}
              className="w-full rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all"
            >
              Понятно!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
