import { Column, Entity, PrimaryColumn } from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';

@Entity({ name: 'processed_event' })
export class ProcessedEventEntity extends EntityRelationalHelper {
  @PrimaryColumn({ type: 'uuid' })
  eventId: string;

  @Column({ type: 'timestamptz' })
  processedAt: Date;
}
