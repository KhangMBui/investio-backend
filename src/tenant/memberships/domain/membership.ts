import { ApiProperty } from '@nestjs/swagger';
import { MembershipRole } from '../membership-role.enum';
import { MembershipStatus } from '../membership-status.enum';

export class Membership {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  tenantId: string;

  @ApiProperty({ type: String })
  userId: string;

  @ApiProperty({ enum: MembershipRole })
  role: MembershipRole;

  @ApiProperty({ enum: MembershipStatus })
  status: MembershipStatus;

  @ApiProperty()
  joinedAt: Date;
}
