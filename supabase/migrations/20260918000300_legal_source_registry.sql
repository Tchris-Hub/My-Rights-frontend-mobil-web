-- My Rights — Task 09 legal source registry
-- Curated source metadata is kept separate from AI-generated prose. A source
-- may be shown as authoritative only when its verification status is explicit.

begin;

create table if not exists public.legal_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  jurisdiction text not null,
  source_type text not null check (source_type in ('constitution','statute','regulation','case','official_guidance','other')),
  citation text,
  source_url text,
  issuing_authority text,
  effective_from date,
  effective_to date,
  verified_at timestamptz,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','superseded')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.legal_sources enable row level security;

drop policy if exists "legal_sources_public_read" on public.legal_sources;
create policy "legal_sources_public_read"
  on public.legal_sources
  for select to anon, authenticated
  using (verification_status = 'verified');

-- No client insert/update/delete policies. Curated legal-source maintenance is
-- an administrative/server-side operation only.

commit;
