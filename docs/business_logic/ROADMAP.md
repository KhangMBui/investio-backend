# Investio Backend Roadmap

> Status: 2026-05-26  
> This doc tracks backend progress toward MVP launch. See BACKEND-MILESTONES.md for granular task tracking.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11.x, TypeScript |
| Database | PostgreSQL via TypeORM 0.3.x |
| Auth | Passport.js — JWT + JWT-refresh + Anonymous strategies |
| Hosting | ECS Fargate (NestJS app + Worker) |
| Async | Outbox → EventBridge + SQS (worker, future) |
| Frontend | Next.js (separate repo) |

---

## Phase overview

| Phase | Milestones | Status |
|---|---|---|
| Foundation | M0 (infra), M1 (auth hardening) | ✅ Done |
| Core features | M2 (tenants), M3 (ideas), M4 (comments), M5 (coach) | 🔨 In progress |
| Reliability | M6 (outbox worker) | ⬜ Planned |
| Collaboration | M7 (invite flow) | ⬜ Planned |
| Readiness | M8 (API polish), M9 (production lite) | ⬜ Planned |

---

## Phase 1 — Foundation (complete)

### M0: Backend Foundation Verification

- NestJS app boots cleanly
- Migrations run on empty DB
- Swagger loads at `/docs`
- `yarn build` passes
- E2E test suite runs against live app

### M1: Auth + Platform Admin Hardening

- Register / login / refresh / logout / `/auth/me` verified
- `UserPlatformRole` enum (`admin` | `user`) on user entity
- Role embedded in JWT payload (`role` field)
- `PlatformRoleGuard` + `@PlatformRoles()` decorator created
- All `/users` endpoints protected — admin only
- Dev seed users: `admin@investio.com` (admin), `test@investio.com` (user)

---

## Phase 2 — Core Features (in progress)

### M2: Tenant + Membership Core

- Tenant creation: creator becomes owner
- Member listing
- Tenant-scoped guard stack verified
- **Remaining**: scope `GET /tenants` to current user's memberships only; verify `PATCH /members/:userId`

### M3: Ideas Core Workflow

- Create / list / get / update / resolve verified
- Edit audit trail (`idea_edits`) verified
- **Remaining**: invalidate endpoint; permission enforcement (author-edit, mod-resolve); filtering; pagination

### M4: Community Comments

- Create / list comments verified
- **Remaining**: pagination; delete comment (author or mod/owner)

### M5: Coach v0 Reports

- `ai_reports` and `reflection_prompts` tables exist
- Latest report and generate endpoints exist
- **Remaining**: implement actual stats-based generation; define report JSON shape

---

## Phase 3 — Reliability (planned)

### M6: Jobs + Outbox Worker

- `outbox_events` and `processed_events` tables exist
- `OutboxService` helpers exist
- **Remaining**: wire domain services to emit events; implement polling worker; idempotency deduplication

---

## Phase 4 — Collaboration (planned)

### M7: Invite Flow + Email

- `MailService` and `MailerModule` exist from boilerplate
- `status: invited` enum value exists on memberships
- **Remaining**: invite endpoint; accept-invite endpoint; invite email template; status transition

---

## Phase 5 — Launch Readiness (planned)

### M8: API Polish + Frontend Readiness

- Swagger DTO decorators
- Custom exception filter for contract error envelope
- Missing query params (status, ticker, limit, cursor)
- CORS config review for staging/production

### M9: Production Readiness Lite

- Health check endpoint
- Env var documentation
- Structured logging
- JWT and CORS settings locked for production
- Production migration process documented

---

## Out of scope (post-MVP)

- Real-time collaboration
- Advanced LLM coach (embeddings, multi-agent)
- EventBridge + SQS production wiring
- Notification system beyond auth emails
- Cross-tenant idea sharing
- Fine-grained permissions beyond RBAC
- Public API / third-party integrations
- Multi-region deployment
- Billing / subscriptions
- "Last owner cannot be removed" guard
