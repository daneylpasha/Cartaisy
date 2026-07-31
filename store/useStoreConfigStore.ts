import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StoreConfigState {
  currency: string;
  timezone: string;
  storeName: string;
  // Runtime branding — already validated by the caller (see
  // utils/brandingValidation.ts) before it reaches this store. Undefined
  // means "no valid value as of the last setConfig call that represented a
  // successful fetch."
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
    // Whether this call represents a successful `/store/config` fetch.
    // Defaults to true. When explicitly false (the caller's fetch failed
    // and it's passing through its own fallback defaults), branding
    // fields are left untouched instead of being cleared — this is what
    // keeps last-known branding intact across a failed refetch, per the
    // contract doc's fallback rule. currency/timezone/storeName are NOT
    // covered by this — they keep their existing overwrite-on-every-call
    // behavior regardless of fetchSucceeded, unchanged from before.
    fetchSucceeded?: boolean;
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
      setConfig: (config) => set((state) => {
        const fetchSucceeded = config.fetchSucceeded ?? true;

        return {
          currency: config.currency || "USD",
          timezone: config.timezone || "UTC",
          storeName: config.storeName || "",
          // On a successful fetch, a branding field that's absent or
          // invalid means the backend genuinely has nothing there right
          // now (e.g. a merchant removed their custom color) — that must
          // clear any stale persisted value, not keep it forever. Only a
          // failed fetch (fetchSucceeded: false) preserves what was
          // already persisted.
          primaryColor: fetchSucceeded ? config.primaryColor : state.primaryColor,
          secondaryColor: fetchSucceeded ? config.secondaryColor : state.secondaryColor,
          logoUrl: fetchSucceeded ? config.logoUrl : state.logoUrl,
          isLoaded: true,
        };
      }),
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
