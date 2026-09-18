# Task 01 — Architecture / Release-Path Integrity Status

Branch: `security-hardening-v1`
Current verification commit: `e2eda02a473513916f99448b1634f46316b4b26e`

## Verified in source

- Canonical mobile Supabase client is `mobile/src/services/supabase.ts`.
- Legacy `mobile/src/services/supabaseClient.ts` is absent.
- Legacy `mobile/src/services/api.ts` is absent.
- `mobile/.env` is absent.
- `mobile/.env.example` exists and contains only public Supabase configuration placeholders.
- `mobile/app.config.ts` contains no Railway/API-host configuration.
- Auth, chat, document and legal services inspected on this branch import the canonical Supabase client.
- Release-path CI checks are scoped to executable app/config files so historical audit artifacts do not create false positives.
- CI now includes a live Supabase Auth health check for project ref `prwcbruqvywakcvoknai`.
  - HTTP 540 is treated as an explicit paused-project failure.
  - Successful 2xx responses are accepted as project reachability evidence.
  - Other 4xx/5xx responses fail verification rather than being treated as healthy.

## Verification blocker

The previous GitHub Actions run did not start its job steps because GitHub reported an account/payment problem. Therefore TypeScript, Expo Doctor, release-path checks and the Supabase health check have not yet executed on a hosted runner.

Task 01 remains **OPEN** until the workflow executes successfully or equivalent execution evidence is obtained.

## Supabase status

The repository identifies the Supabase project ref as `prwcbruqvywakcvoknai`. The live project state is intentionally not inferred from the existence of the URL. Supabase documents HTTP 540 as the paused-project response. The new CI health check is designed to record that distinction when GitHub Actions can execute.

## Gate rule

Do not advance to Task 02 until Task 01 has implementation evidence plus successful verification evidence.
