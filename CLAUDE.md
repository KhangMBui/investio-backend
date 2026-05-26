# Project Instructions

## When adding entities, schemas, or properties

Use the `generate` skill (auto-loaded from [.claude/skills/generate/SKILL.md](.claude/skills/generate/SKILL.md)). It documents the project's CLI generators (`npm run generate:resource:*`, `npm run add:property:to-*`) which keep both database variants, DTOs, modules, and migrations in sync. Do not hand-write entity files.

---

# Project Summary

Investio is a **multi-tenant investment collaboration platform** where teams can create, discuss, and track investment ideas together.

Users register globally, then create or join **tenants** (organizations). Within a tenant, members post investment ideas with a thesis, timeframe, and invalidation criteria. Other members comment, and the platform generates weekly AI-driven recap reports. An audit trail (idea-edits) records every field change.

**Current status**: NestJS modular monolith backend. Boilerplate-derived, with Investio domain modules added on top.

---

# Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11.x, TypeScript |
| Database | PostgreSQL via TypeORM 0.3.x |
| ORM | TypeORM (relational) + Mongoose (document, unused in domain) |
| Auth | Passport.js — JWT strategy + JWT-refresh + Anonymous |
| Mail | Nodemailer + Handlebars templates |
| File storage | Local (dev) or AWS S3 / S3-presigned (configurable via `FILE_DRIVER`) |
| API docs | Swagger / OpenAPI at `/docs` |
| Config | `@nestjs/config` with typed config objects |
| i18n | `nestjs-i18n` with header-based language resolution |
| Frontend | Next.js (SSR) — separate repo |
| Infra | Route53 → CloudFront → ALB → ECS Fargate |
| Future | AWS EventBridge + SQS for async event fan-out |

---

# Architecture

**Modular monolith.** All modules share one Postgres instance but own their tables. Module boundaries are enforced through NestJS module encapsulation — no cross-module direct repository access. Each module exports its service; other modules import the service, never the repository.

**Clean architecture within each module:**
```
controller → service → repository (abstract) → repository (relational impl) → TypeORM entity
                       domain object ← mapper ← TypeORM entity
```

Domain objects (`src/<module>/domain/*.ts`) are plain classes returned from services and serialized to clients. TypeORM entities live in `src/<module>/infrastructure/persistence/relational/entities/`. Mappers translate between them.

**Multi-tenancy model:**
- Users are global (no tenant affiliation on the user record).
- Tenant-scoped resources require `x-tenant-id` header.
- `TenantContextGuard` reads the header and injects `tenantId` into the request.
- `TenantMemberGuard` checks the user has an active membership in that tenant.
- `TenantRoleGuard` + `@TenantRoles(...)` decorator enforce role requirements.
- The `membership` object (with `role`) is injected into `request.membership` by `TenantMemberGuard`.

---

# Module Ownership

| Module | Path | Responsibility |
|---|---|---|
| **Identity** | `src/auth`, `src/users`, `src/session` | Auth (JWT, password reset, email confirm), user CRUD, session lifecycle |
| **Tenant** | `src/tenant/tenants`, `src/tenant/memberships` | Tenant creation, member management, role/status, tenant guards |
| **Ideas** | `src/ideas`, `src/ideas/idea-edits` | Investment idea CRUD, status transitions, edit audit log |
| **Community** | `src/community/comments` | Comments on ideas |
| **Coach** | `src/coach/ai-reports`, `src/coach/reflection-prompts` | AI-generated weekly recaps, reflection prompts |
| **Jobs** | `src/jobs/outbox`, `src/jobs/processed-events` | Transactional outbox, event deduplication |
| **Infrastructure** | `src/mail`, `src/mailer`, `src/files`, `src/database` | Mail transport, file upload, DB config, migrations |
| **Common** | `src/common`, `src/utils`, `src/config`, `src/i18n` | Shared decorators, interceptors, pagination, validation, config types |

---

# Database Ownership

