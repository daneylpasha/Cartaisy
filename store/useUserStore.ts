import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/utils/storage';
import { IAddress } from '@/api/generated/cartaisyAPI.schemas';

interface User {
  id?: string;
  email?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  [key: string]: any; // Allow any additional dynamic fields
}

interface UserState {
  user: User | null;
  defaultAddress: IAddress | null;
  profileData: Record<string, any>; // Temporary storage for profile completion data (not persisted)
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  setDefaultAddress: (address: IAddress | null) => void;
  setProfileData: (data: Record<string, any>) => void;
  updateProfileData: (key: string, value: any) => void;
  clearUser: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      defaultAddress: null,
      profileData: {},

      setUser: (user) =>
        set({ user }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : updates as User,
        })),

      setDefaultAddress: (address) =>
        set({ defaultAddress: address }),

      setProfileData: (data) =>
        set({ profileData: data }),

      updateProfileData: (key, value) =>
        set((state) => ({
          profileData: { ...state.profileData, [key]: value },
        })),

      clearUser: () =>
        set({
          user: null,
          defaultAddress: null,
          profileData: {},
        }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist user and defaultAddress - not profileData
      partialize: (state) => ({
        user: state.user,
        defaultAddress: state.defaultAddress,
      }),
    }
  )
);

export default useUserStore;
