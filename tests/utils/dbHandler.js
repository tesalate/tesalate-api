const mongoose = require('mongoose');
const config = require('../../src/config/config');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let replset;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  replset = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
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
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
};
