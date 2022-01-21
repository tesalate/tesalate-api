const mongoose = require('mongoose');
const faker = require('faker');
const TeslaAccount = require('../../src/models/teslaAccount.model');
const { admin, userOne } = require('./user.fixture');

const teslaAccountAdmin = {
  _id: mongoose.Types.ObjectId(),
  user: admin._id,
  email: faker.internet.email().toLowerCase(),
  access_token: faker.random.alphaNumeric(26),
  refresh_token: faker.random.alphaNumeric(66),
  linked: faker.datatype.boolean(),
  vehicles: [],
};

const teslaAccountOne = {
  _id: mongoose.Types.ObjectId(),
  user: userOne._id,
  email: faker.internet.email().toLowerCase(),
  access_token: faker.random.alphaNumeric(26),
  refresh_token: faker.random.alphaNumeric(66),
  linked: faker.datatype.boolean(),
  vehicles: [],
};

const insertTeslaAccounts = async (teslaAccounts) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const account of teslaAccounts) {
    // eslint-disable-next-line no-await-in-loop
    await TeslaAccount.create(account);
  }
  // await TeslaAccount.insertMany(teslaAccounts.map((teslaAccount) => teslaAccount));
};

module.exports = {
  teslaAccountAdmin,
  teslaAccountOne,
  insertTeslaAccounts,
};
