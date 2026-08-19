import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getRealtimeChannel } from "./realtimeProvider";

const SESSIONS_KEY = "cahoot_active_sessions";

export interface ActiveSessionInfo {
  pin: string;
  quizTitle: string;
  status: "lobby" | "active" | "finished";
  lastHeartbeat: number;
}

export class SessionManager {
  // Register active host session
  static registerHost(pin: string, quizTitle: string) {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      const sessions: Record<string, ActiveSessionInfo> = stored ? JSON.parse(stored) : {};
      sessions[pin] = {
        pin,
        quizTitle,
        status: "lobby",
        lastHeartbeat: Date.now(),
      };
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      // ignore
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        Promise.resolve(
          supabase.from("game_sessions").upsert({
            pin,
            status: "lobby",
            created_at: new Date().toISOString(),
          })
        ).catch(console.warn);
      }
    }
  }

  // Unregister host session
  static unregisterHost(pin: string) {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      if (stored) {
        const sessions: Record<string, ActiveSessionInfo> = JSON.parse(stored);
        delete sessions[pin];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      }
    } catch (e) {
      // ignore
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        Promise.resolve(
          supabase
            .from("game_sessions")
            .update({ status: "finished", ended_at: new Date().toISOString() })
            .eq("pin", pin)
        ).catch(console.warn);
      }
    }
  }

  // Check if a room with the given PIN is currently active with a live Host
  static async checkRoomExists(pin: string): Promise<boolean> {
    const cleanPin = pin.replace(/\s+/g, "").trim();
    if (!cleanPin) return false;

    // 1. Check Local Active Sessions Storage (valid for 2 hours)
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SESSIONS_KEY);
        if (stored) {
          const sessions: Record<string, ActiveSessionInfo> = JSON.parse(stored);
          const session = sessions[cleanPin];
          if (session && session.status !== "finished") {
            const isFresh = Date.now() - session.lastHeartbeat < 2 * 60 * 60 * 1000;
            if (isFresh) return true;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. Check Supabase DB if configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data } = await supabase
            .from("game_sessions")
            .select("id, status")
            .eq("pin", cleanPin)
            .neq("status", "finished")
            .single();

          if (data) return true;
        } catch (e) {
          // ignore
        }
      }
    }

    // 3. Ping over Realtime Channel
    return new Promise<boolean>((resolve) => {
      const channel = getRealtimeChannel(cleanPin);
      let answered = false;

      const unsubscribe = channel.subscribe((payload) => {
        if (payload.pin === cleanPin && (payload.event === "ROOM_EXISTS" || payload.event === "LOBBY_SYNC")) {
          answered = true;
          unsubscribe();
          resolve(true);
        }
      });

      channel.broadcast("CHECK_ROOM", { pin: cleanPin });

      setTimeout(() => {
        if (!answered) {
          unsubscribe();
          resolve(false);
        }
      }, 700);
    });
  }
}
