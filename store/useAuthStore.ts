import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  setToken: (token: string, refreshToken?: string) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,

      setToken: (token, refreshToken) =>
        set({ token, refreshToken: refreshToken || null }),

      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;