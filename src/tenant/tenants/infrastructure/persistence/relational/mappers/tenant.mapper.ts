import { Tenant } from '../../../../domain/tenant';
import { TenantEntity } from '../entities/tenant.entity';

export class TenantMapper {
  static toDomain(raw: TenantEntity): Tenant {
    const domain = new Tenant();
    domain.id = raw.id;
    domain.slug = raw.slug;
    domain.name = raw.name;
    domain.settingsJson = raw.settingsJson;
    domain.createdAt = raw.createdAt;
    return domain;
  }

  static toPersistence(domain: Tenant): TenantEntity {
    const entity = new TenantEntity();
    if (domain.id) entity.id = domain.id;
    entity.slug = domain.slug;
    entity.name = domain.name;
    entity.settingsJson = domain.settingsJson ?? null;
    return entity;
  }
}
