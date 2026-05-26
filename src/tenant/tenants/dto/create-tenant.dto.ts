import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'my-workspace', type: String })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'My Workspace', type: String })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: Object })
  settingsJson?: Record<string, unknown>;
}
