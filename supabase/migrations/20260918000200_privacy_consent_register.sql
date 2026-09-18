-- My Rights — Task 06 privacy consent register
-- Records policy versions accepted at account creation without storing
-- legal content or additional sensitive data.

begin;

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  source text not null default 'mobile_signup',
  unique (user_id, terms_version, privacy_version)
);

alter table public.privacy_consents enable row level security;

drop policy if exists "privacy_consents_select_own" on public.privacy_consents;
create policy "privacy_consents_select_own"
  on public.privacy_consents
  for select to authenticated
  using (user_id = auth.uid());

-- Clients cannot manufacture or modify historical consent records directly.
-- The signup trigger records the explicit versions supplied in signup metadata.

create or replace function public.record_signup_privacy_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted boolean;
  terms_version text;
  privacy_version text;
begin
  accepted := coalesce((new.raw_user_meta_data ->> 'accepted_terms')::boolean, false);
  terms_version := nullif(new.raw_user_meta_data ->> 'terms_version', '');
  privacy_version := nullif(new.raw_user_meta_data ->> 'privacy_version', '');

  if accepted and terms_version is not null and privacy_version is not null then
    insert into public.privacy_consents (user_id, terms_version, privacy_version)
    values (new.id, terms_version, privacy_version)
    on conflict (user_id, terms_version, privacy_version) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_record_signup_privacy_consent on auth.users;
create trigger trg_record_signup_privacy_consent
after insert on auth.users
for each row execute function public.record_signup_privacy_consent();

commit;
