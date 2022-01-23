/* eslint-disable no-restricted-syntax */
import faker from 'faker';
import { User } from '../../../src/models';

describe('User model', () => {
  describe('User validation', () => {
    let newUser;
    beforeEach(() => {
      newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
    });

    test('should correctly validate a valid user', async () => {
      const goodUsernames = [
        'user',
        'user123',
        '_user',
        '_.user',
        'UsEr',
        'user_',
        '_user_',
        'user.name',
        'user_name',
        'user-name',
      ];
      for (const username of goodUsernames) {
        newUser.username = username;
        // eslint-disable-next-line
        await expect(new User(newUser).validate()).resolves.toBeUndefined();
      }
    });

    test('should throw a validation error if username is invalid', async () => {
      const badUsernames = [
        '.',
        '.user', // starts with a period
        '0user', // starts with a number
        '-user', // starts with a hyphen
        '@username', // starts with an at symbol
        'us', // too short
        'username@1234.com', // invalid character (@)
        'username&1234.com', // invalid character (&)
        'u?ser', // invalid character (?)
        'u*ser', // invalid character (*)
        '/user', // invalid character (/)
        'u!ser', // invalid character (!)
        'user.', // ends with a period
        'user-.name', // period after - or _
        ' ', // too short and whitespace
        '       ', // only whitespace
        'user name', // space between characters
      ];
      for (const username of badUsernames) {
        newUser.username = username;
        // eslint-disable-next-line
        await expect(new User(newUser).validate()).rejects.toThrow();
      }
    });

    test('should throw a validation error if teslaAccount is invalid', async () => {
      newUser.teslaAccount = {};
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicles is invalid', async () => {
      newUser.vehicles = {};
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if email is invalid', async () => {
      newUser.email = 'invalidEmail';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password length is less than 8 characters', async () => {
      newUser.password = 'passwo1';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain numbers', async () => {
      newUser.password = 'password';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if password does not contain letters', async () => {
      newUser.password = '11111111';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });

    test('should throw a validation error if role is unknown', async () => {
      newUser.role = 'invalid';
      await expect(new User(newUser).validate()).rejects.toThrow();
    });
  });

  describe('User toJSON()', () => {
    test('should not return user password when toJSON is called', () => {
      const newUser = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        username: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password1',
        role: 'user',
      };
      expect(new User(newUser).toJSON()).not.toHaveProperty('password');
    });
  });
});
