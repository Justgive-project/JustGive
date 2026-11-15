import "server-only";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";
import { leaderboardEntriesForCurrentSource, type LeaderboardEntry } from "@/lib/leaderboard";

export async function getDemoLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const db = createSupabasePrivilegedClient();
  if (!db) return [];
  const { data } = await db.from("garden_demo_leaderboard").select("id,display_name,photo_path,biography,amount_paise").order("amount_paise", { ascending: false }).limit(100);
  return (data ?? []).map(row => ({ id: row.id, amountPaise: Number(row.amount_paise), displayName: row.display_name, photoUrl: row.photo_path ? `/api/contributors/photo/${encodeURIComponent(row.id)}` : null, biography: row.biography, consent: true }));
}

/** Verified data stays a separate source until profiles can be reliably and explicitly associated. */
export async function getVerifiedLeaderboardEntries(): Promise<LeaderboardEntry[]> { return []; }

export async function getLeaderboardEntries() {
  const [demo, verified] = await Promise.all([getDemoLeaderboardEntries(), getVerifiedLeaderboardEntries()]);
  return leaderboardEntriesForCurrentSource(demo, verified);
}
