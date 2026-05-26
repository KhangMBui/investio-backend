import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { MembershipsService } from '../memberships/memberships.service';
import { MembershipStatus } from '../memberships/membership-status.enum';

@Injectable()
export class TenantMemberGuard implements CanActivate {
  constructor(private readonly membershipsService: MembershipsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId: string = request.user?.id;
    const tenantId: string = request.tenantId;

    if (!userId || !tenantId) {
      throw new ForbiddenException();
    }

    const membership = await this.membershipsService.findOne(tenantId, userId);

    if (!membership || membership.status !== MembershipStatus.active) {
      throw new ForbiddenException();
    }

    request.membership = membership;
    return true;
  }
}
