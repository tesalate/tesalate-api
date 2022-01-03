const faker = require('faker');
const { Reminder } = require('../../../src/models');
const { reminderForVehicleOneForAdmin } = require('../../fixtures/reminder.fixture');

let newReminder;

describe('Reminder model', () => {
  describe('Reminder validation', () => {
    beforeEach(() => {
      const { _id, ...rest } = reminderForVehicleOneForAdmin;
      newReminder = rest;
    });

    test('should correctly validate a valid reminder obj', async () => {
      await expect(new Reminder(newReminder).validate()).resolves.toBeUndefined();
    });

    test('should correctly validate a valid reminder obj when "when" is a date', async () => {
      newReminder.when = new Date();
      await expect(new Reminder(newReminder).validate()).resolves.toBeUndefined();
    });

    test('should correctly validate a valid reminder obj when "when" is a number', async () => {
      newReminder.when = 112233445566;
      await expect(new Reminder(newReminder).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if type is not a valid enum', async () => {
      newReminder.type = 'notGoingToWork';
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if type is missing from obj', async () => {
      delete newReminder.type;
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if message is not a string', async () => {
      newReminder.message = faker.datatype.array(2);
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if message is missing from obj', async () => {
      delete newReminder.message;
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if "when" is not a number or date', async () => {
      newReminder.when = faker.datatype.array(2);
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if remindWithin is not a number', async () => {
      newReminder.remindWithin = faker.datatype.array(2);
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if "completed" is not a boolean', async () => {
      newReminder.completed = faker.datatype.array(2);
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle is not a objectId', async () => {
      newReminder.vehicle = faker.datatype.array(2);
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle is missing from obj', async () => {
      delete newReminder.vehicle;
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if user is invalid', async () => {
      newReminder.user = faker.datatype.number(123456);
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });

    test('should throw a validation error if user is missing from obj', async () => {
      delete newReminder.user;
      await expect(new Reminder(newReminder).validate()).rejects.toThrow();
    });
  });

  describe('Reminder toJSON()', () => {
    test('should not return reminder __v when toJSON is called', () => {
      expect(new Reminder(newReminder).toJSON()).not.toHaveProperty('__v');
    });
  });
});
