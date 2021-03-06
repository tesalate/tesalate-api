import request from 'supertest';
import faker from 'faker';
import httpStatus from 'http-status';
import httpMocks from 'node-mocks-http';
import moment from 'moment';
import bcrypt from 'bcryptjs';
import cookieParser from 'set-cookie-parser';
import app from '../../src/app';
import config from '../../src/config/config';
import auth from '../../src/middleware/auth';
import { tokenService, emailService } from '../../src/services';
import ApiError from '../../src/utils/ApiError';
import setupTestDB from '../utils/setupTestDB';
import { User, Token } from '../../src/models';
import { roleRights } from '../../src/config/roles';
import { tokenTypes } from '../../src/config/tokens';
import { userOne, admin, insertUsers } from '../fixtures/user.fixture';
import { userOneAccessToken, adminAccessToken } from '../fixtures/token.fixture';

setupTestDB();

describe('Auth routes', () => {
  describe('POST /v1/auth/register', () => {
    let newUser;
    const username = faker.internet.userName().toUpperCase();

    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username,
        displayName: username,
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
      };
    });

    test('should return 201 and successfully register user if request data is ok', async () => {
      const res = await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.CREATED);
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        _id: expect.anything(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username.toLowerCase(),
        displayName: newUser.displayName,
        email: newUser.email,
        role: 'user',
        isEmailVerified: false,
        teslaAccount: null,
      });

      const cookies = cookieParser.parse(res as any, { map: true });
      expect(cookies).toEqual(
        expect.objectContaining({
          refreshToken: expect.objectContaining({
            value: expect.anything(),
          }),
          token: expect.objectContaining({
            value: expect.anything(),
          }),
        })
      );

      const dbUser = await User.findById(res.body._id);
      expect(dbUser).toBeDefined();
      expect(dbUser!.password).not.toBe(newUser.password);
      expect(dbUser!.toJSON()).toMatchObject({
        _id: expect.anything(),
        username: newUser.username.toLowerCase(),
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        displayName: newUser.displayName,
        email: newUser.email,
        role: 'user',
        isEmailVerified: false,
        teslaAccount: null,
      });
    });

    test('should return 400 error if email is invalid', async () => {
      newUser.email = 'invalidEmail';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if password does not contain both letters and numbers', async () => {
      newUser.password = 'password';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);

      newUser.password = '11111111';

      await request(app).post('/v1/auth/register').send(newUser).expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    test('should return 200 and login user if email and password match', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.OK);

      expect(res.body).toEqual({
        _id: expect.anything(),
        firstName: userOne.firstName,
        lastName: userOne.lastName,
        username: userOne.username,
        displayName: userOne.displayName,
        email: userOne.email,
        role: userOne.role,
        isEmailVerified: userOne.isEmailVerified,
        teslaAccount: null,
        vehicles: [],
      });

      const cookies = cookieParser.parse(res as any, { map: true });
      expect(cookies).toEqual(
        expect.objectContaining({
          refreshToken: expect.objectContaining({
            value: expect.anything(),
          }),
          token: expect.objectContaining({
            value: expect.anything(),
          }),
        })
      );
    });

    test('should return 401 error if there are no users with that email', async () => {
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });

    test('should return 401 error if password is wrong', async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: 'wrongPassword1',
      };

      const res = await request(app).post('/v1/auth/login').send(loginCredentials).expect(httpStatus.UNAUTHORIZED);

      expect(res.body).toEqual({ code: httpStatus.UNAUTHORIZED, message: 'Incorrect email or password' });
    });
  });

  describe('POST /v1/auth/logout', () => {
    test('should return 204 if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH);

      const res = await request(app)
        .post('/v1/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const cookies = cookieParser.parse(res as any, { map: true });
      expect(cookies).toEqual(
        expect.objectContaining({
          refreshToken: expect.objectContaining({
            value: '',
          }),
          token: expect.objectContaining({
            value: '',
          }),
        })
      );

      const dbRefreshTokenDoc = await Token.findOne({ token: refreshToken });
      expect(dbRefreshTokenDoc).toBe(null);
    });

    test('should return 404 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH, true);

      await request(app)
        .post('/v1/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/refresh-tokens', () => {
    test('should return 204 and new auth tokens if refresh token is valid', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH);

      const res = await request(app)
        .post('/v1/auth/refresh-tokens')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);
      const cookies = cookieParser.parse(res as any, { map: true });
      const dbRefreshTokenDoc = await Token.findOne({ token: cookies.refreshToken.value });
      expect(dbRefreshTokenDoc).toMatchObject({ type: tokenTypes.REFRESH, user: userOne._id, blacklisted: false });

      const dbRefreshTokenCount = await Token.countDocuments();
      expect(dbRefreshTokenCount).toBe(1);
    });

    test('should return 400 error if refresh token is missing from cookies', async () => {
      await request(app).post('/v1/auth/refresh-tokens').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 error if refresh token is signed using an invalid secret', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH, 'invalidSecret');
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is not found in the database', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH, true);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if refresh token is expired', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().subtract(1, 'minutes');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 error if user is not found', async () => {
      const expiresAt = moment().add(config.jwt.refreshExpirationDays, 'days');
      const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
      await tokenService.saveToken(refreshToken, userOne._id, expiresAt, tokenTypes.REFRESH);

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/forgot-password', () => {
    beforeEach(() => {
      /* @ts-ignore */
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send reset password email to the user', async () => {
      await insertUsers([userOne]);
      const sendResetPasswordEmailSpy = jest.spyOn(emailService, 'sendResetPasswordEmail');

      await request(app).post('/v1/auth/forgot-password').send({ email: userOne.email }).expect(httpStatus.NO_CONTENT);

      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const resetPasswordToken = sendResetPasswordEmailSpy.mock.calls[0][1];
      const dbResetPasswordTokenDoc = await Token.findOne({ token: resetPasswordToken, user: userOne._id });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    test('should return 400 if email is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/forgot-password').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 if email does not belong to any user', async () => {
      await request(app).post('/v1/auth/forgot-password').send({ email: userOne.email }).expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /v1/auth/reset-password', () => {
    test('should return 204 and reset the password', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      const isPasswordMatch = await bcrypt.compare('password2', dbUser!.password);
      expect(isPasswordMatch).toBe(true);

      const dbResetPasswordTokenCount = await Token.countDocuments({ user: userOne._id, type: tokenTypes.RESET_PASSWORD });
      expect(dbResetPasswordTokenCount).toBe(0);
    });

    test('should return 400 if reset password token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/reset-password').send({ password: 'password2' }).expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if reset password token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expiresAt, tokenTypes.RESET_PASSWORD, true);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if reset password token is expired', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().subtract(1, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expiresAt = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password2' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 if password is missing or invalid', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
      const resetPasswordToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);
      await tokenService.saveToken(resetPasswordToken, userOne._id, expiresAt, tokenTypes.RESET_PASSWORD);

      await request(app).post('/v1/auth/reset-password').query({ token: resetPasswordToken }).expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'short1' })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: 'password' })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetPasswordToken })
        .send({ password: '11111111' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/send-verification-email', () => {
    beforeEach(() => {
      /* @ts-ignore */
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    test('should return 204 and send verification email to the user', async () => {
      await insertUsers([userOne]);
      const sendVerificationEmailSpy = jest.spyOn(emailService, 'sendVerificationEmail');

      await request(app)
        .post('/v1/auth/send-verification-email')
        .set('Cookie', `token=${userOneAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(userOne.email, expect.any(String));
      const verifyEmailToken = sendVerificationEmailSpy.mock.calls[0][1];
      const dbVerifyEmailToken = await Token.findOne({ token: verifyEmailToken, user: userOne._id });

      expect(dbVerifyEmailToken).toBeDefined();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/send-verification-email').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/auth/verify-email', () => {
    test('should return 204 and verify the email', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expiresAt);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expiresAt, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);

      expect(dbUser!.isEmailVerified).toBe(true);

      const dbVerifyEmailToken = await Token.countDocuments({
        user: userOne._id,
        type: tokenTypes.VERIFY_EMAIL,
      });
      expect(dbVerifyEmailToken).toBe(0);
    });

    test('should return 400 if verify email token is missing', async () => {
      await insertUsers([userOne]);

      await request(app).post('/v1/auth/verify-email').send().expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if verify email token is blacklisted', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expiresAt);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expiresAt, tokenTypes.VERIFY_EMAIL, true);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if verify email token is expired', async () => {
      await insertUsers([userOne]);
      const expiresAt = moment().subtract(1, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expiresAt);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expiresAt, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 401 if user is not found', async () => {
      const expiresAt = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
      const verifyEmailToken = tokenService.generateToken(userOne._id, expiresAt);
      await tokenService.saveToken(verifyEmailToken, userOne._id, expiresAt, tokenTypes.VERIFY_EMAIL);

      await request(app)
        .post('/v1/auth/verify-email')
        .query({ token: verifyEmailToken })
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('Auth middleware', () => {
  test('should call next with no errors if access token is valid', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({ cookies: { token: userOneAccessToken } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user._id).toEqual(userOne._id);
  });

  test('should call next with unauthorized error if access token is not found in header', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest();
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is not a valid jwt token', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({ headers: { Authorization: 'Bearer randomToken' } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if the token is not an access token', async () => {
    await insertUsers([userOne]);
    const expiresAt = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const refreshToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.REFRESH);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${refreshToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is generated with an invalid secret', async () => {
    await insertUsers([userOne]);
    const expiresAt = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
    const accessToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.ACCESS, 'invalidSecret');
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if access token is expired', async () => {
    await insertUsers([userOne]);
    const expiresAt = moment().subtract(1, 'minutes');
    const accessToken = tokenService.generateToken(userOne._id, expiresAt, tokenTypes.ACCESS);
    const req = httpMocks.createRequest({ headers: { Authorization: `Bearer ${accessToken}` } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with unauthorized error if user is not found', async () => {
    const req = httpMocks.createRequest({ cookies: { token: userOneAccessToken } });
    const next = jest.fn();

    await auth()(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: httpStatus.UNAUTHORIZED, message: 'Please authenticate' })
    );
  });

  test('should call next with forbidden error if user does not have required rights and userId is not in params', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({ cookies: { token: userOneAccessToken } });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: httpStatus.FORBIDDEN, message: 'Forbidden' }));
  });

  test('should call next with no errors if user does not have required rights but userId is in params', async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({
      cookies: { token: userOneAccessToken },
      params: { userId: userOne._id.toHexString() },
    });
    const next = jest.fn();

    await auth('anyRight')(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });

  test('should call next with no errors if user has required rights', async () => {
    await insertUsers([admin]);
    const req = httpMocks.createRequest({
      cookies: { token: adminAccessToken },
      params: { userId: userOne._id.toHexString() },
    });
    const next = jest.fn();
    /* @ts-ignore */
    await auth(...roleRights.get('admin'))(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
  });
});
