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

/**
 * Connection-aware loading utilities
 */
export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

export function getConnectionType(): ConnectionType {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (!connection) return 'unknown';

  const effectiveType = connection.effectiveType;
  return effectiveType || 'unknown';
}

export function isSlowConnection(): boolean {
  const connectionType = getConnectionType();
  return connectionType === 'slow-2g' || connectionType === '2g';
}

export function isFastConnection(): boolean {
  const connectionType = getConnectionType();
  return connectionType === '4g';
}

/**
 * Check if data saver mode is enabled
 */
export function isDataSaverEnabled(): boolean {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return connection?.saveData === true;
}

/**
 * Get optimal image quality based on connection and device
 */
export function getOptimalImageQuality(): number {
  if (isDataSaverEnabled()) return 0.5;
  if (isSlowConnection()) return 0.6;
  if (isLowEndDevice()) return 0.7;
  return 1.0;
}

/**
 * Should preload resource based on connection
 */
export function shouldPreloadResource(): boolean {
  return !isSlowConnection() && !isDataSaverEnabled() && !isLowEndDevice();
}

/**
 * Get optimal fetch priority for resources
 */
export function getResourcePriority(): 'low' | 'high' | 'auto' {
  if (isSlowConnection() || isDataSaverEnabled()) return 'high';
  if (isLowEndDevice()) return 'high';
  return 'auto';
}

/**
 * Apply connection-aware optimizations
 */
export function applyConnectionOptimizations() {
  const isSlowConn = isSlowConnection();
  const dataSaver = isDataSaverEnabled();

  if (isSlowConn || dataSaver) {
    document.documentElement.classList.add('slow-connection');
  }

  if (dataSaver) {
    document.documentElement.classList.add('data-saver');
  }

  console.log(`🌐 Connection Type: ${getConnectionType()}`);
  console.log(`💾 Data Saver: ${dataSaver}`);
  console.log(`🐌 Slow Connection: ${isSlowConn}`);
}
