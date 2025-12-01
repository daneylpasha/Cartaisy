import useAuthStore from "@/store/useAuthStore";
import useUserStore from "@/store/useUserStore";
import Axios, { AxiosError, AxiosRequestConfig } from "axios";

// Backend URL
const API_BASE_URL =
  "https://cartaisy-backend-production.up.railway.app/api/v1";

// Store ID for multi-tenancy (from environment variable)
const STORE_ID = process.env.EXPO_PUBLIC_STORE_ID || "";

// Create axios instance
export const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Store-ID": STORE_ID,
  },
  timeout: 30000, // 30 second timeout to prevent hanging forever
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.log("[API Request Error]:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("API Response SUCCESS", response?.data);
    return response;
  },
  async (error: AxiosError) => {
    console.log("[API Response ERROR] Response Data:", error.response?.data);

    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      useUserStore.getState().clearUser();
    }
    return Promise.reject(error);
  }
);

// Custom instance for Orval
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export default customInstance;
