# Investio MVP API Contract (v0)

> Purpose: keep frontend + backend unblocked.
> This is not a perfect OpenAPI spec — it is a lightweight, stable contract.
> Base URL: `/api/v1`
> Auth: required for all endpoints unless marked **Public**.

---

## 0) Conventions

### Headers

- `Authorization: Bearer <access_token>` (or cookie-based if we switch later)
- `Content-Type: application/json`

### Tenant scoping

All tenant-scoped endpoints require a tenant context, using one of:

- Preferred: `X-Tenant-Id: <tenant_uuid>`
- Alternative: tenant in path: `/tenants/{tenantId}/...` (only if we choose path-style later)

**MVP decision:** Use `X-Tenant-Id` header for tenant-scoped routes.

---

## 1) Standard response formats

### Success envelope (MVP)

For now, responses return plain JSON objects/lists.
We do **not** wrap in `{ data: ... }` unless needed later.

### Error format (consistent everywhere)

**Target shape** (requires a custom exception filter — tracked in Milestone 8):

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

**Current NestJS native shape** (what the API returns today):

```json
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "Forbidden"
}
```

Common HTTP statuses:

- 400 `VALIDATION_ERROR` (invalid input)
- 401 `UNAUTHENTICATED` (missing/invalid token)
- 403 `FORBIDDEN` (no permission in tenant)
- 404 `NOT_FOUND`
- 409 `CONFLICT` (duplicate slug/email, etc.)
- 429 `RATE_LIMITED` (optional later)
- 500 `INTERNAL_ERROR`

Example validation error (target):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": {
      "email": "Email is required"
    }
  }
}
```

---

## 2) Auth / Identity (global)

### POST /auth/register (Public)

Create a user account.

Request:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response 201:

```json
{
  "user": { "id": "uuid", "email": "user@example.com", "created_at": "iso" },
  "access_token": "jwt_string"
}
```

Errors:

- 409 `EMAIL_ALREADY_EXISTS`

### POST /auth/login (Public)

Request:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response 200:

```json
{
  "user": { "id": "uuid", "email": "user@example.com" },
  "access_token": "jwt_string"
}
```

Errors:

- 401 `INVALID_CREDENTIALS`

### POST /auth/logout

If using Bearer tokens only, logout is client-side (delete token).
If using cookies later, this clears the cookie.

Response 204 (no body)

### GET /auth/me

Returns current user.

Response 200:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "created_at": "iso"
}
```

Errors:

- 401 `UNAUTHENTICATED`

---

## 3) Tenants & Memberships

### POST /tenants

Create a tenant (creator becomes owner).

Request:

```json
{
  "slug": "investio",
  "name": "Investio"
}
```

Response 201:

```json
{
  "id": "uuid",
  "slug": "investio",
  "name": "Investio",
  "createdAt": "iso"
}
```

> **Known gap:** Response currently returns only the `Tenant` object. The `membership` (role: owner) is created server-side but not returned. Frontend must call `GET /tenants/{tenantId}/members` to confirm membership. Returning `{ tenant, membership }` is tracked as a Milestone 2 improvement.

Errors:

- 409 `TENANT_SLUG_TAKEN`

### GET /tenants

List tenants the user belongs to.

Response 200:

```json
{
  "tenants": [
    {
      "id": "uuid",
      "slug": "investio",
      "name": "Investio",
      "my_role": "owner",
      "my_status": "active"
    }
  ]
}
```

### GET /tenants/{tenantId}

Response 200:

```json
{
  "id": "uuid",
  "slug": "investio",
  "name": "Investio",
  "created_at": "iso",
  "settings_json": {}
}
```

Errors:

- 404 `NOT_FOUND`
- 403 `FORBIDDEN` (not a member)

### GET /tenants/{tenantId}/members

Response 200:

```json
{
  "members": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "role": "owner",
      "status": "active",
      "joined_at": "iso"
    }
  ]
}
```

Permissions:

- member can view (MVP yes)

### PATCH /tenants/{tenantId}/members/{userId}

Update role/status (owner/mod only).

Request (any subset):

```json
{
  "role": "mod",
  "status": "active"
}
```

Response 200:

```json
{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "role": "mod",
  "status": "active"
}
```

Errors:

- 403 `FORBIDDEN`

---

## 4) Ideas

### POST /ideas (tenant-scoped via X-Tenant-Id)

Create an idea.

Request:

```json
{
  "ticker": "AAPL",
  "thesis": "text",
  "timeframe": "1-3 months",
  "invalidation": "text"
}
```

Response 201:

```json
{
  "idea": {
    "id": "uuid",
    "tenant_id": "uuid",
    "author_user_id": "uuid",
    "ticker": "AAPL",
    "thesis": "text",
    "timeframe": "1-3 months",
    "invalidation": "text",
    "status": "active",
    "created_at": "iso",
    "resolved_at": null
  }
}
```

