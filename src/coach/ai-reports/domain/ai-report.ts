import { ApiProperty } from '@nestjs/swagger';

export class AiReport {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty()
  periodStart: Date;

  @ApiProperty()
  periodEnd: Date;

  @ApiProperty({ type: Object })
  content: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;
}
