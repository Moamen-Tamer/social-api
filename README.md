<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-FF4438?style=flat&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white" />
</p>

<h1 align="center">Social API</h1>

<p align="center">
  A production-ready RESTful back-end for a social media platform, built with <strong>TypeScript</strong>, <strong>Express</strong>, and a polyglot persistence layer — PostgreSQL for relational data, MongoDB for posts and comments, and Redis for caching and rate-limiting.
</p>

<p align="center">
  <a href="https://moamen-tamer.github.io/social-api/">
    Live Demo
  </a>
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

Social API is a fully layered REST back-end that powers the core features of a social media application — user accounts, follow relationships, a personalised feed, posts, comments, likes, and notifications. The architecture follows a clean **Repository → Service → Controller** pattern, keeping business logic decoupled from HTTP handling and data access.

---

## Architecture

```
     HTTP Request
          │
          ▼
        Router          (src/routes/)
          │
          ▼
      Middleware        (authentication · authorization · rate-limiter · logger)
          │
          ▼ 
      Controller        (src/controllers/)
          │
          ▼
       Service          (src/services/)    ←── business logic lives here
          │
          ▼
      Repository        (src/repositories/)
      │        │
      ▼        ▼
PostgreSQL  MongoDB / Redis
```

- **PostgreSQL** — users, follows, likes, notifications (relational, strongly typed)
- **MongoDB** — posts, comments (document model, flexible schema via Mongoose)
- **Redis** — feed caching, refresh-token store, rate-limit counters

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript (strict mode) |
| Framework | Express.js |
| Relational DB | PostgreSQL (`pg`) |
| Document DB | MongoDB (Mongoose) |
| Cache / Queue | Redis (`ioredis`) |
| Auth | JWT (access + refresh cookies, HTTP-only) |
| Testing | Jest + `ts-jest` |
| Linting & Build | TypeScript compiler (`tsc`) |

---

## Features

- **Authentication** — register, login, logout, and silent token refresh using a dual-token strategy (short-lived access token + long-lived refresh token, both as HTTP-only cookies)
- **Users** — public profiles, bio updates, account deletion
- **Follow system** — follow / unfollow, follower lists, stored in PostgreSQL
- **Feed** — personalised feed built from followed users' posts; Redis-cached for performance
- **Posts** — full CRUD for post content, stored in MongoDB
- **Likes** — like / unlike posts; duplicate likes return `409 Conflict`
- **Comments** — create, read, and delete comments on posts (MongoDB)
- **Notifications** — auto-generated on follow and like events; mark-all-as-read and bulk retrieval
- **Rate limiting** — per-IP request throttling via `express-rate-limit` backed by Redis
- **Error handling** — custom `HttpError` class, centralised error middleware, and a `notFound` catch-all
- **Request logging** — Morgan HTTP logger
- **Database migrations** — numbered SQL migration files run via a custom `scripts/migrate.ts` script
- **Seed data** — pre-built seed script for local development

---

## Project Structure

```
social-api/
├── migrations/              # Numbered SQL migration files (PostgreSQL)
├── seeds/                   # Development seed data
├── scripts/                 # Utility scripts (migrate.ts)
├── src/
│   ├── config/              # Cookie options, environment variable validation
│   ├── connections/         # DB connection factories (postgres, mongo, redis)
│   ├── controllers/         # Route handlers — parse req, call service, send res
│   ├── errors/              # Custom HttpError class
│   ├── middleware/          # Auth, authz, error, limiter, logger, notFound
│   ├── models/              # Mongoose models (Post, Comment)
│   ├── repositories/        # Data-access layer — all raw DB queries live here
│   ├── routes/              # Express routers
│   ├── server/              # App factory, bootstrap, server entry point
│   ├── services/            # Business logic
│   ├── types/               # Shared TypeScript types and Express augmentation
│   └── utils/               # JWT helpers, Redis helpers
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

- Node.js ≥ 18
- PostgreSQL running locally (or via Docker)
- MongoDB running locally (or via Atlas)
- Redis running locally (WSL on Windows is fine)

### Install

```bash
git clone https://github.com/Moamen-Tamer/social-api.git
cd social-api
npm install
```

### Configure

```bash
cp .env.example .env
# Fill in the values — see Environment Variables below
```

### Build & Run

```bash
# Development (ts-node)
npm run dev

