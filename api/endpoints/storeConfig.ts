import { axiosInstance } from "../apiClient";

export interface StoreConfig {
  currency: string;
  timezone: string;
  name: string;
}

export const getStoreConfig = async (): Promise<StoreConfig> => {
  try {
    const response = await axiosInstance.get("/store/config");
    console.log("[StoreConfig] Fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.warn("[StoreConfig] Failed to fetch, using defaults:", error);
    return {
      currency: "USD",
      timezone: "UTC",
      name: "",
    };
  }
};
