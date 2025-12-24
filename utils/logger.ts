/**
 * Debug logging utilities that only output in development mode
 * These logs are automatically disabled in production builds
 */

export const debugLog = (...args: any[]) => {
  if (__DEV__) {
    console.log(...args);
  }
};

export const debugWarn = (...args: any[]) => {
  if (__DEV__) {
    console.warn(...args);
  }
};

export const debugError = (...args: any[]) => {
  if (__DEV__) {
    console.error(...args);
  }
};
