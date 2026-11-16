"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent } from "react";
import { Heart, Sparkles } from "lucide-react";

import type { Locale } from "@/lib/i18n";
import { inlineCopy } from "@/lib/inline-copy";
const celebrationKey = "justgive:contribution-confirmed";

export function OrbitRing({ className, radius, duration }: { className: string; radius: number; duration: string }) {
  const starX = 310 + radius;
  const starY = 215;
  return (
    <g className={`heart-orbit ${className}`} style={{ "--orbit-duration": duration } as CSSProperties}>
      <circle className="heart-orbit-line" cx="310" cy="215" r={radius} />
      <circle className="heart-orbit-highlight" cx="310" cy="215" r={radius} pathLength="100" />
      <circle className="heart-orbit-particle particle-primary" cx="310" cy={215 - radius} r="4" />
      <circle className="heart-orbit-particle particle-secondary" cx={310 + radius} cy="215" r="2.5" />
      <circle className="heart-orbit-particle particle-tertiary" cx="310" cy={215 + radius} r="3" />
      <path className="heart-orbit-star" d={`M${starX} ${starY - 6} L${starX + 1.5} ${starY - 1.5} L${starX + 6} ${starY} L${starX + 1.5} ${starY + 1.5} L${starX} ${starY + 6} L${starX - 1.5} ${starY + 1.5} L${starX - 6} ${starY} L${starX - 1.5} ${starY - 1.5} Z`} />
    </g>
  );
}

export function FloatingParticle({ className, cx, cy, radius }: { className: string; cx: number; cy: number; radius: number }) {
  return <circle className={`floating-particle ${className}`} cx={cx} cy={cy} r={radius} />;
}

