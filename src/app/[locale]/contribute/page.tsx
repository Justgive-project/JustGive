import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ContributionForm } from "@/components/contribution-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { inlineCopy } from "@/lib/inline-copy";
import { isLocale } from "@/lib/i18n";

export default async function ContributePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <SiteHeader locale={locale} />
      <main className="contribute-page">
        <Link className="contribute-back-link" href={`/${locale}`}>
          <ArrowLeft size={17} aria-hidden="true" />
          {inlineCopy(locale, "होम पर वापस जाएँ", "Back to home")}
        </Link>
        <ContributionForm locale={locale} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
