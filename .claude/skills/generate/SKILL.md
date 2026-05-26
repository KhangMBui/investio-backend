---
name: generate
description: Add entities/schemas and properties to existing entities via this project's CLI generators (npm run generate:resource:*, npm run add:property:to-*). Use when adding a new entity, a new schema, or a new property to an existing entity/schema in this NestJS boilerplate.
---

# Generate Entities and Properties

## Detect the database variant

**This project uses PostgreSQL/TypeORM only.** Always use `{db}` = `relational`, regardless of which scripts exist in `package.json`. The `all-db` and `document` scripts are present but unused — do not run them.

## Add an entity/schema

**Rules:**
- **Never generate `User` or `File` entities** — they already exist. You can reference them in relationships.
- Entity names must be PascalCase and singular (e.g., `Post`, `Category`, `BlogComment`).

**Command:**

```bash
npm run generate:resource:{db} -- --name {EntityName}
```

`{db}` comes from the detection section above.

Run sequentially, one entity at a time.

## Add a property to an entity/schema

**Rules:**
- **Never add `id`, `createdAt`, or `updatedAt`** — these are predefined for all entities.
- Property names must be camelCase (e.g., `firstName`, `isActive`).

**Property kinds:**
- `primitive` — basic types: `string`, `number`, `boolean`, `Date`
- `reference` — relationship to another entity
- `denormalized` — denormalized copy of another entity's data (stored inline instead of referenced)

**Relationship rules:**
- When creating a property with `referenceType: "oneToMany"`, **do NOT** create the corresponding `manyToOne` in the referenced entity — the generator creates it automatically.
- **Do NOT create `oneToMany`** if the `propertyInReference` could have many items. Instead, create a `manyToOne` on the child entity only.
- For **File** relations, use only `oneToOne` or `manyToMany`.
- `propertyInReference` is only required when `referenceType` is `oneToMany`.

**Command:**

```bash
npm run add:property:to-{db} -- --name {EntityName} --property {propertyName} --kind {kind} --type {type} --referenceType {referenceType} --propertyInReference {propertyInReference} --isAddToDto {isAddToDto} --isOptional {isOptional} --isNullable {isNullable} --shouldAutoLoad {shouldAutoLoad}
```

**Argument rules:**
- `--name` (required): Entity name, PascalCase
- `--property` (required): Property name, camelCase
- `--kind` (required): `primitive` | `reference` | `denormalized`
- `--type` (required): For primitive: `string` | `number` | `boolean` | `Date`. For reference/denormalized: the referenced entity name (e.g., `User`, `File`, `Category`)
- `--referenceType`: Only for reference/denormalized kind. Values: `oneToOne` | `oneToMany` | `manyToOne` | `manyToMany`
- `--propertyInReference`: Only when `referenceType` is `oneToMany`. The property name on the referenced entity.
- `--isAddToDto`: `true` | `false` — whether the property can be set via HTTP request
- `--isOptional`: `true` | `false`
- `--isNullable`: `true` | `false` — only meaningful when `isOptional` is `true`
- `--shouldAutoLoad`: `true` (default) | `false`. Only meaningful for `kind=reference`. `true` emits `eager: true` (TypeORM) and `autopopulate: true` (Mongoose). `false` stores only the related entity's id (Mongoose: `string` field + ObjectId; TypeORM: `eager: false`). No effect for `primitive`/`denormalized`.

**Omit arguments that don't apply** (e.g., omit `--referenceType` for primitive properties, omit `--propertyInReference` unless `referenceType` is `oneToMany`).

Run sequentially, one property at a time.

---

## Post-generation: wire tenant context (tenant-scoped resources only)

The generator produces a minimal controller and module. For any resource that belongs to a tenant (ideas, comments, AI reports, etc.), apply these manual changes after generation:

### Controller

Replace the generated guard and add the tenant header and decorators:

```typescript
// Replace:
@UseGuards(AuthGuard('jwt'))

// With:
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(AuthGuard('jwt'), TenantContextGuard, TenantMemberGuard)
```

Add imports:
```typescript
import { TenantContextGuard } from '../tenant/guards/tenant-context.guard';
import { TenantMemberGuard } from '../tenant/guards/tenant-member.guard';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
```

Add `@TenantContext() tenantId: string` and `@CurrentUser() user: JwtPayloadType` parameters to handler methods that need them.

### Module

Import `MembershipsModule` so `TenantMemberGuard` can inject `MembershipsService`:

```typescript
import { MembershipsModule } from '../tenant/memberships/memberships.module';

@Module({
  imports: [
    RelationalExamplePersistenceModule,
    MembershipsModule,   // add this
  ],
  ...
})
```

### Entity

Add `tenantId` as a plain string column (not a FK — Investio denormalizes it):

```typescript
@Column({ type: String })
tenantId: string;
```

### Service

Prefix all tenant-scoped methods with `tenantId: string` as the first argument and filter all queries by it.
