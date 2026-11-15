import Link from "next/link";
import { ArrowRight, CheckCircle2, Flower2, HandHeart, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { getMessages, isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnimatedHeart } from "@/components/animated-heart";
import { GlassCard } from "@/components/glass-surfaces";
import { MessageAppreciationButton } from "@/components/message-appreciation-button";
import { WallStarterNotes } from "@/components/wall-starter-notes";
import { GardenLeaderboard } from "@/components/garden-leaderboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const deva = locale === "hi";
  return {
    title: deva ? "जस्टगिव — खुशी से दें। सुकून महसूस करें।" : locale === "hi-Latn" ? "JustGive — Khushi se dein. Sukoon mehsoos karein." : "JustGive — Give Freely. Feel Good. Repeat.",
    description: deva ? "एक निजी स्वैच्छिक योगदान वेबसाइट।" : locale === "hi-Latn" ? "Ek niji vaikalpik yogadaan vebsait." : "A personal voluntary contribution website.",
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", hi: "/hi", "x-default": "/en" },
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw;
  const t = getMessages(locale);
  const db = await createSupabaseServerClient();
  const { data: wallMessages } = db
    ? await db.from("approved_messages").select("id,body,locale,created_at,appreciation_count,pass_it_on").order("created_at", { ascending: false }).limit(3)
    : { data: null };
  const { data: dailyMoment } = db ? await db.from("daily_moments").select("title,body").eq("locale", locale).eq("published", true).lte("publish_at", new Date().toISOString()).order("publish_at", { ascending: false }).limit(1).maybeSingle() : { data: null };

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "JustGive",
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              inLanguage: locale,
              description: t.homeMetaDescription,
            }),
          }}
        />
        <section className="hero-section" aria-labelledby="home-title">
          <svg className="hero-wave" aria-hidden="true" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--wave-top)" stopOpacity=".55" />
                <stop offset=".45" stopColor="var(--wave-mid)" stopOpacity=".24" />
                <stop offset="1" stopColor="var(--wave-bottom)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="waveRidge" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--wave-ridge-a)" />
                <stop offset=".35" stopColor="var(--wave-ridge-b)" />
                <stop offset=".7" stopColor="var(--wave-ridge-c)" />
                <stop offset="1" stopColor="var(--wave-ridge-d)" />
              </linearGradient>
              <filter id="waveBlur" x="-5%" y="-60%" width="110%" height="220%">
                <feGaussianBlur stdDeviation="9" />
              </filter>
            </defs>
            <path d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118 L1440 320 L0 320 Z" fill="url(#waveFill)" />
            <path className="hero-wave-blur" d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118" fill="none" stroke="url(#waveRidge)" strokeWidth="16" opacity=".55" filter="url(#waveBlur)" vectorEffect="non-scaling-stroke" />
            <path className="hero-wave-mobile-glow" d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118" fill="none" stroke="url(#waveRidge)" strokeWidth="10" opacity=".18" vectorEffect="non-scaling-stroke" />
            <path d="M0 150 C170 190 330 170 520 118 C700 70 840 56 990 108 C1110 150 1190 196 1310 186 C1380 180 1415 150 1440 118" fill="none" stroke="url(#waveRidge)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="hero-copy">
            <p className="hero-kicker">{t.heroKicker}</p>
            <h1 id="home-title">
              <span>{t.heroPlace}</span>
              <em>{t.heroPlaceEm}</em>
            </h1>
            <p>{t.heroText}</p>
            <div className="hero-actions">
              <Link className="button premium-cta hero-cta" href={`/${locale}/contribute`}><Heart size={18} aria-hidden="true" />{t.heroGive}</Link>
              <Link className="hero-secondary-link" href={`/${locale}/how-it-works`}>{t.howLink}</Link>
            </div>
          </div>
          <AnimatedHeart locale={locale} />
        </section>

        <GardenLeaderboard locale={locale} />

        <section className="content-section why-section" id="why">
          <div className="section-intro"><h2>{t.whyTitle}</h2><p>{t.whyText}</p></div>
          <div className="owner-ethics glass-panel owner-ethics-inline">
            <div className="owner-ethics-mark" aria-hidden="true"><Heart /></div>
            <div><h2 id="owner-ethics-title">{t.ownerEthicsTitle}</h2><p>{t.ownerEthics}</p></div>
          </div>
          <div className="reason-cards">
            <GlassCard><div className="reason-icon coral"><HandHeart aria-hidden="true" /></div><h3>{t.choiceTitle}</h3><p>{t.choiceBody}</p></GlassCard>
            <GlassCard><div className="reason-icon yellow"><Sparkles aria-hidden="true" /></div><h3>{t.happinessTitle}</h3><p>{t.happinessBody}</p></GlassCard>
            <GlassCard><div className="reason-icon ocean"><ShieldCheck aria-hidden="true" /></div><h3>{t.honestTitle}</h3><p>{t.honestBody}</p></GlassCard>
          </div>
        </section>

        <section className="steps-section" id="how">
          <div><h2>{t.howTitle}</h2><p>{t.stepsLead}</p><Link className="text-link" href={`/${locale}/how-it-works`}>{t.fullProcess}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <ol>{t.steps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span>{step}<CheckCircle2 size={19} aria-hidden="true" /></li>)}</ol>
        </section>

        <section className="wall-preview">
          <div className="wall-copy"><h2>{t.wallTitle}</h2><p>{t.wallText}</p><Link className="text-link" href={`/${locale}/wall-of-kindness`}>{t.wallLink}<ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="wall-preview-messages" aria-label={t.wallTitle}>
            {wallMessages?.length ? wallMessages.map((message) => <figure className="wall-message-card" key={message.id}><Flower2 size={21} aria-hidden="true" /><blockquote>{message.body}</blockquote>{message.pass_it_on && <p className="pass-it-on"><Sparkles size={14} aria-hidden="true" />{message.pass_it_on}</p>}<figcaption>{new Date(message.created_at).toLocaleDateString(locale === "en" ? "en-IN" : "hi-IN")}<MessageAppreciationButton id={message.id} count={message.appreciation_count} locale={locale}/></figcaption></figure>) : <WallStarterNotes locale={locale} />}
          </div>
        </section>

        {dailyMoment && <section className="daily-moment glass-panel" aria-labelledby="daily-moment-title"><span className="eyebrow">{t.dailyMomentEyebrow}</span><h2 id="daily-moment-title">{dailyMoment.title}</h2><p>{dailyMoment.body}</p></section>}

        <section className="faq-section">
          <h2>{t.faqTitle}</h2>
          <div className="faq-grid">{t.faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
          <Link className="stats-inline" href={`/${locale}/transparency`}>
            <span className="stats-icon"><ShieldCheck size={22} aria-hidden="true" /></span>
            <span><strong>{t.statsTitle}</strong><span>{t.statsLink}</span></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
