import { useGetFavorites } from "@/api/generated/favorites/favorites";
import useFavoritesStore from "@/store/useFavoritesStore";
import { useEffect } from "react";

/**
 * Central initialization component for app-level features
 * Must be rendered inside QueryClientProvider
 *
 * Add any new app-level initialization logic here (e.g., user preferences, cart sync, etc.)
 */
export const AppInitializer = () => {
  // ==================== FAVORITES INITIALIZATION ====================
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  const { data: favoritesData } = useGetFavorites();

  useEffect(() => {
    if (favoritesData?.data?.productIds) {
      console.log(
        "🔥 [AppInitializer] Favorites loaded:",
        favoritesData.data.productIds.length,
        "products"
      );
      setFavorites(favoritesData.data.productIds);
    }
  }, [favoritesData, setFavorites]);

  // ==================== ADD MORE INITIALIZATIONS BELOW ====================
  // Example: Cart sync, user preferences, notification settings, etc.
  //
  // const { data: userPreferences } = useGetUserPreferences();
  // useEffect(() => {
  //   if (userPreferences) {
  //     console.log("🔥 [AppInitializer] User preferences loaded");
  //     // Initialize user preferences store
  //   }
  // }, [userPreferences]);

  // This component doesn't render anything - it's purely for side effects
  return null;
};
