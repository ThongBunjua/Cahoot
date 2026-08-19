import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Player } from "./types";

export class SyncBridge {
  // Host registers or finds game session in Supabase DB
  static async hostRegisterRoom(pin: string, quizId?: string): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data } = await supabase
        .from("game_sessions")
        .upsert(
          {
            pin,
            status: "lobby",
            current_question_index: 0,
            created_at: new Date().toISOString(),
          },
          { onConflict: "pin" }
        )
        .select("id")
        .single();

      if (data && data.id) {
        return data.id;
      }
    } catch (err) {
      console.warn("[SyncBridge] Host register room DB notice:", err);
    }
    return null;
  }

  // Player joins room in Supabase DB
  static async playerJoinRoom(pin: string, player: Player): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { data: session } = await supabase
        .from("game_sessions")
        .select("id")
        .eq("pin", pin)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (session && session.id) {
        await supabase.from("session_players").upsert(
          {
            session_id: session.id,
            nickname: player.nickname,
            avatar: player.avatar || "🦊",
            score: player.score || 0,
            streak: player.streak || 0,
            rank: player.rank || 1,
            is_active: true,
          },
          { onConflict: "session_id,nickname" }
        );
      }
    } catch (err) {
      console.warn("[SyncBridge] Player join DB notice:", err);
    }
  }

  // Host polls session players as fallback backup
  static async fetchRoomPlayers(pin: string): Promise<Player[]> {
    if (!isSupabaseConfigured()) return [];
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data: session } = await supabase
        .from("game_sessions")
        .select("id")
        .eq("pin", pin)
        .single();

      if (session && session.id) {
        const { data: dbPlayers } = await supabase
          .from("session_players")
          .select("*")
          .eq("session_id", session.id)
          .eq("is_active", true)
          .order("joined_at", { ascending: true });

        if (dbPlayers && dbPlayers.length > 0) {
          return dbPlayers.map((p, idx) => ({
            id: p.id,
            nickname: p.nickname,
            avatar: p.avatar || "🦊",
            score: p.score || 0,
            streak: p.streak || 0,
            lastPoints: 0,
            lastCorrect: null,
            lastAnswerIndex: null,
            rank: p.rank || idx + 1,
            joinedAt: new Date(p.joined_at).getTime() || Date.now(),
          }));
        }
      }
    } catch (err) {
      // ignore
    }
    return [];
  }
}