Errors:

- 400 `VALIDATION_ERROR`
- 401 `UNAUTHENTICATED`
- 403 `FORBIDDEN` (not in tenant)

### GET /ideas (tenant-scoped)

List ideas (simple feed).

Query params (optional):

- `status=active|resolved|invalidated|expired`
- `cursor=<string>` (optional later)
- `limit=20`

Response 200:

```json
{
  "ideas": [
    {
      "id": "uuid",
      "ticker": "AAPL",
      "thesis": "text",
      "status": "active",
      "created_at": "iso",
      "author": { "user_id": "uuid", "email": "user@example.com" },
      "comment_count": 3
    }
  ],
  "next_cursor": null
}
```

### GET /ideas/{ideaId} (tenant-scoped)

Response 200:

```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "author_user_id": "uuid",
  "ticker": "AAPL",
  "thesis": "text",
  "timeframe": "1-3 months",
  "invalidation": "text",
  "status": "active",
  "created_at": "iso",
  "resolved_at": null
}
```

### PATCH /ideas/{ideaId} (tenant-scoped)

Edits idea fields; generates `idea_edits` audit rows.
Permissions: author or mod/owner (MVP decision).

Request (any subset):

```json
{
  "ticker": "AAPL",
  "thesis": "updated",
  "timeframe": "3-6 months",
  "invalidation": "updated"
}
```

Response 200:

```json
{
  "idea": { "id": "uuid", "status": "active", "thesis": "updated" }
}
```

### POST /ideas/{ideaId}/resolve (tenant-scoped)

Permissions: mod/owner.

Request:

```json
{
  "status": "resolved",
  "note": "optional string"
}
```

Response 200:

```json
{
  "idea": { "id": "uuid", "status": "resolved", "resolved_at": "iso" }
}
```

### GET /ideas/{ideaId}/edits (tenant-scoped)

Response 200:

```json
{
  "edits": [
    {
      "id": "uuid",
      "idea_id": "uuid",
      "editor_user_id": "uuid",
      "field": "thesis",
      "old_value": "old",
      "new_value": "new",
      "edited_at": "iso"
    }
  ]
}
```

---

## 5) Comments (Community)

### POST /ideas/{ideaId}/comments (tenant-scoped)

Request:

```json
{ "body": "text" }
```

Response 201:

```json
{
  "comment": {
    "id": "uuid",
    "idea_id": "uuid",
    "author_user_id": "uuid",
    "body": "text",
    "created_at": "iso"
  }
}
```

### GET /ideas/{ideaId}/comments (tenant-scoped)

Response 200:

```json
{
  "comments": [
    {
      "id": "uuid",
      "author": { "user_id": "uuid", "email": "user@example.com" },
      "body": "text",
      "created_at": "iso"
    }
  ]
}
```

---

## 6) AI Coach v0 (weekly recap)

### GET /ai/report (tenant-scoped)

Returns the most recent report for the current user.

Response 200:

```json
{
  "report": {
    "id": "uuid",
    "tenant_id": "uuid",
    "user_id": "uuid",
    "period_start": "iso",
    "period_end": "iso",
    "content": {
      "summary": "string",
      "stats": {
        "ideas_created": 3,
        "ideas_resolved": 1,
        "comments_written": 5
      }
    },
    "created_at": "iso"
  }
}
```

Errors:

- 404 `REPORT_NOT_FOUND` (if none yet)

### POST /ai/report (tenant-scoped)

Triggers generation. MVP runs synchronously; future: 202 + async worker.

Response 201:

```json
{
  "report": {
    "id": "uuid",
    "tenant_id": "uuid",
    "user_id": "uuid",
    "created_at": "iso"
  }
}
```

---

## 7) Notes for implementation (non-binding)

Swagger is auto-generated from NestJS controllers + DTOs via `@nestjs/swagger`. Available at `GET /docs`.

Frontend should treat 401 as "redirect to login" and 403 as "show not allowed".

Tenant-scoped endpoints must reject missing X-Tenant-Id with:

- 400 `TENANT_CONTEXT_REQUIRED`

End

---

## Why this format works (for 2-person startup)

- ✅ Unblocks FE/BE immediately (shapes are written down)
- ✅ You can implement endpoint-by-endpoint and keep it updated
- ✅ Swagger can "catch up" later from controller attributes
- ✅ Contract is stable even if you refactor internals

---

### Next step (fastest)

Tell me one choice so I can lock the contract fully:
**Do you want tenant context as `X-Tenant-Id` header (recommended), or in the URL path?**

If you don’t answer, no worries — the doc above already assumes `X-Tenant-Id` and you can ship with it.
