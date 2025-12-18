import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";
import analyticsApi, {
  QueuedSessionEvent,
  SessionEventData,
  SessionEventType,
} from "@/api/endpoints/analytics";
import useAuthStore from "@/store/useAuthStore";

const QUEUE_STORAGE_KEY = "session_tracking_queue";
const LAST_APP_OPEN_KEY = "last_app_open_timestamp";
const DEBOUNCE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_COUNT = 3;
const BATCH_SIZE = 10;

/**
 * Generate a simple UUID v4
 * Using crypto.randomUUID when available, otherwise fallback to manual generation
 */
function generateUUID(): string {
  // Try native crypto.randomUUID (available in modern environments)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: Generate UUID v4 manually
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * SessionTracker - Tracks app session events for DAU/MAU analytics
 *
 * Features:
 * - Tracks app_open, app_close, app_backgrounded events
 * - Debounces rapid open/close to prevent spam
 * - Queues events when offline or API fails
 * - Retries queued events on next app open
 * - Works for both authenticated and guest users
 */
class SessionTracker {
  private sessionId: string | null = null;
  private sessionStart: Date | null = null;
  private isProcessingQueue = false;
  private lastAppOpenTime: number | null = null;

  constructor() {
    // Load last app open time from storage on init
    this.loadLastAppOpenTime();
  }

  /**
   * Load last app open timestamp from AsyncStorage
   */
  private async loadLastAppOpenTime(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(LAST_APP_OPEN_KEY);
      if (stored) {
        this.lastAppOpenTime = parseInt(stored, 10);
      }
    } catch (error) {
      console.error("[SessionTracker] Error loading last app open time:", error);
    }
  }

  /**
   * Save last app open timestamp to AsyncStorage
   */
  private async saveLastAppOpenTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_APP_OPEN_KEY, timestamp.toString());
      this.lastAppOpenTime = timestamp;
    } catch (error) {
      console.error("[SessionTracker] Error saving last app open time:", error);
    }
  }

  /**
   * Check if app_open should be debounced
   */
  private shouldDebounceAppOpen(): boolean {
    if (!this.lastAppOpenTime) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastOpen = now - this.lastAppOpenTime;
    return timeSinceLastOpen < DEBOUNCE_INTERVAL_MS;
  }

  /**
   * Start a new session (called on app open/foreground)
   */
  async startSession(): Promise<void> {
    // Check debounce for app_open
    if (this.shouldDebounceAppOpen()) {
      console.log(
        "[SessionTracker] Debouncing app_open - last open was less than 5 minutes ago"
      );
      // Still create a session ID if we don't have one
      if (!this.sessionId) {
        this.sessionId = generateUUID();
        this.sessionStart = new Date();
      }
      return;
    }

    // Create new session
    this.sessionId = generateUUID();
    this.sessionStart = new Date();

    console.log("[SessionTracker] Starting new session:", this.sessionId);

    // Track app_open event
    await this.trackEvent("app_open");

    // Save timestamp for debouncing
    await this.saveLastAppOpenTime(Date.now());

    // Process any queued events from previous sessions
    this.processQueue();
  }

  /**
   * End the current session (called on app close/unmount)
   */
  async endSession(): Promise<void> {
    if (!this.sessionId) {
      console.log("[SessionTracker] No active session to end");
      return;
    }

    console.log("[SessionTracker] Ending session:", this.sessionId);
    await this.trackEvent("app_close");
    this.sessionId = null;
    this.sessionStart = null;
  }

  /**
   * Mark session as backgrounded (called when app goes to background)
   */
  async backgroundSession(): Promise<void> {
    if (!this.sessionId) {
      console.log("[SessionTracker] No active session to background");
      return;
    }

    console.log("[SessionTracker] Backgrounding session:", this.sessionId);
    await this.trackEvent("app_backgrounded");
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration(): number {
    if (!this.sessionStart) {
      return 0;
    }
    return Math.floor((Date.now() - this.sessionStart.getTime()) / 1000);
  }

  /**
   * Track a session event
   */
  private async trackEvent(event: SessionEventType): Promise<void> {
    if (!this.sessionId) {
      console.warn("[SessionTracker] Cannot track event without session ID");
      return;
    }

    // Get auth state
    const { token, deviceId } = useAuthStore.getState();

    // Build event data
    const eventData: SessionEventData = {
      event,
      sessionId: this.sessionId,
      deviceId: deviceId || undefined,
      customerId: token ? this.getCustomerId() : null, // null for guests
      platform: Platform.OS as "ios" | "android" | "web",
      appVersion: this.getAppVersion(),
      timestamp: new Date().toISOString(),
      metadata: {
        sessionDuration: this.getSessionDuration(),
      },
    };

    console.log("[SessionTracker] Tracking event:", event, "session:", this.sessionId);

    try {
      await analyticsApi.trackSession(eventData);
      console.log("[SessionTracker] Event tracked successfully:", event);
    } catch (error: any) {
      console.error(
        "[SessionTracker] Failed to track event, queuing for retry:",
        error?.message
      );
      await this.queueEvent(eventData);
    }
  }

  /**
   * Get app version from expo config
   */
  private getAppVersion(): string {
    return Constants.expoConfig?.version || "1.0.0";
  }

  /**
   * Get customer ID from auth store (if available)
   * Returns undefined if not logged in
   */
  private getCustomerId(): string | undefined {
    // Try to extract customer ID from the stored user data
    // This depends on how customer data is stored in useAuthStore
    const authState = useAuthStore.getState();

    // If there's a method to get customer ID, use it
    // Otherwise return undefined and backend will determine from token
    return (authState as any).customerId || (authState as any).user?.id || undefined;
  }

  /**
   * Queue an event for later retry
   */
  private async queueEvent(eventData: SessionEventData): Promise<void> {
    try {
      const queue = await this.getQueue();

      const queuedEvent: QueuedSessionEvent = {
        ...eventData,
        queuedAt: new Date().toISOString(),
        retryCount: 0,
      };

      queue.push(queuedEvent);
      await this.saveQueue(queue);
      console.log("[SessionTracker] Event queued, queue size:", queue.length);
    } catch (error) {
      console.error("[SessionTracker] Failed to queue event:", error);
    }
  }

  /**
   * Process queued events (call on app start)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      console.log("[SessionTracker] Queue processing already in progress");
      return;
    }

    this.isProcessingQueue = true;
    console.log("[SessionTracker] Processing queued events...");

    try {
      const queue = await this.getQueue();

      if (queue.length === 0) {
        console.log("[SessionTracker] Queue is empty");
        return;
      }

      console.log("[SessionTracker] Queue has", queue.length, "events");

      const remainingQueue: QueuedSessionEvent[] = [];
      const eventsToProcess = queue.slice(0, BATCH_SIZE);

      for (const event of eventsToProcess) {
        try {
          await analyticsApi.trackSession({
            event: event.event,
            sessionId: event.sessionId,
            deviceId: event.deviceId,
            customerId: event.customerId,
            platform: event.platform,
            appVersion: event.appVersion,
            timestamp: event.timestamp,
            metadata: event.metadata,
          });

          console.log("[SessionTracker] Queued event processed:", event.event);
        } catch (error: any) {
          console.error(
            "[SessionTracker] Failed to process queued event:",
            error?.message
          );

          // Re-queue if under retry limit
          if (event.retryCount < MAX_RETRY_COUNT) {
            remainingQueue.push({
              ...event,
              retryCount: event.retryCount + 1,
            });
          } else {
            console.warn(
              "[SessionTracker] Event exceeded max retries, dropping:",
              event.event
            );
          }
        }
      }

      // Add remaining items from queue that weren't processed
      const unprocessedItems = queue.slice(BATCH_SIZE);
      await this.saveQueue([...remainingQueue, ...unprocessedItems]);

      console.log(
        "[SessionTracker] Queue processing complete, remaining:",
        remainingQueue.length + unprocessedItems.length
      );
    } catch (error) {
      console.error("[SessionTracker] Error processing queue:", error);
    } finally {
      this.isProcessingQueue = false;
    }
  }

  /**
   * Get the current queue from storage
   */
  private async getQueue(): Promise<QueuedSessionEvent[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error("[SessionTracker] Error reading queue:", error);
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueuedSessionEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error("[SessionTracker] Error saving queue:", error);
    }
  }

  /**
   * Clear the queue (for testing or reset)
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      console.log("[SessionTracker] Queue cleared");
    } catch (error) {
      console.error("[SessionTracker] Error clearing queue:", error);
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
export const sessionTracker = new SessionTracker();
export default sessionTracker;
