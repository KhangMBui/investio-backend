import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedEventEntity } from './infrastructure/persistence/relational/entities/processed-event.entity';

@Injectable()
export class ProcessedEventsService {
  constructor(
    @InjectRepository(ProcessedEventEntity)
    private readonly repo: Repository<ProcessedEventEntity>,
  ) {}

  async isProcessed(eventId: string): Promise<boolean> {
    const count = await this.repo.count({ where: { eventId } });
    return count > 0;
  }

  async markProcessed(eventId: string): Promise<void> {
    const entity = this.repo.create({
      eventId,
      processedAt: new Date(),
    });
    await this.repo.save(entity);
  }
}
