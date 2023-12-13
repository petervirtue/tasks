import { Session } from 'src/sessions/entities/session.entity';

export type JwtRefreshPayload = {
  sessionId: Session['id'];
  iat: number;
  exp: number;
};
