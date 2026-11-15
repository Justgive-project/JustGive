import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ profile: { photo_path: "safe-id.webp", public_consent: true }, owner: null as null | { id: string } }));
vi.mock("@/lib/contributor-owner", () => ({ currentContributor: vi.fn(async () => state.owner) }));
vi.mock("@/lib/supabase/privileged", () => ({ createSupabasePrivilegedClient: vi.fn(() => ({
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: state.profile, error: null }) }) }) }),
  storage: { from: () => ({ download: async () => ({ data: new Blob([new Uint8Array([1, 2, 3])]), error: null }) }) },
})) }));

import { GET } from "@/app/api/contributors/photo/[profileId]/route";

const request = () => GET(new Request("https://example.test/photo"), { params: Promise.resolve({ profileId: "123e4567-e89b-42d3-a456-426614174000" }) });

describe("contributor photo privacy", () => {
  beforeEach(() => { state.profile = { photo_path: "safe-id.webp", public_consent: true }; state.owner = null; });

  it("serves consented photos without exposing the private storage path", async () => {
    const response = await request();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not serve private photos without the edit credential owner", async () => {
    state.profile.public_consent = false;
    const response = await request();
    expect(response.status).toBe(404);
  });

  it("allows the private owner to preview their own photo", async () => {
    state.profile.public_consent = false;
    state.owner = { id: "123e4567-e89b-42d3-a456-426614174000" };
    const response = await request();
    expect(response.status).toBe(200);
  });
});
