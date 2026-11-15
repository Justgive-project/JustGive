import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { createSupabasePrivilegedClient } from "@/lib/supabase/privileged";

export const contributorCookie = "jg_contributor_edit";
export const hashContributorCredential = (value: string) => createHash("sha256").update(value).digest("hex");

export async function currentContributor() {
  const credential = (await cookies()).get(contributorCookie)?.value;
  if (!credential || !/^[\da-f]{64}$/.test(credential)) return null;
  const db = createSupabasePrivilegedClient();
  if (!db) return null;
  const { data } = await db.from("contributor_profiles").select("id").eq("edit_token_hash", hashContributorCredential(credential)).maybeSingle();
  return data?.id ? { id: data.id, credential } : null;
}

export function newContributorCredential() { return randomBytes(32).toString("hex"); }
