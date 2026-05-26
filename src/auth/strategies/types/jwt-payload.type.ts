import { Session } from '../../../session/domain/session';
import { User } from '../../../users/domain/user';
import { UserPlatformRole } from '../../../users/user-platform-role.enum';

export type JwtPayloadType = {
  id: User['id'];
  role: UserPlatformRole;
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
