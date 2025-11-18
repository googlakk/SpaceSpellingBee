// Performance optimization utilities for mobile devices

/**
 * Detect if device is low-end based on various factors
 */
export function isLowEndDevice(): boolean {
  // Check if user has enabled reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return true;

  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) return true;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;

  // Check connection speed
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === '2g' || effectiveType === 'slow-2g') return true;
  }

  return false;
}

/**
 * Get device performance tier
 */
export type PerformanceTier = 'high' | 'medium' | 'low';

export function getPerformanceTier(): PerformanceTier {
  const deviceMemory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency || 2;

  // High-end device
  if (deviceMemory >= 8 && cores >= 8) return 'high';

  // Medium device
  if (deviceMemory >= 4 && cores >= 4) return 'medium';

  // Low-end device
  return 'low';
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Idle Callback wrapper with fallback
 */
export function requestIdleCallbackPolyfill(callback: () => void, timeout = 1000) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  } else {
    return setTimeout(callback, 1);
  }
}

/**
 * Apply performance class to document based on device tier
 */
export function applyPerformanceClass() {
  const tier = getPerformanceTier();
  const reducedMotion = prefersReducedMotion();

  document.documentElement.classList.add(`perf-${tier}`);

  if (reducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }

  if (isLowEndDevice()) {
    document.documentElement.classList.add('low-end-device');
  }

  console.log(`📊 Performance Tier: ${tier}`);
  console.log(`🎭 Reduced Motion: ${reducedMotion}`);
  console.log(`📱 Low-End Device: ${isLowEndDevice()}`);
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  const duration = end - start;

  if (duration > 16.67) {
    console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
  }
}

/**
 * Check if device supports backdrop-filter
 */
export function supportsBackdropFilter(): boolean {
  return CSS.supports('backdrop-filter', 'blur(10px)');
}

/**
 * Get optimal animation duration based on device
 */
export function getAnimationDuration(baseMs: number): number {
  const tier = getPerformanceTier();
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) return 0;

  switch (tier) {
    case 'high':
      return baseMs;
    case 'medium':
      return baseMs * 0.7;
    case 'low':
      return baseMs * 0.5;
    default:
      return baseMs;
  }
}
