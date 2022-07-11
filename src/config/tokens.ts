import config from './config';

const secureCookie = config.env === 'production';

export enum TokenTypesEnum {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
  INVITE = 'invite',
}

export type TokenType = {
  [key in TokenTypesEnum]: string;
};

const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
  INVITE: 'invite',
};

const defaultTokenOptions = {
  path: '/',
  sameSite: true,
  httpOnly: true, // http only, prevents JavaScript cookie access
  secure: secureCookie, // cookie must be sent over https / ssl
};

const tokenCookieOptions = {
  ...defaultTokenOptions,
  maxAge: config.jwt.accessExpirationMinutes * 60000, // 6,0000 = ms in 1 minute
};

const refreshTokenCookieOptions = {
  ...defaultTokenOptions,
  maxAge: config.jwt.refreshExpirationDays * 86400000, // 86,400,000 = ms in 1 day
};

export { tokenTypes, tokenCookieOptions, refreshTokenCookieOptions };
