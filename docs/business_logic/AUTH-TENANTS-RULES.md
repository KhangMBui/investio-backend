# Investio MVP – Auth + Tenant Rules (v0)

> Goal: one source of truth so frontend + backend make the same decisions.
> This is intentionally small and should be updated when rules change.

---

## 1) Authentication model

### Identity scope

- **Users are global** (not tenant-scoped).
- A user can belong to **0..N tenants** via `memberships`.

### Auth mechanism (MVP)

- Auth is based on an **access token** issued at login/register.
- Recommended transport/storage:
  - **HTTP-only Secure cookie** (preferred for web + SSR)
  - (If using Bearer headers temporarily in dev, do not store token in localStorage for prod.)

### Token claims (minimum)

- `id`: user_id (uuid) — NestJS implementation uses `id`, not the JWT standard `sub`
- `role`: platform role (`user` | `admin`)
- `sessionId`: server-side session UUID (enables server-side revocation)
- `exp`: expiry
- Do **not** store secrets/PII in token payload.

### Auth states

- **Unauthenticated**: no token/invalid token → `401 UNAUTHENTICATED`
- **Authenticated**: token valid → request has `CurrentUser`

---

## 2) Tenant resolution (how API knows “which tenant”)

### Tenant-scoped vs global endpoints

- **Global endpoints** do not require a tenant (e.g. `/auth/*`, `/me`, list user’s tenants).
- **Tenant-scoped endpoints** require a tenant context (Ideas, Comments, Members, AI reports).

### MVP tenant context rule

Tenant context is provided by:

- Header: `X-Tenant-Id: <tenant_uuid>`

If missing on a tenant-scoped endpoint:

- Return `400 TENANT_CONTEXT_REQUIRED`

If tenant_id is invalid UUID:

- Return `400 VALIDATION_ERROR`

### Membership requirement

For any tenant-scoped endpoint:

- User must have a `memberships` row where:
  - `tenant_id = X-Tenant-Id`
  - `user_id = CurrentUser.id`
  - `status = active`
- Otherwise:
  - `403 FORBIDDEN` (not a member / not active)

> Note: `invited` and `banned` are treated as **not allowed** for tenant data access in MVP.

---

## 3) Roles & authorization rules

### Roles

- `owner`
- `mod`
- `member`

### Default permissions (MVP)

| Action                        | member |          mod | owner |
| ----------------------------- | -----: | -----------: | ----: |
| View tenant info              |     ✅ |           ✅ |    ✅ |
| View members list             |     ✅ |           ✅ |    ✅ |
| Create idea                   |     ✅ |           ✅ |    ✅ |
| Edit own idea                 |     ✅ |           ✅ |    ✅ |
| Edit others’ ideas            |     ❌ |           ✅ |    ✅ |
| Resolve/Invalidate ideas      |     ❌ |           ✅ |    ✅ |
| Comment on ideas              |     ✅ |           ✅ |    ✅ |
| Delete others’ comments       |     ❌ |           ✅ |    ✅ |
| Change member role/status     |     ❌ | ✅ (limited) |    ✅ |
| Delete tenant / dangerous ops |     ❌ |           ❌ |    ✅ |

### “Mod limited” clarification (MVP)

Mods can:

- promote/demote `member` ↔ `mod` (optional decision)
- change status `active` ↔ `banned` for members (optional)
  Mods cannot:
- change owner
- ban owner
- remove ownership

(If you want simplest MVP: only **owner** can change roles/status.)

---

## 4) Ownership & special constraints

### Tenant creation

- The user who creates the tenant becomes:
  - `memberships.role = owner`
  - `memberships.status = active`

### Owner invariants (recommended)

- A tenant must always have **at least 1 active owner**.
- Requests that would leave the tenant with zero owners must fail with:
  - `409 CONFLICT` / `CANNOT_REMOVE_LAST_OWNER`

### Self-actions

- A user cannot ban themselves if they are the last owner.
- A user cannot change their own role if they are the last owner.

---

## 5) Data access rules (must hold everywhere)

### Tenant isolation rule

All tenant-scoped reads/writes MUST include `tenant_id = X-Tenant-Id` at the DB query level.

### Cross-tenant protection

- Never accept `tenant_id` from the client body for tenant-scoped resources.
- Server derives tenant_id from `X-Tenant-Id` only.
- When referencing resource IDs (ideaId/commentId), server must verify:
  - resource.tenant_id == current tenant_id
  - else `404 NOT_FOUND` (recommended) or `403 FORBIDDEN` (choose one)

**MVP recommendation:** return `404 NOT_FOUND` to avoid tenant existence leakage.

---

## 6) Endpoint classification (quick checklist)

### Global endpoints (no tenant context)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout` (optional)
- `GET /me`
- `GET /tenants` (list my tenants)
- `POST /tenants` (create tenant)

### Tenant-scoped endpoints (require X-Tenant-Id + active membership)

- Ideas: `POST/GET/PATCH /ideas`, `/ideas/{id}/*`
- Comments: `/ideas/{id}/comments`
- Members: `/tenants/{tenantId}/members*` (or tenant-scoped equivalents)
- AI: `/ai/reports/*`

---

## 7) Implementation notes (non-binding but recommended)

### Middleware / filters

- **Auth middleware**: sets `CurrentUser` or returns 401
- **Tenant middleware** (for tenant-scoped routes): validates header, loads membership, sets:
  - `TenantContext { tenant_id, role, membership_status }`

### Logging

Include in logs (where possible):

- `user_id`
- `tenant_id` (if tenant-scoped)
- `request_id` (correlation ID)

---

## 8) Error codes (canonical)

- `UNAUTHENTICATED` (401)
- `TENANT_CONTEXT_REQUIRED` (400)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `TENANT_SLUG_TAKEN` (409)
- `EMAIL_ALREADY_EXISTS` (409)
- `CANNOT_REMOVE_LAST_OWNER` (409)

---

_End_
