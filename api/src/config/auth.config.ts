import { registerAs } from '@nestjs/config';

export type AuthConfig = {
  secret?: string;
  expires?: string;
  refreshSecret?: string;
  refreshExpires?: string;
  forgotSecret?: string;
  forgotExpires?: string;
  confirmEmailSecret?: string;
  confirmEmailExpires?: string;
};

export default registerAs<AuthConfig>('auth', () => {
  return {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_TOKEN_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES_IN,
    forgotSecret: process.env.FORGOT_SECRET,
    forgotExpires: process.env.FORGOT_TOKEN_EXPIRES_IN,
    confirmEmailSecret: process.env.CONFIRM_EMAIL_SECRET,
    confirmEmailExpires: process.env.CONFIRM_EMAIL_TOKEN_EXPIRES_IN,
  };
});
