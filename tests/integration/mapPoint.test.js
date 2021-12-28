const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const {
  insertMapPoints,
  mapPointForVehicleOneForAdmin,
  mapPointForVehicleOneForUser,
  mapPointForVehicleTwoForUser,
  latitude,
  longitude,
} = require('../fixtures/mapPoint.fixture');
const { insertUsers, admin, userOne } = require('../fixtures/user.fixture');
const { adminAccessToken, userOneAccessToken } = require('../fixtures/token.fixture');
const { MapPoint, VehicleData } = require('../../src/models');

setupTestDB();

describe('MapPoint routes', () => {
  describe('GET /v1/map-points', () => {
    test('should return 200 and apply the default query options for map points', async () => {
      await insertUsers([admin, userOne]);
      await insertMapPoints([mapPointForVehicleOneForAdmin, mapPointForVehicleOneForUser]);

      const res = await request(app)
        .get('/v1/map-points')
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
      expect(res.body.results[0]).toEqual({
        ...mapPointForVehicleOneForAdmin,
        _id: mapPointForVehicleOneForAdmin._id.toHexString(),
        vid: mapPointForVehicleOneForAdmin.vid.toHexString(),
        user: mapPointForVehicleOneForAdmin.user.toHexString(),
        dataPoints: expect.anything(),
      });
    });

    test('should return 200 error if an admin tries to get all their map pointss', async () => {
      await insertUsers([admin, userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser, mapPointForVehicleOneForAdmin]);

      const res = await request(app).get('/v1/map-points').set('Cookie', `token=${adminAccessToken}`).expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(mapPointForVehicleOneForAdmin._id.toHexString());
    });

    test('should return 200 error if regular user tries to get all of their map pointss', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser, mapPointForVehicleOneForAdmin]);

      const res = await request(app)
        .get(`/v1/map-points`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(mapPointForVehicleOneForUser._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertMapPoints([mapPointForVehicleOneForAdmin]);

      await request(app).get('/v1/map-points').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on vid field for map point', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/map-points')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vid: mapPointForVehicleOneForUser.vid.toHexString() })
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
      expect(res.body.results[0]._id).toBe(mapPointForVehicleOneForUser._id.toHexString());
    });

    test('should return 0 map points when searching for vid that the user does not own', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForAdmin, mapPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/map-points')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vid: mapPointForVehicleOneForAdmin.vid.toHexString() })
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
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/map-points')
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
      expect(res.body.results[0]._id).toBe(mapPointForVehicleOneForUser._id.toHexString());
      expect(res.body.results[1]._id).toBe(mapPointForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/map-points')
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
      expect(res.body.results[1]._id).toBe(mapPointForVehicleOneForUser._id.toHexString());
      expect(res.body.results[0]._id).toBe(mapPointForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/map-points')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: 'maxChargeRate:desc,energyAdded:asc' })
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

      const expectedOrder = [mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser].sort((a, b) => {
        if (a.maxChargeRate < b.maxChargeRate) {
          return 1;
        }
        if (a.maxChargeRate > b.maxChargeRate) {
          return -1;
        }
        return a.energyAdded < b.energyAdded ? -1 : 1;
      });

      expectedOrder.forEach((vehicle, index) => {
        expect(res.body.results[index]._id).toBe(vehicle._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/map-points')
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
      expect(res.body.results[0]._id).toBe(mapPointForVehicleOneForUser._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser, mapPointForVehicleOneForAdmin]);

      const res = await request(app)
        .get('/v1/map-points')
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
      expect(res.body.results[0]._id).toBe(mapPointForVehicleTwoForUser._id.toHexString());
    });
  });

  describe('GET /v1/map-points/:mapPointId', () => {
    test('should return 200 and the mapPoint object if data is ok', async () => {
      await insertUsers([admin, userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser, mapPointForVehicleOneForAdmin]);

      const res = await request(app)
        .get(`/v1/map-points/${mapPointForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        ...mapPointForVehicleOneForUser,
        _id: mapPointForVehicleOneForUser._id.toHexString(),
        user: mapPointForVehicleOneForUser.user.toHexString(),
        vid: mapPointForVehicleOneForUser.vid.toHexString(),
        dataPoints: expect.anything(),
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertMapPoints([mapPointForVehicleOneForAdmin]);

      await request(app).get(`/v1/map-points/${mapPointForVehicleOneForAdmin._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if chargeSessionId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/map-points/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/map-points/${mapPointForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /v1/map-points/distance', () => {
    test('should return 200 and the mapPoint object if data is ok', async () => {
      await insertUsers([admin, userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser, mapPointForVehicleTwoForUser, mapPointForVehicleOneForAdmin]);

      const res = await request(app)
        .get(`/v1/map-points/distance/${mapPointForVehicleOneForUser.vid}`)
        .query({ km: 1 })
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const dbVehicleData = await VehicleData.findOne({
        'drive_state.latitude': latitude,
        'drive_state.longitude': longitude,
      }).lean();

      expect(res.body).toEqual([
        {
          _id: expect.anything(),
          dataPoints: [
            {
              _id: expect.anything(),
              drive_state: {
                heading: dbVehicleData.drive_state.heading,
                latitude: dbVehicleData.drive_state.latitude,
                longitude: dbVehicleData.drive_state.longitude,
              },
            },
          ],
          latLongString: mapPointForVehicleOneForUser.latLongString,
          visitCount: mapPointForVehicleOneForUser.visitCount,
          vid: mapPointForVehicleOneForUser.vid.toHexString(),
        },
      ]);
    });

    test('should return 401 error if access token is missing', async () => {
      await insertMapPoints([mapPointForVehicleOneForAdmin]);

      await request(app).get(`/v1/map-points/distance`).send().expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /v1/map-points/:mapPointId', () => {
    test('should return 204 if vehicle data is deleted', async () => {
      await insertUsers([userOne]);
      await insertMapPoints([mapPointForVehicleOneForUser]);

      await request(app)
        .delete(`/v1/map-points/${mapPointForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbVehicle = await MapPoint.findById(mapPointForVehicleOneForUser._id);
      expect(dbVehicle).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertMapPoints([mapPointForVehicleOneForAdmin]);

      await request(app)
        .delete(`/v1/map-points/${mapPointForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if chargeSessionId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/map-points/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/map-points/${mapPointForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
