const faker = require('faker');
const { ChargeSession } = require('../../../src/models');
const { chargeSessionForVehicleOneForAdmin } = require('../../fixtures/chargeSession.fixture');

let newChargeSession;

describe('ChargeSession model', () => {
  describe('ChargeSession validation', () => {
    beforeEach(() => {
      const { _id, ...rest } = chargeSessionForVehicleOneForAdmin;
      newChargeSession = rest;
    });

    test('should correctly validate a valid chargeSession obj', async () => {
      await expect(new ChargeSession(newChargeSession).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if user is invalid', async () => {
      newChargeSession.user = faker.datatype.number(123456);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if dataPoints is not an array of objectIds', async () => {
      newChargeSession.dataPoints = [faker.datatype.number(123456)];
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if startDate is not a date', async () => {
      newChargeSession.startDate = faker.random.alphaNumeric(36);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if endDate is not a date', async () => {
      newChargeSession.endDate = faker.random.alphaNumeric(36);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if maxChargeRate is not a number', async () => {
      newChargeSession.maxChargeRate = faker.datatype.string();
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if energyAdded is not a number', async () => {
      newChargeSession.energyAdded = faker.datatype.string();
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if charger is not an objectId', async () => {
      newChargeSession.charger = faker.datatype.array(2);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if geoJSON is not a geoJSON obj', async () => {
      newChargeSession.geoJSON = faker.datatype.array(2);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if flags is not an array of flags', async () => {
      newChargeSession.flags = [faker.datatype.string()];
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vid is not a objectId', async () => {
      newChargeSession.vid = faker.datatype.array(2);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if user is not an objectId', async () => {
      newChargeSession.user = faker.datatype.array(2);
      await expect(new ChargeSession(newChargeSession).validate()).rejects.toThrow();
    });
  });

  describe('ChargeSession toJSON()', () => {
    test('should not return chargeSession __v when toJSON is called', () => {
      expect(new ChargeSession(newChargeSession).toJSON()).not.toHaveProperty('__v');
    });
  });
});
