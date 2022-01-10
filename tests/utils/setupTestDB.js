const dbHandler = require('./dbHandler');

const setupTestDB = () => {
  jest.setTimeout(15000);
  beforeAll(async () => {
    await dbHandler.connect();
  });
  beforeEach(async () => {
    await dbHandler.clearDatabase();
  });
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  afterAll(async () => {
    await dbHandler.closeDatabase();
  });
};

module.exports = setupTestDB;
