import { mobileConfig } from "@/api/config/mobileConfig";
import useAuthStore from "@/store/useAuthStore";
import Axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

// Backend URL (from environment variable)
const API_BASE_URL = mobileConfig.apiBaseUrl;

// Store ID for multi-tenancy (from environment variable)
const STORE_ID = mobileConfig.storeId;

// Token refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
      config.headers["X-Store-ID"] = mobileConfig.storeId;
    }

    if (__DEV__) {
      console.log("[API Request]:", config.url);
    }

    // Add authentication header
    if (token) {
      // Logged-in user
      config.headers.Authorization = `Bearer ${token}`;

      // If there's a guest session, include it for backend auto-merge
      if (guestSessionId) {
        config.headers["X-Session-ID"] = guestSessionId;
      }
    } else if (guestSessionId) {
      // Guest user with existing session
      config.headers["X-Session-ID"] = guestSessionId;
    }

    // Always add device ID for tracking
    if (deviceId) {
      config.headers["X-Device-ID"] = deviceId;
    }

    return config;
  },
  (error) => {
    if (__DEV__) {
      console.log("[API Request Error]:", error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and capture session IDs
axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log("API Response SUCCESS", response?.config?.url);
    }

    // Capture new session ID from response headers (for guest sessions)
    const newSessionId = response.headers["x-session-id"];
    if (newSessionId) {
      const { guestSessionId, setGuestSession, token } = useAuthStore.getState();

      // If we don't have a session ID and we're not logged in, save the new one
      if (!guestSessionId && !token) {
        setGuestSession(newSessionId);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (__DEV__) {
      console.log("[API Response ERROR] URL:", error.config?.url);
      console.log("[API Response ERROR] HTTP Status:", error.response?.status);
    }

    // Check if this is a token expiry error (401)
    // Also check for specific error codes from backend if available
    const responseData = error.response?.data as { code?: string; message?: string } | undefined;
    const isTokenExpired = error.response?.status === 401 &&
      (responseData?.code === "TOKEN_EXPIRED" ||
       responseData?.code === "INVALID_TOKEN" ||
       responseData?.message?.toLowerCase().includes("token") ||
       responseData?.message?.toLowerCase().includes("expired") ||
       responseData?.message?.toLowerCase().includes("unauthorized") ||
       !responseData?.code); // Also handle generic 401 without specific code

    // Don't retry refresh token endpoint or already retried requests
    const isRefreshEndpoint = originalRequest?.url?.includes("/auth/refresh-token");
    const isLoginEndpoint = originalRequest?.url?.includes("/auth/login");
    const isRegisterEndpoint = originalRequest?.url?.includes("/auth/register");

    if (
      isTokenExpired &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isLoginEndpoint &&
      !isRegisterEndpoint
    ) {
      const { refreshToken, token, setToken, clearAuth } = useAuthStore.getState();

      // Only attempt refresh if we have a refresh token and were previously logged in
      if (refreshToken && token) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return axiosInstance(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call refresh token endpoint directly to avoid interceptor loop
          const response = await Axios.post(
            `${API_BASE_URL}/customer/auth/refresh-token`,
            { refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Store-ID": STORE_ID,
              },
            }
          );

          const newAccessToken = response.data?.data?.accessToken || response.data?.data?.token;
          const newRefreshToken = response.data?.data?.refreshToken;

          if (newAccessToken) {
            // Update tokens in store
            setToken(newAccessToken, newRefreshToken || refreshToken);

            // Update the failed request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Process any queued requests
            processQueue(null, newAccessToken);

            // Retry the original request
            return axiosInstance(originalRequest);
          } else {
            throw new Error("No access token in refresh response");
          }
        } catch (refreshError) {
          // Process queued requests with error
          processQueue(refreshError, null);

          // Clear auth - refresh token is also expired/invalid
          clearAuth();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
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
