import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipEntity } from './infrastructure/persistence/relational/entities/membership.entity';
import { MembershipMapper } from './infrastructure/persistence/relational/mappers/membership.mapper';
import { Membership } from './domain/membership';
import { MembershipRole } from './membership-role.enum';
import { MembershipStatus } from './membership-status.enum';
import { NullableType } from '../../utils/types/nullable.type';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(MembershipEntity)
    private readonly repo: Repository<MembershipEntity>,
  ) {}

  async findOne(
    tenantId: string,
    userId: string,
  ): Promise<NullableType<Membership>> {
    const entity = await this.repo.findOne({ where: { tenantId, userId } });
    return entity ? MembershipMapper.toDomain(entity) : null;
  }

  async findByTenant(tenantId: string): Promise<Membership[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(MembershipMapper.toDomain);
  }

  async create(data: {
    tenantId: string;
    userId: string;
    role: MembershipRole;
    status?: MembershipStatus;
  }): Promise<Membership> {
    const entity = this.repo.create({
      tenantId: data.tenantId,
      userId: data.userId,
      role: data.role,
      status: data.status ?? MembershipStatus.active,
    });
    const saved = await this.repo.save(entity);
    return MembershipMapper.toDomain(saved);
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    status: MembershipStatus,
  ): Promise<void> {
    await this.repo.update({ tenantId, userId }, { status });
  }

  async remove(tenantId: string, userId: string): Promise<void> {
    await this.repo.delete({ tenantId, userId });
  }
}
