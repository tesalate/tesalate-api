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
  maxAge: Number.MAX_SAFE_INTEGER,
};

const refreshTokenCookieOptions = {
  ...defaultTokenOptions,
  maxAge: Number.MAX_SAFE_INTEGER,
};

export { tokenTypes, tokenCookieOptions, refreshTokenCookieOptions };
