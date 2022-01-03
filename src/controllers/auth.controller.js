const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { tokenCookieOptions, refreshTokenCookieOptions } = require('../config/tokens');

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

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
