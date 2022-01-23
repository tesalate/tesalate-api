import mongoose from 'mongoose';
import faker from 'faker';
import Reminder from '../../src/models/reminder.model';
const { vehicleOneForAdmin, vehicleOneForUser, vehicleTwoForUser } = require('./vehicle.fixture');

const reminderOneForAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForAdmin.user,
  vehicle: vehicleOneForAdmin._id,
  message: faker.lorem.sentence(),
  type: faker.random.arrayElement(['odometer']),
  completed: faker.datatype.boolean(),
  when: faker.random.arrayElement([faker.datatype.number()]),
  remindWithin: faker.datatype.number(),
};

const reminderOneForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleOneForUser.user,
  vehicle: vehicleOneForUser._id,
  message: faker.lorem.sentence(),
  type: faker.random.arrayElement(['odometer']),
  completed: faker.datatype.boolean(),
  when: faker.random.arrayElement([faker.datatype.number()]),
  remindWithin: faker.datatype.number(),
};

const reminderTwoForUser = {
  _id: mongoose.Types.ObjectId(),
  user: vehicleTwoForUser.user,
  vehicle: vehicleTwoForUser._id,
  message: faker.lorem.sentence(),
  type: faker.random.arrayElement(['odometer']),
  completed: faker.datatype.boolean(),
  when: faker.random.arrayElement([faker.datatype.number()]),
  remindWithin: faker.datatype.number(),
};

const insertReminders = async (reminders) => {
  await Reminder.insertMany(reminders.map((data) => data));
};

export { reminderOneForAdmin, reminderOneForUser, reminderTwoForUser, insertReminders };
