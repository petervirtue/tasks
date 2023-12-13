import { registerAs } from '@nestjs/config';

export type AuthConfig = {
  apiPrefix?: string;
  port?: number;
};

export default registerAs<AuthConfig>('app', () => {
  return {
    apiPrefix: process.env.API_PREFIX,
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3001,
  };
});
