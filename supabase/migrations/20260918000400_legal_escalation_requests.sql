create extension if not exists pgcrypto;

create table if not exists public.legal_escalation_requests (
    id uuid primary key default gen_random_uuid(),
    reference_number text not null unique,
    user_id uuid not null references auth.users(id) on delete cascade,
    conversation_id uuid references public.chat_sessions(id) on delete set null,
    reason text not null,
    urgency text not null default 'medium' check (urgency in ('low', 'medium', 'high', 'critical')),
    status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'closed')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint legal_escalation_reason_length check (char_length(trim(reason)) between 1 and 4000)
);

create index if not exists legal_escalation_requests_user_idx
    on public.legal_escalation_requests(user_id, created_at desc);

create index if not exists legal_escalation_requests_status_idx
    on public.legal_escalation_requests(status, created_at);

alter table public.legal_escalation_requests enable row level security;

drop policy if exists "Users can view own escalation requests" on public.legal_escalation_requests;
create policy "Users can view own escalation requests"
on public.legal_escalation_requests
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create own escalation requests" on public.legal_escalation_requests;
create policy "Users can create own escalation requests"
on public.legal_escalation_requests
for insert
to authenticated
with check (
    user_id = auth.uid()
    and (
        conversation_id is null
        or exists (
            select 1
            from public.chat_sessions s
            where s.id = conversation_id
              and s.user_id = auth.uid()
        )
    )
);

drop policy if exists "Users cannot update escalation requests" on public.legal_escalation_requests;
drop policy if exists "Users cannot delete escalation requests" on public.legal_escalation_requests;

create or replace function public.set_legal_escalation_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists legal_escalation_updated_at on public.legal_escalation_requests;
create trigger legal_escalation_updated_at
before update on public.legal_escalation_requests
for each row execute function public.set_legal_escalation_updated_at();

revoke all on public.legal_escalation_requests from anon;
grant select, insert on public.legal_escalation_requests to authenticated;