| Module | Tables / Entities |
|---|---|
| Identity | `users`, `sessions`, `files` |
| Tenant | `tenants`, `memberships` |
| Ideas | `ideas`, `idea_edits` |
| Community | `comments` |
| Coach | `ai_reports`, `reflection_prompts` |
| Jobs | `outbox_events`, `processed_events` |

All tables use UUID primary keys. Tenant-scoped tables carry a `tenantId` column (not a FK to the tenants table — denormalized for query simplicity). Soft-delete via `deletedAt` is used on `users` and `sessions`.

---

# API Conventions

**Base URL:** `<backend-domain>/api/v1/`

**Versioning:** URI-based (`/v1/`, `/v2/`). All current routes are v1.

**Auth header:** `Authorization: Bearer <jwt>`

**Tenant header:** `x-tenant-id: <uuid>` — required on all tenant-scoped endpoints.

**Language header:** `x-custom-lang: en` (configurable via `APP_HEADER_LANGUAGE`).

**Guard stack for tenant-scoped routes:**
```
AuthGuard('jwt') → TenantContextGuard → TenantMemberGuard → [TenantRoleGuard if roles required]
```

**Pagination:** Cursor-style via `infinityPagination()` utility. Returns `{ data: T[], hasNextPage: boolean }`.

**Error format:** Standard NestJS HTTP exceptions — `{ statusCode, message, error }`.

**Swagger docs:** `GET /docs`

---

# Key Routes

| Method | Path | Guard stack | Description |
|---|---|---|---|
| POST | `/api/v1/auth/email/login` | none | Login with email/password |
| POST | `/api/v1/auth/email/register` | none | Register |
| GET | `/api/v1/auth/me` | JWT | Current user profile |
| POST | `/api/v1/auth/refresh` | JWT-refresh | Get new access token |
| POST | `/api/v1/auth/logout` | JWT | Invalidate session |
| POST | `/api/v1/tenants` | JWT | Create tenant (caller becomes owner) |
| GET | `/api/v1/tenants/:tenantId/members` | JWT + tenant guards | List members |
| POST | `/api/v1/ideas` | JWT + tenant guards | Create idea |
| PATCH | `/api/v1/ideas/:ideaId` | JWT + tenant guards | Update idea (auto-logs edit) |
| POST | `/api/v1/ideas/:ideaId/resolve` | JWT + tenant guards | Resolve idea |
| GET | `/api/v1/ideas/:ideaId/edits` | JWT + tenant guards | Audit log |
| POST | `/api/v1/ideas/:ideaId/comments` | JWT + tenant guards | Post comment |
| GET | `/api/v1/ai/report` | JWT + tenant guards | Latest AI report |
| POST | `/api/v1/ai/report` | JWT + tenant guards | Generate new AI report |

---

# Async Rules

**Outbox pattern:** Domain events are written to `outbox_events` in the same DB transaction as the business operation. A worker polls `outbox_events` for unpublished events and fans them out.

**Idempotency:** `processed_events` table deduplicates events by `eventId`. Workers check this table before processing.

**Future:** AWS EventBridge + SQS will replace the polling worker for fan-out. The outbox write contract stays the same.

**Slow work (AI reports):** `CoachService.generateReport` runs synchronously now (MVP). Future: move to a job queue.

---

# Repo Structure

