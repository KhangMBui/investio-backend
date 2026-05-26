import { ApiProperty } from '@nestjs/swagger';

export class ReflectionPrompt {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ type: String })
  reportId: string;

  @ApiProperty({ type: String })
  prompt: string;

  @ApiProperty()
  createdAt: Date;
}
