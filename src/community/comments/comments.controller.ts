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
  @ApiOkResponse({ type: [Comment] })
  @ApiParam({ name: 'ideaId', type: String })
  @HttpCode(HttpStatus.OK)
  findAll(
    @Param('ideaId') ideaId: string,
    @TenantContext() tenantId: string,
  ): Promise<Comment[]> {
    return this.commentsService.findByIdea(tenantId, ideaId);
  }
}
