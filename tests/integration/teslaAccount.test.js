/* eslint-disable camelcase */
const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const axios = require('axios');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { TeslaAccount, Vehicle } = require('../../src/models');
const { admin, insertUsers, userOne } = require('../fixtures/user.fixture');
const { vehicleOneForAdmin } = require('../fixtures/vehicle.fixture');
const { teslaAccountAdmin, insertTeslaAccounts, teslaAccountOne } = require('../fixtures/teslaAccount.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');
const { emailService } = require('../../src/services');

setupTestDB();

jest.mock('axios');

describe('TeslaAccount routes', () => {
  describe('POST /v1/tesla-account', () => {
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
        .post('/v1/tesla-account')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newTeslaAccount)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        _id: expect.anything(),
        user: teslaAccountAdmin.user.toHexString(),
        vehicles: [],
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
      await request(app).post('/v1/tesla-account').send(newTeslaAccount).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      newTeslaAccount.email = 'invalidEmail';

      await request(app)
        .post('/v1/tesla-account')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newTeslaAccount)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if email is already used', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountOne, teslaAccountAdmin]);
      newTeslaAccount.email = teslaAccountAdmin.email;

      await request(app)
        .post('/v1/tesla-account')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newTeslaAccount)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/tesla-account', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      const res = await request(app).get('/v1/tesla-account').set('Cookie', `token=${adminAccessToken}`).send();

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
        vehicles: [],
      });
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/tesla-account').send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/tesla-account/:teslaAccountId', () => {
    test('should return 200 and the teslaAccount object if data is ok', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      const res = await request(app)
        .get(`/v1/tesla-account/${teslaAccountAdmin._id}`)
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
        vehicles: [],
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app).get(`/v1/tesla-account/${teslaAccountAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if teslaAccount is trying to get another teslaAccount', async () => {
      await insertUsers([userOne, admin]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      await request(app)
        .get(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if teslaAccountId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .get('/v1/tesla-account/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/tesla-account/:teslaAccountId', () => {
    test('should return 204 if data is ok', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .delete(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbTeslaAccount = await TeslaAccount.findById(teslaAccountAdmin._id);
      expect(dbTeslaAccount).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).delete(`/v1/tesla-account/${teslaAccountAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 error if teslaAccount is trying to delete another teslaAccount', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      await request(app)
        .delete(`/v1/tesla-account/${teslaAccountOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if teslaAccountId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .delete('/v1/tesla-account/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if teslaAccount already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/tesla-account/:teslaAccountId', () => {
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
        .patch(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        ...updateBody,
        _id: teslaAccountAdmin._id.toHexString(),
        user: teslaAccountAdmin.user.toHexString(),
        vehicles: [],
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
        .patch(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .send(updateBody)
        .expect(httpStatus.UNAUTHORIZED);
    });

    test("should return 404 if user is updating another user's teslaAccount", async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-account/${teslaAccountOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if admin/user is updating another teslaAccount that is not found', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-account/${teslaAccountOne._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if teslaAccountId is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: faker.internet.email().toLowerCase() };

      await request(app)
        .patch(`/v1/tesla-account/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is invalid', async () => {
      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);
      const updateBody = { email: 'invalidEmail' };

      await request(app)
        .patch(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if email is already taken', async () => {
      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);
      const updateBody = { email: teslaAccountOne.email };

      await request(app)
        .patch(`/v1/tesla-account/${teslaAccountAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/tesla-account/login', () => {
    let body;

    const teslaResponseTokens = {
      access_token: faker.random.alphaNumeric(26),
      refresh_token: faker.random.alphaNumeric(66),
    };

    beforeEach(() => {
      body = {
        email: faker.internet.email().toLowerCase(),
        refreshToken: faker.random.alphaNumeric(66),
      };
    });

    test('should return 201 and successfully create and login new teslaAccount with vehicles if data is ok', async () => {
      axios.post.mockResolvedValue({
        data: {
          ...teslaResponseTokens,
        },
      });
      const {
        tokens,
        id,
        vehicle_id,
        vin,
        display_name,
        option_codes,
        color,
        state,
        in_service,
        id_s,
        calendar_enabled,
        api_version,
        backseat_token,
        backseat_token_updated_at,
      } = vehicleOneForAdmin;

      axios.get.mockResolvedValue({
        data: {
          response: [
            {
              tokens,
              id,
              vehicle_id,
              vin,
              display_name,
              option_codes,
              color,
              state,
              in_service,
              id_s,
              calendar_enabled,
              api_version,
              backseat_token,
              backseat_token_updated_at,
            },
          ],
        },
      });

      await insertUsers([admin]);

      const res = await request(app)
        .post('/v1/tesla-account/login')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        teslaAccount: {
          _id: expect.anything(),
          user: teslaAccountAdmin.user.toHexString(),
          email: body.email,
          linked: true,
        },
        vehicles: [
          {
            tokens,
            id,
            vehicle_id,
            vin,
            display_name,
            option_codes,
            color,
            state,
            in_service,
            id_s,
            calendar_enabled,
            api_version,
            backseat_token,
            backseat_token_updated_at,
            _id: expect.anything(),
            user: teslaAccountAdmin.user.toHexString(),
            collectData: false,
            teslaAccount: res.body.teslaAccount._id,
          },
        ],
      });

      const dbTeslaAccount = await TeslaAccount.findById(res.body.teslaAccount._id);
      expect(dbTeslaAccount).toBeDefined();
      expect(dbTeslaAccount).toMatchObject({
        _id: expect.anything(),
        user: teslaAccountAdmin.user,
        email: body.email,
        access_token: teslaResponseTokens.access_token,
        refresh_token: teslaResponseTokens.refresh_token,
        linked: true,
      });

      const dbVehicles = await Vehicle.find({ user: teslaAccountAdmin.user });
      expect(dbVehicles).toBeDefined();
      expect(dbVehicles).toHaveLength(1);
      expect(dbVehicles[0].toJSON()).toMatchObject({
        tokens,
        id,
        vehicle_id,
        vin,
        display_name,
        option_codes,
        color,
        state,
        in_service,
        id_s,
        calendar_enabled,
        api_version,
        backseat_token,
        backseat_token_updated_at,
        _id: expect.anything(),
        user: teslaAccountAdmin.user,
        collectData: false,
        teslaAccount: dbTeslaAccount._id,
      });
    });

    test('should return 200 and successfully relink teslaAccount if data is ok', async () => {
      axios.post.mockResolvedValue({
        data: {
          ...teslaResponseTokens,
        },
      });
      const {
        tokens,
        id,
        vehicle_id,
        vin,
        display_name,
        option_codes,
        color,
        state,
        in_service,
        id_s,
        calendar_enabled,
        api_version,
        backseat_token,
        backseat_token_updated_at,
      } = vehicleOneForAdmin;

      axios.get.mockResolvedValue({
        data: {
          response: [
            {
              tokens,
              id,
              vehicle_id,
              vin,
              display_name,
              option_codes,
              color,
              state,
              in_service,
              id_s,
              calendar_enabled,
              api_version,
              backseat_token,
              backseat_token_updated_at,
            },
          ],
        },
      });

      await insertUsers([admin, userOne]);
      await insertTeslaAccounts([teslaAccountAdmin, teslaAccountOne]);

      const res = await request(app)
        .post('/v1/tesla-account/login')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        teslaAccount: {
          _id: expect.anything(),
          user: teslaAccountAdmin.user.toHexString(),
          email: body.email,
          linked: true,
        },
        vehicles: [
          {
            tokens,
            id,
            vehicle_id,
            vin,
            display_name,
            option_codes,
            color,
            state,
            in_service,
            id_s,
            calendar_enabled,
            api_version,
            backseat_token,
            backseat_token_updated_at,
            _id: expect.anything(),
            user: teslaAccountAdmin.user.toHexString(),
            collectData: false,
            teslaAccount: res.body.teslaAccount._id,
          },
        ],
      });

      const dbTeslaAccount = await TeslaAccount.findById(res.body.teslaAccount._id);
      expect(dbTeslaAccount).toBeDefined();
      expect(dbTeslaAccount.toJSON()).toMatchObject({
        _id: teslaAccountAdmin._id,
        user: teslaAccountAdmin.user,
        email: body.email,
        linked: true,
      });

      const dbVehicles = await Vehicle.find({ user: teslaAccountAdmin.user });
      expect(dbVehicles).toBeDefined();
      expect(dbVehicles).toHaveLength(1);
      expect(dbVehicles[0].toJSON()).toMatchObject({
        tokens,
        id,
        vehicle_id,
        vin,
        display_name,
        option_codes,
        color,
        state,
        in_service,
        id_s,
        calendar_enabled,
        api_version,
        backseat_token,
        backseat_token_updated_at,
        _id: expect.anything(),
        user: teslaAccountAdmin.user,
        collectData: false,
        teslaAccount: dbTeslaAccount._id,
      });
    });

    test('should return 502 if response from tesla is bad', async () => {
      axios.post.mockRejectedValueOnce();

      await insertUsers([admin]);
      await insertTeslaAccounts([teslaAccountAdmin]);

      await request(app)
        .post('/v1/tesla-account/login')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.BAD_GATEWAY);
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/tesla-account/login').send(body).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if email is invalid', async () => {
      await insertUsers([admin]);
      body.email = 'invalidEmail';

      await request(app)
        .post('/v1/tesla-account/login')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if refreshToken is missing', async () => {
      await insertUsers([admin]);
      body.refreshToken = null;

      await request(app)
        .post('/v1/tesla-account/login')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(body)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/tesla-account/send-data-collection-stopped-email', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });

    const vehicleName = 'tyl3r';

    test('should return 204 and send data collection stopped email to the user', async () => {
      await insertUsers([userOne]);
      await insertTeslaAccounts([teslaAccountOne]);
      const sendDataCollectorStoppedEmailSpy = jest.spyOn(emailService, 'sendDataCollectorStoppedEmail');

      await request(app)
        .post(
          `/v1/tesla-account/send-data-collection-stopped-email?teslaAccountId=${teslaAccountOne._id.toHexString()}&userId=${userOne._id.toHexString()}`
        )
        .expect(httpStatus.NO_CONTENT);
      expect(sendDataCollectorStoppedEmailSpy).toHaveBeenCalledWith(teslaAccountOne.email);
    });

    test('should return 400 error if teslaAccount is not a valid object id', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(`/v1/tesla-account/send-data-collection-stopped-email?teslaAccountId=1234&userId=${userOne._id.toHexString()}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if userId is not a valid object id', async () => {
      await insertUsers([admin]);

      await request(app)
        .post(
          `/v1/tesla-account/send-data-collection-stopped-email?teslaAccountId=${teslaAccountOne._id.toHexString()}&userId=1234`
        )
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if tesla account is an object id', async () => {
      await insertUsers([userOne]);

      await request(app)
        .post(
          `/v1/tesla-account/send-data-collection-stopped-email?teslaAccountId=${teslaAccountOne._id.toHexString()}&userId=${userOne._id.toHexString()}`
        )
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
