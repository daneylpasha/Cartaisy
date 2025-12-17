import AsyncStorage from "@react-native-async-storage/async-storage";
import notificationsApi, {
  NotificationEventType,
  QueuedNotificationEvent,
  TrackNotificationEventData,
} from "@/api/endpoints/notifications";

const QUEUE_STORAGE_KEY = "notification_tracking_queue";
const MAX_RETRY_COUNT = 3;
const BATCH_SIZE = 10;

/**
 * NotificationTracker - Handles tracking notification events with offline support
 *
 * Features:
 * - Queues events when offline or API fails
 * - Retries queued events when connection restored
 * - Persists queue to AsyncStorage
 * - Prevents duplicate tracking
 */
class NotificationTracker {
  private isProcessingQueue = false;
  private trackedNotifications = new Set<string>(); // Prevent duplicate tracking

  /**
   * Track a notification event with offline support
   */
  async trackEvent(
    notificationId: string | undefined,
    eventType: NotificationEventType,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Validate notificationId
    if (!notificationId) {
      console.warn("[NotificationTracker] Missing notificationId, skipping tracking");
      return;
    }

    // Create unique key for deduplication
    const trackingKey = `${notificationId}_${eventType}`;

    // Check for duplicate tracking (within session)
    if (this.trackedNotifications.has(trackingKey)) {
      console.log("[NotificationTracker] Already tracked this event, skipping:", trackingKey);
      return;
    }

    const eventData: TrackNotificationEventData = {
      notificationId,
      eventType,
      timestamp: new Date().toISOString(),
      deviceId,
      metadata,
    };

    console.log("[NotificationTracker] Tracking event:", eventType, "for notification:", notificationId);

    try {
      // Try to send immediately
      await notificationsApi.trackEvent(eventData);
      this.trackedNotifications.add(trackingKey);
      console.log("[NotificationTracker] Event tracked successfully:", eventType);
    } catch (error: any) {
      console.error("[NotificationTracker] Failed to track event, queuing for retry:", error?.message);
      // Queue for later retry
      await this.queueEvent(eventData);
    }
  }

  /**
   * Track notification delivery (shown to user)
   */
  async trackDelivery(
    notificationId: string | undefined,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return this.trackEvent(notificationId, "delivered", deviceId, metadata);
  }

  /**
   * Track notification open (user tapped)
   */
  async trackOpen(
    notificationId: string | undefined,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return this.trackEvent(notificationId, "opened", deviceId, metadata);
  }

  /**
   * Track notification click with action
   */
  async trackClick(
    notificationId: string | undefined,
    actionId: string,
    deviceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    return this.trackEvent(notificationId, "clicked", deviceId, {
      ...metadata,
      actionId,
    });
  }

  /**
   * Queue an event for later retry
   */
  private async queueEvent(eventData: TrackNotificationEventData): Promise<void> {
    try {
      const queue = await this.getQueue();

      // Check if this event is already queued
      const exists = queue.some(
        (item) =>
          item.notificationId === eventData.notificationId &&
          item.eventType === eventData.eventType
      );

      if (exists) {
        console.log("[NotificationTracker] Event already in queue, skipping");
        return;
      }

      const queuedEvent: QueuedNotificationEvent = {
        ...eventData,
        queuedAt: new Date().toISOString(),
        retryCount: 0,
      };

      queue.push(queuedEvent);
      await this.saveQueue(queue);
      console.log("[NotificationTracker] Event queued, queue size:", queue.length);
    } catch (error) {
      console.error("[NotificationTracker] Failed to queue event:", error);
    }
  }

  /**
   * Process queued events (call when app comes online or on app start)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      console.log("[NotificationTracker] Queue processing already in progress");
      return;
    }

    this.isProcessingQueue = true;
    console.log("[NotificationTracker] Processing queued events...");

    try {
      const queue = await this.getQueue();

      if (queue.length === 0) {
        console.log("[NotificationTracker] Queue is empty");
        return;
      }

      console.log("[NotificationTracker] Queue has", queue.length, "events");

      const remainingQueue: QueuedNotificationEvent[] = [];
      const eventsToProcess = queue.slice(0, BATCH_SIZE);

      for (const event of eventsToProcess) {
        try {
          await notificationsApi.trackEvent({
            notificationId: event.notificationId,
            eventType: event.eventType,
            timestamp: event.timestamp,
            deviceId: event.deviceId,
            metadata: event.metadata,
          });

          const trackingKey = `${event.notificationId}_${event.eventType}`;
          this.trackedNotifications.add(trackingKey);
          console.log("[NotificationTracker] Queued event processed:", event.eventType);
        } catch (error: any) {
          console.error("[NotificationTracker] Failed to process queued event:", error?.message);

          // Re-queue if under retry limit
          if (event.retryCount < MAX_RETRY_COUNT) {
            remainingQueue.push({
              ...event,
              retryCount: event.retryCount + 1,
            });
          } else {
            console.warn("[NotificationTracker] Event exceeded max retries, dropping:", event.notificationId);
          }
        }
      }

      // Add remaining items from queue that weren't processed
      const unprocessedItems = queue.slice(BATCH_SIZE);
      await this.saveQueue([...remainingQueue, ...unprocessedItems]);

      console.log("[NotificationTracker] Queue processing complete, remaining:", remainingQueue.length + unprocessedItems.length);
    } catch (error) {
      console.error("[NotificationTracker] Error processing queue:", error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Get the current queue from storage
   */
  private async getQueue(): Promise<QueuedNotificationEvent[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error("[NotificationTracker] Error reading queue:", error);
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueuedNotificationEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("[NotificationTracker] Error saving queue:", error);
    }
  }

  /**
   * Clear the queue (for testing or reset)
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log("[NotificationTracker] Queue cleared");
    } catch (error) {
      console.error("[NotificationTracker] Error clearing queue:", error);
    }
  }

  /**
   * Get queue size (for debugging)
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }
}

// Export singleton instance
export const notificationTracker = new NotificationTracker();
export default notificationTracker;
