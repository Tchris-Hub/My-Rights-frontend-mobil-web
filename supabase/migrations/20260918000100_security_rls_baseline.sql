-- My Rights — Task 03 authorization/RLS baseline
-- This migration intentionally fails if private tables required by the mobile
-- application are missing. A missing table is not treated as a secure state.
--
-- Service-role operations remain outside these policies and must stay server-side.

begin;

do $$
begin
  if to_regclass('public.users') is null then
    raise exception 'RLS baseline cannot continue: public.users is missing';
  end if;

  if to_regclass('public.chat_sessions') is null then
    raise exception 'RLS baseline cannot continue: public.chat_sessions is missing';
  end if;

  if to_regclass('public.chat_messages') is null then
    raise exception 'RLS baseline cannot continue: public.chat_messages is missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'chat_sessions'
      and column_name = 'user_id'
  ) then
    raise exception 'RLS baseline cannot continue: public.chat_sessions.user_id is missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'chat_messages'
      and column_name = 'session_id'
  ) then
    raise exception 'RLS baseline cannot continue: public.chat_messages.session_id is missing';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Account profile: a user can only read/change their own profile.
-- Inserts are normally performed by a trusted server-side signup trigger.
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
  on public.users
  for insert
  to authenticated
  with check (id = auth.uid());

-- No client DELETE policy is intentionally created for user profiles.

-- ---------------------------------------------------------------------------
-- Chat sessions: ownership is anchored to auth.uid(), never a client-chosen
-- owner. The mobile insert path may omit user_id only if the database supplies
-- it with a trusted DEFAULT/trigger such as auth.uid().
-- ---------------------------------------------------------------------------

alter table public.chat_sessions enable row level security;

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own"
  on public.chat_sessions
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own"
  on public.chat_sessions
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own"
  on public.chat_sessions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "chat_sessions_delete_own" on public.chat_sessions;
create policy "chat_sessions_delete_own"
  on public.chat_sessions
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Chat messages: ownership is inherited from the parent session. A client
-- cannot read/write another user's messages merely by guessing a message UUID.
-- ---------------------------------------------------------------------------

alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
  on public.chat_messages
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
  on public.chat_messages
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own"
  on public.chat_messages
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own"
  on public.chat_messages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.chat_sessions s
      where s.id = chat_messages.session_id
        and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Public reference data: readable to guests/authenticated users, but never
-- writable from the mobile client. Server/service-role jobs may still manage it.
-- These tables are only protected if they exist in the deployed schema.
-- ---------------------------------------------------------------------------

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'constitution_chapters',
    'constitution_sections',
    'legal_templates',
    'lawyers',
    'legal_aid_centers',
    'organizations'
  ] loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I enable row level security', table_name);

      execute format(
        'drop policy if exists %I on public.%I',
        table_name || '_public_read',
        table_name
      );

      execute format(
        'create policy %I on public.%I for select to anon, authenticated using (true)',
        table_name || '_public_read',
        table_name
      );
    end if;
  end loop;
end $$;

commit;
