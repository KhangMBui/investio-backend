import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: 'john.doe@example.com' })
  email: string;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
