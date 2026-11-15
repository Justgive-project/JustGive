export type LeaderboardEntry = { id: string; amountPaise: number; displayName: string | null; photoUrl: string | null; biography: string | null; consent: boolean };
export type RankedEntry = LeaderboardEntry & { rank: number };

/** Current public view deliberately chooses only the demo source until verified attribution exists. */
export function leaderboardEntriesForCurrentSource(demo: LeaderboardEntry[], verified: LeaderboardEntry[]) {
  return { demo, verified, entries: demo, source: "demo-unverified" as const };
}

/** Ranking is intentionally source agnostic; callers must supply one source at a time. */
export function rankContributors(entries: LeaderboardEntry[], limit = 20): RankedEntry[] {
  const eligible = entries.filter((entry) => entry.consent && Number.isSafeInteger(entry.amountPaise) && entry.amountPaise > 0)
    .sort((a, b) => b.amountPaise - a.amountPaise);
  let previous: number | undefined;
  let rank = 0;
  return eligible.slice(0, limit).map((entry, index) => {
    if (entry.amountPaise !== previous) rank = index + 1;
    previous = entry.amountPaise;
    return { ...entry, rank };
  });
}
