import request from 'supertest';
import faker from 'faker';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { Vehicle } from '../../src/models';
import { vehicleOneForAdmin, insertVehicles, vehicleOneForUser, vehicleTwoForUser } from '../fixtures/vehicle.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';
import { insertTeslaAccounts, teslaAccountOne } from '../fixtures/teslaAccount.fixture';

setupTestDB();

describe('Vehicle routes', () => {
  describe('POST /v1/vehicles', () => {
    let newVehicle;
    beforeEach(() => {
      newVehicle = {
        tokens: [faker.random.alphaNumeric(6), faker.random.alphaNumeric(6)],
        id: faker.datatype.number(),
        collectData: faker.datatype.boolean(),
        vehicle_id: faker.datatype.number(),
        access_type: faker.random.alphaNumeric(6),
        vin: faker.random.alphaNumeric(12),
        display_name: faker.internet.userName(),
        option_codes: faker.random.alphaNumeric(12),
        color: faker.vehicle.color(),
        state: faker.random.arrayElement(['online', 'asleep', 'offline']),
        in_service: faker.datatype.boolean(),
        id_s: faker.random.alphaNumeric(12),
        calendar_enabled: faker.datatype.boolean(),
        api_version: faker.datatype.number(10),
        backseat_token: null,
        backseat_token_updated_at: null,
      };
    });

    test('should return 201 and successfully create new vehicle if data is ok', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .post('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        user: expect.anything(),
        _id: expect.anything(),
        id: newVehicle.id,
        teslaAccount: null,
        access_type: newVehicle.access_type,
        collectData: newVehicle.collectData,
        tokens: newVehicle.tokens,
        vehicle_id: newVehicle.vehicle_id,
        vin: newVehicle.vin,
        display_name: newVehicle.display_name,
        option_codes: newVehicle.option_codes,
        color: newVehicle.color,
        state: newVehicle.state,
        in_service: newVehicle.in_service,
        id_s: newVehicle.id_s,
        calendar_enabled: newVehicle.calendar_enabled,
        api_version: newVehicle.api_version,
        backseat_token: newVehicle.backseat_token,
        backseat_token_updated_at: newVehicle.backseat_token_updated_at,
      });

      const dbVehicle = await Vehicle.findById(res.body._id);
      expect(dbVehicle).toBeDefined();
      expect(dbVehicle!.toJSON()).toEqual({
        _id: expect.anything(),
        id: newVehicle.id,
        access_type: newVehicle.access_type,
        user: userOne._id,
        collectData: newVehicle.collectData,
        teslaAccount: userOne.teslaAccount,
        tokens: newVehicle.tokens,
        vehicle_id: newVehicle.vehicle_id,
        vin: newVehicle.vin,
        display_name: newVehicle.display_name,
        option_codes: newVehicle.option_codes,
        color: newVehicle.color,
        state: newVehicle.state,
        in_service: newVehicle.in_service,
        id_s: newVehicle.id_s,
        calendar_enabled: newVehicle.calendar_enabled,
        api_version: newVehicle.api_version,
        backseat_token: newVehicle.backseat_token,
        backseat_token_updated_at: newVehicle.backseat_token_updated_at,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/vehicles').send(newVehicle).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicle is invalid', async () => {
      await insertUsers([admin]);
      newVehicle.user = 'invalidUserId';
      await request(app)
        .post('/v1/vehicles')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if vehicle/user is already registered', async () => {
      await insertUsers([admin]);
      await insertVehicles([vehicleOneForAdmin]);

      newVehicle.user = admin._id;
      newVehicle.vin = vehicleOneForAdmin.vin;

      await request(app)
        .post('/v1/vehicles')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if id_s invalid', async () => {
      await insertUsers([admin]);
      newVehicle.id_s = { bad: true };

      await request(app)
        .post('/v1/vehicles')
        .set('Cookie', `token=${adminAccessToken}`)
        .send(newVehicle)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/vehicles', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertVehicles([vehicleOneForAdmin, vehicleOneForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      const { _id, ...rest } = vehicleOneForAdmin;
      expect(res.body.results[0]).toEqual({
        ...rest,
        _id: vehicleOneForAdmin._id.toHexString(),
        teslaAccount: vehicleOneForAdmin.teslaAccount.toHexString(),
        user: vehicleOneForAdmin.user.toHexString(),
        id: vehicleOneForAdmin.id,
      });
    });

    test('should return 200 error if an admin tries to get all their vehicles', async () => {
      await insertUsers([admin, userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser, vehicleOneForAdmin]);

      const res = await request(app).get('/v1/vehicles').set('Cookie', `token=${adminAccessToken}`).expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(vehicleOneForAdmin._id.toHexString());
    });

    test('should return 200 error if regular user tries to get all of their vehicles', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser, vehicleOneForAdmin]);

      const res = await request(app).get(`/v1/vehicles`).set('Cookie', `token=${userOneAccessToken}`).expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(vehicleOneForUser._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertVehicles([vehicleOneForAdmin]);

      await request(app).get('/v1/vehicles').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on vin field', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vin: vehicleOneForUser.vin })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 1,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(vehicleOneForUser._id.toHexString());
    });

    test('should return 0 vehicles when searching for vehicle that the user does not own', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForAdmin, vehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vin: vehicleOneForAdmin.vin })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 0,
        totalResults: 0,
      });
      expect(res.body.results).toHaveLength(0);
    });

    test('should correctly sort the returned array if ascending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: '_id:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(vehicleOneForUser._id.toHexString());
      expect(res.body.results[1]._id).toBe(vehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: '_id:desc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[1]._id).toBe(vehicleOneForUser._id.toHexString());
      expect(res.body.results[0]._id).toBe(vehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: 'vin:desc,color:asc' })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);

      const expectedOrder = [vehicleOneForUser, vehicleTwoForUser].sort((a, b) => {
        if (a.vin < b.vin) {
          return 1;
        }
        if (a.vin > b.vin) {
          return -1;
        }
        return a.color < b.color ? -1 : 1;
      });

      expectedOrder.forEach((vehicle, index) => {
        expect(res.body.results[index]._id).toBe(vehicle._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(vehicleOneForUser._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertVehicles([vehicleOneForUser, vehicleTwoForUser, vehicleOneForAdmin]);

      const res = await request(app)
        .get('/v1/vehicles')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ page: 2, limit: 1 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 1,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(vehicleTwoForUser._id.toHexString());
    });
  });

  describe('GET /v1/vehicles/:vehicleId', () => {
    test('should return 200 and the vehicle object if data is ok', async () => {
      await insertUsers([admin]);
      await insertVehicles([vehicleOneForAdmin]);

      const res = await request(app)
        .get(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      const { _id, ...rest } = vehicleOneForAdmin;
      expect(res.body).toEqual({
        ...rest,
        _id: vehicleOneForAdmin._id.toHexString(),
        teslaAccount: vehicleOneForAdmin.teslaAccount.toHexString(),
        user: vehicleOneForAdmin.user.toHexString(),
        id: vehicleOneForAdmin.id,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertVehicles([vehicleOneForAdmin]);

      await request(app).get(`/v1/vehicles/${vehicleOneForAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/vehicles/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/vehicles/:vehicleId', () => {
    test('should return 204 if data is ok for vehicle delete', async () => {
      await insertUsers([userOne]);
      await insertTeslaAccounts([teslaAccountOne]);
      await insertVehicles([vehicleOneForUser]);

      const res = await request(app)
        .delete(`/v1/vehicles/${vehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbVehicle = await Vehicle.findById(vehicleOneForUser._id);
      expect(dbVehicle).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertVehicles([vehicleOneForAdmin]);

      await request(app).delete(`/v1/vehicles/${vehicleOneForAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/vehicles/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/vehicles/:vehicleId', () => {
    test('should return 200 and successfully update vehicle if data is ok', async () => {
      await insertUsers([admin]);
      await insertVehicles([vehicleOneForAdmin]);

      const updateBody = {
        collectData: faker.datatype.boolean(),
        tokens: [faker.random.alphaNumeric(6), faker.random.alphaNumeric(6)],
        vehicle_id: faker.datatype.number(),
        vin: faker.random.alphaNumeric(12),
        access_type: faker.random.alphaNumeric(6),
        display_name: faker.internet.userName(),
        option_codes: faker.random.alphaNumeric(12),
        color: faker.vehicle.color(),
        state: faker.random.arrayElement(['online', 'asleep', 'offline']),
        in_service: faker.datatype.boolean(),
        id_s: faker.random.alphaNumeric(12),
        calendar_enabled: faker.datatype.boolean(),
        api_version: faker.datatype.number(10),
        backseat_token: null,
        backseat_token_updated_at: null,
      };

      const res = await request(app)
        .patch(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        ...updateBody,
        _id: vehicleOneForAdmin._id.toHexString(),
        teslaAccount: vehicleOneForAdmin.teslaAccount.toHexString(),
        user: vehicleOneForAdmin.user.toHexString(),
        id: vehicleOneForAdmin.id,
      });

      const dbVehicle = await Vehicle.findById(vehicleOneForAdmin._id);
      expect(dbVehicle).toBeDefined();
      expect(dbVehicle!.toJSON()).toMatchObject({
        ...updateBody,
        teslaAccount: vehicleOneForAdmin.teslaAccount,
        user: vehicleOneForAdmin.user,
        id: vehicleOneForAdmin.id,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertVehicles([vehicleOneForAdmin]);
      const updateBody = { display_name: faker.name.findName() };

      await request(app).patch(`/v1/vehicles/${vehicleOneForAdmin._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 404 if user is updating another users vehicle', async () => {
      await insertUsers([userOne, admin]);
      await insertVehicles([vehicleOneForAdmin, vehicleOneForUser]);
      const updateBody = { display_name: faker.name.findName() };

      await request(app)
        .patch(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 404 if admin is updating another vehicle that is not found', async () => {
      await insertUsers([admin]);
      const updateBody = { vin: 'wont_work' };

      await request(app)
        .patch(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.NOT_FOUND);
    });

    test('should return 400 error if user is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertVehicles([vehicleOneForAdmin]);
      const updateBody = { user: faker.internet.userName() };

      await request(app)
        .patch(`/v1/vehicles/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 if vin is invalid', async () => {
      await insertUsers([admin]);
      await insertVehicles([vehicleOneForAdmin]);
      const updateBody = { vin: {} };

      await request(app)
        .patch(`/v1/vehicles/${vehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 400 error if teslaAccount is not a valid mongo id', async () => {
      await insertUsers([admin]);
      await insertVehicles([vehicleOneForAdmin]);
      const updateBody = { teslaAccount: faker.internet.userName() };

      await request(app)
        .patch(`/v1/vehicles/invalidId`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
