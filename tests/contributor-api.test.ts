import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/contributor-owner", () => ({ currentContributor: vi.fn(async () => null), contributorCookie: "jg_contributor_edit", hashContributorCredential: vi.fn(), newContributorCredential: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ allowRequest: vi.fn(async () => true) }));
vi.mock("@/lib/request-ip", () => ({ getRequestIp: vi.fn(() => "test-ip") }));
vi.mock("@/lib/supabase/privileged", () => ({ createSupabasePrivilegedClient: vi.fn(() => null), getPrivilegedSupabaseConfig: vi.fn(() => ({ configured: true, missing: [] })) }));
vi.mock("@/lib/leaderboard-data", () => ({ getLeaderboardEntries: vi.fn(async () => ({ source: "demo-unverified", entries: [{ id: "public-id", displayName: "Kind Stranger", amountPaise: 500, photoUrl: null, biography: "A short bio", consent: true }] })) }));

import { GET as getProfile, PATCH as editProfile } from "@/app/api/contributors/profile/route";
import { GET as getLeaderboard } from "@/app/api/contributors/leaderboard/route";

describe("contributor API privacy and ownership", () => {
  it("does not expose a profile when the private edit credential is absent", async () => {
    const response = await getProfile();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ profile: null });
  });

  it("rejects profile edits without the private edit credential", async () => {
    const form = new FormData();
    form.set("displayName", "Somebody else"); form.set("consent", "false");
    const response = await editProfile(new Request("http://localhost/api/contributors/profile", { method: "PATCH", body: form }));
    expect(response.status).toBe(404);
    expect(await response.json()).not.toHaveProperty("profileId");
  });

  it("returns only consented public profile fields and demo-labelled amounts", async () => {
    const response = await getLeaderboard();
    const body = await response.json();
    expect(body.source).toBe("demo-unverified");
    expect(body.contributors[0]).toMatchObject({ displayName: "Kind Stranger", biography: "A short bio", amountPaise: 500, rank: 1 });
    expect(body.contributors[0]).not.toHaveProperty("email");
    expect(body.contributors[0]).not.toHaveProperty("receiptToken");
    expect(body.contributors[0]).not.toHaveProperty("editToken");
  });
});
