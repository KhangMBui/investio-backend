import { Membership } from '../../../../domain/membership';
import { MembershipEntity } from '../entities/membership.entity';

export class MembershipMapper {
  static toDomain(raw: MembershipEntity): Membership {
    const domain = new Membership();
    domain.id = raw.id;
    domain.tenantId = raw.tenantId;
    domain.userId = raw.userId;
    domain.role = raw.role;
    domain.status = raw.status;
    domain.joinedAt = raw.joinedAt;
    return domain;
  }

  static toPersistence(domain: Membership): MembershipEntity {
    const entity = new MembershipEntity();
    if (domain.id) entity.id = domain.id;
    entity.tenantId = domain.tenantId;
    entity.userId = domain.userId;
    entity.role = domain.role;
    entity.status = domain.status;
    return entity;
  }
}
