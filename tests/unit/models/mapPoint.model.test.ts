import faker from 'faker';
import { MapPoint } from '../../../src/models';
import { mapPointForVehicleOneForAdmin } from '../../fixtures/mapPoint.fixture';

let newMapPoint;

describe('MapPoint model', () => {
  describe('MapPoint validation', () => {
    beforeEach(() => {
      const { _id, ...rest } = mapPointForVehicleOneForAdmin;
      newMapPoint = rest;
    });

    test('should correctly validate a valid mapPoint obj', async () => {
      await expect(new MapPoint(newMapPoint).validate()).resolves.toBeUndefined();
    });

    test('should throw a validation error if user is invalid', async () => {
      newMapPoint.user = faker.datatype.number(123456);
      await expect(new MapPoint(newMapPoint).validate()).rejects.toThrow();
    });

    test('should throw a validation error if dataPoints is not an array of objectIds', async () => {
      newMapPoint.dataPoints = [faker.datatype.number(123456)];
      await expect(new MapPoint(newMapPoint).validate()).rejects.toThrow();
    });

    test('should throw a validation error if visitCount is not a number', async () => {
      newMapPoint.visitCount = faker.datatype.array(2);
      await expect(new MapPoint(newMapPoint).validate()).rejects.toThrow();
    });

    test('should throw a validation error if latLongString is not a string', async () => {
      newMapPoint.latLongString = faker.datatype.array(2);
      await expect(new MapPoint(newMapPoint).validate()).rejects.toThrow();
    });

    test('should throw a validation error if geoJSON is not a geoJSON Polygon obj', async () => {
      newMapPoint.geoJSON = faker.datatype.array(2);
      await expect(new MapPoint(newMapPoint).validate()).rejects.toThrow();
    });

    test('should throw a validation error if vehicle is not a objectId', async () => {
      newMapPoint.vehicle = faker.datatype.array(2);
      await expect(new MapPoint(newMapPoint).validate()).rejects.toThrow();
    });
  });

  describe('MapPoint toJSON()', () => {
    test('should not return mapPoint __v when toJSON is called', () => {
      expect(new MapPoint(newMapPoint).toJSON()).not.toHaveProperty('__v');
    });
  });
});
