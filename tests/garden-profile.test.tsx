import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { ContributionForm } from "@/components/contribution-form";
import { contributorProfileSchema, validContributorPhoto } from "@/lib/contributor-validation";
import { leaderboardEntriesForCurrentSource } from "@/lib/leaderboard";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("Garden of Kindness profiles", () => {
  it("keeps contribution amount when profile setup opens and saves public consent", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url === "/api/contributors/profile" && !options) return Promise.resolve({ json: async () => ({ profile: null }) });
      return Promise.resolve({ ok: true, json: async () => ({ profile: { displayName: "Kind Stranger", biography: "Small acts matter.", consent: true, photoUrl: null } }) });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContributionForm locale="en"/>);
    fireEvent.click(screen.getByRole("button", { name: "₹51" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, show me" }));
    expect(screen.getByRole("dialog", { name: "Your Garden profile" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Display name"), { target: { value: "Kind Stranger" } });
    fireEvent.change(screen.getByLabelText("About yourself"), { target: { value: "Small acts matter." } });
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "₹51" })).toHaveAttribute("aria-pressed", "true");
    expect(fetchMock).toHaveBeenCalledWith("/api/contributors/profile", expect.objectContaining({ method: "POST" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit my profile" }));
    fireEvent.change(screen.getByLabelText("About yourself"), { target: { value: "Kindness grows." } });
    fireEvent.click(screen.getByLabelText("Show my name and profile on the public leaderboard"));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/contributors/profile", expect.objectContaining({ method: "PATCH" })));
    const update = fetchMock.mock.calls.find(([url, options]) => url === "/api/contributors/profile" && options?.method === "PATCH");
    expect((update?.[1]?.body as FormData).get("consent")).toBe("false");
    expect(screen.getByRole("button", { name: "₹51" })).toHaveAttribute("aria-pressed", "true");
  });

  it("lets a contributor withdraw consent without opening profile setup", () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ json: async () => ({ profile: null }) })));
    render(<ContributionForm locale="en"/>);
    fireEvent.click(screen.getByRole("button", { name: "No, stay private" }));
    expect(screen.getByRole("button", { name: "No, stay private" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("validates flexible names and optional biography", () => {
    expect(contributorProfileSchema.safeParse({ displayName: "A kind 🌱 person", biography: "", consent: true }).success).toBe(true);
    expect(contributorProfileSchema.safeParse({ displayName: "", biography: "", consent: true }).success).toBe(false);
    expect(contributorProfileSchema.safeParse({ displayName: "x", biography: "b".repeat(501), consent: true }).success).toBe(false);
  });

  it("checks photo format signatures, MIME type and server size ceiling", () => {
    const png = new Uint8Array([137,80,78,71,13,10,26,10]);
    expect(validContributorPhoto(png, "image/png", png.length)).toBe(true);
    expect(validContributorPhoto(png, "image/jpeg", png.length)).toBe(false);
    expect(validContributorPhoto(png, "image/png", 5 * 1024 * 1024 + 1)).toBe(false);
    expect(validContributorPhoto(new Uint8Array([1,2,3]), "image/webp", 3)).toBe(false);
  });

  it("keeps demo and future verified entries in separate rankings", () => {
    const demo = [{ id: "demo", amountPaise: 100, displayName: "Demo", photoUrl: null, biography: null, consent: true }];
    const verified = [{ ...demo[0], id: "verified", displayName: "Verified" }];
    const result = leaderboardEntriesForCurrentSource(demo, verified);
    expect(result.source).toBe("demo-unverified");
    expect(result.entries.map(({ id }) => id)).toEqual(["demo"]);
    expect(result.verified).toEqual(verified);
  });
});
