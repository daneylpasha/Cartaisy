/**
 * Simple navigation state to coordinate between cold start deep linking and splash screen
 * This prevents splash screen from overriding deep link navigation
 */

let deepLinkNavigationHandled = false;

/**
 * Mark that deep link navigation has been handled (called from cold start handler)
 */
export function setDeepLinkHandled(handled: boolean): void {
  deepLinkNavigationHandled = handled;
  console.log('[NavigationState] Deep link handled set to:', handled);
}

/**
 * Check if deep link navigation was already handled
 * Splash screen should check this before navigating
 */
export function wasDeepLinkHandled(): boolean {
  return deepLinkNavigationHandled;
}

/**
 * Reset the state (call when app goes to background or on logout)
 */
export function resetDeepLinkState(): void {
  deepLinkNavigationHandled = false;
  console.log('[NavigationState] Deep link state reset');
}
