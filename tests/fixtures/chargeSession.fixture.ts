import mongoose from 'mongoose';
import faker from 'faker';
import { ChargeSession, VehicleData } from '../../src/models';
import { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser } from './vehicle.fixture';
import { dataPointForVehicleOneForAdmin } from './vehicleData.fixture';
import { infoFlag, warningFlag, errorFlag } from './flag.fixture';

const chargeSession = {
  dataPoints: Array.from({ length: faker.datatype.number(100) }, () => mongoose.Types.ObjectId()),
  maxChargeRate: faker.datatype.number(),
  energyAdded: faker.datatype.float({ min: 0, max: 100, precision: 2 }),
  charger: mongoose.Types.ObjectId(),
  flags: faker.random.arrayElement([[infoFlag], [infoFlag, warningFlag], [errorFlag], []]),
  geoJSON: faker.random.arrayElement([
    {
      type: 'Point',
      coordinates: [faker.datatype.number({ min: -100, max: 100 }), faker.datatype.number({ min: -100, max: 100 })],
    },
  ]),
  startDate: faker.date.soon(),
  endDate: faker.date.soon(),
};

const chargeSessionForVehicleOneForAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForAdmin.user,
  vehicle: vehicleOneForAdmin._id,
  ...chargeSession,
};

const chargeSessionForVehicleOneForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForUser.user,
  vehicle: vehicleOneForUser._id,
  ...chargeSession,
};

const chargeSessionForVehicleTwoForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleTwoForUser.user,
  vehicle: vehicleTwoForUser._id,
  ...chargeSession,
};

const insertChargeSessions = async (chargeSessions) => {
  const sessions = await Promise.all(
    chargeSessions.map(async (session) => {
      const data = session;
      const { _id, ...rest } = dataPointForVehicleOneForAdmin;
      const arr = Array.from({ length: faker.datatype.number({ min: 1, max: 12 }) }, (_, i) => ({
        ...rest,
        vehicle: data.vehicle,
        charge_session_id: data._id,
        charge_state: {
          ...rest.charge_state,
          ...Object.keys(rest.charge_state).reduce((acc, curr) => {
            const currVal = rest.charge_state[curr];
            return {
              ...acc,
              // add the index value to any number within charge_state. This simulates a real charge session
              [curr]: typeof currVal === 'number' ? currVal + i : currVal,
            };
          }, {}),
        },
        user: data.user,
      }));
      const insertedData = await VehicleData.insertMany(arr);
      data.dataPoints = insertedData.map((el) => el._id);
      return data;
    })
  );
  await ChargeSession.insertMany(sessions);
};

export {
  chargeSessionForVehicleOneForAdmin,
  chargeSessionForVehicleOneForUser,
  chargeSessionForVehicleTwoForUser,
  insertChargeSessions,
};
