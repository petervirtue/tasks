import { Session } from 'src/sessions/entities/session.entity';
import { User } from 'src/user/entities/user.entity';

export type JwtPayload = Pick<User, 'id'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
