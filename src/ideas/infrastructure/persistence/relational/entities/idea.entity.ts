import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IdeaStatus } from '../../../../idea-status.enum';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({ name: 'idea' })
export class IdeaEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  authorUserId: string;

  @Column({ type: String, nullable: true })
  ticker: string | null;

  @Column({ type: 'text' })
  thesis: string;

  @Column({ type: String })
  timeframe: string;

  @Column({ type: 'text' })
  invalidation: string;

  @Column({ type: 'enum', enum: IdeaStatus, default: IdeaStatus.active })
  status: IdeaStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;
}
