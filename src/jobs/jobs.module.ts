import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEventEntity } from './outbox/infrastructure/persistence/relational/entities/outbox-event.entity';
import { ProcessedEventEntity } from './processed-events/infrastructure/persistence/relational/entities/processed-event.entity';
import { OutboxService } from './outbox/outbox.service';
import { ProcessedEventsService } from './processed-events/processed-events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEventEntity, ProcessedEventEntity]),
  ],
  providers: [OutboxService, ProcessedEventsService],
  exports: [OutboxService, ProcessedEventsService],
})
export class JobsModule {}
