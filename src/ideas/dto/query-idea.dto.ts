import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { IdeaStatus } from '../idea-status.enum';

export class QueryIdeaDto {
  @ApiPropertyOptional({ enum: IdeaStatus })
  @IsOptional()
  @IsEnum(IdeaStatus)
  status?: IdeaStatus;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  ticker?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 20))
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}
