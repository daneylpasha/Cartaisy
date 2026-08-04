import { useGetFavorites } from "@/api/generated/favorites/favorites";
import { mobileConfig } from "@/api/config/mobileConfig";
import { getStoreConfig } from "@/api/endpoints/storeConfig";
import { useDynamicPrimaryTheme } from "@/hooks/useDynamicPrimaryTheme";
import { useDynamicSecondaryTheme } from "@/hooks/useDynamicSecondaryTheme";
import useAuthStore from "@/store/useAuthStore";
import useFavoritesStore from "@/store/useFavoritesStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { validateBranding } from "@/utils/brandingValidation";
import { useEffect, useRef } from "react";
import Axios from "axios";

const API_BASE_URL = mobileConfig.apiBaseUrl;
const STORE_ID = mobileConfig.storeId;

/**
 * Central initialization component for app-level features
 * Must be rendered inside QueryClientProvider
 *
 * Add any new app-level initialization logic here (e.g., user preferences, cart sync, etc.)
 */
export const AppInitializer = () => {
  // ==================== GUEST MODE INITIALIZATION ====================
  const { token, refreshToken, initializeDeviceId, enableGuestMode, setToken, clearAuth, _hasHydrated } = useAuthStore();
  const tokenRefreshAttemptedRef = useRef(false);

  useEffect(() => {
    if (_hasHydrated) {
      // Initialize device ID for tracking (persisted across sessions)
      initializeDeviceId();

      // If no token, enable guest mode
      if (!token) {
        enableGuestMode();
        console.log("[AppInitializer] Guest mode enabled");
      }
    }
  }, [_hasHydrated, token, initializeDeviceId, enableGuestMode]);

  // ==================== STARTUP TOKEN REFRESH ====================
  // Proactively refresh token on app startup if user is logged in
  // This handles cases where the access token expired while the app was closed
  // Deferred to allow navigation to be ready first
  useEffect(() => {
    const refreshTokenOnStartup = async () => {
      // Only attempt once per app session
      if (tokenRefreshAttemptedRef.current) return;

      // Only if we have both tokens (user was logged in)
      if (!_hasHydrated || !token || !refreshToken) return;

      tokenRefreshAttemptedRef.current = true;
      console.log("[AppInitializer] Proactively refreshing token on startup...");

      try {
        const response = await Axios.post(
          `${API_BASE_URL}/customer/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Store-ID": STORE_ID,
            },
          }
        );

        const newAccessToken = response.data?.data?.accessToken || response.data?.data?.token;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (newAccessToken) {
          console.log("[AppInitializer] Token refresh SUCCESS - new token received");
          setToken(newAccessToken, newRefreshToken || refreshToken);
        } else {
          console.log("[AppInitializer] Token refresh response missing access token");
        }
      } catch (error: any) {
        console.log("[AppInitializer] Token refresh FAILED:", error?.message);
        console.log("[AppInitializer] Status:", error?.response?.status);
        console.log("[AppInitializer] Response:", error?.response?.data);

        // If refresh token is also expired/invalid, clear auth
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.log("[AppInitializer] Refresh token invalid - clearing auth");
          clearAuth();
        }
        // For other errors (network, etc.), keep existing tokens and let user retry
      }
    };

    // Defer token refresh to 1.5 seconds to allow navigation to be ready
    const timer = setTimeout(refreshTokenOnStartup, 1500);
    return () => clearTimeout(timer);
  }, [_hasHydrated, token, refreshToken, setToken, clearAuth]);

  // ==================== FAVORITES INITIALIZATION ====================
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  const isGuest = useAuthStore((state) => state.isGuest);
  const isAuthenticated = _hasHydrated && !!token && !isGuest;

  // Only fetch favorites if user is logged in (not guest)
  const { data: favoritesData, refetch: refetchFavorites } = useGetFavorites({
    query: {
      enabled: isAuthenticated, // Only run query if logged in and not guest
      staleTime: 0, // Always refetch when enabled changes
    },
  });

  // Refetch favorites when auth state changes (e.g., after login)
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[AppInitializer] User authenticated, fetching favorites...");
      refetchFavorites();
    }
  }, [isAuthenticated, refetchFavorites]);

  useEffect(() => {
    if (favoritesData?.data?.productIds) {
      console.log("[AppInitializer] Setting favorites:", favoritesData.data.productIds);
      setFavorites(favoritesData.data.productIds);
    }
  }, [favoritesData, setFavorites]);

  // ==================== STORE CONFIG INITIALIZATION ====================
  // Fetch store configuration (currency, timezone, etc.) from backend
  // Deferred to 500ms to let app UI render first
  const storeConfigFetchedRef = useRef(false);
  const storeConfigHasHydrated = useStoreConfigStore((state) => state._hasHydrated);

  useEffect(() => {
    // Wait for the persist middleware's async AsyncStorage read to finish
    // before calling setConfig(). That rehydration merge can land at any
    // time in the background; if it landed AFTER setConfig() ran, it would
    // silently overwrite freshly-fetched (or freshly-cleared) branding with
    // whatever was previously on disk. Gating on _hasHydrated — the same
    // pattern useAuthStore uses for its own hydration race — guarantees
    // setConfig() always runs last.
    if (!storeConfigHasHydrated) return;

    const initializeStoreConfig = async () => {
      // Only fetch once per app session
      if (storeConfigFetchedRef.current) return;
      storeConfigFetchedRef.current = true;

      try {
        // getStoreConfig() throws on fetch failure (see storeConfig.ts) so
        // this catch block can tell a successful-but-empty response apart
        // from a genuine failure — only the latter should preserve
        // previously persisted branding instead of clearing it.
        const config = await getStoreConfig();
        const branding = validateBranding({
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          logoUrl: config.logoUrl,
        });
        useStoreConfigStore.getState().setConfig({
          currency: config.currency || "USD",
          timezone: config.timezone || "UTC",
          storeName: config.name || "",
          ...branding,
          fetchSucceeded: true,
        });
        console.log("[AppInitializer] Store config loaded - Currency:", config.currency);
      } catch (error) {
        console.warn("[AppInitializer] Failed to load store config, using defaults:", error);
        useStoreConfigStore.getState().setConfig({
          currency: "USD",
          timezone: "UTC",
          storeName: "",
          fetchSucceeded: false,
        });
      }
    };

    // Defer store config initialization to 500ms
    const timer = setTimeout(initializeStoreConfig, 500);
    return () => clearTimeout(timer);
  }, [storeConfigHasHydrated]);

  // ==================== DYNAMIC RUNTIME THEME ====================
  // Propagates the merchant's primaryColor/secondaryColor (once fetched
  // above) into the live Tamagui theme, so every $primary/$secondary-styled
  // surface across the app reflects them — see hooks/useDynamicPrimaryTheme.ts
  // and hooks/useDynamicSecondaryTheme.ts for the mechanism and its known
  // boundary (getTokenValue() call sites aren't covered).
  useDynamicPrimaryTheme();
  useDynamicSecondaryTheme();

  // ==================== ADD MORE INITIALIZATIONS BELOW ====================
  // Example: Cart sync, user preferences, notification settings, etc.

  // This component doesn't render anything - it's purely for side effects
  return null;
};
