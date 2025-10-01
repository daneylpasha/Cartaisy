import axiosInstance from "@/api/config/axios";
import { useQuery } from "@tanstack/react-query";

export interface HomeScreenData {
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

const fetchHomeScreenData = async (): Promise<HomeScreenData> => {
  const response = await axiosInstance.get("/customer/homescreen");

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch homescreen data");
  }

  return response.data.data;
};

export const useHomeScreenData = () => {
  return useQuery({
    queryKey: ["homescreen"],
    queryFn: fetchHomeScreenData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
