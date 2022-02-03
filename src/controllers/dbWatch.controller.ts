import { IUser } from '../models/user.model';
import { IVehicleData } from '../models/vehicleData.model';
import { chargeSessionService, driveSessionService } from '../services';

const handleChange = async (
  change: {
    fullDocument: { [x: string]: unknown; _id?: string; user?: IUser; dataPoints?: IVehicleData[] };
    ns: { coll: string };
  },
  action: unknown
) => {
  const { dataPoints, ...rest } = change.fullDocument;
  const { coll: collection } = change.ns;

  switch (collection) {
    case 'chargesessions': {
      const chargeData = await chargeSessionService.getChargeSessionAggregateById(
        change.fullDocument._id,
        change.fullDocument.user
      );

      return {
        ...rest,
        aggregateData: chargeData,
        type: 'charge-sessions',
        action,
      };
    }

    case 'drivesessions': {
      const driveData = await driveSessionService.getDriveSessionAggregateById(
        change.fullDocument._id,
        change.fullDocument.user
      );
      return {
        ...rest,
        aggregateData: driveData,
        type: 'drive-sessions',
        action,
      };
    }
    case 'mappoints': {
      return {
        ...rest,
        type: 'map-points',
        action,
      };
    }
    case 'vehicles': {
      return {
        ...rest,
        type: 'vehicles',
        action,
      };
    }
    case 'teslaaccounts': {
      return {
        ...rest,
        type: 'tesla-accounts',
        action,
      };
    }
    case 'vehicledata': {
      return {
        ...rest,
        type: 'vehicle-data',
        action,
      };
    }

    default:
      return {};
  }
};

export default handleChange;
