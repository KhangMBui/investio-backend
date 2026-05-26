import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';

@Entity({ name: 'outbox_event' })
export class OutboxEventEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  tenantId: string | null;

  @Column({ type: String })
  eventType: string;

  @Column({ type: 'jsonb' })
  payloadJson: Record<string, unknown>;

  @CreateDateColumn()
  occurredAt: Date;

  @Index()
  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;
}
