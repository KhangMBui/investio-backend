import { Session } from '../../../session/domain/session';
import { User } from '../../../users/domain/user';

export type JwtPayloadType = {
  id: User['id'];
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
