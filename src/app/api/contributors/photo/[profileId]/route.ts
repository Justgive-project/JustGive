import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";
import { currentContributor } from "@/lib/contributor-owner";

const profileIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, { params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  if (!profileIdPattern.test(profileId)) return new Response(null, { status: 404 });
  const db = createSupabasePrivilegedClient();
  if (!db) return new Response(null, { status: 503 });
  const { data: profile, error } = await db.from("contributor_profiles").select("photo_path,public_consent").eq("id", profileId).maybeSingle();
  if (error || !profile?.photo_path) return new Response(null, { status: 404 });
  if (!profile.public_consent) {
    const owner = await currentContributor();
    if (owner?.id !== profileId) return new Response(null, { status: 404 });
  }
  const { data, error: downloadError } = await db.storage.from("contributor-photos").download(profile.photo_path);
  if (downloadError || !data) return new Response(null, { status: 404 });
  const extension = profile.photo_path.split(".").pop()?.toLowerCase();
  const contentType = extension === "jpg" || extension === "jpeg" ? "image/jpeg" : extension === "png" ? "image/png" : extension === "webp" ? "image/webp" : null;
  if (!contentType) return new Response(null, { status: 404 });
  return new Response(data, { headers: { "Content-Type": contentType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
