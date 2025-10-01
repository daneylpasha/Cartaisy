import { create } from "zustand";

interface Collection {
  id: string;
  title: string;
  image: string;
}

interface CollectionsState {
  Collection: Collection[];
  isLoading: boolean;
  error: string | null;
  setCollection: (collection: Collection[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearProducts: () => void;
}

const useCollectionStore = create<CollectionsState>((set) => ({
  Collection: [],
  isLoading: false,
  error: null,

  setCollection: (collection: Collection[]) => set({ Collection: collection }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),

  clearProducts: () =>
    set({
      Collection: [],
      error: null,
    }),
}));

export default useCollectionStore;
export type { Collection };
