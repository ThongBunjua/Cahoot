import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BroadcastPayload, RealtimeEvent } from "./types";

export type EventCallback = (payload: BroadcastPayload) => void;

export class RealtimeChannelBridge {
  private pin: string;
  private listeners: Set<EventCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private isDestroyed: boolean = false;

  constructor(pin: string) {
    this.pin = pin;
    this.init();
  }

  private init() {
    if (typeof window === "undefined") return;

    // 1. Initialize Local BroadcastChannel for instant local & multi-tab/window communication
    try {
      if ("BroadcastChannel" in window) {
        this.broadcastChannel = new BroadcastChannel(`cahoot_room_${this.pin}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.pin === this.pin) {
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not supported or error:", e);
    }

    // 2. Initialize Supabase Realtime Channel if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        this.supabaseChannel = supabase.channel(`game_room_${this.pin}`, {
          config: {
            broadcast: { self: false, ack: false },
          },
        });

        this.supabaseChannel
          .on("broadcast", { event: "game_event" }, (payload: any) => {
            if (payload && payload.payload) {
              this.notifyListeners(payload.payload);
            }
          })
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              console.log(`[Supabase Realtime] Connected to room ${this.pin}`);
            }
          });
      }
    }

    // 3. Fallback: window storage event for cross-tab sync
    window.addEventListener("storage", this.handleStorageEvent);
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

    // Notify local listeners in same tab
    this.notifyListeners(payload);

    // Broadcast across tabs/windows via BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {
        console.warn("Error posting to BroadcastChannel:", e);
      }
    }

    // Broadcast via localStorage event
    try {
      localStorage.setItem(`cahoot_event_${this.pin}`, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }

    // Broadcast via Supabase Realtime Broadcast (Zero DB writes!)
    if (this.supabaseChannel) {
      this.supabaseChannel.send({
        type: "broadcast",
        event: "game_event",
        payload,
      }).catch((err: any) => {
        console.warn("Supabase broadcast error:", err);
      });
    }
  }

  public destroy() {
    this.isDestroyed = true;
    this.listeners.clear();

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent);
    }

    if (this.supabaseChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(this.supabaseChannel);
      }
      this.supabaseChannel = null;
    }
  }
}

// Global active channels cache to prevent duplicate connections
const channels = new Map<string, RealtimeChannelBridge>();

export function getRealtimeChannel(pin: string): RealtimeChannelBridge {
  const normalizedPin = pin.trim();
  if (!channels.has(normalizedPin)) {
    channels.set(normalizedPin, new RealtimeChannelBridge(normalizedPin));
  }
  return channels.get(normalizedPin)!;
}
