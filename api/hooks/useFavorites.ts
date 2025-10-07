import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetFavorites,
  useAddFavorite,
  useRemoveFavorite,
  getGetFavoritesQueryKey,
} from '@/api/generated/favorites/favorites';
import useFavoritesStore from '@/store/useFavoritesStore';
import useAuthStore from '@/store/useAuthStore';

/**
 * Custom hook to manage favorites with local state sync
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { setFavorites, addFavorite: addFavoriteLocal, removeFavorite: removeFavoriteLocal } = useFavoritesStore();

  // Fetch favorites from API (only if authenticated)
  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useGetFavorites({
    query: {
      enabled: !!token, // Only fetch if user is authenticated
    },
  });

  // Sync API data with local Zustand store
  useEffect(() => {
    if (favoritesData?.data?.productIds) {
      setFavorites(favoritesData.data.productIds);
    }
  }, [favoritesData, setFavorites]);

  // Add favorite mutation
  const addFavoriteMutation = useAddFavorite({
    mutation: {
      onMutate: async ({ data: { productId } }) => {
        // Optimistically update UI
        addFavoriteLocal(productId);
      },
      onError: (error, { data: { productId } }) => {
        // Rollback on error
        removeFavoriteLocal(productId);
        console.error('Failed to add favorite:', error);
      },
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
      },
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useRemoveFavorite({
    mutation: {
      onMutate: async ({ productId }) => {
        // Optimistically update UI
        removeFavoriteLocal(productId);
      },
      onError: (error, { productId }) => {
        // Rollback on error
        addFavoriteLocal(productId);
        console.error('Failed to remove favorite:', error);
      },
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: getGetFavoritesQueryKey() });
      },
    },
  });

  const toggleFavorite = (productId: string) => {
    if (!token) {
      console.warn('User must be logged in to add favorites');
      // TODO: Show login prompt
      return;
    }

    const isFav = useFavoritesStore.getState().isFavorite(productId);

    if (isFav) {
      removeFavoriteMutation.mutate({ productId });
    } else {
      addFavoriteMutation.mutate({ data: { productId } });
    }
  };

  return {
    favorites: favoritesData?.data?.productIds || [],
    isLoading,
    error,
    refetch,
    toggleFavorite,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
  };
};

/**
 * Hook to check if a product is favorited
 */
export const useIsFavorite = (productId: string) => {
  return useFavoritesStore((state) => state.isFavorite(productId));
};
