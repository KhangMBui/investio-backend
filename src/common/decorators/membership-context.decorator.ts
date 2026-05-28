import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Membership } from '../../tenant/memberships/domain/membership';

export const MembershipContext = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Membership => {
    const request = ctx.switchToHttp().getRequest();
    return request.membership;
  },
);
