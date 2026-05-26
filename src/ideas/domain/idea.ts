import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdeaStatus } from '../idea-status.enum';

export class Idea {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String })
  authorUserId: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  ticker: string | null;

  @ApiProperty({ type: String })
  thesis: string;

  @ApiProperty({ type: String })
  timeframe: string;

  @ApiProperty({ type: String })
  invalidation: string;

  @ApiProperty({ enum: IdeaStatus })
  status: IdeaStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({ nullable: true })
  resolvedAt: Date | null;
}
