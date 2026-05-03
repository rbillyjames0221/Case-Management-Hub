# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is a **Legal Case Management System (OLA-CMS)** for the Office of Legal Affairs, Civil Service Commission.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (drizzle-zod removed — use $inferSelect/$inferInsert types only)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Clerk (Replit-managed, RBAC with 5 roles)
- **Frontend**: React + Vite, Wouter, TanStack Query, shadcn/ui, Tailwind CSS v4

## Architecture

### Artifacts
- `artifacts/cms` — React Vite frontend (previewPath `/`, port from `PORT` env)
- `artifacts/api-server` — Express 5 backend (port 8080)
- `artifacts/mockup-sandbox` — Design sandbox

### Shared Libraries
- `lib/db` — Drizzle ORM schema + pg client (exported as `@workspace/db` and `@workspace/db/schema`)
- `lib/api-spec` — OpenAPI spec + Orval config for codegen
- `lib/api-zod` — Generated Zod validation schemas
- `lib/api-client-react` — Generated React Query hooks

## Database Schema (PostgreSQL)

Tables:
- `users` — synced from Clerk (clerkId, role, email, firstName, lastName, etc.)
- `cases` — core case entity (caseNumber, title, status, priority, category, complainantId, assignedLawyerId)
- `case_files` — uploaded files (multer, stored in `artifacts/api-server/uploads/`)
- `case_notes` — notes per case (isInternal flag for staff-only notes)
- `case_timeline` — automated audit trail per case
- `hearings` — scheduled hearings (can be virtual, with meetingUrl)
- `messages` — case messaging between user and legal team
- `audit_logs` — global audit trail

## RBAC Roles

- `SUPER_ADMIN` — full access, user management, role assignment, audit logs
- `LEGAL_ADMIN` — manage all cases, assign lawyers, view audit logs
- `LAWYER` — manage assigned cases only, schedule hearings, update statuses
- `STAFF` — file cases on behalf of users, add notes
- `USER` — citizens: file cases, view own cases, message, attend hearings

## API Routes (`/api/...`)

- `GET /healthz` — health check
- `GET /auth/me` — get/sync current user profile
- `PUT /auth/me` — update own profile
- `GET/PUT/DELETE /users/:id` — user management (admin)
- `GET /users/lawyers` — list all lawyers
- `PUT /users/:id/role` — change role (SUPER_ADMIN only)
- `GET/POST /cases` — list/create cases
- `GET/PUT/DELETE /cases/:id` — case detail
- `PUT /cases/:id/status` — update case status + timeline entry
- `PUT /cases/:id/assign` — assign lawyer
- `GET/POST /cases/:id/notes` — case notes
- `GET /cases/:id/timeline` — case timeline
- `GET/POST /cases/:id/files` — file upload (multer, 20MB max)
- `GET /cases/download/:fileId` — file download
- `GET/POST /cases/:id/messages` — case messaging
- `GET/POST /cases/:id/hearings` — hearing schedule
- `PUT /cases/hearings/:hearingId` — update hearing
- `GET /cases/upcoming` — upcoming hearings for current user
- `GET /dashboard/stats` — role-specific stats
- `GET /dashboard/my-cases` — recent cases for current user
- `GET /dashboard/activity` — recent activity
- `GET /audit-logs` — global audit log (admin only)

## Frontend Pages

- `/` — Public homepage (landing page with hero, features, CTA)
- `/sign-in` + `/sign-up` — Clerk-powered branded auth pages
- `/dashboard` — User/citizen dashboard (stats, recent cases, upcoming hearings)
- `/my-cases` — User's case list with filters
- `/file-case` — Case filing form
- `/admin/dashboard` — Admin overview (all stats, recent cases, hearings)
- `/admin/cases` — Admin case management table with lawyer assignment
- `/admin/users` — User management with role assignment
- `/admin/audit-logs` — System audit log viewer
- `/lawyer/dashboard` — Lawyer dashboard (assigned cases, stats, hearings)
- `/lawyer/cases` — Lawyer's case list with status update controls
- `/cases/:id` — Full case detail (tabs: overview/files/messages/hearings/timeline)

## Case Status Lifecycle

`FILED → UNDER_REVIEW → INVESTIGATION → HEARING_SCHEDULED → RESOLVED → ARCHIVED`

## Case Priority Enum

`LOW | NORMAL | HIGH | URGENT`

## Soft Deletes

`cases`, `case_files`, `case_notes`, and `hearings` all have a `deletedAt` timestamp column. Queries must filter `isNull(table.deletedAt)`.

## Access Control

- `loadAndAuthorizeCase` middleware: USER must own the case (complainantId), LAWYER must be assigned
- `requireRole(...)` middleware: checks DB user's role
- `requireDbUser` middleware: ensures user exists in DB (calls `/api/auth/sync` on first login)

## TypeScript Notes

- `@types/express@5` types `req.params[key]` as `string | string[]` — always use `String(req.params.id)` before passing to Drizzle
- `clerkClient` from `@clerk/express` is a Proxy (NOT callable) — use `clerkClient.users.getUser(userId)` directly

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run seed` — seed demo data (idempotent, cleans up first)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run push-force` — force push (use after enum changes)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