# Production build
npm run build
npm start
```

---

## Environment Variables

Copy `.env.example` and fill in each value:

| Variable | Description |
|---|---|
| `PORT` | Server port (default `3000`) |
| `POSTGRES_URL` | PostgreSQL connection string |
| `MONGO_URL` | MongoDB connection URI |
| `REDIS_URL` | Redis connection URL |
| `ACCESS_TOKEN_SECRET` | JWT secret for access tokens |
| `REFRESH_TOKEN_SECRET` | JWT secret for refresh tokens |
| `NODE_ENV` | `development` or `production` |

---

## Running Migrations & Seeds

```bash
# Run all pending SQL migrations against PostgreSQL
npx ts-node scripts/migrate.ts

# Seed the database with sample users and posts
npx ts-node seeds/seed.ts
```

The seed script creates two test accounts:

| Username | Email | Password |
|---|---|---|
| `ahmedmohamed` | ahmedmohamed@gmail.com | `password` |
| (register your own via POST /api/auth/register) | — | — |

---

## API Reference

All routes are prefixed with `/api`.

### Auth

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | — | Create a new account |
| `POST` | `/auth/login` | — | Login and receive cookies |
| `POST` | `/auth/refresh` | Cookie | Silent access-token refresh |
| `POST` | `/auth/logout` | Cookie | Clear auth cookies |

### Users

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/users/:id` | — | Get public profile |
| `PUT` | `/users/:id` | ✓ Own account | Update bio |
| `DELETE` | `/users/:id` | ✓ Own account | Delete account |
| `POST` | `/users/:id/follow` | ✓ | Follow a user |
| `DELETE` | `/users/:id/follow` | ✓ | Unfollow a user |
| `GET` | `/users/:id/followers` | ✓ | List followers |

### Feed

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/feed/` | ✓ | Get personalised feed (Redis-cached) |

### Posts

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/posts/` | ✓ | Create a post |
| `GET` | `/posts/:id` | ✓ | Get post with comments and likes |
| `PUT` | `/posts/:id` | ✓ Own post | Edit post content |
| `DELETE` | `/posts/:id` | ✓ Own post | Delete post |
| `POST` | `/posts/:id/like` | ✓ | Like a post |
| `DELETE` | `/posts/:id/like` | ✓ | Unlike a post |

### Comments

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/comments/:postId` | ✓ | Add a comment |
| `GET` | `/comments/:postId` | ✓ | Get all comments on a post |
| `DELETE` | `/comments/:postId/:commentId` | ✓ Own comment | Delete a comment |

### Notifications

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications/` | ✓ | Fetch all notifications |
| `PATCH` | `/notifications/read` | ✓ | Mark all as read |

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

Tests cover controllers, services, and utilities / middleware using Jest and `ts-jest`. The HTML coverage report is generated at `coverage/lcov-report/index.html`.

---

## Postman Collection

A ready-to-import Postman collection is included in the repo:

```
social-api_postman_collection.json
```

**Quick setup:**

1. Import the file into Postman (File → Import).
2. Create an environment with a variable `baseUrl` set to `http://localhost:3000/api`.
3. Run **login - ahmed** first — the HTTP-only cookies are saved automatically by Postman Desktop.
4. After creating a post, copy its `_id` into a `postId` variable.

For a full interactive walkthrough of every endpoint (with a visual checklist), open **`TESTING.html`** in your browser.

---

> Built as a backend engineering project to explore polyglot persistence, clean layered architecture, and production-grade auth patterns in TypeScript.
