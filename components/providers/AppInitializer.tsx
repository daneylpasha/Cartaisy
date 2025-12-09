import { useGetFavorites } from "@/api/generated/favorites/favorites";
import useAuthStore from "@/store/useAuthStore";
import useFavoritesStore from "@/store/useFavoritesStore";
import { useEffect } from "react";

/**
 * Central initialization component for app-level features
 * Must be rendered inside QueryClientProvider
 *
 * Add any new app-level initialization logic here (e.g., user preferences, cart sync, etc.)
 */
export const AppInitializer = () => {
  // ==================== GUEST MODE INITIALIZATION ====================
  const { token, initializeDeviceId, enableGuestMode, _hasHydrated } = useAuthStore();

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

  // ==================== ADD MORE INITIALIZATIONS BELOW ====================
  // Example: Cart sync, user preferences, notification settings, etc.

  // This component doesn't render anything - it's purely for side effects
  return null;
};
