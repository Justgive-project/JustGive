import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { GlassNavigation } from "@/components/site-header";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/en" }));

describe("contribution navigation", () => {
  it("sends the desktop and mobile navbar CTAs to the localized contribution page", () => {
    render(<GlassNavigation locale="en" />);

    const contributionLinks = screen.getAllByRole("link").filter((link) => link.getAttribute("href") === "/en/contribute");
    expect(contributionLinks).toHaveLength(2);
  });
});
