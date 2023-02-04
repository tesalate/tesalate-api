import client from '../redis';
import config from '../config/config';
import { IMapPoint } from '../models/mapPoint.model';
import VehicleData from '../models/vehicleData.model';
import { chargeSessionService, driveSessionService } from '../services';
import logger from '../config/logger';

const handleChange = async (change: any, action: unknown) => {
  const { dataPoints, ...rest } = change.fullDocument;
  const { coll: collection } = change.ns;

  switch (collection) {
    case 'sessions': {
      if (change.fullDocument.type === 'charge') {
        const chargeData = await chargeSessionService.getChargeSessionAggregateById(
          change.fullDocument._id,
          change.fullDocument.user
        );

        return {
          ...rest,
          aggregateData: chargeData,
          collection,
          action,
        };
      }

      if (change.fullDocument.type === 'drive') {
        const driveData = await driveSessionService.getDriveSessionAggregateById(
          change.fullDocument._id,
          change.fullDocument.user
        );

        return {
          ...rest,
          aggregateData: driveData,
          collection,
          action,
        };
      }

      if (change.fullDocument.type === 'sleep') {
        return {};
      }

      if (change.fullDocument.type === 'sentry') {
        return {};
      }
      return {};
    }

    case 'mappoints': {
      const uiMapPointCacheKey = JSON.stringify({
        vehicle: rest.vehicle,
        user: rest.user,
        sortBy: 'updatedAt:desc',
      });

      const cachedValue = await client.get(uiMapPointCacheKey);
      if (cachedValue && dataPoints?.[0]) {
        let cachedMapPoints = JSON.parse(cachedValue).results;

        const data = await VehicleData.findOne({ _id: dataPoints[0] as unknown as string }).select(
          '_id drive_state.heading drive_state.latitude drive_state.longitude'
        );
        const updatedMapPoint = {
          ...rest,
          dataPoints: [data],
        };

        const index = cachedMapPoints.findIndex((e: IMapPoint) => {
          return e._id === rest._id?.toHexString();
        });

        if (index !== -1) {
          cachedMapPoints.splice(index, 1);
        }

        cachedMapPoints = [updatedMapPoint, ...cachedMapPoints];
        await client.setex(
          uiMapPointCacheKey,
          60 * 60 * 24 * 30, // 30 days
          JSON.stringify({ results: cachedMapPoints, page: 1, totalResults: cachedMapPoints.length })
        );
      }

      return {
        ...rest,
        collection,
        action,
      };
    }
    case 'vehicles': {
      return {
        ...rest,
        collection,
        action,
      };
    }
    case 'teslaaccounts': {
      return {
        ...rest,
        collection,
        action,
      };
    }

    case 'vehicledata': {
      const uiLatestCacheKey = JSON.stringify({
        vehicle: rest.vehicle,
        user: rest.user,
        sortBy: config.cache.latestSortBy,
        limit: 1,
      });
      const cachedValue = await client.get(uiLatestCacheKey);
      if (cachedValue) {
        const latestCachedDataPoint = JSON.parse(cachedValue);
        rest.count = latestCachedDataPoint.totalResults + 1;
        await client.setex(
          uiLatestCacheKey,
          config.cache.latestTTL,
          JSON.stringify({ results: [rest], totalResults: rest.count })
        );
      }
      return {
        ...rest,
        collection,
        action,
      };
    }

    default:
      logger.warn('UNHANDLED COLLECTION IN DB WATCHER', { collection });
      return {};
  }
};

export default handleChange;
