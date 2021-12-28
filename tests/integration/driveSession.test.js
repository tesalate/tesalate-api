const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const {
  insertDriveSessions,
  driveSessionForVehicleOneForAdmin,
  driveSessionForVehicleOneForUser,
  driveSessionForVehicleTwoForUser,
} = require('../fixtures/driveSession.fixture');
const { insertUsers, admin, userOne } = require('../fixtures/user.fixture');
const { adminAccessToken, userOneAccessToken } = require('../fixtures/token.fixture');
const { VehicleData, DriveSession } = require('../../src/models');

setupTestDB();

describe('DriveSession routes', () => {
  describe('GET /v1/drive-sessions', () => {
    test('should return 200 and apply the default query options for drive sessions', async () => {
      await insertUsers([admin, userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForAdmin, driveSessionForVehicleOneForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
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
        ...driveSessionForVehicleOneForAdmin,
        _id: driveSessionForVehicleOneForAdmin._id.toHexString(),
        vid: driveSessionForVehicleOneForAdmin.vid.toHexString(),
        user: driveSessionForVehicleOneForAdmin.user.toHexString(),
        flags: driveSessionForVehicleOneForAdmin.flags.map((el) => ({ ...el, _id: el._id.toHexString() })),
        dataPoints: driveSessionForVehicleOneForAdmin.dataPoints.map((el) => el._id.toHexString()),
        startDate: expect.anything(),
        endDate: expect.anything(),
      });
    });

    test('should return 200 error if an admin tries to get all their drive sessionss', async () => {
      await insertUsers([admin, userOne]);
      await insertDriveSessions([
        driveSessionForVehicleOneForUser,
        driveSessionForVehicleTwoForUser,
        driveSessionForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get('/v1/drive-sessions')
        .set('Cookie', `token=${adminAccessToken}`)
        .expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleOneForAdmin._id.toHexString());
    });

    test('should return 200 error if regular user tries to get all of their drive sessionss', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([
        driveSessionForVehicleOneForUser,
        driveSessionForVehicleTwoForUser,
        driveSessionForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get(`/v1/drive-sessions`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleOneForUser._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertDriveSessions([driveSessionForVehicleOneForAdmin]);

      await request(app).get('/v1/drive-sessions').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on vid field for drive session', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForUser, driveSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vid: driveSessionForVehicleOneForUser.vid.toHexString() })
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
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleOneForUser._id.toHexString());
    });

    test('should return 0 drive sessions when searching for vid that the user does not own', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForAdmin, driveSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vid: driveSessionForVehicleOneForAdmin.vid.toHexString() })
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
      await insertDriveSessions([driveSessionForVehicleOneForUser, driveSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
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
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleOneForUser._id.toHexString());
      expect(res.body.results[1]._id).toBe(driveSessionForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForUser, driveSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
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
      expect(res.body.results[1]._id).toBe(driveSessionForVehicleOneForUser._id.toHexString());
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForUser, driveSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ sortBy: 'maxSpeed:desc,maxRegen:asc' })
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

      const expectedOrder = [driveSessionForVehicleOneForUser, driveSessionForVehicleTwoForUser].sort((a, b) => {
        if (a.maxSpeed < b.maxSpeed) {
          return 1;
        }
        if (a.maxSpeed > b.maxSpeed) {
          return -1;
        }
        return a.maxRegen < b.maxRegen ? -1 : 1;
      });

      expectedOrder.forEach((vehicle, index) => {
        expect(res.body.results[index]._id).toBe(vehicle._id.toHexString());
      });
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForUser, driveSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/drive-sessions')
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
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleOneForUser._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([
        driveSessionForVehicleOneForUser,
        driveSessionForVehicleTwoForUser,
        driveSessionForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get('/v1/drive-sessions')
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
      expect(res.body.results[0]._id).toBe(driveSessionForVehicleTwoForUser._id.toHexString());
    });
  });

  describe('GET /v1/drive-sessions/:driveSessionId', () => {
    test('should return 200 and the drive session object if data is ok', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForUser]);

      const res = await request(app)
        .get(`/v1/drive-sessions/${driveSessionForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const { _id } = driveSessionForVehicleOneForUser;
      const dbVehicleData = await VehicleData.find({ drive_session_id: _id }).lean();

      const { startDate, endDate, speedArr, powerArr, labels, distance, batteryLevel, avgExTemp, avgInTemp, duration } = {
        startDate: dbVehicleData[0].drive_state.timestamp,
        endDate: dbVehicleData[dbVehicleData.length - 1].drive_state.timestamp,
        speedArr: dbVehicleData.map((data) => data.drive_state.speed),
        powerArr: dbVehicleData.map((data) => data.drive_state.power),
        distance: dbVehicleData[dbVehicleData.length - 1].vehicle_state.odometer - dbVehicleData[0].vehicle_state.odometer,
        labels: dbVehicleData.map((data) => data.drive_state.timestamp),
        batteryLevel: dbVehicleData.map((data) => data.charge_state.battery_level),
        energyAdded: dbVehicleData[dbVehicleData.length - 1].drive_state.drive_energy_added,
        milesAdded: dbVehicleData[dbVehicleData.length - 1].drive_state.drive_miles_added_rated,
        duration: dbVehicleData[dbVehicleData.length - 1].drive_state.timestamp - dbVehicleData[0].drive_state.timestamp,
        avgExTemp: dbVehicleData.map((data) => data.climate_state.outside_temp),
        avgInTemp: dbVehicleData.map((data) => data.climate_state.inside_temp),
      };

      expect(res.body).toMatchObject({
        _id: _id.toHexString(),
        mapData: dbVehicleData.map((el) => ({
          vid: el.vid.toHexString(),
          dataPoints: [
            {
              _id: el._id.toHexString(),
              drive_state: {
                latitude: el.drive_state.latitude,
                longitude: el.drive_state.longitude,
                heading: el.drive_state.heading,
              },
            },
          ],
        })),
        graphData: {
          datasets: [
            {
              label: 'speed',
              data: speedArr,
            },
            {
              label: 'power',
              data: powerArr,
            },
          ],
          labels,
        },
        sessionData: {
          startDate: { value: startDate, displayName: 'start date', unit: '', displayType: 'date' },
          endDate: { value: endDate, displayName: 'end date', unit: '', displayType: 'date' },
          distance: { value: distance, displayName: 'distance', unit: ' miles', displayType: '' },
          maxSpeed: {
            value: Math.max(...speedArr),
            displayName: 'max speed',
            unit: ' mph',
            displayType: '',
          },
          avgSpeed: {
            value: speedArr.reduce((a, b) => a + b) / speedArr.length,
            displayName: 'avg. speed',
            unit: ' mph',
            displayType: '',
          },
          maxPower: {
            value: Math.max(...powerArr),
            displayName: 'max power',
            unit: ' kW',
            displayType: '',
          },
          avgPower: {
            value: powerArr.reduce((a, b) => a + b) / powerArr.length,
            displayName: 'avg. power',
            unit: ' kW',
            displayType: '',
          },
          maxRegen: {
            value: Math.min(...powerArr),
            displayName: 'max regen',
            unit: ' kW',
            displayType: '',
          },
          // TODO: FIGURE OUT EFF
          efficiency: { value: expect.anything(), displayName: 'efficiency', unit: ' Wh/mi', displayType: '' },
          fromTo: {
            value: `${batteryLevel[0]}% -> ${batteryLevel[batteryLevel.length - 1]}`,
            displayName: 'from -> to',
            unit: '%',
            displayType: '',
          },
          avgExTemp: {
            value: avgExTemp.reduce((a, b) => a + b) / avgExTemp.length,
            displayName: 'avg. ext. temp',
            unit: '°',
            displayType: 'degrees',
          },
          avgInTemp: {
            value: avgInTemp.reduce((a, b) => a + b) / avgInTemp.length,
            displayName: 'avg. int. temp',
            unit: '°',
            displayType: 'degrees',
          },
          duration: { value: duration, displayName: 'duration', unit: '', displayType: 'duration' },
          estTimeWaiting: {
            value: speedArr.slice(1, -1).filter((value) => value === 0).length,
            displayName: 'est. time stopped',
            unit: '',
            displayType: 'duration',
          },
        },
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertDriveSessions([driveSessionForVehicleOneForAdmin]);

      await request(app)
        .get(`/v1/drive-sessions/${driveSessionForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/drive-sessions/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/drive-sessions/${driveSessionForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/drive-sessions/:driveSessionId', () => {
    test('should return 204 if vehicle data is deleted', async () => {
      await insertUsers([userOne]);
      await insertDriveSessions([driveSessionForVehicleOneForUser]);

      await request(app)
        .delete(`/v1/drive-sessions/${driveSessionForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbVehicle = await DriveSession.findById(driveSessionForVehicleOneForUser._id);
      expect(dbVehicle).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertDriveSessions([driveSessionForVehicleOneForAdmin]);

      await request(app)
        .delete(`/v1/drive-sessions/${driveSessionForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/drive-sessions/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/drive-sessions/${driveSessionForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
