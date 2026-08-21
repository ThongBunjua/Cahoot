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

  // Unregister host session immediately on game finish or host exit
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

  // Check if a room with the given PIN is currently live with an active Host
  static async checkRoomExists(pin: string): Promise<boolean> {
    const cleanPin = pin.replace(/\s+/g, "").trim();
    if (!cleanPin) return false;

    // 1. Ping over Realtime WebSocket Channel to see if Host is actively listening
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

      // If no live Host responds within 700ms, check database fallback
      setTimeout(() => {
        if (!answered) {
          unsubscribe();

          // 2. Check Supabase DB fallback
          if (isSupabaseConfigured()) {
            const supabase = getSupabaseClient();
            if (supabase) {
              supabase
                .from("game_sessions")
                .select("id, status")
                .eq("pin", cleanPin)
                .neq("status", "finished")
                .single()
                .then(({ data }) => {
                  resolve(Boolean(data));
                }, () => resolve(false));
              return;
            }
          }

          // 3. Check local active sessions as final fallback (within 30 mins)
          if (typeof window !== "undefined") {
            try {
              const stored = localStorage.getItem(SESSIONS_KEY);
              if (stored) {
                const sessions: Record<string, ActiveSessionInfo> = JSON.parse(stored);
                const s = sessions[cleanPin];
                if (s && s.status !== "finished" && Date.now() - s.lastHeartbeat < 30 * 60 * 1000) {
                  resolve(true);
                  return;
                }
              }
            } catch (e) {}
          }

          resolve(false);
        }
      }, 700);
    });
  }
}
