const mongoose = require('mongoose');
const faker = require('faker');
const { Vehicle } = require('../../../src/models');

let newVehicle;

describe('Vehicle model', () => {
  describe('Vehicle validation', () => {
    beforeEach(() => {
      newVehicle = {
        user: mongoose.Types.ObjectId(),
        teslaAccount: mongoose.Types.ObjectId(),
        collectData: faker.datatype.boolean(),
        tokens: [faker.random.alphaNumeric(6), faker.random.alphaNumeric(6)],
        id: faker.datatype.number(),
        vehicle_id: faker.datatype.number(),
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
        access_type: 'OWNER',
      };
    });

    test('should correctly validate a valid vehicle', async () => {
      await expect(new Vehicle(newVehicle).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if user is invalid', async () => {
      newVehicle.user = faker.datatype.number(123456);
      await expect(new Vehicle(newVehicle).validate()).rejects.toThrow();
    });

    test('should throw a validation error if collectData is not a boolean', async () => {
      newVehicle.collectData = faker.datatype.number(123456);
      await expect(new Vehicle(newVehicle).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vin is invalid', async () => {
      newVehicle.vin = faker.datatype.array(2);
      await expect(new Vehicle(newVehicle).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle_id is invalid', async () => {
      newVehicle.vehicle_id = faker.datatype.array(2);
      await expect(new Vehicle(newVehicle).validate()).rejects.toThrow();
    });

    test('should throw a validation error if id_s is invalid', async () => {
      newVehicle.id_s = faker.datatype.array(2);
      await expect(new Vehicle(newVehicle).validate()).rejects.toThrow();
    });
  });

  describe('Vehicle toJSON()', () => {
    test('should not return vehicle password when toJSON is called', () => {
      expect(new Vehicle(newVehicle).toJSON()).not.toHaveProperty('__v');
    });
  });
});
