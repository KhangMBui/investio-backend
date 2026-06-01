import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './domain/comment';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantContext } from '../../common/decorators/tenant-context.decorator';
import { TenantContextGuard } from '../../tenant/guards/tenant-context.guard';
import { TenantMemberGuard } from '../../tenant/guards/tenant-member.guard';
import { JwtPayloadType } from '../../auth/strategies/types/jwt-payload.type';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../../utils/dto/infinity-pagination-response.dto';
import { QueryCommentDto } from './dto/query-comment.dto';
import { infinityPagination } from '../../utils/infinity-pagination';
import { MembershipContext } from '../../common/decorators/membership-context.decorator';
import { Membership } from '../../tenant/memberships/domain/membership';

@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(AuthGuard('jwt'), TenantContextGuard, TenantMemberGuard)
@ApiTags('Comments')
@Controller({ path: 'ideas/:ideaId/comments', version: '1' })
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiCreatedResponse({ type: Comment })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('ideaId') ideaId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayloadType,
    @TenantContext() tenantId: string,
  ): Promise<Comment> {
    return this.commentsService.create(tenantId, ideaId, user.id, dto);
  }

  @Get()
  @ApiOkResponse({ type: InfinityPaginationResponse(Comment) })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryCommentDto,
    @Param('ideaId') ideaId: string,
    @TenantContext() tenantId: string,
  ): Promise<InfinityPaginationResponseDto<Comment>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;

    if (limit > 50) limit = 50;

    return infinityPagination(
      await this.commentsService.findManyWithPagination({
        tenantId,
        ideaId,
        sortOptions: query?.sort,
        paginationOptions: { page, limit },
      }),
      { page, limit },
    );
  }

  @Delete(':commentId')
  @ApiParam({ name: 'ideaId', type: String })
  @ApiParam({ name: 'commentId', type: String })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('ideaId') ideaId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayloadType,
    @TenantContext() tenantId: string,
    @MembershipContext() membership: Membership,
  ): Promise<void> {
    return this.commentsService.remove(
      tenantId,
      ideaId,
      commentId,
      user.id,
      membership.role,
    );
  }
}
