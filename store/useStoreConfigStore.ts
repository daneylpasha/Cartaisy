import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StoreConfigState {
  currency: string;
  timezone: string;
  storeName: string;
  // Runtime branding — already validated by the caller (see
  // utils/brandingValidation.ts) before it reaches this store. Undefined
  // means "no valid value from the most recent fetch"; a startup that can't
  // reach the backend, or a response that simply doesn't set a field, never
  // clears an already-persisted value here — see setConfig below.
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  isLoaded: boolean;
  setConfig: (config: {
    currency: string;
    timezone: string;
    storeName: string;
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
  }) => void;
  setCurrency: (currency: string) => void;
  reset: () => void;
}

const useStoreConfigStore = create<StoreConfigState>()(
  persist(
    (set) => ({
      currency: "USD",
      timezone: "UTC",
      storeName: "",
      primaryColor: undefined,
      secondaryColor: undefined,
      logoUrl: undefined,
      isLoaded: false,
      setConfig: (config) => set((state) => ({
        currency: config.currency || "USD",
        timezone: config.timezone || "UTC",
        storeName: config.storeName || "",
        // Branding fields only ever move from "absent" to "a new valid
        // value," or stay as whatever was last persisted. A field that's
        // absent on this call — whether because the backend genuinely has
        // nothing set for this store, or because the fetch itself failed
        // and the caller is passing through its own fallback defaults —
        // must never clear a previously persisted value. This is what
        // keeps last-known branding intact across a failed refetch, per
        // the contract doc's fallback rule.
        primaryColor: config.primaryColor ?? state.primaryColor,
        secondaryColor: config.secondaryColor ?? state.secondaryColor,
        logoUrl: config.logoUrl ?? state.logoUrl,
        isLoaded: true,
      })),
      setCurrency: (currency) => set({ currency }),
      reset: () => set({
        currency: "USD",
        timezone: "UTC",
        storeName: "",
        primaryColor: undefined,
        secondaryColor: undefined,
        logoUrl: undefined,
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
