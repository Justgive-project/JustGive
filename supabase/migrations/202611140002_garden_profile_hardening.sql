-- Garden profiles are owned by the high-entropy edit token whose SHA-256 hash is
-- stored here. The token itself is held only in an HttpOnly server cookie; all
-- profile reads and writes go through validated server routes.
create index if not exists contributor_profiles_public_consent_idx
  on public.contributor_profiles (public_consent, updated_at desc);
create index if not exists demo_leaderboard_contributions_profile_status_idx
  on public.demo_leaderboard_contributions (profile_id, status)
  where profile_id is not null;

create or replace function public.set_contributor_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists contributor_profiles_updated_at on public.contributor_profiles;
create trigger contributor_profiles_updated_at
  before update on public.contributor_profiles
  for each row execute function public.set_contributor_profile_updated_at();

-- Keep profile details and token hashes private to server-side code. The
-- service role is used only in server-only route modules after ownership checks.
alter table public.contributor_profiles enable row level security;
revoke all on public.contributor_profiles from anon, authenticated;
grant select, insert, update, delete on public.contributor_profiles to service_role;

alter table public.demo_leaderboard_contributions enable row level security;
revoke all on public.demo_leaderboard_contributions from anon, authenticated;
grant select, insert, update, delete on public.demo_leaderboard_contributions to service_role;

-- Do not expose the view directly to browser roles. Public data is projected by
-- the consent-filtered server endpoint, which excludes owner credentials.
revoke all on public.garden_demo_leaderboard from anon, authenticated;
grant select on public.garden_demo_leaderboard to service_role;

-- Storage objects remain private and are served only through the server route.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contributor-photos', 'contributor-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = false, file_size_limit = 5242880, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "contributor photos are server managed" on storage.objects;
create policy "contributor photos are server managed" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'contributor-photos' and false)
  with check (bucket_id = 'contributor-photos' and false);
