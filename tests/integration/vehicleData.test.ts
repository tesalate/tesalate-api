import request from 'supertest';
import httpStatus from 'http-status';
import app from '../../src/app';
import setupTestDB from '../utils/setupTestDB';
import { Vehicle } from '../../src/models';
import {
  dataPointForVehicleOneForAdmin,
  dataPointForVehicleOneForUser,
  dataPointForVehicleTwoForUser,
  insertVehicleDataPoints,
} from '../fixtures/vehicleData.fixture';
import { admin, insertUsers, userOne } from '../fixtures/user.fixture';
import { adminAccessToken, userOneAccessToken } from '../fixtures/token.fixture';

setupTestDB();

describe('VehicleData routes', () => {
  describe('GET /v1/vehicle-data', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertUsers([admin, userOne]);
      await insertVehicleDataPoints([dataPointForVehicleOneForAdmin, dataPointForVehicleOneForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
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
      const { _id, ...rest } = dataPointForVehicleOneForAdmin;
      expect(res.body.results[0]).toEqual({
        ...rest,
        user: dataPointForVehicleOneForAdmin.user.toHexString(),
        id: dataPointForVehicleOneForAdmin.id,
        _id: dataPointForVehicleOneForAdmin._id.toHexString(),
        vehicle: dataPointForVehicleOneForAdmin.vehicle.toHexString(),
        drive_session_id: dataPointForVehicleOneForAdmin.drive_session_id
          ? dataPointForVehicleOneForAdmin.drive_session_id.toHexString()
          : null,
        charge_session_id: dataPointForVehicleOneForAdmin.charge_session_id
          ? dataPointForVehicleOneForAdmin.charge_session_id.toHexString()
          : null,
      });
    });

    test('should return 200 error if an admin tries to get all their vehicle data points', async () => {
      await insertUsers([admin, userOne]);
      await insertVehicleDataPoints([
        dataPointForVehicleOneForUser,
        dataPointForVehicleTwoForUser,
        dataPointForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get('/v1/vehicle-data')
        .set('Cookie', `token=${adminAccessToken}`)
        .expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(dataPointForVehicleOneForAdmin._id.toHexString());
    });

    test('should return 200 error if regular user tries to get all of their vehicle data points', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([
        dataPointForVehicleOneForUser,
        dataPointForVehicleTwoForUser,
        dataPointForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get(`/v1/vehicle-data`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(dataPointForVehicleOneForUser._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertVehicleDataPoints([dataPointForVehicleOneForAdmin]);

      await request(app).get('/v1/vehicle-data').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on vin field', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([dataPointForVehicleOneForUser, dataPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vin: dataPointForVehicleOneForUser.vin })
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
      expect(res.body.results[0]._id).toBe(dataPointForVehicleOneForUser._id.toHexString());
    });

    test('should return 0 vehicle data point when searching for vehicle that the user does not own', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([dataPointForVehicleOneForAdmin, dataPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vin: dataPointForVehicleOneForAdmin.vin })
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
      await insertVehicleDataPoints([dataPointForVehicleOneForUser, dataPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
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
      expect(res.body.results[0]._id).toBe(dataPointForVehicleOneForUser._id.toHexString());
      expect(res.body.results[1]._id).toBe(dataPointForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([dataPointForVehicleOneForUser, dataPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
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
      expect(res.body.results[1]._id).toBe(dataPointForVehicleOneForUser._id.toHexString());
      expect(res.body.results[0]._id).toBe(dataPointForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([dataPointForVehicleOneForUser, dataPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
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

      const expectedOrder = [dataPointForVehicleOneForUser, dataPointForVehicleTwoForUser].sort((a, b) => {
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
      await insertVehicleDataPoints([dataPointForVehicleOneForUser, dataPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/vehicle-data')
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
      expect(res.body.results[0]._id).toBe(dataPointForVehicleOneForUser._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([
        dataPointForVehicleOneForUser,
        dataPointForVehicleTwoForUser,
        dataPointForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get('/v1/vehicle-data')
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
      expect(res.body.results[0]._id).toBe(dataPointForVehicleTwoForUser._id.toHexString());
    });
  });

  describe('GET /v1/vehicle-data/:vehicleDataId', () => {
    test('should return 200 and the vehicle object if data is ok', async () => {
      await insertUsers([admin]);
      await insertVehicleDataPoints([dataPointForVehicleOneForAdmin]);

      const res = await request(app)
        .get(`/v1/vehicle-data/${dataPointForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.OK);
      const { _id, ...rest } = dataPointForVehicleOneForAdmin;
      expect(res.body).toEqual({
        ...rest,
        _id: dataPointForVehicleOneForAdmin._id.toHexString(),
        id: dataPointForVehicleOneForAdmin.id,
        vehicle: dataPointForVehicleOneForAdmin.vehicle.toHexString(),
        user: dataPointForVehicleOneForAdmin.user.toHexString(),
        drive_session_id: dataPointForVehicleOneForAdmin.drive_session_id
          ? dataPointForVehicleOneForAdmin.drive_session_id.toHexString()
          : null,
        charge_session_id: dataPointForVehicleOneForAdmin.charge_session_id
          ? dataPointForVehicleOneForAdmin.charge_session_id.toHexString()
          : null,
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertVehicleDataPoints([dataPointForVehicleOneForAdmin]);

      await request(app)
        .get(`/v1/vehicle-data/${dataPointForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/vehicle-data/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/vehicle-data/${dataPointForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/vehicle-data/:vehicleDataId', () => {
    test('should return 204 if vehicle data is deleted', async () => {
      await insertUsers([userOne]);
      await insertVehicleDataPoints([dataPointForVehicleOneForUser]);

      await request(app)
        .delete(`/v1/vehicle-data/${dataPointForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbVehicle = await Vehicle.findById(dataPointForVehicleOneForUser._id);
      expect(dbVehicle).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertVehicleDataPoints([dataPointForVehicleOneForAdmin]);

      await request(app)
        .delete(`/v1/vehicle-data/${dataPointForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/vehicle-data/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/vehicle-data/${dataPointForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
