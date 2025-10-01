import { create } from "zustand";

// Sirf required types jo actually use ho rahe hain
// Types for HomeScreen API Response
interface Banner {
  _id: string;
  imageUrl: string;
  title: string;
  subTitle: string;
  navigateTo: string;
  position: number;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  imageUrl: string;
  position: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  id: string;
  title: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: any[];
  options: any[];
  images: any[];
  image?: any;
}

interface Collection {
  _id: string;
  imageUrl: string;
  title: string;
  position: number;
  isActive: boolean;
}

interface CalloutBanner {
  _id: string;
  imageUrl: string;
  title: string;
  buttonText: string;
  action: {
    type: string;
    navigateTo: string;
  };
  position: number;
  isActive: boolean;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
}
interface HomeScreenData {
  carousel: any[];
  categories: any[];
  categoryGrid: any[];
  featuredProducts: any[];
  newArrivals: any[];
  bestSellers: any[];
  calloutBanners: any[];
  collectionDisplays: any[];
  categoryCollectionGrid: any[];
  promoBanners: any[];
  collectionShowcases: any[];
}

interface HomeScreenState {
  data: HomeScreenData | null;
  isLoading: boolean;
  error: string | null;

  // Setters
  setData: (data: HomeScreenData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
}

const useHomeScreenStore = create<HomeScreenState>((set) => ({
  data: null,
  isLoading: false,
  error: null,

  setData: (data) =>
    set({
      data,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearData: () =>
    set({
      data: null,
      error: null,
    }),
}));

export default useHomeScreenStore;
export type {
  Banner,
  CalloutBanner,
  Category,
  Collection,
  HomeScreenData,
  Product,
};
