import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiReportEntity } from './ai-reports/infrastructure/persistence/relational/entities/ai-report.entity';
import { ReflectionPromptEntity } from './reflection-prompts/infrastructure/persistence/relational/entities/reflection-prompt.entity';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { MembershipsModule } from '../tenant/memberships/memberships.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiReportEntity, ReflectionPromptEntity]),
    MembershipsModule,
  ],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
