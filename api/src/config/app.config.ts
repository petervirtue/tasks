import { registerAs } from '@nestjs/config';

export type AuthConfig = {
  name?: string;
  port?: number;
  webURL?: string;
  apiPrefix?: string;
};

export default registerAs<AuthConfig>('app', () => {
  return {
    name: process.env.APP_NAME,
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 3001,
    webURL: process.env.WEB_URL,
    apiPrefix: process.env.API_PREFIX,
  };
});
