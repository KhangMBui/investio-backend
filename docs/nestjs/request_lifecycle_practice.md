# NestJS Request Lifecycle Audit — Investio Backend

## Context

Audit of how the Investio backend applies NestJS request lifecycle best practices across all layers: middleware → guards → interceptors → pipes → controller → service → interceptors → exception filters. Goal: identify what is applied (where), what is missing, and whether missing items are necessary for MVP.

---

## Request flow in this project (tenant-scoped route)

```
Request
  ↓
[No middleware]
  ↓
AuthGuard('jwt')           — validates Bearer token, sets request.user (JwtPayloadType)
TenantContextGuard         — reads x-tenant-id header, sets request.tenantId
TenantMemberGuard          — queries DB for membership, checks status=active, sets request.membership
[TenantRoleGuard]          — optional, checks request.membership.role against @TenantRoles()
  ↓
ResolvePromisesInterceptor — resolves nested promises before serialization (before phase)
ClassSerializerInterceptor — applies @Exclude/@Expose (before phase)
  ↓
ValidationPipe (global)    — transforms + validates DTO, strips unknown fields, 422 on fail
  ↓
Controller method
  ↓
Service (business logic)
  ↓
ClassSerializerInterceptor — serializes response (after phase)
ResolvePromisesInterceptor — resolves promises in response (after phase)
  ↓
[No custom exception filter] — NestJS default: { statusCode, message, error }
  ↓
Response
```

---

## Layer-by-layer findings

### ✅ Middleware — not implemented, not needed

No custom middleware registered. Auth and tenant context are handled by guards, which is the correct NestJS pattern for authorization. A logging middleware (for correlation IDs) is a nice-to-have but not required for MVP.

**Verdict: gap is intentional, not a problem.**

---

### ✅ Guards — well implemented

| Guard                      | File                                        | Applied on                                                                 |
| -------------------------- | ------------------------------------------- | -------------------------------------------------------------------------- |
| `AuthGuard('jwt')`         | passport built-in                           | Class level: Ideas, Comments, Coach, Users, Tenants controllers            |
| `AuthGuard('jwt-refresh')` | passport built-in                           | `POST /auth/refresh` only                                                  |
| `TenantContextGuard`       | `src/tenant/guards/tenant-context.guard.ts` | Class level on tenant-scoped controllers; per-route on `TenantsController` |
| `TenantMemberGuard`        | `src/tenant/guards/tenant-member.guard.ts`  | Same as above; reads from `request.tenantId` set by TenantContextGuard     |
| `TenantRoleGuard`          | `src/tenant/guards/tenant-role.guard.ts`    | Per-route: resolve/invalidate endpoints, PATCH members                     |
| `PlatformRoleGuard`        | `src/common/guards/platform-role.guard.ts`  | Class level: `UsersController` only (admin-only endpoints)                 |

Guard order is correct everywhere: auth → context → membership → role. Each guard depends on what the previous one set on the request object.

**Verdict: fully applied. No gaps.**

---

### ✅ Interceptors — correctly applied globally

| Interceptor                  | File                                  | Registered                                                                 |
| ---------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| `ResolvePromisesInterceptor` | `src/utils/serializer.interceptor.ts` | Global, first (resolves nested async values before class-transformer runs) |
| `ClassSerializerInterceptor` | NestJS built-in                       | Global, second (applies `@Exclude`/`@Expose` decorators on domain objects) |

`@Exclude({ toPlainOnly: true })` is on the `password` field of `User` domain object — prevents password hash from leaking in responses.

`@SerializeOptions()` is used in `AuthController` to control which serialization group is exposed (e.g. exposing password hash only when needed for internal use).

**Verdict: fully applied. No gaps.**

---

### ✅ Pipes — global ValidationPipe correctly configured

Registered globally in `src/main.ts` using options from `src/utils/validation-options.ts`:

```
transform: true             — auto-converts query strings to typed DTO instances
whitelist: true             — strips unknown properties from body/query
forbidNonWhitelisted: true  — rejects requests with unknown properties (422)
errorHttpStatusCode: 422    — returns UNPROCESSABLE_ENTITY, not 400, on validation fail
```

No per-param or per-route pipes needed beyond this.

**Verdict: fully applied. No gaps.**

---

### ✅ Controllers — follow project conventions

All controllers have:

- `@HttpCode()` on every handler (explicit, not relying on defaults)
- `@ApiProperty()` / `@ApiPropertyOptional()` on DTO fields for Swagger visibility
- Custom param decorators (`@CurrentUser`, `@TenantContext`, `@MembershipContext`) instead of raw `@Req()`
- Domain objects returned from service, not raw TypeORM entities

**Verdict: fully applied. No gaps.**

---

### ✅ Services — business logic correctly isolated

Services accept `tenantId` as first argument on tenant-scoped operations. They return domain objects, not entities. Permission checks (e.g. `canEdit` in `IdeasService.update()`) live in the service, not the controller.

**Verdict: fully applied. No gaps.**

---

### ❌ Exception Filters — missing (tracked in M8)

**This is the only real gap.**

No custom exception filter exists. NestJS currently returns its native format:

```json
{ "statusCode": 403, "message": "Forbidden", "error": "Forbidden" }
```

The API contract specifies:

```json
{ "error": { "code": "FORBIDDEN", "message": "...", "details": {} } }
```

A global `HttpExceptionFilter` implementing `ExceptionFilter` would intercept all `HttpException` instances and reformat them to the contract envelope.

**Verdict: necessary for frontend integration (tracked as M8 task). Not blocking for backend-only development.**

---

## Summary table

| Layer                 | Status                 | Notes                                                                    |
| --------------------- | ---------------------- | ------------------------------------------------------------------------ |
| Middleware            | ✅ Intentionally empty | Guards handle auth/context; logging is a future nice-to-have             |
| Guards                | ✅ Complete            | 6 guards, correct composition order, all routes covered                  |
| Interceptors (before) | ✅ Complete            | Promise resolver + serializer, correct registration order                |
| Pipes                 | ✅ Complete            | Global ValidationPipe with strict config                                 |
| Controllers           | ✅ Complete            | Explicit HTTP codes, Swagger decorators, custom param decorators         |
| Services              | ✅ Complete            | Domain logic isolated, permission checks in service layer                |
| Interceptors (after)  | ✅ Complete            | ClassSerializerInterceptor handles response shape                        |
| Exception Filters     | ❌ Missing             | No custom filter — returns NestJS native format, not API contract format |

## One thing to implement (M8)

**`src/common/filters/http-exception.filter.ts`** — global exception filter that maps `HttpException` to `{ error: { code, message, details } }`. Register in `main.ts` with `app.useGlobalFilters(new HttpExceptionFilter())`. This normalizes all 4xx/5xx responses to the contract shape the frontend expects.
