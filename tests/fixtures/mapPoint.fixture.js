const mongoose = require('mongoose');
const faker = require('faker');
const MapPoint = require('../../src/models/mapPoint.model');
const { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser } = require('./vehicle.fixture');
const { dataPointForVehicleOneForAdmin } = require('./vehicleData.fixture');
const { VehicleData } = require('../../src/models');
const trunc = require('../../src/utils/trunc');

const getLatLongObj = (vehicleData) => {
  const lat = trunc(vehicleData.drive_state.latitude, 2);
  const long = trunc(vehicleData.drive_state.longitude, 2);

  return {
    latLongString: `[${lat}, ${long}]`,
    highLat: parseFloat(`${lat}999999999999`),
    highLong: parseFloat(`${long}999999999999`),
    lowLat: parseFloat(lat),
    lowLong: parseFloat(long),
  };
};

const latitude = faker.address.latitude();
const longitude = faker.address.longitude();

const { latLongString, highLat, highLong, lowLat, lowLong } = getLatLongObj({
  drive_state: {
    latitude,
    longitude,
  },
});

const mapPoint = {
  dataPoints: [],
  latLongString,
  visitCount: faker.datatype.number(9999999),
  geoJSON: faker.random.arrayElement([
    {
      type: 'Polygon',
      coordinates: [
        [
          [lowLong, lowLat],
          [lowLong, highLat],
          [highLong, highLat],
          [highLong, lowLat],
          [lowLong, lowLat],
        ],
      ],
    },
  ]),
};

const mapPointForVehicleOneForAdmin = {
  ...mapPoint,
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForAdmin.user,
  vehicle: vehicleOneForAdmin._id,
};

const mapPointForVehicleOneForUser = {
  ...mapPoint,
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForUser.user,
  vehicle: vehicleOneForUser._id,
};

const mapPointForVehicleTwoForUser = {
  ...mapPoint,
  _id: mongoose.Types.ObjectId(),
  user: vehicleTwoForUser.user,
  vehicle: vehicleTwoForUser._id,
};

const insertMapPoints = async (mapPoints) => {
  const points = await Promise.all(
    mapPoints.map(async (session) => {
      const data = session;
      const { _id, ...rest } = dataPointForVehicleOneForAdmin;

      const insertedData = await VehicleData.insertMany([
        {
          ...rest,
          drive_state: {
            ...rest.drive_state,
            latitude,
            longitude,
          },
        },
      ]);

      return {
        ...data,
        dataPoints: insertedData.map((el) => el._id),
      };
    })
  );
  await MapPoint.insertMany(points);
};

module.exports = {
  latitude,
  longitude,
  mapPointForVehicleOneForAdmin,
  mapPointForVehicleOneForUser,
  mapPointForVehicleTwoForUser,
  insertMapPoints,
};
