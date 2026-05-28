# Investio Backend Milestones

> Purpose: provide a practical backend execution plan for the Investio MVP.
> This is a living roadmap. Keep it updated as features ship.

---

## Current Backend State

Investio backend is a NestJS modular monolith using:

- NestJS + TypeScript
- PostgreSQL + TypeORM
- JWT auth + refresh sessions
- Tenant-scoped authorization
- Swagger at `/docs`
- Modular ownership:
  - Identity
  - Tenant
  - Ideas
  - Community
  - Coach
  - Jobs

Core domain modules already exist:

- `src/auth`
- `src/users`
- `src/session`
- `src/tenant`
- `src/ideas`
- `src/community`
- `src/coach`
- `src/jobs`

Important convention:

> Use the project generator skill / CLI generators when adding entities, schemas, properties, DTOs, modules, or migrations. Do not hand-write generated structure unless necessary.

---

# Milestone 0 — Backend Foundation Verification

## Goal

Make sure the backend can run, migrate, build, and expose correct docs before feature work continues.

## Tasks

- [x] Run local dependencies with Docker Compose
- [x] Verify Postgres connection
- [x] Verify MailDev or mail service starts locally
- [x] Run database migrations from scratch
- [x] Run seed scripts if available
- [x] Start NestJS app locally
- [x] Open Swagger at `/docs`
- [x] Confirm routes are at `/api/v1/...` — `API_PREFIX=api` in `.env`, URI versioning adds `/v1` from each controller's `version: '1'`
- [x] Run `yarn build`
- [x] Run `yarn test:e2e` — requires app running (`yarn start:dev`) in a separate terminal; no unit tests exist in `src/` yet

## Acceptance Criteria

- Backend starts without runtime errors
- Migrations apply cleanly on an empty database
- Swagger loads successfully
- Build passes
- No obvious broken imports or missing providers

---

# Milestone 1 — Auth + Platform Admin Hardening ✓

## Goal

Make auth safe enough for MVP and prevent normal users from accessing platform/admin endpoints.

## Tasks

- [x] Verify register flow
- [x] Verify login flow
- [x] Verify refresh token flow
- [x] Verify logout invalidates session
- [x] Verify `/auth/me`
- [x] Add/confirm `platformRole` on users (`UserPlatformRole` enum: `user` | `admin`)
- [x] Seed dev users:
  - `admin@investio.com` / `admin123` — role: admin
  - `test@investio.com` / `test123` — role: user
- [x] Add platform role decorator `@PlatformRoles(UserPlatformRole.ADMIN)`
- [x] Add `PlatformRoleGuard` (`src/common/guards/platform-role.guard.ts`)
- [x] Protect all platform-level user management endpoints:
  - `POST /users`
  - `GET /users`
  - `GET /users/:id`
  - `PATCH /users/:id`
  - `DELETE /users/:id`
- [x] Manual smoke test: confirm normal user receives `403` on `/users` endpoints
- [x] Manual smoke test: confirm admin user can access `/users` endpoints

## Acceptance Criteria

- Normal user can authenticate and call `/auth/me`
- Normal user receives `403` on platform admin endpoints
- Admin user can access platform admin endpoints
- Platform role is embedded in the JWT payload (`role` field)
- Tenant roles are NOT stored in JWT — tenant authorization remains membership-based

---

# Milestone 2 — Tenant + Membership Core

## Goal

Make multi-tenancy reliable and enforce tenant boundaries everywhere.

## Tasks

- [x] Verify tenant creation: creator automatically becomes owner (membership created with `role: owner`)
- [x] Scope `GET /tenants` to return only tenants the current user is a member of — currently returns ALL tenants to any authenticated user (security gap)
- [x] Verify tenant listing shows correct tenants for current user after scoping fix
- [x] Verify member listing (`GET /tenants/:tenantId/members`)
- [x] Verify membership role enum: `owner` | `mod` | `member`
- [x] Verify membership status enum: `active` | `invited` | `banned`
- [x] Verify `x-tenant-id` requirement on tenant-scoped endpoints (throws `TENANT_CONTEXT_REQUIRED`)
- [x] Verify missing tenant header returns correct error
- [x] Verify inactive/banned members cannot access tenant data (`TenantMemberGuard` checks `status === active`)
- [x] Verify tenant role guard works for mod/owner routes (`TenantRoleGuard` + `@TenantRoles()`)
- [x] Verify `PATCH /tenants/:tenantId/members/:userId` endpoint (update role/status — owner/mod only)
- [ ] ~~Add or confirm "last owner cannot be removed" rule~~ — deferred post-MVP

## Acceptance Criteria

- Every tenant-scoped request requires valid `x-tenant-id`
- User must have active membership to access tenant data
- Role-based tenant permissions work
- A user can only list tenants they belong to
- No cross-tenant access is possible through normal API usage

---

# Milestone 3 — Ideas Core Workflow

## Goal

Ship the main product loop: create, view, edit, and resolve investment ideas.

## Tasks

- [x] Verify create idea endpoint
- [x] Verify list ideas endpoint
- [x] Verify get idea detail endpoint
- [x] Verify update idea endpoint
- [x] Verify update writes idea edit audit rows (field-level diff, stored in `idea_edits`)
- [x] Verify resolve idea endpoint (`status → resolved`, sets `resolvedAt`)
- [x] Add invalidate idea endpoint: `POST /ideas/:ideaId/invalidate` (`status → invalidated`)
- [x] Enforce edit permissions: members can only edit their own ideas; mod/owner can edit any
- [x] Enforce resolve/invalidate permissions: mod/owner only (gate behind `TenantRoleGuard`)
- [x] Add filtering on `GET /ideas`:
  - by `status`
  - by `ticker`
