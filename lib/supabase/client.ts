import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

function normalizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  // Strip trailing /rest/v1/ or slashes if user pasted REST endpoint URL
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");
  return url;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const url = normalizeSupabaseUrl(rawUrl);

  if (!url || !key) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      realtime: {
        params: {
          eventsPerSecond: 100,
        },
      },
    });
  }

  return supabaseInstance;
}

export const isSupabaseConfigured = (): boolean => {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key && !url.includes("your-project"));
};
