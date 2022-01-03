const mongoose = require('mongoose');
const faker = require('faker');
const DriveSession = require('../../src/models/driveSession.model');
const { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser } = require('./vehicle.fixture');
const { dataPointForVehicleOneForAdmin } = require('./vehicleData.fixture');
const { VehicleData } = require('../../src/models');
const { infoFlag, warningFlag, errorFlag } = require('./flag.fixture');

const driveSession = {
  dataPoints: Array.from({ length: faker.datatype.number(100) }, () => mongoose.Types.ObjectId()),
  startDate: faker.date.soon(),
  endDate: faker.date.soon(),
  maxSpeed: faker.datatype.number(),
  maxPower: faker.datatype.number(),
  maxRegen: faker.datatype.number(),
  distance: faker.datatype.float({ min: 0, max: 100, precision: 2 }),
  flags: faker.random.arrayElement([[infoFlag], [infoFlag, warningFlag], [errorFlag], []]),
  startLocation: faker.random.arrayElement([
    {
      type: 'Point',
      coordinates: [faker.datatype.number({ min: -100, max: 100 }), faker.datatype.number({ min: -100, max: 100 })],
    },
  ]),
  endLocation: faker.random.arrayElement([
    {
      type: 'Point',
      coordinates: [faker.datatype.number({ min: -100, max: 100 }), faker.datatype.number({ min: -100, max: 100 })],
    },
  ]),
};

const driveSessionForVehicleOneForAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForAdmin.user,
  vehicle: vehicleOneForAdmin._id,
  ...driveSession,
};

const driveSessionForVehicleOneForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForUser.user,
  vehicle: vehicleOneForUser._id,
  ...driveSession,
};

const driveSessionForVehicleTwoForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleTwoForUser.user,
  vehicle: vehicleTwoForUser._id,
  ...driveSession,
};

const insertDriveSessions = async (driveSessions) => {
  const sessions = await Promise.all(
    driveSessions.map(async (session) => {
      const data = session;
      const { _id, ...rest } = dataPointForVehicleOneForAdmin;
      const arr = Array.from({ length: faker.datatype.number({ min: 1, max: 12 }) }, () => ({
        ...rest,
        vehicle: data.vehicle,
        drive_session_id: data._id,
        user: data.user,
      }));
      const insertedData = await VehicleData.insertMany(arr);
      data.dataPoints = insertedData.map((el) => el._id);
      return data;
    })
  );
  await DriveSession.insertMany(sessions);
};

module.exports = {
  driveSessionForVehicleOneForAdmin,
  driveSessionForVehicleOneForUser,
  driveSessionForVehicleTwoForUser,
  insertDriveSessions,
};
