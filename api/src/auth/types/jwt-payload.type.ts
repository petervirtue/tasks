import { Session } from 'src/sessions/entities/session.entity';
import { User } from 'src/users/entities/user.entity';

export type JwtPayload = Pick<User, 'id'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
