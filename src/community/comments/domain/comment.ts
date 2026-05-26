import { ApiProperty } from '@nestjs/swagger';

export class Comment {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String })
  ideaId: string;

  @ApiProperty({ type: String })
  authorUserId: string;

  @ApiProperty({ type: String })
  body: string;

  @ApiProperty()
  createdAt: Date;
}
