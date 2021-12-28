const faker = require('faker');
const { VehicleData } = require('../../../src/models');
const { dataPointForVehicleOneForAdmin } = require('../../fixtures/vehicleData.fixture');

let newVehicleData;

describe('VehicleData model', () => {
  describe('VehicleData validation', () => {
    beforeEach(() => {
      const { _id, ...rest } = dataPointForVehicleOneForAdmin;
      newVehicleData = rest;
    });

    test('should correctly validate a valid vehicleData obj', async () => {
      await expect(new VehicleData(newVehicleData).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if user is invalid', async () => {
      newVehicleData.user = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if charge_state is not a map', async () => {
      newVehicleData.charge_state = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if drive_state is not a map', async () => {
      newVehicleData.drive_state = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle_state is not a map', async () => {
      newVehicleData.vehicle_state = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if climate_state is not a map', async () => {
      newVehicleData.climate_state = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle_config is not a map', async () => {
      newVehicleData.vehicle_config = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if gui_settings is not a map', async () => {
      newVehicleData.gui_settings = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if charge_session_id is not a objectId', async () => {
      newVehicleData.charge_session_id = faker.datatype.array(2);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if drive_session_id is not a objectId', async () => {
      newVehicleData.drive_session_id = faker.datatype.array(2);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if geoJSON is not a geoJSON object', async () => {
      newVehicleData.geoJSON = faker.datatype.number(123456);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vin is invalid', async () => {
      newVehicleData.vin = faker.datatype.array(2);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle_id is invalid', async () => {
      newVehicleData.vehicle_id = faker.datatype.array(2);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });

    test('should throw a validation error if id_s is invalid', async () => {
      newVehicleData.id_s = faker.datatype.array(2);
      await expect(new VehicleData(newVehicleData).validate()).rejects.toThrow();
    });
  });

  describe('VehicleData toJSON()', () => {
    test('should not return vehicleData password when toJSON is called', () => {
      expect(new VehicleData(newVehicleData).toJSON()).not.toHaveProperty('__v');
    });
  });
});
