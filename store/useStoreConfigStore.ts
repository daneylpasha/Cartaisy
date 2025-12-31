import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StoreConfigState {
  currency: string;
  timezone: string;
  storeName: string;
  isLoaded: boolean;
  setConfig: (config: { currency: string; timezone: string; storeName: string }) => void;
  setCurrency: (currency: string) => void;
  reset: () => void;
}

const useStoreConfigStore = create<StoreConfigState>()(
  persist(
    (set) => ({
      currency: "USD",
      timezone: "UTC",
      storeName: "",
      isLoaded: false,
      setConfig: (config) => set({
        currency: config.currency || "USD",
        timezone: config.timezone || "UTC",
        storeName: config.storeName || "",
        isLoaded: true,
      }),
      setCurrency: (currency) => set({ currency }),
      reset: () => set({
        currency: "USD",
        timezone: "UTC",
        storeName: "",
        isLoaded: false,
      }),
    }),
    {
      name: "store-config-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useStoreConfigStore;
