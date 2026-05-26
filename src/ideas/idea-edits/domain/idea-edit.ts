import { ApiProperty } from '@nestjs/swagger';

export class IdeaEdit {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String })
  ideaId: string;

  @ApiProperty({ type: String })
  editorUserId: string;

  @ApiProperty({ type: String })
  field: string;

  @ApiProperty({ type: String })
  oldValue: string;

  @ApiProperty({ type: String })
  newValue: string;

  @ApiProperty()
  editedAt: Date;
}
