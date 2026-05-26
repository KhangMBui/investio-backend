import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { TenantEntity } from '../../../../../tenants/infrastructure/persistence/relational/entities/tenant.entity';
import { UserEntity } from '../../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { MembershipRole } from '../../../../membership-role.enum';
import { MembershipStatus } from '../../../../membership-status.enum';
import { EntityRelationalHelper } from '../../../../../../utils/relational-entity-helper';

@Entity({ name: 'membership' })
@Unique(['tenantId', 'userId'])
export class MembershipEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: MembershipRole })
  role: MembershipRole;

  @Column({
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.active,
  })
  status: MembershipStatus;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => TenantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: TenantEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
