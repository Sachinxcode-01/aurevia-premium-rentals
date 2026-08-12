/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Aurevia Real-Time Cross-App Synchronization Engine
 * Connects Admin Website (port 3002) and Public Website (port 3000) live in real-time!
 */

export type RealtimeEventType =
  | "REVIEW_MODERATED"
  | "ENQUIRY_UPDATED"
  | "TICKET_UPDATED"
  | "BOOKING_UPDATED"
  | "INVENTORY_UPDATED"
  | "KYC_STATUS_UPDATED";

export interface RealtimePayload<T = any> {
  type: RealtimeEventType;
  payload: T;
  timestamp: string;
  sender: "admin" | "public_website";
}

const CHANNEL_NAME = "aurevia_realtime_sync_channel";
const STORAGE_KEY = "aurevia_realtime_event_signal";

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<RealtimeEventType, Set<(payload: any) => void>> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      // 1. Setup BroadcastChannel API for multi-tab / iframe sync
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type) {
            this.notify(event.data.type, event.data.payload);
          }
        };
      } catch {
        // BroadcastChannel fallback
      }

      // 2. Setup localStorage Storage Event Listener for cross-window / cross-port sync
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const data: RealtimePayload = JSON.parse(e.newValue);
            this.notify(data.type, data.payload);
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  /**
   * Broadcast an event to all connected apps (Admin & Public Website)
   */
  public broadcast<T = any>(type: RealtimeEventType, payload: T, sender: "admin" | "public_website" = "admin") {
    const data: RealtimePayload<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      sender,
    };

    // 1. Post to BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch {
        // Fallback
      }
    }

    // 2. Write to localStorage to trigger window 'storage' event across ports
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // Ignore quota errors
      }
    }

    // 3. Notify local in-memory listeners
    this.notify(type, payload);
  }

  /**
   * Subscribe to a specific real-time event type
   */
  public subscribe(type: RealtimeEventType, callback: (payload: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscriber
    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(callback);
      }
    };
  }

  private notify(type: RealtimeEventType, payload: any) {
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[RealtimeHub] Error executing listener for ${type}:`, err);
        }
      });
    }
  }
}

export const realtimeHub = new RealtimeHub();
