import { MigrationInterface, QueryRunner } from 'typeorm';

export class InvestioSchema1748200000000 implements MigrationInterface {
  name = 'InvestioSchema1748200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old boilerplate tables if they exist
    await queryRunner.query(`DROP TABLE IF EXISTS "session" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "file" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "status" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role" CASCADE`);

    // users
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);

    // sessions
    await queryRunner.query(`
      CREATE TABLE "session" (
        "id" SERIAL NOT NULL,
        "hash" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "userId" uuid,
        CONSTRAINT "PK_session" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_session_userId" ON "session" ("userId")
    `);
    await queryRunner.query(`
      ALTER TABLE "session"
        ADD CONSTRAINT "FK_session_user"
        FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    // tenants
    await queryRunner.query(`
      CREATE TABLE "tenant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying NOT NULL,
        "name" character varying NOT NULL,
        "settingsJson" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenant_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tenant" PRIMARY KEY ("id")
      )
    `);

    // memberships
    await queryRunner.query(`
      CREATE TYPE "membership_role_enum" AS ENUM ('owner', 'mod', 'member')
    `);
    await queryRunner.query(`
      CREATE TYPE "membership_status_enum" AS ENUM ('active', 'invited', 'banned')
    `);
    await queryRunner.query(`
      CREATE TABLE "membership" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" "membership_role_enum" NOT NULL,
        "status" "membership_status_enum" NOT NULL DEFAULT 'active',
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_membership_tenant_user" UNIQUE ("tenantId", "userId"),
        CONSTRAINT "PK_membership" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_membership_tenantId" ON "membership" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_membership_userId" ON "membership" ("userId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "membership"
        ADD CONSTRAINT "FK_membership_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_membership_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    // ideas
    await queryRunner.query(`
      CREATE TYPE "idea_status_enum" AS ENUM ('active', 'resolved', 'invalidated', 'expired')
    `);
    await queryRunner.query(`
      CREATE TABLE "idea" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "authorUserId" uuid NOT NULL,
        "ticker" character varying,
        "thesis" text NOT NULL,
        "timeframe" character varying NOT NULL,
        "invalidation" text NOT NULL,
        "status" "idea_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "resolvedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_idea" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_idea_tenantId" ON "idea" ("tenantId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "idea"
        ADD CONSTRAINT "FK_idea_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE,
        ADD CONSTRAINT "FK_idea_author" FOREIGN KEY ("authorUserId") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    // idea_edits
    await queryRunner.query(`
      CREATE TABLE "idea_edit" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "ideaId" uuid NOT NULL,
        "editorUserId" uuid NOT NULL,
        "field" character varying NOT NULL,
        "oldValue" text NOT NULL,
        "newValue" text NOT NULL,
        "editedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_idea_edit" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_idea_edit_tenantId" ON "idea_edit" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_idea_edit_ideaId" ON "idea_edit" ("ideaId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "idea_edit"
        ADD CONSTRAINT "FK_idea_edit_idea" FOREIGN KEY ("ideaId") REFERENCES "idea"("id") ON DELETE CASCADE
    `);

    // comments
    await queryRunner.query(`
      CREATE TABLE "comment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "ideaId" uuid NOT NULL,
        "authorUserId" uuid NOT NULL,
        "body" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comment" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_tenantId" ON "comment" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_ideaId" ON "comment" ("ideaId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "comment"
        ADD CONSTRAINT "FK_comment_idea" FOREIGN KEY ("ideaId") REFERENCES "idea"("id") ON DELETE CASCADE
    `);

    // ai_reports
    await queryRunner.query(`
      CREATE TABLE "ai_report" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "periodStart" TIMESTAMP WITH TIME ZONE NOT NULL,
        "periodEnd" TIMESTAMP WITH TIME ZONE NOT NULL,
        "content" jsonb NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_report" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_report_tenantId" ON "ai_report" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_report_userId" ON "ai_report" ("userId")`,
    );

    // reflection_prompts
    await queryRunner.query(`
      CREATE TABLE "reflection_prompt" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "reportId" uuid NOT NULL,
        "prompt" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reflection_prompt" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_reflection_prompt_tenantId" ON "reflection_prompt" ("tenantId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reflection_prompt_userId" ON "reflection_prompt" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reflection_prompt_reportId" ON "reflection_prompt" ("reportId")`,
    );
    await queryRunner.query(`
      ALTER TABLE "reflection_prompt"
        ADD CONSTRAINT "FK_reflection_prompt_report" FOREIGN KEY ("reportId") REFERENCES "ai_report"("id") ON DELETE CASCADE
    `);

    // outbox_events
    await queryRunner.query(`
      CREATE TABLE "outbox_event" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenantId" uuid,
        "eventType" character varying NOT NULL,
        "payloadJson" jsonb NOT NULL,
        "occurredAt" TIMESTAMP NOT NULL DEFAULT now(),
        "publishedAt" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_outbox_event" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_outbox_event_publishedAt" ON "outbox_event" ("publishedAt")`,
    );

    // processed_events
    await queryRunner.query(`
      CREATE TABLE "processed_event" (
        "eventId" uuid NOT NULL,
        "processedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_processed_event" PRIMARY KEY ("eventId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "processed_event"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "outbox_event"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reflection_prompt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_report"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "idea_edit"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "idea"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "idea_status_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "membership"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "membership_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "membership_role_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tenant"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
  }
}
