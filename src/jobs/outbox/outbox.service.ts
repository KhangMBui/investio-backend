import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { OutboxEventEntity } from './infrastructure/persistence/relational/entities/outbox-event.entity';

@Injectable()
export class OutboxService {
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly repo: Repository<OutboxEventEntity>,
  ) {}

  async publish(
    eventType: string,
    payloadJson: Record<string, unknown>,
    tenantId?: string,
  ): Promise<OutboxEventEntity> {
    const entity = this.repo.create({
      eventType,
      payloadJson,
      tenantId: tenantId ?? null,
      publishedAt: null,
    });
    return this.repo.save(entity);
  }

  async getPending(): Promise<OutboxEventEntity[]> {
    return this.repo.find({
      where: { publishedAt: IsNull() },
      order: { occurredAt: 'ASC' },
      take: 100,
    });
  }

  async markPublished(id: string): Promise<void> {
    await this.repo.update(id, { publishedAt: new Date() });
  }
}
