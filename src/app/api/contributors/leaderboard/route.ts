import { NextResponse } from "next/server";
import { getLeaderboardEntries } from "@/lib/leaderboard-data";
import { rankContributors } from "@/lib/leaderboard";

export async function GET() {
  const { entries, source } = await getLeaderboardEntries();
  return NextResponse.json({ source, contributors: rankContributors(entries, 20) }, { headers: { "Cache-Control": "no-store" } });
}
