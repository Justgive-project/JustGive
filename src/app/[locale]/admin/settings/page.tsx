import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const db = await createSupabaseServerClient();
  if (!db) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Settings</h1><p>Configure Supabase to manage site settings.</p></main></>;
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const { data: admin } = await db.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return <><SiteHeader locale={locale}/><main className="admin-shell"><h1>Access denied</h1></main></>;
  return <><SiteHeader locale={locale}/><main className="admin-shell"><span className="eyebrow">Private workspace</span><h1>Site settings</h1>
    <p className="page-note">There are no editable public display settings. Payment settings require provider approval and a reviewed integration.</p>
    <h2>Private Gratitude Journal</h2><p>Personal notes are visible only to the signed-in admin who created them.</p><Link className="button-secondary" href={`/${locale}/admin/journal`}>Open journal</Link>
  </main></>;
}
