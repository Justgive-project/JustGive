import { NextResponse } from "next/server";
import { createSupabasePrivilegedClient, getPrivilegedSupabaseConfig } from "@/lib/supabase/privileged";
import { currentContributor } from "@/lib/contributor-owner";
import { validContributorPhoto } from "@/lib/contributor-validation";
import { allowRequest } from "@/lib/rate-limit";
import { getRequestIp } from "@/lib/request-ip";

const bucket = "contributor-photos";

async function authorized(request: Request) {
  if (!(await allowRequest(`contributor-photo:${getRequestIp(request)}`, 12))) return { response: NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 }) };
  if (!getPrivilegedSupabaseConfig().configured) return { response: NextResponse.json({ error: "Contributor photos are unavailable because server configuration is missing." }, { status: 503 }) };
  const owner = await currentContributor();
  const db = createSupabasePrivilegedClient();
  if (!owner) return { response: NextResponse.json({ error: "No editable contributor profile was found." }, { status: 404 }) };
  if (!db) return { response: NextResponse.json({ error: "Contributor photos are unavailable." }, { status: 503 }) };
  return { owner, db };
}

export async function POST(request: Request) {
  const access = await authorized(request);
  if ("response" in access) return access.response;
  const form = await request.formData().catch(() => null);
  const file = form?.get("photo");
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Use a JPEG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validContributorPhoto(bytes, file.type, file.size)) return NextResponse.json({ error: "That file is not a valid image." }, { status: 400 });
  const { data: prior } = await access.db.from("contributor_profiles").select("photo_path").eq("id", access.owner.id).single();
  const path = `${crypto.randomUUID()}.${file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]}`;
  const { error: uploadError } = await access.db.storage.from(bucket).upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Photo upload failed. Your existing photo was kept." }, { status: 502 });
  const { error } = await access.db.from("contributor_profiles").update({ photo_path: path, updated_at: new Date().toISOString() }).eq("id", access.owner.id);
  if (error) {
    await access.db.storage.from(bucket).remove([path]);
    return NextResponse.json({ error: "Photo could not be saved. Your existing photo was kept." }, { status: 503 });
  }
  if (prior?.photo_path) await access.db.storage.from(bucket).remove([prior.photo_path]);
  return NextResponse.json({ photoUrl: `/api/contributors/photo/${encodeURIComponent(access.owner.id)}` });
}

export async function DELETE(request: Request) {
  const access = await authorized(request);
  if ("response" in access) return access.response;
  const { data: prior, error: readError } = await access.db.from("contributor_profiles").select("photo_path").eq("id", access.owner.id).single();
  if (readError) return NextResponse.json({ error: "Photo could not be removed." }, { status: 503 });
  const { error } = await access.db.from("contributor_profiles").update({ photo_path: null, updated_at: new Date().toISOString() }).eq("id", access.owner.id);
  if (error) return NextResponse.json({ error: "Photo could not be removed." }, { status: 503 });
  if (prior?.photo_path) await access.db.storage.from(bucket).remove([prior.photo_path]);
  return NextResponse.json({ photoUrl: null });
}
