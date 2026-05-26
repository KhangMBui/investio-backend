import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateIdeaDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  ticker?: string | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  thesis?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  timeframe?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  invalidation?: string;
}
