const mongoose = require('mongoose');
const faker = require('faker');
const MapPoint = require('../../src/models/mapPoint.model');
const { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser } = require('./vehicle.fixture');

const mapPoint = {
  dataPoints: [mongoose.Types.ObjectId()],
  latLongString: faker.random.arrayElement(['[50.65, -60.15]', '[47.01, -122.00]', '[23.78, -122.99]']),
  visitCount: faker.datatype.number(9999999),
  geoJSON: faker.random.arrayElement([
    {
      type: 'Polygon',
      coordinates: [
        [faker.datatype.number({ min: -100, max: 100 }), faker.datatype.number({ min: -100, max: 100 })],
        [[faker.datatype.number({ min: -100, max: 100 }), faker.datatype.number({ min: -100, max: 100 })]],
      ],
    },
  ]),
};

const mapPointForVehicleOneForAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForAdmin.user,
  vid: vehicleOneForAdmin._id,
  ...mapPoint,
};

const mapPointForVehicleOneForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForUser.user,
  vid: vehicleOneForUser._id,
  ...mapPoint,
};

const mapPointForVehicleTwoForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleTwoForUser.user,
  vid: vehicleTwoForUser._id,
  ...mapPoint,
};

const insertMapPoints = async (mapPoints) => {
  await MapPoint.insertMany(mapPoints.map((data) => data));
};

module.exports = {
  mapPointForVehicleOneForAdmin,
  mapPointForVehicleOneForUser,
  mapPointForVehicleTwoForUser,
  insertMapPoints,
};
