import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from './infrastructure/persistence/relational/entities/tenant.entity';
import { TenantMapper } from './infrastructure/persistence/relational/mappers/tenant.mapper';
import { Tenant } from './domain/tenant';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { MembershipsService } from '../memberships/memberships.service';
import { MembershipRole } from '../memberships/membership-role.enum';
import { NullableType } from '../../utils/types/nullable.type';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly repo: Repository<TenantEntity>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async create(dto: CreateTenantDto, ownerUserId: string): Promise<Tenant> {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Tenant slug already taken');
    }

    const entity = this.repo.create({
      slug: dto.slug,
      name: dto.name,
      settingsJson: dto.settingsJson ?? null,
    });
    const saved = await this.repo.save(entity);

    await this.membershipsService.create({
      tenantId: saved.id,
      userId: ownerUserId,
      role: MembershipRole.owner,
    });

    return TenantMapper.toDomain(saved);
  }

  async findAll(): Promise<Tenant[]> {
    const entities = await this.repo.find({ order: { createdAt: 'DESC' } });
    return entities.map(TenantMapper.toDomain);
  }

  async findById(id: string): Promise<NullableType<Tenant>> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? TenantMapper.toDomain(entity) : null;
  }

  async findByIdOrFail(id: string): Promise<Tenant> {
    const tenant = await this.findById(id);
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }
}
