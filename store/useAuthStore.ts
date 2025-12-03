import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isProfileComplete: boolean;
  _hasHydrated: boolean;
  setToken: (token: string, refreshToken?: string) => void;
  setProfileComplete: (complete: boolean) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      isProfileComplete: false,
      _hasHydrated: false,

      setToken: (token, refreshToken) => {
        console.log('[AuthStore] setToken called with token:', token ? 'EXISTS (length: ' + token.length + ')' : 'NULL');
        set({ token, refreshToken: refreshToken || null });
        // Verify it was set
        setTimeout(() => {
          const currentToken = get().token;
          console.log('[AuthStore] Token after set:', currentToken ? 'EXISTS' : 'NULL');
        }, 100);
      },

      setProfileComplete: (complete) =>
        set({ isProfileComplete: complete }),

      clearAuth: () => {
        console.log('[AuthStore] clearAuth called - clearing token!');
        set({
          token: null,
          refreshToken: null,
          isProfileComplete: false,
        });
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isProfileComplete: state.isProfileComplete,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[AuthStore] Rehydrated from storage, token:', state?.token ? 'EXISTS' : 'NULL');
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;