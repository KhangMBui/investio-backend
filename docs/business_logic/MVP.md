# Investio MVP – Design Overview

> This document captures the **minimum shared understanding** needed to build the Investio MVP without rework.
> It is intentionally lightweight and will evolve as the product evolves.

---

## 1. What users can do (MVP scope)

In the MVP, users can:

- Sign up and log in with a global account
- Create or join a tenant (organization)
- Have a role within a tenant (owner / mod / member)
- Create ideas within a tenant
- Edit ideas, with a full edit history (audit trail)
- Comment on ideas
- Resolve or invalidate ideas (role-based)
- Receive a **weekly AI recap v0** (template + stats, no advanced LLM reasoning)

---

## 2. Explicitly out of scope (for MVP)

We are **not** building the following in MVP:

- Real-time collaboration (presence, live cursors, etc.)
- Advanced AI reasoning, embeddings, or multi-agent workflows
- Cross-tenant sharing of ideas
- Notifications beyond basic async delivery
- Fine-grained permissions beyond role-based access
- Public APIs or third-party integrations
- Multi-region deployments or advanced scaling strategies

---

## 3. High-level architecture

The MVP follows a **modular monolith** architecture with clear boundaries and async processing.

**Key principles:**

- HTTP-facing services are synchronous and fast
- Long-running or non-critical work is async
- One shared Postgres database (schemas per module)
- Clear separation between API services and workers

📌 **Architecture diagram:**  
[Investio ER diagram]
(designs/ArchDiagramInvestio.drawio.png)

**Core components:**

- **Next.js Web (UI + SSR)** for frontend
- **NestJS modular monolith** running on ECS Fargate
- **Worker service** (ECS Fargate) for async jobs
- **RDS Postgres**, **S3**
- **EventBridge + SQS** for async messaging

---

## 4. Data model summary

The MVP uses a **shared Postgres database** with logical ownership per module.

**Global identity**

- `users`

**Tenant & access**

- `tenants`
- `memberships` (user ↔ tenant + role)

**Ideas & collaboration**

- `ideas`
- `idea_edits` (audit trail)
- `comments`

**AI outputs**

- `ai_reports`
- `reflection_prompts`

**Async reliability**

- `outbox_events`
- `processed_events`

All tenant-scoped tables include `tenant_id`.

📌 **ER diagram:**  
[Investio ER diagram](designs/ERDiagramInvestio.png)

---

## 5. Async jobs & background processing

The system uses **async processing** for work that:

- is slow or bursty
- does not need to finish before returning HTTP 200
- must be reliable and retryable

**Pattern:**

- API writes domain events to `outbox_events` in the same DB transaction
- Worker publishes events via EventBridge and processes jobs via SQS
- Worker uses `processed_events` to ensure idempotency

**Examples:**

- Weekly AI recap generation
- Notifications
- Analytics rollups

The worker is **not** behind the load balancer and scales independently.

---

## 6. Authentication & multi-tenancy

**Authentication**

- Users authenticate globally (identity is not tenant-scoped)
- Auth tokens identify the user

**Tenant resolution**

- Every request resolves a `tenant_id`
- Tenant access is validated via `memberships`

**Authorization**

- Role-based access: owner / mod / member
- Authorization is enforced at the API layer
- All data access is tenant-scoped by default

**Key rule:**

> No cross-tenant data access is allowed at any layer.

---

## 7. Architectural intent

This MVP intentionally uses a **modular monolith** to:

- move fast with a small team
- keep transactions simple
- avoid premature distributed complexity

Clear module boundaries, async events, and schema
