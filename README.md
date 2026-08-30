<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis_Cloud-FF4438?style=flat&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod_v4-3068B7?style=flat&logo=zod&logoColor=white" />
  <img src="https://img.shields.io/badge/Pino-7B42BC?style=flat&logo=pino&logoColor=white" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white" />
  <img src="https://img.shields.io/badge/Helmet-6C2BD9?style=flat&logo=helmet&logoColor=white" />
</p>

<h1 align="center">Social API</h1>

<p align="center">
  A production-ready RESTful back-end for a social media platform — <strong>TypeScript</strong>, <strong>Express 5</strong>, three managed cloud databases, and <strong>Supabase Auth</strong> handling the entire auth lifecycle.
</p>

<p align="center">
  <a href="https://moamen-tamer.github.io/social-api/TESTING.html">
    Testing Manual - Click Here
  </a>
</p>

<p align="center">
  <sub><strong>v3.0.0</strong> — Supabase Auth, Supabase migrations with RLS, Express 5, Helmet, pino-http, Zod v4</sub>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Migrations & Seeds](#running-migrations--seeds)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Postman Collection](#postman-collection)

---

## Overview

Social API is a fully layered REST back-end that powers the core features of a social media application — user accounts, follow relationships, a personalised feed, posts, comments, likes, and notifications. It follows a clean **Repository → Service → Controller** pattern, keeping business logic decoupled from HTTP handling and data access.

I didn't set out to build anything flashy. This project exists because I wanted a real place to practice things that most tutorials only scratch the surface of: polyglot persistence (using the right database for the right job), clean layered architecture that actually holds up as complexity grows, and offloading auth to a proper provider instead of rolling my own JWT logic.

### How it evolved

- **v1.0.0** — I started with raw `pg` for Postgres and let Mongoose implicitly create whatever collections and indexes it needed on connect. Migration files were hand-written SQL run through a custom `script.ts`. Auth was custom JWT with `jsonwebtoken`. It worked, but nothing was reviewable or repeatable.

- **v2.0.0** — Moved the Postgres layer onto **Knex**. Schema migrations, seeds, and query building all went through a proper schema builder instead of hand-rolled SQL. Every schema change became a tracked, reviewable migration file.

- **v2.1.0** — Applied the same discipline to MongoDB. Turned off Mongoose's `autoIndex`/`autoCreate` and let **migrate-mongo** own every collection and index. Cleaned up connect/disconnect handling so each data store logs its own lifecycle state.

- **v3.0.0** — The big one. Replaced Knex and raw Postgres with **Supabase** for the relational layer — queries now go through the Supabase client, and the schema lives in SQL migration files managed by the Supabase CLI with **Row Level Security** enabled on every table. Auth went from custom JWT signing to **Supabase Auth** (signUp, signInWithPassword, session refresh, admin signOut — all handled by Supabase). Upgraded to **Express 5**, added **Helmet** for security headers, replaced Morgan with **pino-http** for consistent structured logging, moved to **Zod v4**, and switched from `ts-jest` to **@swc/jest** for faster test runs.

---

## Architecture

```
             HTTP Request
                  │
                  ▼
                Router                (src/routes/)
                  │      
                  ▼      
              Middleware              (authentication · authorization · rate-limiter · Pino request logger · Zod validate())
                  │      
                  ▼      
              Controller              (src/controllers/)
                  │      
                  ▼      
               Service                (src/services/)    <<--- business logic lives here
                  │
                  ▼
      ┌------Repository-------┐       (src/repositories/)
      │           │           │
      ▼           ▼           ▼
   Supabase    MongoDB      Redis
  ( Postgres    Atlas       Cloud
   + Auth )
```

Each layer has one job. Controllers parse the request and call a service. Services contain the business logic and delegate data access to repositories. Repositories talk to the databases — that's it. Nothing leaks across boundaries.

- **Supabase (PostgreSQL + Auth)** — users, follows, likes, notifications, and the entire auth lifecycle. Relational data lives in Postgres tables with UUID primary keys, composite keys, check constraints, foreign keys, and RLS policies — all defined in versioned SQL migration files. Auth (register, login, refresh, logout, session validation, user deletion) is handled entirely by Supabase Auth — the API just passes cookies back and forth.
- **MongoDB Atlas** — posts and comments. Document-shaped data that fits naturally in a document store. Collections and indexes are explicitly versioned through **migrate-mongo** — Mongoose's `autoIndex` and `autoCreate` are both off.
- **Redis Cloud** — caching layer for users, posts, comments, feeds, and notifications, each with its own key namespace and TTL. Also handles rate-limit counters via `express-rate-limit`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript (strict mode) |
| Framework | Express 5 |
| Security | Helmet |
| Relational DB + Auth | Supabase (PostgreSQL + Auth) — SQL migrations with RLS |
| Document DB | MongoDB Atlas (Mongoose ODM + migrate-mongo for collections/indexes) |
| Cache | Redis Cloud (`ioredis`) |
| Validation | Zod v4 (request bodies, env vars) + express-validator |
| Logging | Pino + pino-http (structured HTTP logging) |
| Testing | Jest + @swc/jest |
| Build | TypeScript compiler (`tsc`) + tsx (dev) |

---

## Features

- **Authentication** — fully delegated to **Supabase Auth**. Register creates an Auth user (which triggers a Postgres function that auto-inserts a public profile row), login returns Supabase session tokens as HTTP-only cookies, and token refresh is a single call to `supabase.auth.refreshSession()`. Logout revokes the session server-side via `supabase.auth.admin.signOut()`. No custom JWT signing, no token secrets in `.env` — Supabase handles all of it.
- **Users** — public profiles (fetched from Supabase), bio updates, and account deletion (cascades through Auth → public profile → MongoDB posts/comments → Supabase likes/follows/notifications).
- **Follow system** — follow / unfollow with follower lists, stored in Supabase with a composite primary key (`follower_id`, `following_id`) and a check constraint that prevents self-follows at the database level. An `onConflict: "follower_id, following_id"` upsert keeps things idempotent.
- **Feed** — a personalised feed built from followed users' posts, cached in Redis with a `feed:{userId}` key. Cache is invalidated whenever a followed user creates, edits, or deletes a post.
- **Posts** — full CRUD stored in MongoDB Atlas. Supports content, optional media URLs, and tags. Posts are enriched at read time with author profiles (from Supabase), comments (from MongoDB), and like counts (from Supabase).
- **Likes** — like / unlike posts. Stored in Supabase with a composite primary key (`user_id`, `post_id`). Duplicate likes hit the unique constraint and return `409 Conflict`. Post deletion cascades and removes all associated likes.
- **Comments** — create, read, and delete on posts (MongoDB). Deletion is scoped to the comment author.
- **Notifications** — auto-generated on follow and like events, stored in Supabase with a `JSONB` payload column. Supports mark-all-as-read and cached retrieval via Redis.
- **Caching** — Redis caching with individual TTLs for users, posts, comments, feeds, and notifications. Every write operation invalidates the relevant cache keys so stale data never serves.
- **Rate limiting** — global rate limit (1000 req/hour) plus a stricter auth rate limit (20 req/5 min) on register and login routes. Both via `express-rate-limit`.
- **Security headers** — **Helmet** sets sensible HTTP security headers out of the box.
- **Error handling** — custom `HttpError` class, centralised error middleware that handles `HttpError`, malformed JSON, Mongoose `CastError`, and unknown errors differently. Stack traces never leak in production.
- **Structured logging** — **Pino** for application logging with `pino-pretty` for readable dev output. **pino-http** for HTTP request/response logging with custom log levels based on status codes and human-readable success/error messages.
- **Database migrations** — two explicit migration systems. Supabase: raw SQL files managed by the Supabase CLI, including RLS policies, triggers, and functions. MongoDB: JS files managed by **migrate-mongo**. No implicit schema sync anywhere.
- **Seed data** — a comprehensive seed script (`npm run seed`) that creates 30 users via `supabase.auth.admin.createUser`, upserts their profiles, seeds follows/likes/notifications in Supabase and posts/comments in MongoDB, and cleans up previous seed data first. Fully idempotent — run it as many times as you want.
- **Environment validation** — all env vars are validated at startup with **Zod v4**. A missing `SUPABASE_URL` or malformed `MONGO_ATLAS_URI` fails fast with a clear message before the server attempts to connect to anything.

---

## Project Structure

```
social-api/
├── supabase/
│   └── migrations/          # Supabase SQL migrations — schema, RLS, triggers
├── migrations/
│   └── mongo/               # migrate-mongo migrations (JS) — MongoDB collections & indexes
├── seeds/                   # Seed script (Supabase Auth users + Mongo posts + Redis cleanup)
├── migrate-mongo-config.js  # migrate-mongo configuration
├── src/
│   ├── config/              # Cookie options, env validation (Zod v4), logger (Pino)
│   ├── connections/         # Connection factories (supabase, mongo, redis)
│   ├── controllers/         # Route handlers — parse req, call service, send res
│   ├── errors/              # Custom HttpError class
│   ├── middleware/          # Auth (Supabase), authz, error, limiter, logger (pino-http), notFound, validate (Zod)
│   ├── models/              # Mongoose schemas (Post, Comment)
│   ├── repositories/        # Data-access layer — Supabase queries, Mongo queries, Redis caching
│   ├── routes/              # Express 5 routers
│   ├── server/              # App factory, bootstrap, server entry point
│   ├── services/            # Business logic
│   ├── types/               # Shared TypeScript types and Express augmentation
│   └── utils/               # Redis key builders
├── tests/
│   ├── controllers.test.ts
│   ├── services.test.ts
│   └── utils-and-middleware.test.ts
├── TESTING.html             # Interactive endpoint checklist (open in browser)
├── .env.example
├── jest.config.cjs
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A **Supabase** project (free tier works — you'll need the project URL, anon key, and service role key)
- A **MongoDB Atlas** cluster (free tier is fine)
- A **Redis Cloud** instance (or Redis running locally)

### Install

```bash
git clone https://github.com/Moamen-Tamer/social-api.git
cd social-api
npm install
```

### Configure

```bash
cp .env.example .env
# Fill in your Supabase URL + keys, MongoDB Atlas URI, and Redis Cloud URL
```

### Push schema to Supabase

```bash
npx supabase db push
```

This applies all SQL migrations to your Supabase project — tables, RLS policies, the `on_auth_user_created` trigger, everything.

### Run MongoDB migrations

```bash
npm run migrate:mongodb:up
```

### Seed

```bash
npm run seed
```

Creates 30 test users, follows between them, posts with comments, likes, and notifications. All seed accounts use password: `password`.

### Build & Run

```bash
# Development (tsx watch)
npm run dev

# Production build
npm run build
npm start
```

On startup, the app connects to all three data stores in sequence (MongoDB Atlas -> Redis Cloud -> Supabase), logs each connection through Pino, and only starts listening once every store is reachable. If anything fails, it shuts down everything cleanly and tells you exactly what went wrong.

---

## Environment Variables

All variables are validated at startup with **Zod v4** — if anything is missing or malformed, you get a clear error message before the server attempts to connect to anything.

Copy `.env.example` and fill in each value:

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `SERVER_PORT` | Server port (default `3000`) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (used for user-facing auth operations) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (used for admin operations) |
| `MONGO_ATLAS_URI` | MongoDB Atlas connection URI |
| `REDIS_CLOUD_URL` | Redis Cloud connection URL |

Notice what's *not* here: no JWT secrets, no token expiry config. Supabase Auth handles all of that — the API just receives tokens and passes them back as cookies.

---

## Running Migrations

### Supabase (PostgreSQL schema + RLS)

```bash
# Apply all pending migrations to your Supabase project
npx supabase db push

# Create a new migration file
npm run supabase:migration:new <migration_name>

# Reset the local Supabase database (local dev only)
npm run supabase:reset
```

Migrations are plain SQL files in `supabase/migrations/`. They define tables, indexes, constraints, Row Level Security policies, triggers, and functions. The `on_auth_user_created` trigger, for example, automatically inserts a row into `public.users` whenever Supabase Auth creates a new user — so registration only needs one call.

### MongoDB (migrate-mongo)

```bash
# Run all pending migrations (creates collections & indexes)
npm run migrate:mongodb:up

# Roll back the last applied migration
npm run migrate:mongodb:down

# Check migration status
npm run migrate:mongodb:status

# Create a new migration file
npm run migrate:mongodb:create -- migration_name
```

Mongoose connects with `autoIndex: false` and `autoCreate: false`, so collections and indexes only exist once these migrations have been run.

---

## API Reference

All routes are prefixed with `/api`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create a new account (rate-limited: 20 req/5 min) |
| `POST` | `/auth/login` | — | Login and receive HTTP-only cookies (rate-limited: 20 req/5 min) |
| `POST` | `/auth/refresh` | Cookie | Silent access-token refresh via Supabase |
| `POST` | `/auth/logout` | Cookie | Revoke session server-side and clear cookies |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | — | Get public profile |
| `PUT` | `/users/:id` | Own account | Update bio |
| `DELETE` | `/users/:id` | Own account | Delete account (cascades across all stores) |
| `POST` | `/users/:id/follow` | Authenticated | Follow a user |
| `DELETE` | `/users/:id/follow` | Authenticated | Unfollow a user |
| `GET` | `/users/:id/followers` | Authenticated | List followers |

### Feed

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/feed/` | Authenticated | Get personalised feed (Redis-cached) |

### Posts

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/posts/` | Authenticated | Create a post |
| `GET` | `/posts/:id` | Authenticated | Get post with comments and likes |
| `PUT` | `/posts/:id` | Own post | Edit post content |
| `DELETE` | `/posts/:id` | Own post | Delete post (cascades comments + likes) |
| `POST` | `/posts/:id/like` | Authenticated | Like a post |
| `DELETE` | `/posts/:id/like` | Authenticated | Unlike a post |

### Comments

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/comments/:postId` | Authenticated | Add a comment |
| `GET` | `/comments/:postId` | Authenticated | Get all comments on a post |
| `DELETE` | `/comments/:postId/:commentId` | Own comment | Delete a comment |

### Notifications

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications/` | Authenticated | Fetch all notifications |
| `PATCH` | `/notifications/read` | Authenticated | Mark all as read |

---

## Testing

```bash
# Run the full test suite
npm test

# With coverage report (output to coverage/)
npm run test:coverage

# TypeScript type-check only
npm run check
```

Tests cover controllers, services, and utilities / middleware using Jest with **@swc/jest** for faster compilation. The HTML coverage report is generated at `coverage/lcov-report/index.html`.

---

## Postman Collection

A ready-to-import Postman collection is included in the repo:

```
social-api_postman_collection.json
```

**Quick setup:**

1. Import the file into Postman (File -> Import).
2. Create an environment with a variable `baseUrl` set to `http://localhost:3000/api`.
3. Run **login - ahmed** first (email: `ahmedmohamed@gmail.com`, password: `password`) — the HTTP-only cookies are saved automatically by Postman Desktop.
4. After creating a post, copy its `_id` into a `postId` variable.

For a full interactive walkthrough of every endpoint (with a visual checklist), open **[TESTING.html](https://moamen-tamer.github.io/social-api/TESTING.html)** in your browser.

---

> Built as a backend engineering project to explore polyglot persistence, Supabase as a Postgres + Auth provider, and production-grade patterns in TypeScript. If you're working on something similar or have feedback, I'd love to hear from you.