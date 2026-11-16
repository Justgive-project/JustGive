import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { AccessibilityTools } from "@/components/accessibility-tools";
import { SiteBackground } from "@/components/site-background";
export const metadata: Metadata = { title: { default: "JustGive — Give Freely. Feel Good. Repeat.", template: "%s" }, description: "A personal voluntary contribution website. Give freely, with no purchase, pressure, or reward.", metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"), openGraph: { siteName: "JustGive", type: "website", title: "JustGive — Give Freely. Feel Good. Repeat.", description: "A little giving. A little happiness.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "JustGive — Give Freely. Feel Good. Repeat." }] }, twitter: { card: "summary_large_image", images: ["/opengraph-image"] } };
export default async function RootLayout({children}:{children:React.ReactNode}) { const raw=(await headers()).get("x-locale"); const locale: "en" | "hi" | "hi-Latn" = raw === "hi" || raw === "hi-Latn" ? raw : "en";return <html lang={locale}><body><SiteBackground/><ServiceWorkerRegister/><AccessibilityTools locale={locale}/>{children}</body></html>; }
