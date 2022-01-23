import faker from 'faker';
import { Charger } from '../../../src/models';
import { superchargerNAOne } from '../../fixtures/charger.fixture';

let newCharger;

describe('Charger model', () => {
  describe('Charger validation', () => {
    beforeEach(() => {
      const { _id, ...rest } = superchargerNAOne;
      newCharger = rest;
    });

    test('should correctly validate a valid charger obj', async () => {
      await expect(new Charger(newCharger).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if title is not a string', async () => {
      newCharger.title = faker.datatype.array(2);
      await expect(new Charger(newCharger).validate()).rejects.toThrow();
    });

    test('should throw a validation error if title is missing from obj', async () => {
      delete newCharger.title;
      await expect(new Charger(newCharger).validate()).rejects.toThrow();
    });

    test('should throw a validation error if geoJSON is not a geoJSON obj', async () => {
      newCharger.geoJSON = faker.datatype.array(2);
      await expect(new Charger(newCharger).validate()).rejects.toThrow();
    });

    test('should throw a validation error if geoJSON is missing from obj', async () => {
      delete newCharger.geoJSON;
      await expect(new Charger(newCharger).validate()).rejects.toThrow();
    });
  });

  describe('Charger toJSON()', () => {
    test('should not return charger __v when toJSON is called', () => {
      expect(new Charger(newCharger).toJSON()).not.toHaveProperty('__v');
    });
  });
});
