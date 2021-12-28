const mongoose = require('mongoose');
const faker = require('faker');
const { TeslaAccount } = require('../../../src/models');

let newTeslaAccount;

describe('TeslaAccount model', () => {
  describe('TeslaAccount validation', () => {
    beforeEach(() => {
      newTeslaAccount = {
        user: mongoose.Types.ObjectId(),
        email: faker.internet.email().toLowerCase(),
        access_token: faker.datatype.string(26),
        refresh_token: faker.datatype.string(56),
        linked: faker.datatype.boolean(),
      };
    });

    test('should correctly validate a valid teslaAccount', async () => {
      await expect(new TeslaAccount(newTeslaAccount).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if email is invalid', async () => {
      newTeslaAccount.email = 'invalidEmail';
      await expect(new TeslaAccount(newTeslaAccount).validate()).rejects.toThrow();
    });

    test('should throw a validation error if linked is invalid', async () => {
      newTeslaAccount.linked = 'invalid';
      await expect(new TeslaAccount(newTeslaAccount).validate()).rejects.toThrow();
    });
  });

  describe('TeslaAccount toJSON()', () => {
    test('should not return teslaAccount __v when toJSON is called', () => {
      expect(new TeslaAccount(newTeslaAccount).toJSON()).not.toHaveProperty('__v');
    });
  });
});