```
investio-backend/
├── src/
│   ├── main.ts                    # Bootstrap: CORS, prefix, versioning, pipes, interceptors, Swagger
│   ├── app.module.ts              # Root module — imports all feature modules
│   ├── config/                    # app.config.ts + AllConfigType type union
│   ├── common/
│   │   └── decorators/            # @CurrentUser(), @TenantContext()
│   ├── utils/                     # infinityPagination, serializer interceptor, validation options, deep-partial
│   ├── i18n/                      # Translation JSON files
│   ├── database/
│   │   ├── typeorm-config.service.ts
│   │   ├── migrations/            # TypeORM migration files
│   │   └── seeds/                 # Seed scripts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── config/auth.config.ts
│   │   ├── dto/                   # Login, register, reset, confirm DTOs
│   │   └── strategies/            # jwt.strategy, jwt-refresh.strategy, anonymous.strategy
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── domain/user.ts         # Domain object
│   │   ├── dto/
│   │   └── infrastructure/persistence/relational/
│   │       ├── entities/user.entity.ts
│   │       ├── mappers/user.mapper.ts
│   │       └── repositories/users.repository.ts
│   ├── session/                   # Session lifecycle (same clean-arch pattern as users)
│   ├── mail/                      # High-level mail service (uses mailer)
│   ├── mailer/                    # Nodemailer + Handlebars transport
│   ├── files/                     # File upload — LOCAL / S3 / S3-presigned variants
│   ├── tenant/
│   │   ├── tenant.module.ts       # Re-exports TenantsModule + MembershipsModule
│   │   ├── guards/                # TenantContextGuard, TenantMemberGuard, TenantRoleGuard
│   │   ├── tenants/               # TenantEntity, TenantsService, TenantsController
│   │   └── memberships/           # MembershipEntity, MembershipsService, enums
│   ├── ideas/
│   │   ├── ideas.module.ts
│   │   ├── ideas.controller.ts
│   │   ├── ideas.service.ts
│   │   ├── domain/idea.ts
│   │   ├── dto/
│   │   ├── infrastructure/persistence/relational/entities/idea.entity.ts
│   │   └── idea-edits/            # IdeaEditEntity, IdeaEdit domain, edit tracking
│   ├── community/
│   │   └── comments/              # CommentEntity, CommentsService, CommentsController
│   ├── coach/
│   │   ├── coach.module.ts
│   │   ├── coach.controller.ts
│   │   ├── coach.service.ts
│   │   ├── ai-reports/            # AiReportEntity
│   │   └── reflection-prompts/    # ReflectionPromptEntity
│   └── jobs/
│       ├── jobs.module.ts
│       ├── outbox/                # OutboxEventEntity, OutboxService
│       └── processed-events/      # ProcessedEventEntity, ProcessedEventsService
├── test/                          # E2E tests
├── .hygen/                        # Hygen code generation templates
├── .claude/                       # Claude Code configuration and skills
├── docker-compose.yml             # PostgreSQL + MailDev for local dev
└── package.json
```

---

# Existing Boilerplate Decisions

**Kept from boilerplate:**
- Clean architecture (domain / repository / mapper / entity split)
- Dual DB support scaffolding (TypeORM + Mongoose) — only TypeORM is wired in domain modules
- JWT + JWT-refresh + Anonymous Passport strategies
- Session table for server-side token invalidation
- Global `ValidationPipe` with custom options (`whitelist: true`, `forbidNonWhitelisted: true`)
- `ClassSerializerInterceptor` + `@Exclude()` on password fields
- `ResolvePromisesInterceptor` to handle class-transformer promise issue
- Swagger auto-generated docs
- `nestjs-i18n` with header-based language selection
- File upload abstraction (local/S3/S3-presigned via `FILE_DRIVER` env)
- Hygen templates for scaffolding new resources

**Removed / not used:**
- Google / Apple OAuth strategies (packages present but no active strategy wired)
- MongoDB/Mongoose persistence for domain modules (only TypeORM used)
- Role-based user roles on the user record (replaced by tenant membership roles)
- The boilerplate's flat role system (`RoleEntity`) — Investio uses tenant-scoped `MembershipRole` enum instead

---

# Development Conventions

