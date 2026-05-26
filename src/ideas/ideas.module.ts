import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdeaEntity } from './infrastructure/persistence/relational/entities/idea.entity';
import { IdeaEditEntity } from './idea-edits/infrastructure/persistence/relational/entities/idea-edit.entity';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { MembershipsModule } from '../tenant/memberships/memberships.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IdeaEntity, IdeaEditEntity]),
    MembershipsModule,
  ],
  controllers: [IdeasController],
  providers: [IdeasService],
  exports: [IdeasService],
})
export class IdeasModule {}
