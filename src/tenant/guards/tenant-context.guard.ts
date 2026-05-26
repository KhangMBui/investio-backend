import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

export const TENANT_ID_HEADER = 'x-tenant-id';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers[TENANT_ID_HEADER];

    if (!tenantId) {
      throw new BadRequestException('TENANT_CONTEXT_REQUIRED');
    }

    request.tenantId = tenantId;
    return true;
  }
}
