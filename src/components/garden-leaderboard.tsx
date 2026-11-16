"use client";

import { useEffect, useRef, useState } from "react";
import { Flower2, Heart, Trophy } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";
import { ContributorProfileModal, type PublicContributor } from "@/components/contributor-profile-modal";

export function GardenLeaderboard({ locale }: { locale: Locale }) {
  const text = (en: string, hi: string) => inlineCopy(locale, hi, en);
  const [people, setPeople] = useState<PublicContributor[]>([]);
  const [selected, setSelected] = useState<PublicContributor | null>(null);
  const gardenRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (typeof fetch === "undefined") return; void Promise.resolve(fetch("/api/contributors/leaderboard")).then(response => response?.json?.()).then(result => setPeople(result?.contributors ?? [])).catch(() => setPeople([])); }, []);
  const topTen = people.slice(0, 10);
  useEffect(() => {
    const garden = gardenRef.current;
    if (!garden) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let currentAngle = 0;
    let lastTime: number | null = null;
    let frame = 0;
    let isHovered = false;
    let hasFocus = false;
    let isVisible = true;
    const avatars = Array.from(garden.querySelectorAll<HTMLButtonElement>(".garden-person"));
    if (!avatars.length) return;
    const positionAvatars = (angle: number) => {
      const radius = garden.clientWidth * 0.38;
      avatars.forEach((avatar, index) => {
        const baseAngle = (index / Math.max(avatars.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const orbitAngle = baseAngle + angle;
        const x = radius * Math.cos(orbitAngle);
        const y = radius * Math.sin(orbitAngle);
        avatar.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    const motionIsReduced = () => media.matches || document.documentElement.classList.contains("a11y-reduced-motion");
    const shouldRun = () => !motionIsReduced() && !document.hidden && isVisible && !isHovered && !hasFocus;
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = null;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!shouldRun()) { lastTime = null; return; }
      if (lastTime !== null) currentAngle += ((time - lastTime) / 75000) * Math.PI * 2;
      lastTime = time;
      positionAvatars(currentAngle);
      frame = requestAnimationFrame(tick);
    };
    const start = () => { if (shouldRun() && !frame) frame = requestAnimationFrame(tick); };
    const onPointerEnter = () => { isHovered = true; stop(); };
    const onPointerLeave = () => { isHovered = false; start(); };
    const onFocusIn = () => { hasFocus = true; stop(); };
    const onFocusOut = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && garden.contains(event.relatedTarget)) return;
      hasFocus = false;
      start();
    };
    const onVisibilityChange = () => document.hidden ? stop() : start();
    const onMotionChange = () => {
      if (motionIsReduced()) { stop(); currentAngle = 0; positionAvatars(0); }
      else start();
    };
    positionAvatars(0);
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start(); else stop();
    });
    observer.observe(garden);
    const resizeObserver = new ResizeObserver(() => positionAvatars(currentAngle));
    resizeObserver.observe(garden);
    const preferenceObserver = new MutationObserver(onMotionChange);
    preferenceObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    garden.addEventListener("pointerenter", onPointerEnter);
    garden.addEventListener("pointerleave", onPointerLeave);
    garden.addEventListener("focusin", onFocusIn);
    garden.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibilityChange);
    media.addEventListener("change", onMotionChange);
    start();
    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      preferenceObserver.disconnect();
      garden.removeEventListener("pointerenter", onPointerEnter);
      garden.removeEventListener("pointerleave", onPointerLeave);
      garden.removeEventListener("focusin", onFocusIn);
      garden.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      media.removeEventListener("change", onMotionChange);
    };
  }, [people]);
  return <section className="garden-leaderboard" aria-labelledby="garden-leaderboard-title">
    <div className="garden-leaderboard-heading"><span className="eyebrow"><Flower2 size={15} aria-hidden="true" />{text("A garden of kindness", "दयालुता का बगीचा")}</span>
      <h2 id="garden-leaderboard-title">{text("Top 20 kind hearts", "दयालुता के शीर्ष 20 योगदानकर्ता")}</h2>
      <p>{text("Every name here chose to be seen. These are simulated demo contributions, not verified payments.", "यहाँ हर नाम ने सार्वजनिक रूप से दिखने की सहमति दी है। ये सिम्युलेटेड डेमो योगदान हैं, सत्यापित भुगतान नहीं।")}</p>
    </div>
    <div className="garden-leaderboard-layout">
      <div ref={gardenRef} className="garden-top-ten" aria-label={text("Top 10 Garden", "शीर्ष 10 का बगीचा")}>
        <div className="garden-top-ten-orbit" aria-hidden="true" />
        <div className="garden-top-ten-core"><Flower2 size={37} aria-hidden="true"/><span>{text("Garden", "बगीचा")}</span></div>
        {topTen.map(person => <button key={person.id} className={`garden-person garden-rank-${person.rank <= 3 ? person.rank : "other"}`} onClick={() => setSelected(person)} aria-label={`${text("Rank", "स्थान")} ${person.rank}: ${person.displayName}`}>
          <span className="garden-avatar">{person.photoUrl ? <img src={person.photoUrl} alt=""/> : (person.displayName ?? "?").trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase()}</span><span className="garden-person-rank">{person.rank}</span><span className="garden-person-name">{person.displayName}</span>
        </button>)}
        {!topTen.length && <p className="garden-empty">{text("No eligible public demo contributors yet. Choose “Yes, show me” before a demo contribution to join.", "अभी कोई सार्वजनिक डेमो योगदानकर्ता नहीं है। शामिल होने के लिए डेमो योगदान से पहले “हाँ, मुझे दिखाएँ” चुनें।")}</p>}
      </div>
      <div className="garden-top-twenty">
        <div className="garden-list-title"><Trophy size={18} aria-hidden="true"/><h3>{text("Top 20", "शीर्ष 20")}</h3><span>{text("DEMO · UNVERIFIED", "डेमो · अप्रमाणित")}</span></div>
        {people.length ? <ol className="garden-list">{people.slice(0, 20).map(person => <li key={person.id}>
          <span className="garden-list-rank">{person.rank}</span><button className="garden-list-person" onClick={() => setSelected(person)} aria-label={`${person.displayName}, ${text("rank", "स्थान")} ${person.rank}`}><span className={`profile-avatar ${person.rank <= 3 ? `medal-${person.rank}` : ""}`}>{person.photoUrl ? <img src={person.photoUrl} alt=""/> : (person.displayName ?? "?").trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase()}</span><span>{person.displayName}</span></button>
          <span className="garden-list-amount">₹{(person.amountPaise / 100).toLocaleString(locale === "en" ? "en-IN" : "hi-IN")}</span><button className="garden-more" onClick={() => setSelected(person)} aria-label={`${text("More about", "के बारे में अधिक")} ${person.displayName}`}>{text("More", "और जानें")}</button>
        </li>)}</ol> : <p className="garden-empty"><Heart size={17} aria-hidden="true"/>{text("The Garden will bloom here after a public profile joins a completed demo contribution.", "सार्वजनिक प्रोफ़ाइल के डेमो योगदान पूरा करने के बाद बगीचा यहाँ खिलेगा।")}</p>}
      </div>
    </div>
    {selected && <ContributorProfileModal mode="view" contributor={selected} locale={locale} onClose={() => setSelected(null)}/>}
  </section>;
}
