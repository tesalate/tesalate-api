const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const {
  insertChargeSessions,
  chargeSessionForVehicleOneForAdmin,
  chargeSessionForVehicleOneForUser,
  chargeSessionForVehicleTwoForUser,
} = require('../fixtures/chargeSession.fixture');
const { insertUsers, admin, userOne } = require('../fixtures/user.fixture');
const { adminAccessToken, userOneAccessToken } = require('../fixtures/token.fixture');
const { VehicleData, ChargeSession } = require('../../src/models');
const { insertFlags, infoFlag, warningFlag, errorFlag } = require('../fixtures/flag.fixture');

setupTestDB();

describe('ChargeSession routes', () => {
  describe('GET /v1/charge-sessions', () => {
    test('should return 200 and apply the default query options for charge sessions', async () => {
      await insertUsers([admin, userOne]);
      await insertFlags([infoFlag, warningFlag, errorFlag]);
      await insertChargeSessions([chargeSessionForVehicleOneForAdmin, chargeSessionForVehicleOneForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
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
        ...chargeSessionForVehicleOneForAdmin,
        _id: chargeSessionForVehicleOneForAdmin._id.toHexString(),
        charger: chargeSessionForVehicleOneForAdmin.charger.toHexString(),
        vehicle: chargeSessionForVehicleOneForAdmin.vehicle.toHexString(),
        user: chargeSessionForVehicleOneForAdmin.user.toHexString(),
        flags: chargeSessionForVehicleOneForAdmin.flags.map((el) => ({ ...el, _id: el._id.toHexString() })),
        dataPoints: chargeSessionForVehicleOneForAdmin.dataPoints.map((el) => el._id.toHexString()),
        startDate: expect.anything(),
        endDate: expect.anything(),
      });
    });

    test('should return 200 error if an admin tries to get all their charge sessionss', async () => {
      await insertUsers([admin, userOne]);
      await insertChargeSessions([
        chargeSessionForVehicleOneForUser,
        chargeSessionForVehicleTwoForUser,
        chargeSessionForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get('/v1/charge-sessions')
        .set('Cookie', `token=${adminAccessToken}`)
        .expect(httpStatus.OK);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleOneForAdmin._id.toHexString());
    });

    test('should return 200 error if regular user tries to get all of their charge sessionss', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([
        chargeSessionForVehicleOneForUser,
        chargeSessionForVehicleTwoForUser,
        chargeSessionForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get(`/v1/charge-sessions`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleOneForUser._id.toHexString());
    });

    test('should return 401 if access token is missing', async () => {
      await insertChargeSessions([chargeSessionForVehicleOneForAdmin]);

      await request(app).get('/v1/charge-sessions').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should correctly apply filter on vehicle field for charge session', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([chargeSessionForVehicleOneForUser, chargeSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vehicle: chargeSessionForVehicleOneForUser.vehicle.toHexString() })
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
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleOneForUser._id.toHexString());
    });

    test('should return 0 charge sessions when searching for vehicle that the user does not own', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([chargeSessionForVehicleOneForAdmin, chargeSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
        .set('Cookie', `token=${userOneAccessToken}`)
        .query({ vehicle: chargeSessionForVehicleOneForAdmin.vehicle.toHexString() })
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
      await insertChargeSessions([chargeSessionForVehicleOneForUser, chargeSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
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
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleOneForUser._id.toHexString());
      expect(res.body.results[1]._id).toBe(chargeSessionForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if descending sort param is specified', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([chargeSessionForVehicleOneForUser, chargeSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
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
      expect(res.body.results[1]._id).toBe(chargeSessionForVehicleOneForUser._id.toHexString());
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleTwoForUser._id.toHexString());
    });

    test('should correctly sort the returned array if multiple sorting criteria are specified', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([chargeSessionForVehicleOneForUser, chargeSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
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

      const expectedOrder = [chargeSessionForVehicleOneForUser, chargeSessionForVehicleTwoForUser].sort((a, b) => {
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
      await insertChargeSessions([chargeSessionForVehicleOneForUser, chargeSessionForVehicleTwoForUser]);

      const res = await request(app)
        .get('/v1/charge-sessions')
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
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleOneForUser._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([
        chargeSessionForVehicleOneForUser,
        chargeSessionForVehicleTwoForUser,
        chargeSessionForVehicleOneForAdmin,
      ]);

      const res = await request(app)
        .get('/v1/charge-sessions')
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
      expect(res.body.results[0]._id).toBe(chargeSessionForVehicleTwoForUser._id.toHexString());
    });
  });

  describe('GET /v1/charge-sessions/:chargeSessionId', () => {
    test('should return 200 and the charge session object if data is ok', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([chargeSessionForVehicleOneForUser]);

      const res = await request(app)
        .get(`/v1/charge-sessions/${chargeSessionForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      const { _id } = chargeSessionForVehicleOneForUser;
      const dbVehicleData = await VehicleData.find({ charge_session_id: _id }).lean();

      const {
        timestamp,
        batteryLevel,
        usableBatteryLevel,
        chargerPower,
        labels,
        duration,
        energyAdded,
        milesAdded,
        avgExTemp,
        avgInTemp,
        supercharger,
      } = {
        timestamp: dbVehicleData[0].charge_state.timestamp,
        batteryLevel: dbVehicleData.map((data) => data.charge_state.battery_level),
        usableBatteryLevel: dbVehicleData.map((data) => data.charge_state.usable_battery_level),
        chargerPower: dbVehicleData.map((data) => data.charge_state.charger_power),
        labels: dbVehicleData.map((data) => data.charge_state.timestamp),
        energyAdded: dbVehicleData[dbVehicleData.length - 1].charge_state.charge_energy_added,
        milesAdded: dbVehicleData[dbVehicleData.length - 1].charge_state.charge_miles_added_rated,
        duration: dbVehicleData[dbVehicleData.length - 1].charge_state.timestamp - dbVehicleData[0].charge_state.timestamp,
        avgExTemp: dbVehicleData.map((data) => data.climate_state.outside_temp),
        avgInTemp: dbVehicleData.map((data) => data.climate_state.inside_temp),
        supercharger: dbVehicleData.some((data) => data.charge_state.fast_charger_type === 'Tesla'),
      };

      expect(res.body).toMatchObject({
        _id: chargeSessionForVehicleOneForUser._id.toHexString(),
        graphData: {
          datasets: [
            { label: 'battery level', data: batteryLevel },
            { label: 'usable battery level', data: usableBatteryLevel },
            { label: 'charger power', data: chargerPower },
          ],
          labels,
        },
        sessionData: {
          startDate: { value: timestamp, displayName: 'start date', unit: '', displayType: 'date' },
          supercharger: { value: supercharger, displayName: 'supercharger', unit: '', displayType: 'bool' },
          maxPower: {
            value: chargerPower.reduce(function (a, b) {
              return Math.max(a, b);
            }, 0),
            displayName: 'max power',
            unit: ' kW',
            displayType: '',
          },
          avgPower: {
            value: chargerPower.reduce((a, b) => a + b) / chargerPower.length,
            displayName: 'average power',
            unit: ' kW',
            displayType: '',
          },
          fromTo: {
            value: `${batteryLevel[0]}% -> ${batteryLevel[batteryLevel.length - 1]}`,
            displayName: 'from -> to',
            unit: '%',
            displayType: '',
          },
          energyAdded: { value: energyAdded, displayName: 'energy added', unit: ' kWh', displayType: '' },
          milesAdded: { value: milesAdded, displayName: 'miles added', unit: ' miles', displayType: '' },
          duration: {
            value: duration,
            displayName: 'duration',
            unit: '',
            displayType: 'duration',
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
        },
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertChargeSessions([chargeSessionForVehicleOneForAdmin]);

      await request(app)
        .get(`/v1/charge-sessions/${chargeSessionForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .get('/v1/charge-sessions/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .get(`/v1/charge-sessions/${chargeSessionForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/charge-sessions/:chargeSessionId', () => {
    test('should return 204 if vehicle data is deleted', async () => {
      await insertUsers([userOne]);
      await insertChargeSessions([chargeSessionForVehicleOneForUser]);

      await request(app)
        .delete(`/v1/charge-sessions/${chargeSessionForVehicleOneForUser._id}`)
        .set('Cookie', `token=${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbVehicle = await ChargeSession.findById(chargeSessionForVehicleOneForUser._id);
      expect(dbVehicle).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertChargeSessions([chargeSessionForVehicleOneForAdmin]);

      await request(app)
        .delete(`/v1/charge-sessions/${chargeSessionForVehicleOneForAdmin._id}`)
        .send()
        .expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if vehicleId is not a valid mongo id', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete('/v1/charge-sessions/invalidId')
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if vehicle already is not found', async () => {
      await insertUsers([admin]);

      await request(app)
        .delete(`/v1/charge-sessions/${chargeSessionForVehicleOneForAdmin._id}`)
        .set('Cookie', `token=${adminAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });
});
