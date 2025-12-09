import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

// UUID generator for guest sessions
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isProfileComplete: boolean;
  _hasHydrated: boolean;

  // Guest mode fields
  isGuest: boolean;
  guestSessionId: string | null;
  deviceId: string | null;

  // Actions
  setToken: (token: string, refreshToken?: string) => void;
  setProfileComplete: (complete: boolean) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;

  // Guest actions
  initializeDeviceId: () => void;
  setGuestSession: (sessionId: string) => void;
  clearGuestSession: () => void;
  enableGuestMode: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      isProfileComplete: false,
      _hasHydrated: false,

      // Guest mode state
      isGuest: false,
      guestSessionId: null,
      deviceId: null,

      setToken: (token, refreshToken) => {
        console.log('[AuthStore] setToken called with token:', token ? 'EXISTS (length: ' + token.length + ')' : 'NULL');
        // When logging in, keep guestSessionId temporarily for backend auto-merge
        set({
          token,
          refreshToken: refreshToken || null,
          isGuest: false, // Clear guest mode when logged in
        });
        // Verify it was set
        setTimeout(() => {
          const currentToken = get().token;
          console.log('[AuthStore] Token after set:', currentToken ? 'EXISTS' : 'NULL');
        }, 100);
      },

      setProfileComplete: (complete) =>
        set({ isProfileComplete: complete }),

      clearAuth: () => {
        console.log('[AuthStore] clearAuth called - clearing token, switching to guest mode');
        set({
          token: null,
          refreshToken: null,
          isProfileComplete: false,
          isGuest: true, // Switch to guest mode on logout
          // Keep guestSessionId and deviceId to maintain cart
        });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      // Guest mode actions
      initializeDeviceId: () => {
        const currentDeviceId = get().deviceId;
        if (!currentDeviceId) {
          const newDeviceId = generateUUID();
          console.log('[AuthStore] Generated new device ID:', newDeviceId);
          set({ deviceId: newDeviceId });
        } else {
          console.log('[AuthStore] Device ID already exists:', currentDeviceId);
        }
      },

      setGuestSession: (sessionId: string) => {
        console.log('[AuthStore] Setting guest session:', sessionId);
        set({
          guestSessionId: sessionId,
          isGuest: true,
        });
      },

      clearGuestSession: () => {
        console.log('[AuthStore] Clearing guest session');
        set({
          guestSessionId: null,
          isGuest: false,
        });
      },

      enableGuestMode: () => {
        const { token } = get();
        if (!token) {
          console.log('[AuthStore] Enabling guest mode');
          set({ isGuest: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isProfileComplete: state.isProfileComplete,
        // Persist guest session data
        guestSessionId: state.guestSessionId,
        deviceId: state.deviceId,
        isGuest: state.isGuest,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[AuthStore] Rehydrated from storage, token:', state?.token ? 'EXISTS' : 'NULL');
        console.log('[AuthStore] Guest session:', state?.guestSessionId ? 'EXISTS' : 'NULL');
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;