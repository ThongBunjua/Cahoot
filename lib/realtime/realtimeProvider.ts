import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BroadcastPayload, RealtimeEvent } from "./types";

export type EventCallback = (payload: BroadcastPayload) => void;

export class RealtimeChannelBridge {
  private pin: string;
  private listeners: Set<EventCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private isDestroyed: boolean = false;
  private isConnected: boolean = false;
  private pendingQueue: any[] = [];
  private reconnectTimer: any = null;
  private heartbeatTimer: any = null;

  constructor(pin: string) {
    this.pin = pin;
    this.init();
    this.setupNetworkAndVisibilityListeners();
  }

  private init() {
    if (typeof window === "undefined" || this.isDestroyed) return;

    // 1. Local BroadcastChannel for same-device cross-tab communication
    try {
      if ("BroadcastChannel" in window) {
        if (this.broadcastChannel) {
          try { this.broadcastChannel.close(); } catch (e) {}
        }
        this.broadcastChannel = new BroadcastChannel(`cahoot_room_${this.pin}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.pin === this.pin) {
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn("[Cahoot] BroadcastChannel unavailable:", e);
    }

    // 2. Supabase Realtime Channel with Auto-Reconnect & Fault-Tolerance
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          if (this.supabaseChannel) {
            supabase.removeChannel(this.supabaseChannel).catch(() => {});
          }

          this.supabaseChannel = supabase.channel(`game_room_${this.pin}`, {
            config: {
              broadcast: { self: true, ack: false },
            },
          });

          this.supabaseChannel
            .on("broadcast", { event: "game_event" }, (payload: any) => {
              if (payload && payload.payload && payload.payload.pin === this.pin) {
                this.notifyListeners(payload.payload);
              }
            })
            .subscribe((status: string) => {
              if (status === "SUBSCRIBED") {
                this.isConnected = true;
                // Flush all queued messages sent while offline/connecting
                while (this.pendingQueue.length > 0) {
                  const msg = this.pendingQueue.shift();
                  this.sendOverSupabase(msg);
                }
              } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
                this.isConnected = false;
                this.scheduleReconnect();
              }
            });
        } catch (err) {
          console.warn("[Cahoot] Realtime subscription init error:", err);
          this.scheduleReconnect();
        }
      }
    }

    // 3. Fallback Storage Event listener
    window.addEventListener("storage", this.handleStorageEvent);

    // 4. Start Heartbeat
    this.startHeartbeat();
  }

  // Bound event handlers for proper cleanup
  private handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && !this.isDestroyed) {
      if (!this.isConnected) {
        this.init();
      }
    }
  };

  private handleOnline = () => {
    if (!this.isDestroyed) {
      this.init();
    }
  };

  private handleFocus = () => {
    if (!this.isConnected && !this.isDestroyed) {
      this.init();
    }
  };

  private setupNetworkAndVisibilityListeners() {
    if (typeof window === "undefined") return;

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("focus", this.handleFocus);
  }

  private scheduleReconnect() {
    if (this.isDestroyed || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isDestroyed) {
        this.init();
      }
    }, 1200);
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (!this.isConnected && !this.isDestroyed) {
        this.scheduleReconnect();
      }
    }, 4000);
  }

  private handleStorageEvent = (e: StorageEvent) => {
    if (e.key === `cahoot_event_${this.pin}` && e.newValue) {
      try {
        const payload: BroadcastPayload = JSON.parse(e.newValue);
        this.notifyListeners(payload);
      } catch (err) {
        // ignore
      }
    }
  };

  private notifyListeners(payload: BroadcastPayload) {
    if (this.isDestroyed) return;
    this.listeners.forEach((callback) => {
      try {
        callback(payload);
      } catch (err) {
        console.error("Error in realtime listener callback:", err);
      }
    });
  }

  private sendOverSupabase(message: any) {
    if (!this.supabaseChannel) return;
    try {
      this.supabaseChannel.send(message).catch(() => {
        // If send fails, re-queue once
        this.pendingQueue.push(message);
        this.scheduleReconnect();
      });
    } catch (e) {
      this.pendingQueue.push(message);
      this.scheduleReconnect();
    }
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public broadcast(event: RealtimeEvent, data: any): void {
    if (this.isDestroyed || typeof window === "undefined") return;

    const payload: BroadcastPayload = {
      event,
      pin: this.pin,
      data,
      timestamp: Date.now(),
    };

    // 1. Notify local listeners instantly
    this.notifyListeners(payload);

    // 2. BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {
        // ignore
      }
    }

    // 3. LocalStorage sync fallback
    try {
      localStorage.setItem(`cahoot_event_${this.pin}`, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }

    // 4. Supabase Realtime Broadcast (with queue protection)
    const message = {
      type: "broadcast",
      event: "game_event",
      payload,
    };

    if (this.isConnected && this.supabaseChannel) {
      this.sendOverSupabase(message);
    } else {
      // Queue until connection is ready
      this.pendingQueue.push(message);
      this.scheduleReconnect();
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.isConnected = false;
    this.listeners.clear();
    this.pendingQueue = [];

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    if (this.broadcastChannel) {
      try { this.broadcastChannel.close(); } catch (e) {}
      this.broadcastChannel = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent);
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("focus", this.handleFocus);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }

    if (this.supabaseChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(this.supabaseChannel).catch(() => {});
      }
      this.supabaseChannel = null;
    }
  }
}

// Global active channels cache
const channels = new Map<string, RealtimeChannelBridge>();

export function getRealtimeChannel(pin: string): RealtimeChannelBridge {
  const normalizedPin = pin.trim();
  if (!channels.has(normalizedPin)) {
    channels.set(normalizedPin, new RealtimeChannelBridge(normalizedPin));
  }
  return channels.get(normalizedPin)!;
}
