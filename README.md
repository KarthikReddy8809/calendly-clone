# Calendly Clone

A full-stack Calendly-style scheduling app built as a **modular monolith** in a pnpm workspace. Hosts manage event types, weekly availability, and meetings; invitees book time through a public scheduling page.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run Commands](#run-commands)
- [Frontend Routes](#frontend-routes)
- [API Reference](#api-reference)
- [Database](#database)
- [Deployment](#deployment)
- [Further Reading](#further-reading)

---

## Features

| Area               | Capabilities                                                                  |
| ------------------ | ----------------------------------------------------------------------------- |
| **Event types**    | Create, edit, soft-delete scheduling links with duration, color, and location |
| **Availability**   | Weekly hours editor, timezone picker, calendar view, auto-save                |
| **Meetings**       | Upcoming and past meetings feed with cancel support                           |
| **Public booking** | Date picker, slot selection, invitee form, confirmation screen                |

---

## Tech Stack

### Frontend (`apps/web`)

| Category               | Libraries                                      |
| ---------------------- | ---------------------------------------------- |
| **Core**               | React 18, TypeScript, Vite 6                   |
| **Routing**            | TanStack Router                                |
| **Server state**       | TanStack Query                                 |
| **Client state**       | Zustand                                        |
| **Forms & validation** | React Hook Form, Zod                           |
| **HTTP**               | Axios                                          |
| **Styling**            | Tailwind CSS, ShadCN-style Radix UI components |
| **Dates**              | Day.js (UTC + timezone plugins)                |
| **Icons**              | Lucide React                                   |

### Backend (`apps/server`)

| Category       | Libraries                    |
| -------------- | ---------------------------- |
| **Runtime**    | Node.js 20+, Express 4       |
| **Language**   | TypeScript                   |
| **ORM**        | Prisma 6                     |
| **Database**   | MySQL 8                      |
| **Validation** | Zod (via `@calendly/shared`) |
| **Logging**    | Winston                      |
| **Security**   | Helmet, CORS, compression    |

### Shared (`packages/shared`)

| Purpose            | Contents                                                         |
| ------------------ | ---------------------------------------------------------------- |
| **Contract layer** | Zod schemas, DTOs, domain types, API path constants              |
| **Used by**        | Server validation, API responses, client forms, typed API client |

### Tooling (root)

| Tool                    | Role                              |
| ----------------------- | --------------------------------- |
| **pnpm workspaces**     | Monorepo package management       |
| **ESLint 9**            | Flat-config linting               |
| **Prettier**            | Code formatting                   |
| **Husky + lint-staged** | Pre-commit hooks                  |
| **TypeScript 5.7**      | Strict typing across all packages |

---

## Architecture

The project follows a **modular monolith** pattern: one repo, one deploy per app, but code is organized by **feature module** with clear internal boundaries.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                      │
│  modules/event-types │ availability │ meetings │ bookings       │
│         TanStack Query + Axios ──────────────────────────────── │
└───────────────────────────────┬─────────────────────────────────┘
                                │  /api/v1  (Vite proxy in dev)
┌───────────────────────────────▼─────────────────────────────────┐
│                    Express API (apps/server)                     │
│  Route → Controller → Service → Repository → Prisma → MySQL   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│              @calendly/shared (schemas, DTOs, endpoints)         │
└─────────────────────────────────────────────────────────────────┘
```

### Backend module layout

Each feature lives under `apps/server/src/modules/<feature>/`:

```
<feature>/
├── <feature>.routes.ts       # Express router + validation middleware
├── <feature>.controller.ts   # HTTP boundary (req/res only)
├── <feature>.service.ts      # Business logic and invariants
├── <feature>.repository.ts   # Prisma data access (only layer that touches DB)
└── <feature>.mapper.ts       # Entity → API DTO mapping
```

### Frontend module layout

Each feature lives under `apps/web/src/modules/<feature>/`:

```
<feature>/
├── pages/          # Route-level screens
├── components/     # Feature-scoped UI
├── hooks/          # TanStack Query hooks
├── services/       # Typed API calls
├── schemas/        # Zod form schemas
└── routes.tsx      # TanStack Router route definitions
```

### Cross-cutting concerns

| Layer                            | Location                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------- |
| API client + error normalization | `apps/web/src/lib/api-client.ts`                                             |
| Request validation               | `apps/server/src/shared/middleware/validate.ts`                              |
| Error handling                   | `apps/server/src/shared/middleware/error-handler.ts`                         |
| Request logging                  | `apps/server/src/shared/middleware/request-logger.ts`                        |
| Auth (stub)                      | `apps/server/src/shared/context/current-host.ts` — resolves seeded demo host |

> For design rationale, DB constraints, and double-booking prevention, see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Repository Structure

```
calendly-clone/
├── apps/
│   ├── web/                          # React SPA
│   │   ├── src/
│   │   │   ├── app/                  # Router, providers, layouts
│   │   │   ├── components/           # Shared UI (ui/, common/, layout/)
│   │   │   ├── lib/                  # API client, config, dayjs, query keys
│   │   │   └── modules/              # Feature modules (see below)
│   │   ├── public/                   # Static assets, SPA redirects
│   │   └── vite.config.ts            # Dev proxy: /api → localhost:4000
│   │
│   └── server/                       # Express API
│       ├── src/
│       │   ├── modules/              # Feature modules (bookings, events, …)
│       │   ├── shared/               # Middleware, errors, HTTP helpers
│       │   ├── infra/                # Prisma client
│       │   └── config/               # Env validation, logger
│       ├── prisma/                   # Schema, migrations, seed
│       └── api/index.ts              # Vercel serverless entry point
│
├── packages/
│   └── shared/                       # Zod schemas, DTOs, API contracts
│
├── docs/
│   ├── ARCHITECTURE.md               # Deep-dive design doc
│   └── NEXT_STEPS.md
│
├── render.yaml                       # Render static-site deploy config
├── vercel.json                       # Vercel frontend deploy config
├── pnpm-workspace.yaml
├── eslint.config.js
└── tsconfig.base.json
```

### Backend modules

| Module         | Responsibility                                       |
| -------------- | ---------------------------------------------------- |
| `health`       | Liveness + database readiness                        |
| `event-types`  | CRUD for host event types                            |
| `availability` | Weekly recurring availability rules                  |
| `meetings`     | List and cancel booked meetings                      |
| `bookings`     | Public event lookup, slot generation, create booking |

### Frontend modules

| Module         | Route(s)                             | Responsibility            |
| -------------- | ------------------------------------ | ------------------------- |
| `event-types`  | `/`                                  | Manage scheduling links   |
| `availability` | `/availability`                      | Weekly hours and timezone |
| `meetings`     | `/meetings`                          | Upcoming / past meetings  |
| `bookings`     | `/book/:slug`, `/book/:slug/success` | Public booking flow       |

---

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 ([install](https://pnpm.io/installation))
- **MySQL** 8 (local or hosted, e.g. Railway)

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/KarthikReddy8809/calendly-clone.git
cd calendly-clone
pnpm install
```

### 2. Configure the server

```bash
cp apps/server/.env.example apps/server/.env
# Edit DATABASE_URL to point at your MySQL instance
```

### 3. Set up the database

```bash
pnpm --filter @calendly/server prisma:generate
pnpm --filter @calendly/server prisma:migrate
pnpm --filter @calendly/server db:seed
```

This creates tables and seeds a demo host (`demo@calendly.clone`) with sample event types and Mon–Fri 9–5 availability.

### 4. (Optional) Configure the frontend

For local development, **leave `VITE_API_BASE_URL` unset** — Vite proxies `/api` to the Express server automatically.

```bash
cp apps/web/.env.example apps/web/.env
# Leave VITE_API_BASE_URL commented out for local dev
```

### 5. Start development

```bash
# Run web + server in parallel
pnpm dev
```

| Service            | URL                                 |
| ------------------ | ----------------------------------- |
| **Web app**        | http://localhost:5173               |
| **API base**       | http://localhost:4000/api/v1        |
| **Health check**   | http://localhost:4000/api/v1/health |
| **Public booking** | http://localhost:5173/book/30min    |

Or run apps individually:

```bash
pnpm dev:web      # Frontend only (port 5173)
pnpm dev:server   # Backend only (port 4000)
```

---

## Environment Variables

### Server (`apps/server/.env`)

| Variable       | Required | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | MySQL connection string                                           |
| `PORT`         | No       | API port (default `4000`)                                         |
| `NODE_ENV`     | No       | `development` or `production`                                     |
| `LOG_LEVEL`    | No       | Winston log level (default `info`)                                |
| `CORS_ORIGINS` | No       | Comma-separated allowed origins (default `http://localhost:5173`) |

**Railway / serverless example** — append connection params for Vercel:

```
mysql://USER:PASS@HOST:PORT/railway?connection_limit=1&connect_timeout=15&pool_timeout=15&sslaccept=accept_invalid_certs&allowPublicKeyRetrieval=true
```

### Frontend (`apps/web/.env`)

| Variable            | Required | Description                                                           |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | No       | Remote API URL for production builds. Omit locally to use Vite proxy. |

**Production example:**

```
VITE_API_BASE_URL=https://your-api.vercel.app/api/v1
```

---

## Run Commands

### Root (monorepo)

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `pnpm install`      | Install all workspace dependencies |
| `pnpm dev`          | Run web + server in parallel       |
| `pnpm dev:web`      | Run frontend only                  |
| `pnpm dev:server`   | Run backend only                   |
| `pnpm build`        | Build shared → server → web        |
| `pnpm typecheck`    | Type-check all packages            |
| `pnpm lint`         | Lint all packages                  |
| `pnpm format`       | Format all files with Prettier     |
| `pnpm format:check` | Check formatting without writing   |

### Server (`@calendly/server`)

| Command                                          | Description                                 |
| ------------------------------------------------ | ------------------------------------------- |
| `pnpm --filter @calendly/server dev`             | Start API with hot reload (`tsx watch`)     |
| `pnpm --filter @calendly/server build`           | Compile TypeScript + generate Prisma client |
| `pnpm --filter @calendly/server start`           | Run compiled production server              |
| `pnpm --filter @calendly/server prisma:generate` | Generate Prisma client                      |
| `pnpm --filter @calendly/server prisma:migrate`  | Create / apply dev migrations               |
| `pnpm --filter @calendly/server prisma:deploy`   | Apply migrations in production              |
| `pnpm --filter @calendly/server prisma:studio`   | Open Prisma Studio GUI                      |
| `pnpm --filter @calendly/server db:seed`         | Seed demo host and event types              |

### Web (`@calendly/web`)

| Command                                 | Description                        |
| --------------------------------------- | ---------------------------------- |
| `pnpm --filter @calendly/web dev`       | Start Vite dev server              |
| `pnpm --filter @calendly/web build`     | Production build → `apps/web/dist` |
| `pnpm --filter @calendly/web preview`   | Preview production build locally   |
| `pnpm --filter @calendly/web typecheck` | Type-check frontend                |

### Shared (`@calendly/shared`)

| Command                                | Description                 |
| -------------------------------------- | --------------------------- |
| `pnpm --filter @calendly/shared build` | Compile shared package      |
| `pnpm --filter @calendly/shared dev`   | Watch mode for shared types |

---

## Frontend Routes

| Path                  | Layout    | Page                           |
| --------------------- | --------- | ------------------------------ |
| `/`                   | Dashboard | Event types (scheduling links) |
| `/availability`       | Dashboard | Weekly availability editor     |
| `/meetings`           | Dashboard | Upcoming and past meetings     |
| `/book/:slug`         | Public    | Booking — date, time, and form |
| `/book/:slug/success` | Public    | Booking confirmation           |

---

## API Reference

All endpoints are prefixed with `/api/v1` and return a standard envelope:

```json
{ "success": true, "data": { ... }, "meta": { "timestamp": "...", "requestId": "..." } }
```

| Method   | Path                                | Description                                     |
| -------- | ----------------------------------- | ----------------------------------------------- |
| `GET`    | `/health`                           | Liveness + DB readiness                         |
| `GET`    | `/events`                           | List event types                                |
| `POST`   | `/events`                           | Create event type                               |
| `PUT`    | `/events/:id`                       | Update event type                               |
| `DELETE` | `/events/:id`                       | Soft-delete event type                          |
| `GET`    | `/availability`                     | Get weekly availability                         |
| `PUT`    | `/availability`                     | Replace weekly availability                     |
| `GET`    | `/meetings?scope=`                  | List meetings (`upcoming`, `past`, `cancelled`) |
| `PUT`    | `/meetings/:id/cancel`              | Cancel a meeting                                |
| `GET`    | `/book/:slug`                       | Public event type + host profile                |
| `GET`    | `/book/:slug/slots?date=&timezone=` | Available slots for a date                      |
| `POST`   | `/book/:slug`                       | Create a booking                                |

Endpoint path constants live in `packages/shared/src/api/endpoints.ts`.

---

## Database

| Model              | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `User`             | Host accounts                                |
| `EventType`        | Bookable meeting templates with public slugs |
| `AvailabilityRule` | Weekly recurring availability windows        |
| `Meeting`          | Confirmed or cancelled bookings              |

Key design choices:

- **Soft deletes** on users and event types (`deleted_at`)
- **DB-enforced double-booking prevention** via unique `booking_slot_key`
- **CUID primary keys** across all tables

```bash
# Open visual DB browser
pnpm --filter @calendly/server prisma:studio
```

---

## Deployment

The monorepo deploys as **two separate services** (frontend + backend).

### Backend — Vercel (serverless Express)

- Config: `apps/server/vercel.json`
- Entry: `apps/server/api/index.ts`
- Set env vars: `DATABASE_URL`, `CORS_ORIGINS`
- Do **not** set `NODE_ENV=production` manually (breaks pnpm install on Vercel)

### Frontend — Vercel or Render (static SPA)

**Vercel** — config at root `vercel.json`:

- Build: `pnpm --filter @calendly/web build`
- Output: `apps/web/dist`
- Set `VITE_API_BASE_URL` to your deployed API URL

**Render** — config in `render.yaml`:

- Root directory must be the **repo root** (not `apps/web`)
- Uses pnpm with `SKIP_INSTALL_DEPS=true`
- Publish path: `apps/web/dist`
- Set `VITE_API_BASE_URL` in Render environment variables

### CORS

When frontend and backend are on different origins, set `CORS_ORIGINS` on the server:

```
https://your-frontend.vercel.app,https://your-frontend.onrender.com,http://localhost:5173
```

---

## Further Reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module design, API envelope, DB constraints, auth stub
- [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md) — planned improvements

---

## License

Private — not licensed for public distribution.
