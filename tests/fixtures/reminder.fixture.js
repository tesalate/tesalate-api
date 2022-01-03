const mongoose = require('mongoose');
const faker = require('faker');
const Reminder = require('../../src/models/reminder.model');
const { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser } = require('./vehicle.fixture');

const reminder = {
  message: faker.lorem.sentence(),
  type: faker.random.arrayElement(['odometer', 'date']),
  completed: faker.datatype.boolean(),
  when: faker.random.arrayElement([faker.datatype.number(), faker.datatype.datetime()]),
  remindWithin: faker.datatype.number(),
};

const reminderForVehicleOneForAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForAdmin.user,
  vehicle: vehicleOneForAdmin._id,
  ...reminder,
};

const reminderForVehicleOneForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForUser.user,
  vehicle: vehicleOneForUser._id,
  ...reminder,
};

const reminderForVehicleTwoForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleTwoForUser.user,
  vehicle: vehicleTwoForUser._id,
  ...reminder,
};

const insertReminders = async (reminders) => {
  await Reminder.insertMany(reminders.map((data) => data));
};

module.exports = {
  reminderForVehicleOneForAdmin,
  reminderForVehicleOneForUser,
  reminderForVehicleTwoForUser,
  insertReminders,
};
