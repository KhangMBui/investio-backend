import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
  findAll(): Promise<Tenant[]> {
    return this.tenantsService.findAll();
  }

  @Get(':tenantId')
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
}
