// Global variable to store the install prompt event
let deferredPrompt: any = null;

// Register Service Worker for PWA functionality
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('🔄 New version available! Refresh to update.');

                  // Optionally show a toast notification to user
                  if (window.confirm('New version available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  } else {
    console.warn('⚠️ Service Workers are not supported in this browser.');
  }

  // Catch the beforeinstallprompt event GLOBALLY
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    console.log('💡 PWA install prompt is available and saved globally!');

    // Dispatch custom event to notify components
    window.dispatchEvent(new Event('pwa-install-available'));
  });
}

// Get the stored install prompt
export function getInstallPrompt() {
  return deferredPrompt;
}

// Function to show install prompt
export async function promptInstallPWA() {
  if (!deferredPrompt) {
    console.log('⚠️ PWA install prompt not available');
    return false;
  }

  try {
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`✅ User response to install prompt: ${outcome}`);

    // Clear the deferredPrompt variable
    deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    console.error('❌ Error showing install prompt:', error);
    return false;
  }
}

// Track PWA installation
window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA installed successfully!');

  // Track installation in analytics if needed
  // analytics.track('pwa_installed');
});

// Detect if app is running as PWA
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Show install instructions for iOS
export function shouldShowIOSInstallPrompt(): boolean {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = (window.navigator as any).standalone;

  return isIOS && !isInStandaloneMode;
}
