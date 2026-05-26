# Investio MVP – Async Rules (v0)

> Purpose: define what runs async, how it is triggered, and how we keep it reliable.
> MVP goal: background work is **retryable**, **idempotent**, and does not block HTTP responses.

---

## 1) What “async” means in this project

Async work is any work that:

- may be slow (seconds+)
- may be bursty (many jobs)
- does not need to finish before returning HTTP 200/201
- should be retried safely on failure

Rule:

> HTTP APIs should stay fast; background work happens in Worker Services.

---

## 2) Async components (MVP)

- **Outbox table**: `outbox_events` (durable record of events to publish)
- **Event bus**: EventBridge (routing + scheduling)
- **Message queue**: SQS (durable job queue with retries)
- **Worker service**: ECS Fargate tasks (poll SQS / handle async jobs)
- **Idempotency table**: `processed_events` (prevent double-processing)

---

## 3) When to use which mechanism

### A) Domain events (Outbox → EventBridge)

Use for: “something happened” signals that may have multiple downstream consumers.

Examples:

- IdeaCreated
- IdeaUpdated
- IdeaResolved
- CommentCreated
- TenantCreated
- MembershipRoleChanged

Rule:

> If the event is caused by a DB write and must not be lost, write it to `outbox_events` in the same DB transaction.

### B) Jobs (SQS → Worker)

Use for: “do this work” tasks that should be processed reliably.

Examples:

- GenerateWeeklyRecap(tenantId, userId, period)
- SendNotification(type, target)
- AnalyticsRollup(tenantId, window)

Rule:

> If the work might take time or needs retries, it must be a job in SQS.

### C) Schedules (EventBridge schedule → enqueue jobs)

Use for: periodic triggers.

Examples:

- Weekly recap schedule
- Daily cleanup (optional)

Rule:

> Schedules should enqueue jobs (SQS), not directly run heavy work.

---

## 4) Reliability model (MVP guarantees)

### At-least-once delivery

- SQS delivers messages **at least once**
- Workers must assume duplicates can happen

Therefore:

> Every job handler must be idempotent.

### Failure + retry

- If a worker crashes or times out before ack/delete:
  - the message becomes visible again and retries

### Dead-letter queue (DLQ)

MVP recommendation:

- Configure an SQS DLQ
- After N failed attempts (e.g., 5), message moves to DLQ for inspection

---

## 5) Idempotency rules (processed_events)

### Goal

Prevent duplicate processing, especially for:

- sending emails/notifications
- generating the same report twice
- emitting repeated side effects

### Pattern

Before processing a message/event:

1. Check `processed_events` for `event_id` (or `job_id`)
2. If exists → skip (already processed)
3. If not → process and insert row into `processed_events`

Implementation notes:

- Use a unique constraint on `processed_events.event_id`
- Insert should be atomic (UPSERT / “insert-if-not-exists”)

---

## 6) Outbox publishing rules

### When writing domain changes

In the same DB transaction as the business write:

- Insert into `outbox_events`:
  - id (uuid)
  - tenant_id (nullable if global)
  - event_type
  - payload_json
  - occurred_at
  - published_at = null

### Publisher behavior (worker responsibility)

- Periodically query `outbox_events` where `published_at IS NULL`
- Publish to EventBridge (or SQS depending on routing)
- Set `published_at = now()` after successful publish

Rule:

> Never mark an outbox event as published until publish succeeds.

---

## 7) What runs async in MVP (explicit list)

### AI Coach v0

- Weekly recap generation (template + stats)
  - Trigger: EventBridge schedule (weekly) → SQS jobs
  - Worker: computes stats from RDS and writes `ai_reports` (+ `reflection_prompts`)

### Notifications (optional MVP)

- Trigger: IdeaResolved / CommentCreated events
- Worker: dedupe + deliver (email/in-app later)

### Analytics rollups (optional MVP)

- Trigger: events or daily schedule
- Worker: compute counts and store (future)

---

## 8) Tenant scoping & security in async

Rules:

- Any job/event payload that is tenant-scoped must include `tenant_id`
- Worker must enforce tenant scoping on all DB queries:
  - `WHERE tenant_id = payload.tenant_id`
- Never process cross-tenant data in a single job unless it is explicitly global

---

## 9) Naming conventions (MVP)

### Event types (domain events)

Use PascalCase strings:

- `IdeaCreated`
- `IdeaUpdated`
- `IdeaResolved`
- `CommentCreated`
- `TenantCreated`
- `MembershipUpdated`

### Job types (queue tasks)

Use verb-ish names:

- `GenerateWeeklyRecap`
- `SendNotification`
- `RebuildStats`

---

## 10) Operational notes (MVP)

Minimal visibility:

- Worker logs must include:
  - job_id/event_id
  - tenant_id (if any)
  - user_id (if any)
  - attempt number (if available)

DLQ policy:

- If DLQ grows, prioritize fixing handlers before adding features.

---

_End_
