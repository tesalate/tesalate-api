const { MongoMemoryReplSet } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const config = require('../../src/config/config');

let replset;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  replset = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
    binary: { version: '5.0.3' },
  });
  const uri = replset.getUri();

  await mongoose.connect(uri, config.mongoose.options);
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await replset.stop();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  Object.keys(mongoose.connection.collections).forEach(async (key) => {
    const collection = mongoose.connection.collections[key];
    await collection.deleteMany();
  });
};