- [x] Add pagination for ideas
- [x] Confirm all idea queries are tenant-scoped (`where: { tenantId }`)

## Acceptance Criteria

- Tenant member can create, view, and comment on ideas
- Any active tenant member can edit their own ideas; mod/owner can edit any idea
- Only mod/owner can resolve or invalidate ideas
- Every field change creates an audit trail row in `idea_edits`
- Ideas from one tenant never appear in another tenant
- Invalidated ideas are correctly marked and distinguishable from resolved

---

# Milestone 4 — Community Comments

## Goal

Enable discussion around ideas.

## Tasks

- [x] Verify create comment endpoint (`POST /ideas/:ideaId/comments`)
- [x] Verify list comments endpoint (`GET /ideas/:ideaId/comments`)
- [ ] Add pagination for comments
- [ ] Add delete comment endpoint (author or mod/owner only) — add only if needed before launch
- [x] Confirm comments are tenant-scoped (filtered by `tenantId` + `ideaId`)

## Acceptance Criteria

- Members can comment on ideas in their tenant
- Users cannot comment on ideas outside their tenant
- Comments list correctly for an idea
- Pagination works for large comment threads

---

# Milestone 5 — Coach v0 Reports

## Goal

Ship a simple weekly recap experience without advanced LLM complexity.

## Tasks

- [x] Verify latest report endpoint (`GET /api/v1/ai/report`)
- [x] Verify generate report endpoint (`POST /api/v1/ai/report`)
- [ ] Define and document report content JSON shape
- [ ] Implement recap generation using template + stats (no LLM):
  - ideas created in period
  - ideas resolved in period
  - comments written in period
  - active ideas count
- [ ] Generate reflection prompts from report
- [x] Store report in `ai_reports` (entity + table exist)
- [x] Store prompts in `reflection_prompts` (entity + table exist)
- [x] Confirm report is tenant + user scoped (`tenantId` + `userId` on entity)

## Acceptance Criteria

- User can generate a report for their tenant
- User can fetch latest report
- Report does not leak cross-tenant data
- Report generation works without an LLM dependency

---

# Milestone 6 — Jobs + Outbox Worker

## Goal

Move slow/non-critical work toward reliable background processing.

## Tasks

- [x] Verify `outbox_events` table exists
- [x] Verify `processed_events` table exists
- [x] Verify `OutboxService` has `publish()`, `getPending()`, `markPublished()` helpers
- [ ] Wire domain services to emit outbox events — currently `OutboxService.publish()` is never called:
  - `IdeaCreated`
  - `IdeaUpdated`
  - `IdeaResolved`
  - `CommentCreated`
  - `TenantCreated`
- [ ] Implement local polling worker or scheduled processor
- [x] `markPublished()` marks events after processing
- [x] `processed_events` table exists for idempotency deduplication
- [ ] Add structured logs per event processed (eventId, tenantId, eventType)

## Acceptance Criteria

- Domain events are written reliably to `outbox_events` during domain operations
- Worker can process unpublished events
- Duplicate processing is avoided via `processed_events`
- Worker failure does not corrupt data

---

# Milestone 7 — Invite Flow + Email

## Goal

Allow tenant owners/mods to invite members.

## Tasks

- [ ] Add invite endpoint (`POST /tenants/:tenantId/invite`)
- [ ] Create membership with `status = invited`
- [ ] Send invite email via `MailService`
- [ ] Add accept invite endpoint (`POST /memberships/accept`)
- [ ] Change membership status to `active` on accept
- [ ] Prevent banned users from accepting invite
- [ ] Ensure invite is tenant-scoped and role-gated (owner/mod only)

## Acceptance Criteria

- Owner/mod can invite a user by email
- Invited user can accept and become active member
- Invite emails work locally through MailDev
- Invalid or expired invites fail safely

---

# Milestone 8 — API Polish + Frontend Readiness

## Goal

Make the backend comfortable for frontend integration.

## Tasks

- [ ] Review Swagger endpoint names and DTOs
- [ ] Normalize error responses where practical
- [ ] Ensure all DTOs have `@ApiProperty()` decorators
- [ ] Confirm frontend-required endpoints exist
- [ ] Add missing query params:
  - `status`
  - `ticker`
  - `limit`
  - `cursor` / `page`
- [ ] Add custom exception filter to normalize error responses to API contract envelope:
      `{ error: { code, message, details } }` instead of NestJS native `{ statusCode, message, error }`
- [x] CORS enabled for local dev (`cors: true` in `main.ts`)
- [ ] Review CORS origin config for staging/production

## Acceptance Criteria

- Frontend can integrate without guessing payload shapes
- Swagger is accurate enough for development
- Common errors are predictable

---

# Milestone 9 — Production Readiness Lite

## Goal

Prepare backend for a real hosted MVP.

## Tasks

- [ ] Confirm and document full environment variable list
- [x] `.env.example` exists (from boilerplate — review and update for Investio vars)
- [ ] Add deployment notes
- [ ] Verify production database migration process
- [ ] Add health check endpoint (`GET /health`)
- [ ] Add basic structured logging
- [ ] Review secrets handling (JWT secrets, DB credentials, AWS keys)
- [ ] Review CORS and JWT settings for production

## Acceptance Criteria

- App can be deployed to staging
- Required env vars are documented
- Health check works
- Logs are useful enough for debugging

---

# Later / Not MVP

- Idea edit/resolve authorship enforcement (author-only edit, mod/owner resolve)
- "Last owner cannot be removed" membership guard
- Full notification system
- EventBridge + SQS production integration
- Advanced LLM-based coach
- Embeddings / semantic search
- Real-time collaboration
- Multi-region deployment
- Full billing/subscription system
- Public API
