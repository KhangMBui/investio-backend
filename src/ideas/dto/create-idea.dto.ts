import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIdeaDto {
  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  ticker?: string | null;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  thesis: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  timeframe: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  invalidation: string;
}
