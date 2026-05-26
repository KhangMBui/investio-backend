import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  body: string;
}
