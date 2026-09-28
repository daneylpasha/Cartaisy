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
  // App icon and splash, flat on `data` like the other branding fields.
  // `appIconUrl` and `splashImageUrl` are read aliases of the same values.
  // Omitted (not null) when unset or rejected by the backend. Callers still
  // validate before persisting — see utils/brandingValidation.ts.
  iconUrl?: string;
  appIconUrl?: string;
  splashUrl?: string;
  splashImageUrl?: string;
}

// Note: this throws on fetch failure rather than swallowing the error and
// returning bare defaults. That used to happen here, which made a genuine
// fetch failure indistinguishable from a successful response that simply
// has no branding fields set — both looked like the same bare object to
// the caller. Distinguishing them matters: only a real fetch failure
// should preserve previously persisted branding (see AppInitializer.tsx
// and store/useStoreConfigStore.ts's `fetchSucceeded` flag); a successful
// response that omits a field means the backend genuinely has nothing
// there now, and stale branding should clear. The caller is responsible
// for catching and falling back to defaults.
export const getStoreConfig = async (): Promise<StoreConfig> => {
  const response = await axiosInstance.get("/store/config");
  // Do not log the payload. Branding URLs are public, but a malformed
  // response could still carry a token-shaped string and this log runs
  // before validation.
  console.log("[StoreConfig] Fetched successfully");
  return response.data.data;
};