export function AnimatedHeart({ locale }: { locale: Locale }) {
  const [pulse, setPulse] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const celebrationTimeout = useRef<number | null>(null);
  const lastInteraction = useRef(0);

  useEffect(() => {
    const respond = () => setPulse((value) => value + 1);
    window.addEventListener("justgive:amount-change", respond);
    return () => window.removeEventListener("justgive:amount-change", respond);
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(celebrationKey) === "1") {
        celebrationTimeout.current = window.setTimeout(() => {
          try {
            window.sessionStorage.removeItem(celebrationKey);
          } catch (error) {
            console.warn("Could not clear the optional contribution celebration.", error);
          }
          setCelebrating(true);
          celebrationTimeout.current = window.setTimeout(() => setCelebrating(false), 1200);
        }, 0);
      }
    } catch (error) {
      console.warn("Could not load the optional contribution celebration.", error);
    }

    return () => {
      if (celebrationTimeout.current !== null) window.clearTimeout(celebrationTimeout.current);
    };
  }, []);

  function reactToHeart() {
    const now = Date.now();
    if (now - lastInteraction.current < 900) return;
    lastInteraction.current = now;
    setCelebrating(true);
    if (celebrationTimeout.current !== null) window.clearTimeout(celebrationTimeout.current);
    celebrationTimeout.current = window.setTimeout(() => setCelebrating(false), 1000);
  }

  function respondToPointer(event: PointerEvent<SVGSVGElement>) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("a11y-reduced-motion")
    ) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const reflectionX = Math.max(-2, Math.min(2, ((event.clientX - bounds.left) / bounds.width - 0.5) * 4));
    const reflectionY = Math.max(-2, Math.min(2, ((event.clientY - bounds.top) / bounds.height - 0.5) * 4));
    event.currentTarget.style.setProperty("--reflection-x", `${reflectionX}px`);
    event.currentTarget.style.setProperty("--reflection-y", `${reflectionY}px`);
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    reactToHeart();
  }

  return (
    <div className={`hero-art${celebrating ? " is-celebrating" : ""}`}>
      <div className="hero-art-visual">
        <div className="heart-mobile-glow" aria-hidden="true" />
        <svg
          className="hero-illustration orbital-heart"
          viewBox="0 0 560 440"
          role="button"
          tabIndex={0}
          aria-label={inlineCopy(locale, "दिल को हल्की धड़कन दें", "Give the heart a gentle pulse")}
          aria-describedby="joy-description"
          onClick={reactToHeart}
          onKeyDown={handleKeyDown}
          onPointerMove={respondToPointer}
          onPointerLeave={(event) => {
            event.currentTarget.style.setProperty("--reflection-x", "0px");
            event.currentTarget.style.setProperty("--reflection-y", "0px");
          }}
        >
        <title id="joy-title">{inlineCopy(locale, "देने की खुशी", "The joy of giving")}</title>
        <desc id="joy-description">{inlineCopy(locale, "एक धड़कता हुआ दिल और उसके चारों ओर घूमते कण", "A softly beating heart with glowing particles moving around circular paths")}</desc>
        <defs>
          <radialGradient id="hero-heart-fill" cx=".35" cy=".28" r=".82">
            <stop offset="0" stopColor="var(--heart-highlight)" />
            <stop offset=".3" stopColor="var(--heart-mid)" />
            <stop offset=".65" stopColor="var(--heart-rose)" />
            <stop offset="1" stopColor="var(--heart-deep)" />
          </radialGradient>
          <linearGradient id="hero-ring-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--ring-fade)" />
            <stop offset=".55" stopColor="var(--ring-light)" />
            <stop offset="1" stopColor="var(--ring-fade)" />
          </linearGradient>
          <radialGradient id="hero-heart-mobile-highlight">
            <stop offset="0" stopColor="#fff" stopOpacity=".55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id="hero-heart-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26" /></filter>
          <filter id="hero-heart-soft-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <OrbitRing className="orbit-clockwise" radius={218} duration="52s" />
        <OrbitRing className="orbit-counterclockwise" radius={190} duration="38s" />
        <OrbitRing className="orbit-third" radius={164} duration="64s" />
        <ellipse className="heart-ripple" cx="310" cy="215" rx="118" ry="130" />
        <FloatingParticle className="particle-float-a" cx={95} cy={110} radius={3} />
        <FloatingParticle className="particle-float-b" cx={420} cy={132} radius={2.5} />
        <FloatingParticle className="particle-float-c" cx={405} cy={358} radius={3.5} />
        <g className="hero-heart-blur-glow" transform="translate(160 85) scale(1.5)" filter="url(#hero-heart-glow)" opacity=".65" aria-hidden="true">
          <path d="M100 170 C20 110 0 70 0 48 C0 20 22 2 50 2 C72 2 90 14 100 30 C110 14 128 2 150 2 C178 2 200 20 200 48 C200 70 180 110 100 170 Z" fill="var(--heart-glow)" />
        </g>
        <g transform="rotate(-24 300 215)" aria-hidden="true">
          <path d="M40 215 A260 84 0 0 1 560 215" fill="none" stroke="url(#hero-ring-gradient)" strokeWidth="1.8" />
        </g>
        <g className="heart-stable-core">
          <g transform="translate(160 85) scale(1.5)">
            <path id="hero-heart-shape" key={pulse} className="hero-heart" d="M100 170 C20 110 0 70 0 48 C0 20 22 2 50 2 C72 2 90 14 100 30 C110 14 128 2 150 2 C178 2 200 20 200 48 C200 70 180 110 100 170 Z" fill="url(#hero-heart-fill)" />
            <path d="M100 170 C20 110 0 70 0 48 C0 20 22 2 50 2 C72 2 90 14 100 30 C110 14 128 2 150 2 C178 2 200 20 200 48 C200 70 180 110 100 170 Z" fill="none" stroke="var(--heart-edge)" strokeWidth="2" />
            <use href="#hero-heart-shape" className="hero-heart-focus-outline" />
            <ellipse className="hero-heart-highlight" cx="100" cy="138" rx="46" ry="20" fill="var(--heart-belly)" filter="url(#hero-heart-soft-blur)" />
            <ellipse className="hero-heart-highlight" cx="50" cy="40" rx="28" ry="14" fill="var(--heart-reflection)" filter="url(#hero-heart-soft-blur)" transform="rotate(-30 50 40)" />
            <path className="hero-heart-glint" d="M22 46 C24 30 38 20 56 18" />
          </g>
        </g>
        <g transform="rotate(-24 300 215)" aria-hidden="true">
          <path d="M40 215 A260 84 0 0 0 560 215" fill="none" stroke="url(#hero-ring-gradient)" strokeWidth="1.8" opacity=".8" />
        </g>
        <g aria-hidden="true">
          <circle className="celebration-particle burst-a" cx="228" cy="162" r="3" />
          <circle className="celebration-particle burst-b" cx="393" cy="167" r="2.5" />
          <circle className="celebration-particle burst-c" cx="214" cy="261" r="2" />
          <circle className="celebration-particle burst-d" cx="408" cy="255" r="3" />
          <circle className="celebration-particle burst-e" cx="272" cy="328" r="2.5" />
          <circle className="celebration-particle burst-f" cx="350" cy="327" r="2" />
        </g>
        </svg>
      </div>
      <div className="hero-floating-note note-top"><Sparkles size={16} aria-hidden="true" /><span>{inlineCopy(locale, "छोटी खुशी", "A small act, freely chosen")}</span></div>
      <div className="hero-floating-note note-bottom"><Heart size={16} aria-hidden="true" /><span>{inlineCopy(locale, "पूरी तरह वैकल्पिक", "Always optional")}</span></div>
      <a className="scroll-cue" href="#why"><span>{inlineCopy(locale, "और जानें", "A little more")}</span><span aria-hidden="true">↓</span></a>
    </div>
  );
}
