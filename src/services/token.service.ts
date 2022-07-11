import jwt from 'jsonwebtoken';
import moment from 'moment';
import httpStatus from 'http-status';
import config from '../config/config';
import userService from './user.service';
import { Token } from '../models';
import ApiError from '../utils/ApiError';
import { tokenTypes } from '../config/tokens';
import { IToken } from '../models/token.model';

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expiresAt
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expiresAt, type?, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expiresAt.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expiresAt
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expiresAt, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expiresAt: expiresAt.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<IToken>}
 */
const verifyToken = async (token: string, type: string) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: type === tokenTypes.INVITE ? undefined : (payload.sub as string),
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expiresAt: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expiresAt: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expiresAt = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expiresAt, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expiresAt, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expiresAt = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expiresAt, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expiresAt, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

/**
 * Generate invite token
 * @returns {Promise<string>}
 */
const generateInviteToken = async (email) => {
  const expiresAt = moment().add(1, 'month');
  const payload = {
    sub: email,
    iat: moment().unix(),
    exp: expiresAt.unix(),
    type: tokenTypes.INVITE,
  };
  const inviteToken = jwt.sign(payload, config.jwt.secret);
  await saveToken(inviteToken, null, expiresAt, tokenTypes.INVITE);
  return inviteToken;
};

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateInviteToken,
};
