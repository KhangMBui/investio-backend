import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiReportEntity } from './ai-reports/infrastructure/persistence/relational/entities/ai-report.entity';
import { ReflectionPromptEntity } from './reflection-prompts/infrastructure/persistence/relational/entities/reflection-prompt.entity';
import { AiReport } from './ai-reports/domain/ai-report';
import { ReflectionPrompt } from './reflection-prompts/domain/reflection-prompt';

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(AiReportEntity)
    private readonly reportRepo: Repository<AiReportEntity>,
    @InjectRepository(ReflectionPromptEntity)
    private readonly promptRepo: Repository<ReflectionPromptEntity>,
  ) {}

  async getLatestReport(
    tenantId: string,
    userId: string,
  ): Promise<AiReport | null> {
    const entity = await this.reportRepo.findOne({
      where: { tenantId, userId },
      order: { createdAt: 'DESC' },
    });
    return entity ? this.toReport(entity) : null;
  }

  async generateReport(tenantId: string, userId: string): Promise<AiReport> {
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(now.getDate() - 7);

    const content = {
      summary: 'Weekly recap generated',
      generatedAt: now.toISOString(),
    };

    const entity = this.reportRepo.create({
      tenantId,
      userId,
      periodStart,
      periodEnd: now,
      content,
    });
    const saved = await this.reportRepo.save(entity);

    await this.promptRepo.save(
      this.promptRepo.create({
        tenantId,
        userId,
        reportId: saved.id,
        prompt: 'What went well in your investments this week?',
      }),
    );

    return this.toReport(saved);
  }

  async getPrompts(
    tenantId: string,
    userId: string,
    reportId: string,
  ): Promise<ReflectionPrompt[]> {
    const entities = await this.promptRepo.find({
      where: { tenantId, userId, reportId },
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => this.toPrompt(e));
  }

  private toReport(e: AiReportEntity): AiReport {
    const d = new AiReport();
    d.id = e.id;
    d.tenantId = e.tenantId;
    d.userId = e.userId;
    d.periodStart = e.periodStart;
    d.periodEnd = e.periodEnd;
    d.content = e.content;
    d.createdAt = e.createdAt;
    return d;
  }

  private toPrompt(e: ReflectionPromptEntity): ReflectionPrompt {
    const d = new ReflectionPrompt();
    d.id = e.id;
    d.tenantId = e.tenantId;
    d.userId = e.userId;
    d.reportId = e.reportId;
    d.prompt = e.prompt;
    d.createdAt = e.createdAt;
    return d;
  }
}
