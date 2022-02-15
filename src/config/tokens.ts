import config from './config';

const secureCookie = config.env === 'production';

export enum TokenTypesEnum {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

export type TokenType = {
  [key in TokenTypesEnum]: string;
};

const tokenTypes = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'resetPassword',
  VERIFY_EMAIL: 'verifyEmail',
};

const tokenCookieOptions = {
  path: '/',
  sameSite: true,
  maxAge: config.jwt.accessExpirationMinutes * 60000, // 6,0000 = ms in 1 minute
  httpOnly: true, // http only, prevents JavaScript cookie access
  secure: secureCookie, // cookie must be sent over https / ssl
};

const refreshTokenCookieOptions = {
  path: '',
  sameSite: true,
  maxAge: config.jwt.refreshExpirationDays * 86400000, // 86,400,000 = ms in 1 day
  httpOnly: true, // http only, prevents JavaScript cookie access
  secure: secureCookie, // cookie must be sent over https / ssl
};

export { tokenTypes, tokenCookieOptions, refreshTokenCookieOptions };
