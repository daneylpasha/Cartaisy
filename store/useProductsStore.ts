import { create } from 'zustand';

interface Product {
  id: string;
  title: string;
  image: string;
  currentPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  ratingValue?: number;
  totalReviewCount?: number;
  onToggleWishlist?: () => void;
}

interface ProductsState {
  products: Product[];
  homeProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  setProducts: (products: Product[]) => void;
  setHomeProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearProducts: () => void;
}

const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  homeProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  setProducts: (products) => set({ products }),

  setHomeProducts: (products) => set({ homeProducts: products }),

  setSelectedProduct: (product) => set({ selectedProduct: product }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearProducts: () => set({
    products: [],
    homeProducts: [],
    selectedProduct: null,
    error: null,
  }),
}));

export default useProductsStore;
export type { Product };