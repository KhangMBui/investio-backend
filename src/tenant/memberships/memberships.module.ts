import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipEntity } from './infrastructure/persistence/relational/entities/membership.entity';
import { MembershipsService } from './memberships.service';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipEntity])],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
