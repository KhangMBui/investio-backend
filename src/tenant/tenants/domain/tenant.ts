import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Tenant {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  slug: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional({ type: Object, nullable: true })
  settingsJson?: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;
}
