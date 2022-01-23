/* eslint-disable no-restricted-syntax */
import { Flag } from '../../../src/models';
import { infoFlag } from '../../fixtures/flag.fixture';

describe('Flag model', () => {
  describe('Flag validation', () => {
    let newFlag;
    beforeEach(() => {
      newFlag = {
        ...infoFlag,
      };
    });

    test('should correctly validate a valid flag type', async () => {
      const goodFlagTypes = ['info', 'warning', 'error'];
      for (const type of goodFlagTypes) {
        newFlag.type = type;
        // eslint-disable-next-line
        await expect(new Flag(newFlag).validate()).resolves.toBeUndefined();
      }
    });

    test('should throw a validation error if flag type is invalid', async () => {
      const badFlagTypes = ['nope', 1, false, 1.234, true, { true: false }, ''];
      for (const type of badFlagTypes) {
        newFlag.type = type;
        // eslint-disable-next-line
        await expect(new Flag(newFlag).validate()).rejects.toThrow();
      }
    });

    test('should throw a validation error if message is invalid', async () => {
      newFlag.message = {};
      await expect(new Flag(newFlag).validate()).rejects.toThrow();
    });

    test('should throw a validation error if message is missing', async () => {
      const { message: _, ...rest } = newFlag;
      await expect(new Flag(rest).validate()).rejects.toThrow();
    });

    test('should throw a validation error if systemName is invalid', async () => {
      newFlag.systemName = {};
      await expect(new Flag(newFlag).validate()).rejects.toThrow();
    });

    test('should throw a validation error if systemName is missing', async () => {
      const { systemName: _, ...rest } = newFlag;
      await expect(new Flag(rest).validate()).rejects.toThrow();
    });
  });

  describe('Flag toJSON()', () => {
    test('should not return flag password when toJSON is called', () => {
      expect(new Flag(infoFlag).toJSON()).not.toHaveProperty('__v');
    });
  });
});
