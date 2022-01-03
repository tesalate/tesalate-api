const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const axios = require('axios');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { TeslaAccount } = require('../../src/models');
const { admin, insertUsers, userOne } = require('../fixtures/user.fixture');
const { teslaAccountAdmin, insertTeslaAccounts, teslaAccountOne } = require('../fixtures/teslaAccount.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

jest.mock('axios');

describe('TeslaAccount routes', () => {
  describe('POST /v1/tesla-accounts', () => {
    let newTeslaAccount;
    beforeEach(() => {
      newTeslaAccount = {
        email: faker.internet.email().toLowerCase(),
        access_token: faker.random.alphaNumeric(26),
        refresh_token: faker.random.alphaNumeric(66),
        linked: faker.datatype.boolean(),
      };
    });

    test('should return 201 and successfully create new teslaAccount if data is ok', async () => {
      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/tesla-accounts')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newTeslaAccount)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        _id: expect.anything(),
        user: teslaAccountAdmin.user.toHexString(),
        ...newTeslaAccount,
      });

      const dbTeslaAccount = await TeslaAccount.findById(res.body._id);
      expect(dbTeslaAccount).toBeDefined();
      expect(dbTeslaAccount.toJSON()).toMatchObject({
        ...newTeslaAccount,
        _id: expect.anything(),
        user: teslaAccountAdmin.user,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/tesla-accounts').send(newTeslaAccount).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newTeslaAccount.email = 'invalidEmail';

      await request(app)
        .post('/v1/tesla-accounts')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newTeslaAccount)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountOne, teslaAccountAdmin]);
      newTeslaAccount.email = teslaAccountAdmin.email;

      await request(app)
        .post('/v1/tesla-accounts')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newTeslaAccount)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/tesla-accounts', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      const res = await request(app).get('/v1/tesla-accounts').set('Cookie', `token=${adminAccessToken}`).send();

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toEqual({
        _id: teslaAccountAdmin._id.toHexString(),
        access_token: teslaAccountAdmin.access_token,
        email: teslaAccountAdmin.email,
        linked: teslaAccountAdmin.linked,
        refresh_token: teslaAccountAdmin.refresh_token,
        user: teslaAccountAdmin.user.toHexString(),
      });
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/tesla-accounts').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/tesla-accounts/:teslaAccountId', () => {
    test('should return 200 and the teslaAccount object if data is ok', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      const res = await request(app)
        .get(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        _id: teslaAccountAdmin._id.toHexString(),
        access_token: teslaAccountAdmin.access_token,
        email: teslaAccountAdmin.email,
        linked: teslaAccountAdmin.linked,
        refresh_token: teslaAccountAdmin.refresh_token,
        user: teslaAccountAdmin.user.toHexString(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app).get(`/v1/tesla-accounts/${teslaAccountAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if teslaAccount is trying to get another teslaAccount', async () => {
      await insertUsers([userOne, admin]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      await request(app)
        .get(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if teslaAccountId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .get('/v1/tesla-accounts/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/tesla-accounts/:teslaAccountId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .delete(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTeslaAccount = await TeslaAccount.findById(teslaAccountAdmin._id);
      expect(dbTeslaAccount).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/tesla-accounts/${teslaAccountAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if teslaAccount is trying to delete another teslaAccount', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      await request(app)
        .delete(`/v1/tesla-accounts/${teslaAccountOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if teslaAccountId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .delete('/v1/tesla-accounts/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if teslaAccount already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/tesla-accounts/:teslaAccountId', () => {
    test('should return 200 and successfully update teslaAccount if data is ok', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      const updateBody = {
        email: faker.internet.email().toLowerCase(),
        access_token: faker.random.alphaNumeric(26),
        refresh_token: faker.random.alphaNumeric(66),
        linked: faker.datatype.boolean(),
      };

      const res = await request(app)
        .patch(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        ...updateBody,
        _id: teslaAccountAdmin._id.toHexString(),
        user: teslaAccountAdmin.user.toHexString(),
      });

      const dbTeslaAccount = await TeslaAccount.findById(teslaAccountAdmin._id);
      expect(dbTeslaAccount).toBeDefined();

      expect(dbTeslaAccount.toJSON()).toMatchObject({
        ...updateBody,
        _id: teslaAccountAdmin._id,
        user: teslaAccountAdmin.user,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 404 if user is updating another user's teslaAccount", async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-accounts/${teslaAccountOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if admin/user is updating another teslaAccount that is not found', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-accounts/${teslaAccountOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if teslaAccountId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-accounts/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);
      const updateBody = { email: teslaAccountOne.email };

      await request(app)
        .patch(`/v1/tesla-accounts/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/tesla-accounts/link', () => {
    let body;

    const tokens = {
      access_token: faker.random.alphaNumeric(26),
      refresh_token: faker.random.alphaNumeric(66),
    };

    beforeEach(() => {
      body = {
        email: faker.internet.email().toLowerCase(),
        refreshToken: faker.random.alphaNumeric(66),
      };
    });

    test('should return 201 and successfully create and link new teslaAccount if data is ok', async () => {
      axios.post.mockResolvedValue({
        data: {
          ...tokens,
        },
      });

      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/tesla-accounts/link')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        _id: expect.anything(),
        user: teslaAccountAdmin.user.toHexString(),
        email: body.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        linked: true,
      });

      const dbTeslaAccount = await TeslaAccount.findById(res.body._id);
      expect(dbTeslaAccount).toBeDefined();
      expect(dbTeslaAccount.toJSON()).toMatchObject({
        _id: expect.anything(),
        user: teslaAccountAdmin.user,
        email: body.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        linked: true,
      });
    });

    test('should return 200 and successfully link teslaAccount if data is ok', async () => {
      axios.post.mockResolvedValue({
        data: {
          ...tokens,
        },
      });

      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      const res = await request(app)
        .post('/v1/tesla-accounts/link')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        _id: teslaAccountAdmin._id.toHexString(),
        user: teslaAccountAdmin.user.toHexString(),
        email: body.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        linked: true,
      });

      const dbTeslaAccount = await TeslaAccount.findById(res.body._id);
      expect(dbTeslaAccount).toBeDefined();
      expect(dbTeslaAccount.toJSON()).toMatchObject({
        _id: teslaAccountAdmin._id,
        user: teslaAccountAdmin.user,
        email: body.email,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        linked: true,
      });
    });

    test('should return 502 if response from tesla is bad', async () => {
      axios.post.mockRejectedValueOnce();

      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .post('/v1/tesla-accounts/link')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.BAD_GATEWAY);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/tesla-accounts/link').send(body).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      body.email = 'invalidEmail';

      await request(app)
        .post('/v1/tesla-accounts/link')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if refreshToken is missing', async () => {
      await insertUsers([admin]);
      body.refreshToken = null;

      await request(app)
        .post('/v1/tesla-accounts/link')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
