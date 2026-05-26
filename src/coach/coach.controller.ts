import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoachService } from './coach.service';
import { AiReport } from './ai-reports/domain/ai-report';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TenantContext } from '../common/decorators/tenant-context.decorator';
import { TenantContextGuard } from '../tenant/guards/tenant-context.guard';
import { TenantMemberGuard } from '../tenant/guards/tenant-member.guard';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@ApiBearerAuth()
@ApiHeader({ name: 'x-tenant-id', required: true })
@UseGuards(AuthGuard('jwt'), TenantContextGuard, TenantMemberGuard)
@ApiTags('Coach')
@Controller({ path: 'ai', version: '1' })
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Get('reports/latest')
  @ApiOkResponse({ type: AiReport })
  @HttpCode(HttpStatus.OK)
  async getLatest(
    @CurrentUser() user: JwtPayloadType,
    @TenantContext() tenantId: string,
  ): Promise<AiReport> {
    const report = await this.coachService.getLatestReport(tenantId, user.id);
    if (!report) throw new NotFoundException('No reports found');
    return report;
  }

  @Post('reports/generate')
  @ApiOkResponse({ type: AiReport })
  @HttpCode(HttpStatus.OK)
  generate(
    @CurrentUser() user: JwtPayloadType,
    @TenantContext() tenantId: string,
  ): Promise<AiReport> {
    return this.coachService.generateReport(tenantId, user.id);
  }
}
