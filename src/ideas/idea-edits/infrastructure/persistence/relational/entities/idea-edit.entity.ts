import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';

@Entity({ name: 'idea_edit' })
export class IdeaEditEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Index()
  @Column({ type: 'uuid' })
  ideaId: string;

  @Column({ type: 'uuid' })
  editorUserId: string;

  @Column({ type: String })
  field: string;

  @Column({ type: 'text' })
  oldValue: string;

  @Column({ type: 'text' })
  newValue: string;

  @CreateDateColumn()
  editedAt: Date;
}
