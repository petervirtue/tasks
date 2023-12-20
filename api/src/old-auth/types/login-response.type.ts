import { User } from 'src/user/entities/user.entity';

export type LoginResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
};
