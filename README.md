# Calendly Clone — Modular Monolith

A production-grade Calendly clone scaffolded as a **modular monolith** inside a
pnpm workspace. The foundation is fully wired end-to-end (typed API layer,
validation, error handling, query/state management, routing, UI system) so that
feature logic can be layered on without re-architecting.

> This is a **scaffold**. CRUD wiring, the booking flow, and slot generation are
> functional, but the product is intentionally minimal so future work has a
> clean, opinionated base to build on.

---

## Tech Stack

| Layer        | Choices                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------- |
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, ShadCN-style UI, TanStack Router + Query, Zustand, React Hook Form, Zod, Axios, Day.js, Lucide |
| **Backend**  | Node.js, Express, TypeScript, Prisma ORM, MySQL, Zod, Winston                                 |
| **Shared**   | `@calendly/shared` — Zod schemas, DTOs, domain types, API contracts, constants                |
| **Tooling**  | pnpm workspaces, ESLint (flat config), Prettier, Husky, lint-staged, path aliases             |

---

## Repository Layout

```
calendly/
├─ apps/
│  ├─ web/         # React SPA (dashboard + public booking)
│  └─ server/      # Express API + Prisma
├─ packages/
│  └─ shared/      # Cross-cutting types, Zod schemas, DTOs, API contracts
├─ eslint.config.js
├─ tsconfig.base.json
└─ pnpm-workspace.yaml
```

Both apps depend on `@calendly/shared`, which is the **single source of truth**
for the request/response contract. Schemas defined once are reused for server
validation, server↔client types, and client form validation.

---

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- A MySQL 8 instance

---

## Getting Started

```bash
# 1. Install dependencies (workspace-wide)
pnpm install

# 2. Configure environment
cp apps/server/.env.example apps/server/.env
# edit DATABASE_URL to point at your MySQL instance

# 3. Generate the Prisma client + apply the schema
pnpm --filter @calendly/server prisma:generate
pnpm --filter @calendly/server prisma:migrate     # creates the initial migration
pnpm --filter @calendly/server db:seed            # seeds a demo host + event types

# 4. Run everything (web + server in parallel)
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/v1
- Health: http://localhost:4000/api/v1/health

The Vite dev server proxies `/api` → the Express server, so no CORS config is
needed locally.

---

## Useful Scripts (root)

| Command            | Description                                  |
| ------------------ | -------------------------------------------- |
| `pnpm dev`         | Run web + server in parallel                 |
| `pnpm build`       | Build shared → server → web                  |
| `pnpm typecheck`   | Type-check every package                     |
| `pnpm lint`        | Lint every package                           |
| `pnpm format`      | Prettier write across the repo               |

---

## API Surface

All routes are namespaced under `/api/v1` and return the standard envelope
(`{ success, data | error, meta }`).

| Method | Path                       | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/health`                  | Liveness + DB readiness         |
| GET    | `/events`                  | List event types                |
| POST   | `/events`                  | Create event type               |
| PUT    | `/events/:id`              | Update event type               |
| DELETE | `/events/:id`              | Soft-delete event type          |
| GET    | `/availability`            | Get weekly availability         |
| PUT    | `/availability`            | Replace weekly availability     |
| GET    | `/meetings?scope=`         | List meetings (upcoming/past/cancelled) |
| PUT    | `/meetings/:id/cancel`     | Cancel a meeting                |
| GET    | `/book/:slug`              | Public event type + host        |
| GET    | `/book/:slug/slots`        | Available slots for a date      |
| POST   | `/book/:slug`              | Create a booking                |

See `docs/ARCHITECTURE.md` for the full design rationale.
