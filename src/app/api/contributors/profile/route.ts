import { NextResponse } from "next/server";
import { createSupabasePrivilegedClient, getPrivilegedSupabaseConfig } from "@/lib/supabase/privileged";
import { contributorCookie, currentContributor, hashContributorCredential, newContributorCredential } from "@/lib/contributor-owner";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";
import { contributorProfileSchema } from "@/lib/contributor-validation";

function responsePhoto(profileId: string, path: string | null) {
  return path ? `/api/contributors/photo/${encodeURIComponent(profileId)}` : null;
}
function configurationError() {
  const { missing } = getPrivilegedSupabaseConfig();
  return `Contributor profiles are unavailable because server configuration is missing: ${missing.join(", ")}.`;
}
function setupError(error: { code?: string; message?: string } | null) {
  if (error?.code === "42P01" || error?.code === "PGRST205" || /contributor_profiles|garden_demo_leaderboard|does not exist/i.test(error?.message ?? "")) {
    return "Contributor profile database setup is incomplete. Apply the Garden profile migration and try again.";
  }
  if (/permission|not allowed|row-level security/i.test(error?.message ?? "")) return "The profile database denied this operation. Check the applied profile migration and server permissions.";
  return "The profile could not be saved. Check the Garden profile database setup and try again.";
}
export async function GET() {
  const config = getPrivilegedSupabaseConfig();
  if (!config.configured) return NextResponse.json({ profile: null, error: configurationError() }, { status: 503 });
  const owner = await currentContributor();
  if (!owner) return NextResponse.json({ profile: null });
  const db = createSupabasePrivilegedClient();
  if (!db) return NextResponse.json({ profile: null, error: configurationError() }, { status: 503 });
  const { data, error } = await db.from("contributor_profiles").select("display_name,biography,public_consent,photo_path,created_at,updated_at").eq("id", owner.id).maybeSingle();
  if (error) return NextResponse.json({ profile: null, error: setupError(error) }, { status: 503 });
  if (!data) return NextResponse.json({ profile: null });
  return NextResponse.json({ profile: { displayName: data.display_name, biography: data.biography, consent: data.public_consent, photoUrl: responsePhoto(owner.id, data.photo_path), createdAt: data.created_at, updatedAt: data.updated_at } });
}

export async function POST(request: Request) {
  if (!(await allowRequest(`contributor-profile:${getRequestIp(request)}`, 12))) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  const config = getPrivilegedSupabaseConfig();
  if (!config.configured) return NextResponse.json({ error: configurationError() }, { status: 503 });
  const db = createSupabasePrivilegedClient();
  if (!db) return NextResponse.json({ error: configurationError() }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const parsed = contributorProfileSchema.safeParse({ displayName: form?.get("displayName"), biography: form?.get("biography") ?? "", consent: form?.get("consent") === "true" });
  if (!parsed.success) return NextResponse.json({ error: "Add a display name (up to 60 characters) and a short biography." }, { status: 400 });
  const owner = await currentContributor();
  const credential = owner?.credential ?? newContributorCredential();
  const profileId = owner?.id;
  const record = { edit_token_hash: hashContributorCredential(credential), display_name: parsed.data.displayName, biography: parsed.data.biography, public_consent: parsed.data.consent, consented_at: parsed.data.consent ? new Date().toISOString() : null };
  const query = profileId
    ? db.from("contributor_profiles").update({ ...record, updated_at: new Date().toISOString() }).eq("id", profileId).select("id,photo_path").single()
    : db.from("contributor_profiles").insert(record).select("id,photo_path").single();
  const { data, error } = await query;
  if (error || !data) {
    return NextResponse.json({ error: setupError(error) }, { status: 503 });
  }
  const response = NextResponse.json({ profile: { displayName: parsed.data.displayName, biography: parsed.data.biography, consent: parsed.data.consent, photoUrl: responsePhoto(data.id, data.photo_path) } });
  response.cookies.set(contributorCookie, credential, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export async function PATCH(request: Request) {
  if (!(await allowRequest(`contributor-edit:${getRequestIp(request)}`, 20))) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  const config = getPrivilegedSupabaseConfig();
  if (!config.configured) return NextResponse.json({ error: configurationError() }, { status: 503 });
  const owner = await currentContributor();
  if (!owner) return NextResponse.json({ error: "No editable contributor profile was found." }, { status: 404 });
  const db = createSupabasePrivilegedClient();
  if (!db) return NextResponse.json({ error: configurationError() }, { status: 503 });
  const credential = newContributorCredential();
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Invalid profile update." }, { status: 400 });
  const consent = form.get("consent") === "true";
  const parsed = contributorProfileSchema.safeParse({ displayName: form.get("displayName"), biography: form.get("biography") ?? "", consent });
  if (!parsed.success) return NextResponse.json({ error: "Add a display name (up to 60 characters) and a short biography." }, { status: 400 });
  const update = { edit_token_hash: hashContributorCredential(credential), display_name: parsed.data.displayName, biography: parsed.data.biography, public_consent: consent, consented_at: consent ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
  const { error } = await db.from("contributor_profiles").update(update).eq("id", owner.id);
  if (error) return NextResponse.json({ error: setupError(error) }, { status: 503 });
  const { data: current } = await db.from("contributor_profiles").select("photo_path").eq("id", owner.id).single();
  const response = NextResponse.json({ ok: true, consent, photoUrl: responsePhoto(owner.id, current?.photo_path ?? null) });
  response.cookies.set(contributorCookie, credential, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
