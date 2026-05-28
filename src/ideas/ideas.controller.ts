import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { IdeasService } from './ideas.service';
import { CreateIdeaDto } from './dto/create-idea.dto';
import { UpdateIdeaDto } from './dto/update-idea.dto';
import { Idea } from './domain/idea';
import { IdeaEdit } from './idea-edits/domain/idea-edit';
import { IdeaStatus } from './idea-status.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { TenantContextGuard } from '../tenant/guards/tenant-context.guard';
import { TenantMemberGuard } from '../tenant/guards/tenant-member.guard';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { MembershipContext } from '../common/decorators/membership-context.decorator';
import { Membership } from '../tenant/memberships/domain/membership';
import {
  TenantRoleGuard,
  TenantRoles,
} from '../tenant/guards/tenant-role.guard';
import { MembershipRole } from '../tenant/memberships/membership-role.enum';
import { QueryIdeaDto } from './dto/query-idea.dto';
import { InfinityPaginationResponseDto } from '../utils/dto/infinity-pagination-response.dto';

@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(AuthGuard('jwt'), TenantContextGuard, TenantMemberGuard)
@ApiTags('Ideas')
@Controller({ path: 'ideas', version: '1' })
export class IdeasController {
  constructor(private readonly ideasService: IdeasService) {}

  @Post()
  @ApiCreatedResponse({ type: Idea })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateIdeaDto,
    @CurrentUser() user: JwtPayloadType,
    @TenantContext() tenantId: string,
  ): Promise<Idea> {
    return this.ideasService.create(tenantId, user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: [Idea] })
  @HttpCode(HttpStatus.OK)
  findAll(
    @TenantContext() tenantId: string,
    @Query() query: QueryIdeaDto,
  ): Promise<InfinityPaginationResponseDto<Idea>> {
    return this.ideasService.findAll(tenantId, query);
  }

  @Get(':ideaId')
  @ApiOkResponse({ type: Idea })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('ideaId') ideaId: string,
    @TenantContext() tenantId: string,
  ): Promise<Idea> {
    return this.ideasService.findByIdOrFail(tenantId, ideaId);
  }

  @Patch(':ideaId')
  @ApiOkResponse({ type: Idea })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('ideaId') ideaId: string,
    @Body() dto: UpdateIdeaDto,
    @CurrentUser() user: JwtPayloadType,
    @TenantContext() tenantId: string,
    @MembershipContext() membership: Membership,
  ): Promise<Idea> {
    return this.ideasService.update(
      tenantId,
      ideaId,
      user.id,
      membership.role,
      dto,
    );
  }

  @Post(':ideaId/resolve')
  @UseGuards(TenantRoleGuard)
  @TenantRoles(MembershipRole.mod, MembershipRole.owner)
  @ApiOkResponse({ type: Idea })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  resolve(
    @Param('ideaId') ideaId: string,
    @TenantContext() tenantId: string,
  ): Promise<Idea> {
    return this.ideasService.resolveOrInvalidate(
      tenantId,
      ideaId,
      IdeaStatus.resolved,
    );
  }

  @Post(':ideaId/invalidate')
  @UseGuards(TenantRoleGuard)
  @TenantRoles(MembershipRole.mod, MembershipRole.owner)
  @ApiOkResponse({ type: Idea })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  invalidate(
    @Param('ideaId') ideaId: string,
    @TenantContext() tenantId: string,
  ): Promise<Idea> {
    return this.ideasService.resolveOrInvalidate(
      tenantId,
      ideaId,
      IdeaStatus.invalidated,
    );
  }

  @Get(':ideaId/edits')
  @ApiOkResponse({ type: [IdeaEdit] })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  getEdits(
    @Param('ideaId') ideaId: string,
    @TenantContext() tenantId: string,
  ): Promise<IdeaEdit[]> {
    return this.ideasService.getEdits(tenantId, ideaId);
  }
}
