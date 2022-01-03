const faker = require('faker');
const { DriveSession } = require('../../../src/models');
const { driveSessionForVehicleOneForAdmin } = require('../../fixtures/driveSession.fixture');

let newDriveSession;

describe('DriveSession model', () => {
  describe('DriveSession validation', () => {
    beforeEach(() => {
      const { _id, ...rest } = driveSessionForVehicleOneForAdmin;
      newDriveSession = rest;
    });

    test('should correctly validate a valid driveSession obj', async () => {
      await expect(new DriveSession(newDriveSession).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if user is invalid', async () => {
      newDriveSession.user = faker.datatype.number(123456);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if dataPoints is not an array of objectIds', async () => {
      newDriveSession.dataPoints = [faker.datatype.number(123456)];
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if startDate is not a date', async () => {
      newDriveSession.startDate = faker.random.alphaNumeric(36);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if endDate is not a date', async () => {
      newDriveSession.endDate = faker.random.alphaNumeric(36);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if maxSpeed is not a number', async () => {
      newDriveSession.maxSpeed = faker.datatype.string();
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if maxPower is not a number', async () => {
      newDriveSession.maxPower = faker.datatype.string();
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if maxRegen is not a number', async () => {
      newDriveSession.maxRegen = faker.datatype.string();
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if distance is not a number', async () => {
      newDriveSession.distance = faker.datatype.string();
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if startLocation is not a geoJSON obj', async () => {
      newDriveSession.startLocation = faker.datatype.array(2);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if endLocation is not a geoJSON obj', async () => {
      newDriveSession.endLocation = faker.datatype.array(2);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if flags is not an array of flags', async () => {
      newDriveSession.flags = [faker.datatype.string()];
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle is not a objectId', async () => {
      newDriveSession.vehicle = faker.datatype.array(2);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });

    test('should throw a validation error if user is not an objectId', async () => {
      newDriveSession.user = faker.datatype.array(2);
      await expect(new DriveSession(newDriveSession).validate()).rejects.toThrow();
    });
  });

  describe('DriveSession toJSON()', () => {
    test('should not return driveSession __v when toJSON is called', () => {
      expect(new DriveSession(newDriveSession).toJSON()).not.toHaveProperty('__v');
    });
  });
});
