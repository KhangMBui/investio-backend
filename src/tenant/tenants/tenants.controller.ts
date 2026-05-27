import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { MembershipsService } from '../memberships/memberships.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { Tenant } from './domain/tenant';
import { Membership } from '../memberships/domain/membership';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../../auth/strategies/types/jwt-payload.type';
import { TenantContextGuard } from '../guards/tenant-context.guard';
import { TenantMemberGuard } from '../guards/tenant-member.guard';
import { TenantRoleGuard, TenantRoles } from '../guards/tenant-role.guard';
import { MembershipRole } from '../memberships/membership-role.enum';
import { UpdateMembershipDto } from '../memberships/dto/update-membership.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Tenants')
@Controller({ path: 'tenants', version: '1' })
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly membershipsService: MembershipsService,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: Tenant })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<Tenant> {
    return this.tenantsService.create(dto, user.id);
  }

  @Get()
  @ApiOkResponse({ type: [Tenant] })
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: JwtPayloadType) {
    const memberships = await this.membershipsService.findByUser(user.id);
    const tenantIds = memberships.map((m) => m.tenantId);
    const tenants = await this.tenantsService.findByIds(tenantIds);

    return tenants.map((tenant) => {
      const membership = memberships.find((m) => m.tenantId === tenant.id)!;
      return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        my_role: membership.role,
        my_status: membership.status,
      };
    });
  }

  @Get(':tenantId')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(TenantContextGuard, TenantMemberGuard)
  @ApiOkResponse({ type: Tenant })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('tenantId') tenantId: string): Promise<Tenant> {
    return this.tenantsService.findByIdOrFail(tenantId);
  }

  @Get(':tenantId/members')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(TenantContextGuard, TenantMemberGuard)
  @ApiOkResponse({ type: [Membership] })
  @HttpCode(HttpStatus.OK)
  getMembers(@Param('tenantId') tenantId: string): Promise<Membership[]> {
    return this.membershipsService.findByTenant(tenantId);
  }

  @Patch(':tenantId/members/:userId')
  @ApiHeader({ name: 'x-tenant-id', required: true })
  @UseGuards(TenantContextGuard, TenantMemberGuard, TenantRoleGuard)
  @TenantRoles(MembershipRole.owner, MembershipRole.mod)
  @ApiOkResponse({ type: Membership })
  @HttpCode(HttpStatus.OK)
  updateMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMembershipDto,
  ): Promise<Membership> {
    return this.membershipsService.update(tenantId, userId, dto);
  }
}
