import { useGetFavorites } from "@/api/generated/favorites/favorites";
import { getStoreConfig } from "@/api/endpoints/storeConfig";
import useAuthStore from "@/store/useAuthStore";
import useFavoritesStore from "@/store/useFavoritesStore";
import useStoreConfigStore from "@/store/useStoreConfigStore";
import { useEffect, useRef } from "react";
import Axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";
const STORE_ID = process.env.EXPO_PUBLIC_STORE_ID || "";

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

    refreshTokenOnStartup();
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
  const storeConfigFetchedRef = useRef(false);

  useEffect(() => {
    const initializeStoreConfig = async () => {
      // Only fetch once per app session
      if (storeConfigFetchedRef.current) return;
      storeConfigFetchedRef.current = true;

      try {
        const config = await getStoreConfig();
        useStoreConfigStore.getState().setConfig({
          currency: config.currency || "USD",
          timezone: config.timezone || "UTC",
          storeName: config.name || "",
        });
        console.log("[AppInitializer] Store config loaded - Currency:", config.currency);
      } catch (error) {
        console.warn("[AppInitializer] Failed to load store config:", error);
      }
    };

    initializeStoreConfig();
  }, []);

  // ==================== ADD MORE INITIALIZATIONS BELOW ====================
  // Example: Cart sync, user preferences, notification settings, etc.

  // This component doesn't render anything - it's purely for side effects
  return null;
};
