const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const User = require('../../src/models/user.model');

const password = 'password1';
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

const adminUsername = faker.internet.userName().toUpperCase();
const admin = {
  _id: mongoose.Types.ObjectId(),
  teslaAccount: null,
  vehicles: [],
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: adminUsername.toLowerCase(),
  displayName: adminUsername,
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'admin',
  isEmailVerified: false,
};

const userOneUsername = faker.internet.userName().toUpperCase();
const userOne = {
  _id: mongoose.Types.ObjectId(),
  teslaAccount: null,
  vehicles: [],
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: userOneUsername.toLowerCase(),
  displayName: userOneUsername,
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

const userTwoUsername = faker.internet.userName().toUpperCase();
const userTwo = {
  _id: mongoose.Types.ObjectId(),
  teslaAccount: null,
  vehicles: Array(
    faker.datatype.number({
      min: 0,
      max: 12,
    })
  ).fill(mongoose.Types.ObjectId()),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  username: userTwoUsername.toLowerCase(),
  displayName: userTwoUsername,
  email: faker.internet.email().toLowerCase(),
  password,
  role: 'user',
  isEmailVerified: false,
};

const insertUsers = async (users) => {
  await User.insertMany(users.map((user) => ({ ...user, password: hashedPassword })));
};

module.exports = {
  userOne,
  userTwo,
  admin,
  insertUsers,
};
