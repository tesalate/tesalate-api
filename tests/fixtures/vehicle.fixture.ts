import mongoose from 'mongoose';
import faker from 'faker';
import Vehicle from '../../src/models/vehicle.model';
const { admin, userOne } = require('./user.fixture');
const { teslaAccountOne, teslaAccountAdmin } = require('./teslaAccount.fixture');

const vehicleOneForAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: admin._id,
  teslaAccount: teslaAccountAdmin._id,
  collectData: faker.datatype.boolean(),
  access_type: 'OWNER',
  tokens: [faker.random.alphaNumeric(6), faker.random.alphaNumeric(6)],
  id: faker.datatype.number(),
  vehicle_id: faker.datatype.number(),
  vin: faker.random.alphaNumeric(12),
  display_name: faker.internet.userName(),
  option_codes: faker.random.alphaNumeric(12),
  color: faker.vehicle.color(),
  state: faker.random.arrayElement(['online', 'asleep', 'offline']),
  in_service: faker.datatype.boolean(),
  id_s: faker.random.alphaNumeric(12),
  calendar_enabled: faker.datatype.boolean(),
  api_version: faker.datatype.number(999),
  backseat_token: null,
  backseat_token_updated_at: null,
};

const vehicleOneForUser = {
  _id: mongoose.Types.ObjectId(),
  access_type: 'OWNER',
  user: userOne._id,
  teslaAccount: teslaAccountOne._id,
  collectData: faker.datatype.boolean(),
  tokens: [faker.random.alphaNumeric(6), faker.random.alphaNumeric(6)],
  id: faker.datatype.number(),
  vehicle_id: faker.datatype.number(),
  vin: faker.random.alphaNumeric(12),
  display_name: faker.internet.userName(),
  option_codes: faker.random.alphaNumeric(12),
  color: faker.vehicle.color(),
  state: faker.random.arrayElement(['online', 'asleep', 'offline']),
  in_service: faker.datatype.boolean(),
  id_s: faker.random.alphaNumeric(12),
  calendar_enabled: faker.datatype.boolean(),
  api_version: faker.datatype.number(10),
  backseat_token: null,
  backseat_token_updated_at: null,
};

const vehicleTwoForUser = {
  _id: mongoose.Types.ObjectId(),
  access_type: 'OWNER',
  user: userOne._id,
  teslaAccount: teslaAccountOne._id,
  collectData: faker.datatype.boolean(),
  tokens: [faker.random.alphaNumeric(6), faker.random.alphaNumeric(6)],
  id: faker.datatype.number(),
  vehicle_id: faker.datatype.number(),
  vin: faker.random.alphaNumeric(12),
  display_name: faker.internet.userName(),
  option_codes: faker.random.alphaNumeric(12),
  color: faker.vehicle.color(),
  state: faker.random.arrayElement(['online', 'asleep', 'offline']),
  in_service: faker.datatype.boolean(),
  id_s: faker.random.alphaNumeric(12),
  calendar_enabled: faker.datatype.boolean(),
  api_version: faker.datatype.number(10),
  backseat_token: null,
  backseat_token_updated_at: null,
};

const insertVehicles = async (vehicles) => {
  await Vehicle.insertMany(vehicles.map((vehicle) => vehicle));
};

export { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser, insertVehicles };
