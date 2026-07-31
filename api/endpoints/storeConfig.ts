import { axiosInstance } from "../apiClient";

export interface StoreConfig {
  currency: string;
  timezone: string;
  name: string;
  // Runtime branding fields — flat on the response, not nested under a
  // `branding` key (see docs/MOBILE_RUNTIME_BRANDING_CONTRACT.md). Optional
  // because the backend omits any of these that aren't set or don't pass its
  // own validation, and older/default stores may not have them at all. Not
  // validated here — callers must validate before persisting or rendering
  // (see utils/brandingValidation.ts).
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export const getStoreConfig = async (): Promise<StoreConfig> => {
  try {
    const response = await axiosInstance.get("/store/config");
    console.log("[StoreConfig] Fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.warn("[StoreConfig] Failed to fetch, using defaults:", error);
    return {
      currency: "USD",
      timezone: "UTC",
      name: "",
    };
  }
};
