import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRole1779779674643 implements MigrationInterface {
  name = 'AddUserRole1779779674643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "idea" DROP CONSTRAINT "FK_idea_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "idea" DROP CONSTRAINT "FK_idea_author"`,
    );
    await queryRunner.query(
      `ALTER TABLE "idea_edit" DROP CONSTRAINT "FK_idea_edit_idea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_session_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_membership_tenant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_membership_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reflection_prompt" DROP CONSTRAINT "FK_reflection_prompt_report"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" DROP CONSTRAINT "FK_comment_idea"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_idea_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_idea_edit_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_idea_edit_ideaId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_session_userId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_outbox_event_publishedAt"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_membership_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_membership_userId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_reflection_prompt_tenantId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_reflection_prompt_userId"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_reflection_prompt_reportId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_comment_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_comment_ideaId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ai_report_tenantId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ai_report_userId"`);
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "UQ_membership_tenant_user"`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'user'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5ec7cecb89cf3764588425a7fc" ON "idea" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_524e08d67f23674959e74c6497" ON "idea_edit" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ecf6cfe2b635d9f77cf704f321" ON "idea_edit" ("ideaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a337823e5d2d8608a19bd73053" ON "outbox_event" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_887207ad6fa078ba020fa4bec9" ON "outbox_event" ("publishedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7af8171eb65349ad5035d10956" ON "membership" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_eef2d9d9c70cd13bed868afedf" ON "membership" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe50104896822b39fd02e88d79" ON "reflection_prompt" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c18935e650cc6e49bb4939fec6" ON "reflection_prompt" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4cb3701080ac9834deac4983d9" ON "reflection_prompt" ("reportId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8f58834bed39f0f9e85f048eaf" ON "comment" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_861b419cce1c9ae64295300d6b" ON "comment" ("ideaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55a35a77bc313675fdbc981208" ON "ai_report" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04f7b86d4e73186aef3a360ad4" ON "ai_report" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "UQ_623c6d41da24d2bd67462292940" UNIQUE ("tenantId", "userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_7af8171eb65349ad5035d109562" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "FK_7af8171eb65349ad5035d109562"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" DROP CONSTRAINT "UQ_623c6d41da24d2bd67462292940"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_04f7b86d4e73186aef3a360ad4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55a35a77bc313675fdbc981208"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_861b419cce1c9ae64295300d6b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8f58834bed39f0f9e85f048eaf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4cb3701080ac9834deac4983d9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c18935e650cc6e49bb4939fec6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe50104896822b39fd02e88d79"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_eef2d9d9c70cd13bed868afedf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7af8171eb65349ad5035d10956"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_887207ad6fa078ba020fa4bec9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a337823e5d2d8608a19bd73053"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ecf6cfe2b635d9f77cf704f321"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_524e08d67f23674959e74c6497"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5ec7cecb89cf3764588425a7fc"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "UQ_membership_tenant_user" UNIQUE ("tenantId", "userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_report_userId" ON "ai_report" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_report_tenantId" ON "ai_report" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_ideaId" ON "comment" ("ideaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comment_tenantId" ON "comment" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reflection_prompt_reportId" ON "reflection_prompt" ("reportId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reflection_prompt_userId" ON "reflection_prompt" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_reflection_prompt_tenantId" ON "reflection_prompt" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_membership_userId" ON "membership" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_membership_tenantId" ON "membership" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_outbox_event_publishedAt" ON "outbox_event" ("publishedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_session_userId" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_idea_edit_ideaId" ON "idea_edit" ("ideaId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_idea_edit_tenantId" ON "idea_edit" ("tenantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_idea_tenantId" ON "idea" ("tenantId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comment" ADD CONSTRAINT "FK_comment_idea" FOREIGN KEY ("ideaId") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reflection_prompt" ADD CONSTRAINT "FK_reflection_prompt_report" FOREIGN KEY ("reportId") REFERENCES "ai_report"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_membership_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "membership" ADD CONSTRAINT "FK_membership_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_session_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "idea_edit" ADD CONSTRAINT "FK_idea_edit_idea" FOREIGN KEY ("ideaId") REFERENCES "idea"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "idea" ADD CONSTRAINT "FK_idea_author" FOREIGN KEY ("authorUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "idea" ADD CONSTRAINT "FK_idea_tenant" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
