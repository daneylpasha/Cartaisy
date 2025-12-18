import { axiosInstance } from "../apiClient";

export type SessionEventType = "app_open" | "app_close" | "app_backgrounded";

export interface SessionEventData {
  event: SessionEventType;
  sessionId: string;
  deviceId?: string;
  customerId?: string | null; // null for guest users
  platform: "ios" | "android" | "web";
  appVersion: string;
  timestamp: string; // ISO string
  metadata?: Record<string, any>;
}

export interface SessionEventResponse {
  success: boolean;
  message?: string;
}

export interface QueuedSessionEvent extends SessionEventData {
  queuedAt: string;
  retryCount: number;
}

const analyticsApi = {
  /**
   * Track a session event (app_open, app_close, app_backgrounded)
   */
  trackSession: async (data: SessionEventData): Promise<SessionEventResponse> => {
    const response = await axiosInstance.post("/customer/analytics/session", data);
    return response.data;
  },
};

export default analyticsApi;