### DTO Pattern
- One file per operation: `create-<resource>.dto.ts`, `update-<resource>.dto.ts`, `query-<resource>.dto.ts`
- Extend `PartialType` for update DTOs
- `class-validator` decorators for all fields; `@ApiProperty()` for Swagger visibility
- Validation is strict: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`

### Controller Pattern
```typescript
@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })   // on tenant-scoped controllers
@UseGuards(AuthGuard('jwt'), TenantContextGuard, TenantMemberGuard)
@ApiTags('ResourceName')
@Controller({ path: 'resource', version: '1' })
export class ResourceController {
  // Inject service only — never repositories directly
  // Use @CurrentUser() for JWT payload, @TenantContext() for tenantId
  // Return domain objects, not entities
  // HttpCode explicitly set on every handler
}
```

### Service Pattern
- Services accept `tenantId` as first argument on all tenant-scoped operations
- Services return domain objects
- Throw `NotFoundException` for missing records, `ForbiddenException` for auth failures
- Edit tracking: `IdeasService.update()` compares old vs new field values and writes `IdeaEdit` records

### Repository Pattern
- Abstract repository interface in `src/<module>/domain/<resource>.repository.ts`
- Relational implementation in `src/<module>/infrastructure/persistence/relational/repositories/`
- Services depend on the abstract interface (injected via module provider token)
- Mappers translate `Entity ↔ Domain` — never return raw entities from services

### Entity Conventions
- All PKs are `uuid` generated with `@PrimaryGeneratedColumn('uuid')`
- Timestamps: `createdAt` (auto), `updatedAt` (auto), `deletedAt` (soft-delete where applicable)
- Tenant-scoped entities carry a plain `tenantId: string` column
- Extend `EntityRelationalHelper` for `toJSON()` support

### Validation Conventions
- `@IsUUID()` on all ID fields
- `@IsEmail()` + `lowerCaseTransformer` on email fields
- `@MinLength(6)` on passwords
- Slug fields: `@Matches(/^[a-z0-9-]+$/)` (e.g., tenant slug)
- `@IsOptional()` before `@IsString()` / `@IsEnum()` on optional fields

### Enum Location
- Enums live in their owning module: `src/tenant/memberships/membership-role.enum.ts`, `src/ideas/idea-status.enum.ts`

---

# Where to Go When Working on X

| Task | Location |
|---|---|
| Auth (login, register, tokens, password reset) | [src/auth/](src/auth/) |
| User CRUD | [src/users/](src/users/) |
| Session management | [src/session/](src/session/) |
| Tenant creation and settings | [src/tenant/tenants/](src/tenant/tenants/) |
| Membership roles and status | [src/tenant/memberships/](src/tenant/memberships/) |
| Tenant guards (context, member, role) | [src/tenant/guards/](src/tenant/guards/) |
| Investment ideas (create/edit/resolve) | [src/ideas/](src/ideas/) |
| Idea edit audit log | [src/ideas/idea-edits/](src/ideas/idea-edits/) |
| Comments | [src/community/comments/](src/community/comments/) |
| AI reports and reflection prompts | [src/coach/](src/coach/) |
| Outbox events | [src/jobs/outbox/](src/jobs/outbox/) |
| Event deduplication | [src/jobs/processed-events/](src/jobs/processed-events/) |
| Database config and migrations | [src/database/](src/database/) |
| Mail (high-level templates) | [src/mail/](src/mail/) |
| Mail transport (Nodemailer) | [src/mailer/](src/mailer/) |
| File upload | [src/files/](src/files/) |
| Shared decorators (@CurrentUser, @TenantContext) | [src/common/decorators/](src/common/decorators/) |
| Pagination utility | [src/utils/infinity-pagination.ts](src/utils/infinity-pagination.ts) |
| Global config types | [src/config/config.type.ts](src/config/config.type.ts) |
| App bootstrap | [src/main.ts](src/main.ts) |
| Root module wiring | [src/app.module.ts](src/app.module.ts) |

---

# Future Work

Planned but not yet implemented:

- **Invalidate idea endpoint** — `POST /ideas/:ideaId/invalidate` (status transition to `invalidated`)
- **Invite member flow** — invite by email, `status: invited` → `active` on accept
- **Weekly AI recap job** — background worker triggered on schedule (currently synchronous)
- **EventBridge + SQS integration** — replace outbox polling worker with AWS event bus
- **Tenant settings** — `settingsJson` column exists on `TenantEntity` but no endpoints yet
- **Notification system** — no push/email notification plumbing beyond auth emails
- **Search/filter on ideas** — `findAll` currently returns all ideas in a tenant without filtering
- **Pagination on ideas and comments** — no cursor pagination wired on domain endpoints yet
- **Worker process** — outbox polling worker not implemented; `OutboxService` methods exist but no scheduler
