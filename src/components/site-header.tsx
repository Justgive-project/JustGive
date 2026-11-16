import Link from "next/link";
import { Heart } from "lucide-react";
import { getMessages, type Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./language-switch";
import { MobileNav } from "./mobile-nav";
import { SkipLink } from "./skip-link";
export function GlassNavigation({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const nav=<><Link href={`/${locale}/about`}>{t.nav.about}</Link><Link href={`/${locale}/how-it-works`}>{t.nav.how}</Link><Link href={`/${locale}/wall-of-kindness`}>{t.nav.wall}</Link><Link href={`/${locale}/transparency`}>{t.nav.transparency}</Link><Link href={`/${locale}/contact`}>{t.nav.contact}</Link></>;
  return <><header className="site-header"><SkipLink label={t.skipToContent}/><div className="site-nav-shell"><Link className="wordmark brand-lockup group flex shrink-0 items-center gap-2 bg-transparent border-none shadow-none sm:gap-2.5 focus:outline-none" href={`/${locale}`} aria-label={t.brand}>
    <span className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
      <svg className="jg-ribbon-logo h-9 w-11 overflow-visible drop-shadow-[0_4px_10px_rgba(166,120,226,0.28)] sm:h-11 sm:w-14" viewBox="0 0 120 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="jgLogoJ" x1="8" y1="78" x2="48" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF7B89" />
            <stop offset="52%" stopColor="#F6BCBA" />
            <stop offset="100%" stopColor="#E3AADD" />
          </linearGradient>
          <linearGradient id="jgLogoHeart" x1="32" y1="16" x2="84" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F6BCBA" />
            <stop offset="50%" stopColor="#E38CE0" />
            <stop offset="100%" stopColor="#B388EB" />
          </linearGradient>
          <linearGradient id="jgLogoG" x1="68" y1="18" x2="112" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C3C7F4" />
            <stop offset="50%" stopColor="#9A7CE6" />
            <stop offset="100%" stopColor="#E3AADD" />
          </linearGradient>
        </defs>
        <path d="M55 4 L56.8 9.2 L62 11 L56.8 12.8 L55 18 L53.2 12.8 L48 11 L53.2 9.2 Z" fill="#F29A97" />
        <path d="M65 2 L65.8 4.5 L68.3 5.3 L65.8 6.1 L65 8.6 L64.2 6.1 L61.7 5.3 L64.2 4.5 Z" fill="#F6BCBA" />
        <path d="M21 34 L22.1 37.2 L25.3 38.3 L22.1 39.4 L21 42.6 L19.9 39.4 L16.7 38.3 L19.9 37.2 Z" fill="#B68EE8" />
        <path d="M58 63 C58 63 33 46 33 30 C33 20 41 15 49 15 C54 15 57 18 58 22 C59 18 62 15 67 15 C75 15 83 20 83 30 C83 46 58 63 58 63 Z" stroke="url(#jgLogoHeart)" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(244, 231, 251, 0.35)" />
        <path d="M45 16 C37 16 34 22 34 32 L34 56 C34 69 25 75 16 74 C9 73 6 66 9 59 C11 54 16 53 18 56" stroke="url(#jgLogoJ)" strokeWidth="8.5" strokeLinecap="round" />
        <path d="M98 28 C92 18 76 17 68 28 C60 39 62 58 74 68 C85 77 102 74 107 58 C109 51 107 46 101 46 L85 46 C80 46 76 49 73 46" stroke="url(#jgLogoG)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M34 26 L34 55 C34 66 26 72 17 72" stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M67 16 C75 16 82 21 82 30 C82 43 62 58 58 61" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
    <span className="flex flex-col leading-none">
      <span className="flex items-baseline text-[19px] font-extrabold tracking-tight sm:text-[22px]">
        <span className="text-[#231942]">Just</span>
        <span className="text-[#56287A]">G</span>
        <span className="relative inline-flex flex-col items-center text-[#56287A]">
          <svg className="-mb-1 h-2.5 w-2.5 text-[#F48B88]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>ı</span>
        </span>
        <span className="text-[#56287A]">ve</span>
      </span>
      <span className="mt-0.5 hidden pl-0.5 text-[7.5px] font-bold uppercase tracking-[0.22em] text-[#231942]/80 sm:block">
        Voluntary Giving
      </span>
    </span>
  </Link><nav className="desktop-nav" aria-label={locale !== "en" ? "मुख्य नेविगेशन" : "Main navigation"}>{nav}</nav><div className="header-actions"><LanguageSwitch locale={locale}/><Link href={`/${locale}/contribute`} className="button button-small premium-cta"><Heart size={16} aria-hidden="true"/>{t.nav.give}</Link></div><MobileNav locale={locale} nav={nav} giveLabel={t.nav.give}/></div></header></>;
}

export const SiteHeader = GlassNavigation;
