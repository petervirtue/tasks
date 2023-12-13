import { User } from 'src/users/entities/user.entity';

export type LoginResponse = {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
};
