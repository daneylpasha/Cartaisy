import { axiosInstance } from "../apiClient";

export type NotificationEventType = "delivered" | "opened" | "clicked" | "dismissed";

export interface TrackNotificationEventData {
  notificationId: string;
  eventType: NotificationEventType;
  timestamp: string; // ISO string
  deviceId?: string;
  metadata?: Record<string, any>;
}

export interface TrackNotificationResponse {
  success: boolean;
  message: string;
}

export interface QueuedNotificationEvent extends TrackNotificationEventData {
  queuedAt: string;
  retryCount: number;
}

const notificationsApi = {
  /**
   * Track a notification event (delivered, opened, clicked, etc.)
   */
  trackEvent: async (data: TrackNotificationEventData): Promise<TrackNotificationResponse> => {
    const response = await axiosInstance.post("/customer/notifications/track", data);
    return response.data;
  },

  /**
   * Track notification open specifically
   */
  trackOpen: async (
    notificationId: string,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<TrackNotificationResponse> => {
    return notificationsApi.trackEvent({
      notificationId,
      eventType: "opened",
      timestamp: new Date().toISOString(),
      deviceId,
      metadata,
    });
  },

  /**
   * Track notification delivery (when shown to user)
   */
  trackDelivery: async (
    notificationId: string,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<TrackNotificationResponse> => {
    return notificationsApi.trackEvent({
      notificationId,
      eventType: "delivered",
      timestamp: new Date().toISOString(),
      deviceId,
      metadata,
    });
  },

  /**
   * Track notification click (with specific action)
   */
  trackClick: async (
    notificationId: string,
    actionId: string,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<TrackNotificationResponse> => {
    return notificationsApi.trackEvent({
      notificationId,
      eventType: "clicked",
      timestamp: new Date().toISOString(),
      deviceId,
      metadata: { ...metadata, actionId },
    });
  },
};

export default notificationsApi;
