import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/202611120005_pass_it_on.sql"), "utf8");
const adminMigration = readFileSync(resolve(process.cwd(), "supabase/migrations/202611130001_admin_message_permissions.sql"), "utf8");
const gardenMigration = readFileSync(resolve(process.cwd(), "supabase/migrations/202611140001_garden_profiles.sql"), "utf8");

describe("pass-it-on migration contract", () => {
  it("appends pass_it_on while preserving public appreciation counts", () => {
    expect(migration).toMatch(/select id, body, locale, created_at, appreciation_count, pass_it_on/i);
    expect(migration).toMatch(/grant select \(id, body, locale, created_at, appreciation_count, pass_it_on\) on public\.approved_messages to anon, authenticated/i);
  });

  it("grants the security-invoker view's public column at the base table", () => {
    expect(migration).toMatch(/grant select \(pass_it_on\) on public\.messages to anon, authenticated/i);
  });

  it("keeps moderation report counts behind admin-checked RPCs", () => {
    expect(adminMigration).toMatch(/revoke select \(report_count\) on public\.messages from anon, authenticated/i);
    expect(adminMigration).toMatch(/revoke update on public\.messages from authenticated/i);
    expect(adminMigration).toMatch(/admin_list_messages\(\)[\s\S]*?if auth\.uid\(\) is null or not public\.is_admin\(\)/i);
    expect(adminMigration).toMatch(/admin_moderate_message\(target_message_id uuid, requested_action text\)[\s\S]*?if auth\.uid\(\) is null or not public\.is_admin\(\)/i);
    expect(adminMigration).toMatch(/revoke all on function public\.admin_moderate_message\(uuid, text\) from public, anon/i);
  });
});

describe("Garden profile storage contract", () => {
  it("keeps profile and contribution ownership tables server-only with private photo storage", () => {
    expect(gardenMigration).toMatch(/alter table public\.contributor_profiles enable row level security/i);
    expect(gardenMigration).toMatch(/revoke all on public\.contributor_profiles from anon, authenticated/i);
    expect(gardenMigration).toMatch(/alter table public\.demo_leaderboard_contributions enable row level security/i);
    expect(gardenMigration).toMatch(/revoke all on public\.demo_leaderboard_contributions from anon, authenticated/i);
    expect(gardenMigration).toMatch(/values \('contributor-photos','contributor-photos',false,5242880,array\['image\/jpeg','image\/png','image\/webp'\]\)/i);
    expect(gardenMigration).toMatch(/create policy "contributor photos are server managed" on storage\.objects[\s\S]*?using \(bucket_id = 'contributor-photos' and false\)[\s\S]*?with check \(bucket_id = 'contributor-photos' and false\)/i);
  });
});
