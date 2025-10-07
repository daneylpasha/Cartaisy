import { create } from 'zustand';

interface FavoritesState {
  favoriteProductIds: Set<string>;
  setFavorites: (productIds: string[]) => void;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteProductIds: new Set<string>(),

  setFavorites: (productIds) =>
    set({
      favoriteProductIds: new Set(productIds),
    }),

  addFavorite: (productId) =>
    set((state) => {
      const newFavorites = new Set(state.favoriteProductIds);
      newFavorites.add(productId);
      return { favoriteProductIds: newFavorites };
    }),

  removeFavorite: (productId) =>
    set((state) => {
      const newFavorites = new Set(state.favoriteProductIds);
      newFavorites.delete(productId);
      return { favoriteProductIds: newFavorites };
    }),

  isFavorite: (productId) => {
    return get().favoriteProductIds.has(productId);
  },

  clearFavorites: () =>
    set({
      favoriteProductIds: new Set<string>(),
    }),
}));

export default useFavoritesStore;
