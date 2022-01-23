import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, userService, tokenService, emailService } from '../services';
import { tokenCookieOptions, refreshTokenCookieOptions } from '../config/tokens';
import { TypedRequest } from './types';

const register = catchAsync(async (req, res, next) => {
  const newUser = req.body;

  // CREATE USER
  const user = await userService.createUser({ ...newUser, displayName: newUser.username });
  const {
    access: { token: accessToken },
    refresh: { token: refreshToken },
  } = await tokenService.generateAuthTokens(user);

  res
    .status(httpStatus.CREATED)
    .cookie('token', accessToken, tokenCookieOptions)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .send({ user });
  next();
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const {
    access: { token: accessToken },
    refresh: { token: refreshToken },
  } = await tokenService.generateAuthTokens(user);
  res
    .cookie('token', accessToken, tokenCookieOptions)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .send({ user });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.cookies.refreshToken);
  res.status(httpStatus.NO_CONTENT).clearCookie('refreshToken', { path: '' }).clearCookie('token').send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const {
    access: { token: accessToken },
    refresh: { token: refreshToken },
  } = await authService.refreshAuth(req.cookies.refreshToken);
  res
    .cookie('token', accessToken, tokenCookieOptions)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .status(httpStatus.NO_CONTENT)
    .send();
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req: TypedRequest<{ token: string}, {password: string }>, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});


const verifyEmail = catchAsync(async (req: TypedRequest<{ token: string },{}>, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
