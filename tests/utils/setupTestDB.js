const dbHandler = require('./dbHandler');

const setupTestDB = () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });
  beforeEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => {
    await dbHandler.closeDatabase();
  });
};

module.exports = setupTestDB;
