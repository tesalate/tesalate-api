const { chargeSessionService, driveSessionService } = require('../services');

const handleChange = async (change, action) => {
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

module.exports = handleChange;
