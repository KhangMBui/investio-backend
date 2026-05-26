import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MembershipRole } from '../memberships/membership-role.enum';
import { Membership } from '../memberships/domain/membership';

export const TENANT_ROLES_KEY = 'tenantRoles';
export const TenantRoles = (...roles: MembershipRole[]) =>
  SetMetadata(TENANT_ROLES_KEY, roles);

@Injectable()
export class TenantRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(
      TENANT_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership: Membership = request.membership;

    if (!membership || !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
