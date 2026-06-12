# Architecture

## 1. Modular Monolith

The system is a **single deployable monolith** organized **by feature module**,
not by technical layer. One codebase, one deploy, but with hard internal seams
so a module could later be extracted into a service without rewrites.

```
apps/server/src/modules/<feature>/
  ├─ <feature>.controller.ts   # HTTP boundary (req/res only)
  ├─ <feature>.service.ts      # business logic + invariants
  ├─ <feature>.repository.ts   # data access (the only Prisma consumer)
  ├─ <feature>.mapper.ts       # entity → DTO mapping
  └─ <feature>.routes.ts       # route table + validation middleware

apps/web/src/modules/<feature>/
  ├─ pages/        # route-level screens
  ├─ components/   # feature-scoped UI
  ├─ hooks/        # TanStack Query hooks
  ├─ services/     # typed API calls
  ├─ schemas/      # form schemas (Zod)
  └─ routes.tsx    # TanStack Router route definitions
```

### Why this shape?

- **High cohesion / low coupling** — everything about "meetings" lives in one
  folder. Cross-module imports are rare and explicit.
- **Parallelizable** — teams own modules end-to-end.
- **Extractable** — each backend module already has its own controller →
  service → repository chain, the natural boundary for a future microservice.

## 2. Backend: Clean Architecture + SOLID

The dependency direction is strictly inward:

```
Route → Controller → Service → Repository → Prisma
                       │
                       └── depends on @calendly/shared (schemas/DTOs)
```

- **Controller** — translates HTTP ↔ domain. No business rules.
- **Service** — owns invariants (unique slug, "already cancelled", double-book
  guard). Depends on a repository **abstraction**, injected via the constructor
  (Dependency Inversion), which makes it unit-testable with a fake repo.
- **Repository** — the single place that knows Prisma. Swapping the ORM touches
  only this layer.
- **Mapper** — converts Prisma rows (Dates, enums) into the wire DTOs defined in
  `@calendly/shared`, keeping persistence types from leaking to the client.

Cross-cutting concerns are middleware:

- `request-context` → correlation id on every request/response.
- `request-logger` → structured Winston access logs.
- `validate(schema, part)` → Zod validation factory for body/query/params.
- `error-handler` → normalizes `AppError`, Prisma errors (P2002 → 409,
  P2025 → 404), and unknowns into the standard `ApiError` envelope.

### API Response Standardization

Every endpoint returns `ApiResponse<T>`:

```ts
type ApiResponse<T> =
  | { success: true;  data: T;            meta: ApiMeta }
  | { success: false; error: ApiErrorBody; meta: ApiMeta };
```

The frontend's typed API layer (`lib/api-client.ts`) unwraps this envelope and
throws a normalized `ApiRequestError`, so call sites only ever see `T`.

## 3. Database Design

Tables: `users`, `event_types`, `availability`, `meetings` (Prisma models map to
these via `@@map`). Highlights:

- **Primary keys**: `cuid()` strings — collision-resistant, sortable-ish, safe
  to expose in URLs.
- **Foreign keys**: `event_types.user_id`, `availability.user_id`,
  `meetings.event_type_id`/`host_id`, all `onDelete: Cascade`.
- **Unique constraints**: `users.email`, `users.username`,
  `(event_types.user_id, slug)` so public links never collide per host.
- **Soft delete**: `deleted_at` on `users` and `event_types`; queries filter
  `deletedAt: null`, preserving FK integrity for historic meetings.
- **Audit timestamps**: `created_at` / `updated_at` everywhere.
- **Indexes** chosen for hot paths: `(host_id, start_time)`,
  `(host_id, status, start_time)`, `(event_type_id, start_time)`,
  `(user_id, is_active)`.

### Double-Booking Prevention (DB-enforced)

`meetings.booking_slot_key` is a **unique** column set to `"{hostId}:{startISO}"`
while a meeting is `confirmed`, and `NULL` on cancellation. Because MySQL allows
multiple `NULL`s in a unique index:

- Two concurrent bookings for the same host+time → the second hits the unique
  violation (Prisma `P2002`) → mapped to a `409 DOUBLE_BOOKING`.
- A cancelled slot frees up (`key → NULL`) and can be rebooked.

This pushes the correctness guarantee into the database rather than relying on
read-then-write application checks that race under load.

## 4. Frontend Architecture

- **Atomic-ish layering**: `components/ui/*` (ShadCN primitives) →
  `components/common/*` & `components/layout/*` (composites) → `modules/*`
  (feature screens).
- **Routing**: TanStack Router with **code-based** route definitions. Two
  pathless layout routes (`dashboard`, `public`) keep the authenticated shell
  and the public booking experience cleanly separated. Each module exports its
  own routes and they are composed in `app/router/index.tsx`.
- **Server state**: TanStack Query. A central `queryKeys` factory prevents key
  drift; retry policy skips 4xx. Mutations invalidate by key and surface toasts.
- **Client state**: Zustand (`ui-store` for theme + sidebar, persisted; a small
  store to carry the booking confirmation to the success screen).
- **Forms**: React Hook Form + Zod resolver, with ShadCN `Form` primitives.
- **Resilience**: a top-level `ErrorBoundary` plus per-layout `Suspense`
  fallbacks; skeletons, empty states, and error states for every data view.
- **Theming**: CSS variables (Calendly-blue palette) with light/dark support.

## 5. Shared Package as the Contract

`@calendly/shared` exports Zod schemas + inferred types + endpoint builders.
Defining a schema once gives us: server request validation, the server's
response types, the client's response types, **and** the client's form schemas —
eliminating contract drift between front and back.

## 6. Auth (deliberately stubbed)

There is no auth yet. `getCurrentHost()` resolves the single seeded host. It is
the **only** seam to replace with real session/JWT lookup to make the app
multi-tenant — controllers and services already take a `userId`.
