import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';

interface User {
  id?: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  [key: string]: any; // Allow any additional dynamic fields
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  profileData: Record<string, any>; // Temporary storage for profile completion data (not persisted)
  setToken: (token: string, refreshToken?: string) => void;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setProfileData: (data: Record<string, any>) => void;
  updateProfileData: (key: string, value: any) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      profileData: {},

      setToken: (token, refreshToken) =>
        set({ token, refreshToken: refreshToken || null }),

      setUser: (user) =>
        set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : updates as User,
        })),

      setProfileData: (data) =>
        set({ profileData: data }),

      updateProfileData: (key, value) =>
        set((state) => ({
          profileData: { ...state.profileData, [key]: value },
        })),

      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          profileData: {},
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist token, refreshToken, and user - not profileData
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;