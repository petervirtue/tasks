import { User } from 'src/user/entities/user.entity';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
