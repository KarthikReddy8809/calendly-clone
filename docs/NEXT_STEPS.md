# Next Implementation Plan

The scaffold is intentionally thin. Recommended build order:

## Phase 1 — Database & Runtime
1. Stand up MySQL, set `DATABASE_URL`, run `prisma migrate dev` to create the
   initial migration, then `db:seed`.
2. Smoke-test the API via `/health` and the seeded `/book/30min` page.

## Phase 2 — Harden the Booking Engine
1. **Slot generation edge cases**: respect invitee vs host timezone fully,
   multiple intervals per day, buffers before/after, minimum scheduling notice,
   and date-range limits.
2. **Overlap on variable durations**: today the unique key guards identical
   start times; add an application-level overlap check (or an exclusion-style
   constraint) for overlapping ranges of differing lengths.
3. **Booking validation**: reject bookings that don't correspond to a generated
   slot (server-side recompute), not just any ISO timestamp.

## Phase 3 — Authentication & Multi-Tenancy
1. Add `auth` module (email/password or OAuth), sessions/JWT.
2. Replace `getCurrentHost()` with the authenticated principal.
3. Scope every query by the real `userId`; add per-user public URLs
   (`/book/:username/:slug`).

## Phase 4 — Notifications & Calendar
1. Email confirmations/cancellations (e.g. Resend/Nodemailer) + `.ics`.
2. Google/Microsoft calendar sync (push events, read busy times).

## Phase 5 — Quality & Ops
1. **Tests**: unit tests for services (inject fake repositories), integration
   tests for routes (supertest), component tests (Vitest + Testing Library),
   E2E (Playwright) for the booking flow.
2. **Observability**: request metrics, error tracking (Sentry), structured log
   shipping.
3. **CI**: typecheck + lint + test on PR; `prisma migrate deploy` on release.
4. **Frontend perf**: route-based code splitting (the bundle warning), prefetch
   on intent (already enabled), and image/avatar handling.

## Phase 6 — Product Polish
1. Pagination UI for meetings, reschedule flow, event-type duplication.
2. Booking page theming per host, custom questions, redirect-on-confirm.
3. Dashboard analytics (bookings over time, popular event types).
