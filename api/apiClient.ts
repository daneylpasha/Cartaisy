import useAuthStore from "@/store/useAuthStore";
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

// Request interceptor to add JWT token or guest session headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const { token, guestSessionId, deviceId } = useAuthStore.getState();

    // Ensure X-Store-ID is always set (in case env var wasn't loaded at module init)
    if (!config.headers["X-Store-ID"]) {
      config.headers["X-Store-ID"] = process.env.EXPO_PUBLIC_STORE_ID || "";
    }

    console.log("[API Request]:", config.url);
    console.log("[API Request] X-Store-ID:", config.headers["X-Store-ID"]);
    console.log("[API Request] Token exists:", !!token);
    console.log("[API Request] Guest session exists:", !!guestSessionId);

    // Add authentication header
    if (token) {
      // Logged-in user
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API Request] Authorization header set");

      // If there's a guest session, include it for backend auto-merge
      if (guestSessionId) {
        config.headers["X-Session-ID"] = guestSessionId;
        console.log("[API Request] Including guest session for auto-merge");
      }
    } else if (guestSessionId) {
      // Guest user with existing session
      config.headers["X-Session-ID"] = guestSessionId;
      console.log("[API Request] Guest session header set");
    }

    // Always add device ID for tracking
    if (deviceId) {
      config.headers["X-Device-ID"] = deviceId;
    }

    return config;
  },
  (error) => {
    console.log("[API Request Error]:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and capture session IDs
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("API Response SUCCESS", response?.data);

    // Capture new session ID from response headers (for guest sessions)
    const newSessionId = response.headers["x-session-id"];
    if (newSessionId) {
      const { guestSessionId, setGuestSession, token } = useAuthStore.getState();

      // If we don't have a session ID and we're not logged in, save the new one
      if (!guestSessionId && !token) {
        console.log("[API Response] Received new guest session ID:", newSessionId);
        setGuestSession(newSessionId);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    console.log("[API Response ERROR] URL:", error.config?.url);
    console.log("[API Response ERROR] HTTP Status:", error.response?.status);
    console.log("[API Response ERROR] Response Data:", error.response?.data);

    // Don't auto-clear auth on 401 errors
    // Token will only be cleared on explicit signout by user
    if (error.response?.status === 401) {
      console.log(
        "[API Response ERROR] 401 received - NOT clearing auth (only signout clears token)"
      );
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
