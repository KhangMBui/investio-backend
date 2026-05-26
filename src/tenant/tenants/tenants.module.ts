import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './infrastructure/persistence/relational/entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity]), MembershipsModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
