"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { LanguageSwitch } from "./language-switch";
import type { Locale } from "@/lib/i18n";

export function MobileNav({ locale, nav, giveLabel }: { locale: Locale; nav: React.ReactNode; giveLabel: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const openLabel = locale !== "en" ? "नेविगेशन खोलें" : "Open navigation";
  const closeLabel = locale !== "en" ? "नेविगेशन बंद करें" : "Close navigation";
  const navLabel = locale !== "en" ? "मोबाइल नेविगेशन" : "Mobile navigation";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const close = () => {
      details.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !details.open) return;
      event.preventDefault();
      close();
      (details.querySelector("summary") as HTMLElement | null)?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <details className="mobile-nav" ref={ref} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <summary aria-label={isOpen ? closeLabel : openLabel} aria-expanded={isOpen} aria-controls="mobile-site-nav">
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </summary>
      <nav id="mobile-site-nav" aria-label={navLabel}>
        {nav}
        <LanguageSwitch locale={locale} />
        <Link href={`/${locale}/contribute`} className="button premium-cta"><Heart size={18} aria-hidden="true" />{giveLabel}</Link>
      </nav>
    </details>
  );
}
