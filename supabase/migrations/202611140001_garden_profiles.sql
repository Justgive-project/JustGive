create table public.contributor_profiles (
  id uuid primary key default gen_random_uuid(),
  edit_token_hash text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 60),
  photo_path text,
  biography text not null default '' check (char_length(biography) <= 500),
  public_consent boolean not null default false,
  consented_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((public_consent and consented_at is not null) or not public_consent)
);
alter table public.contributor_profiles enable row level security;
revoke all on public.contributor_profiles from anon, authenticated;
grant select, insert, update, delete on public.contributor_profiles to service_role;

create table public.demo_leaderboard_contributions (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique,
  profile_id uuid references public.contributor_profiles(id) on delete set null,
  amount_paise bigint not null check (amount_paise between 100 and 10000000),
  status text not null default 'created' check (status in ('created','successful','pending','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
alter table public.demo_leaderboard_contributions enable row level security;
revoke all on public.demo_leaderboard_contributions from anon, authenticated;
grant select, insert, update, delete on public.demo_leaderboard_contributions to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contributor-photos','contributor-photos',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false, file_size_limit=5242880, allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Profile photos are served by the server after consent/ownership checks. Browser roles
-- must not read, enumerate, upload, replace, or delete objects directly.
drop policy if exists "contributor photos are server managed" on storage.objects;
create policy "contributor photos are server managed" on storage.objects
  for all to anon, authenticated
  using (bucket_id = 'contributor-photos' and false)
  with check (bucket_id = 'contributor-photos' and false);

create or replace view public.garden_demo_leaderboard with (security_invoker = true) as
  select p.id, p.display_name, p.photo_path, p.biography, sum(d.amount_paise)::bigint as amount_paise
  from public.demo_leaderboard_contributions d
  join public.contributor_profiles p on p.id=d.profile_id
  where d.status='successful' and p.public_consent=true
  group by p.id, p.display_name, p.photo_path, p.biography;
revoke all on public.garden_demo_leaderboard from anon, authenticated;
grant select on public.garden_demo_leaderboard to service_role;

