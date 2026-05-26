import { Module } from '@nestjs/common';
import { TenantsModule } from './tenants/tenants.module';
import { MembershipsModule } from './memberships/memberships.module';

@Module({
  imports: [TenantsModule, MembershipsModule],
  exports: [TenantsModule, MembershipsModule],
})
export class TenantModule {}
