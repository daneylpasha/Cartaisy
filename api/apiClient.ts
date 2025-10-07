import useAuthStore from "@/store/useAuthStore";
import Axios, { AxiosError, AxiosRequestConfig } from "axios";

// Backend URL
const API_BASE_URL =
  "https://cartaisy-backend-production.up.railway.app/api/v1";

// Create axios instance
export const axiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout to prevent hanging forever
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token;

    console.log("[API Request] Full URL:", config.baseURL + config.url);
    console.log("[API Request] Method:", config.method?.toUpperCase());
    console.log("[API Request] Headers:", JSON.stringify(config.headers));
    console.log(
      "[API Request] Token (first 20 chars):",
      token?.substring(0, 20)
    );
    console.log("[API Request] Timeout:", config.timeout);

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
    console.log("[API Response SUCCESS] URL:", response.config.url);
    console.log("[API Response SUCCESS] Status:", response.status);
    console.log(
      "[API Response SUCCESS] Data preview:",
      JSON.stringify(response.data).substring(0, 200)
    );
    console.log("[API Response SUCCESS] Time taken: Request completed");
    return response;
  },
  async (error: AxiosError) => {
    console.log("[API Response ERROR] ==================");
    console.log("[API Response ERROR] URL:", error.config?.url);
    console.log("[API Response ERROR] Status:", error.response?.status);
    console.log("[API Response ERROR] Code:", error.code);
    console.log("[API Response ERROR] Message:", error.message);
    console.log("[API Response ERROR] Response Data:", error.response?.data);
    console.log(
      "[API Response ERROR] Is Timeout:",
      error.code === "ECONNABORTED"
    );
    console.log("[API Response ERROR] ==================");

    if (error.response?.status === 401) {
      console.log("[API Response ERROR] 401 Unauthorized - Clearing auth");
      useAuthStore.getState().clearAuth();
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
