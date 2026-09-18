# Task 01 — Architecture / Release-Path Integrity Status

Branch: `security-hardening-v1`
Latest implementation commit: `bbeed509bf0c7d2f94c2bcccbdccc48ea3fa6d51`

## Verified in source

- Canonical mobile Supabase client is `mobile/src/services/supabase.ts`.
- The client accepts only the public Supabase URL and publishable key environment variables.
- Legacy `mobile/src/services/supabaseClient.ts` is absent.
- Legacy `mobile/src/services/api.ts` is absent.
- `mobile/.env` is absent.
- `mobile/.env.example` exists and contains only public Supabase configuration placeholders.
- `mobile/app.config.ts` contains no Railway/API-host configuration.
- The unused `expo-web-browser` config plugin was removed because it was not declared in `mobile/package.json`; this avoids a release/config resolution mismatch.
- Auth, chat, document and legal services inspected on this branch use the canonical Supabase client.
- Release-path CI checks are scoped to executable app/config files so historical audit artifacts do not create false positives.
- CI includes a live Supabase Auth health check for project ref `prwcbruqvywakcvoknai`.
  - HTTP 540 is treated as an explicit paused-project failure.
  - Successful 2xx responses are accepted as project reachability evidence.
  - Other 4xx/5xx responses fail verification rather than being treated as healthy.

## Verification blocker

GitHub Actions is triggering the workflow but the hosted job is immediately failing before any steps execute. The run has no executable step records. This prevents us from claiming TypeScript, Expo Doctor, release-path, or Supabase health-check success.

Task 01 remains **OPEN** until the workflow executes successfully or equivalent execution evidence is obtained.

## Supabase status

The repository identifies the Supabase project ref as `prwcbruqvywakcvoknai`. The live project state is intentionally not inferred from the existence of the URL. The CI health probe is now the correct automated verification path: a 540 response is treated as paused, while a successful health response proves endpoint reachability.

## Gate rule

Do not advance to Task 02 until Task 01 has implementation evidence plus successful verification evidence.
