const faker = require('faker');
const config = require('../../src/config/config');
const { waitForSocketState, createSocketClient, setupWebSocket } = require('../utils/setupWebSocket');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');
const { ChargeSession, DriveSession, Vehicle, MapPoint, TeslaAccount, VehicleData } = require('../../src/models');
const { chargeSessionForVehicleOneForUser, insertChargeSessions } = require('../fixtures/chargeSession.fixture');
const { driveSessionForVehicleOneForUser, insertDriveSessions } = require('../fixtures/driveSession.fixture');
const { vehicleOneForUser, insertVehicles } = require('../fixtures/vehicle.fixture');
const { dataPointForVehicleOneForUser } = require('../fixtures/vehicleData.fixture');
const { mapPointForVehicleOneForUser, insertMapPoints } = require('../fixtures/mapPoint.fixture');
const { teslaAccountOne, insertTeslaAccounts } = require('../fixtures/teslaAccount.fixture');

setupWebSocket();

describe('DB Change Stream', () => {
  test('INSERT for charge session', async () => {
    await insertUsers([userOne]);
    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    await ChargeSession.create(chargeSessionForVehicleOneForUser);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: chargeSessionForVehicleOneForUser._id.toHexString(),
      action: 'insert',
      type: 'charge-sessions',
    });
  });

  test('INSERT for drive session', async () => {
    await insertUsers([userOne]);
    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    await DriveSession.create(driveSessionForVehicleOneForUser);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: driveSessionForVehicleOneForUser._id.toHexString(),
      action: 'insert',
      type: 'drive-sessions',
    });
  });

  test('INSERT for vehicle data', async () => {
    await insertUsers([userOne]);
    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    await VehicleData.create(dataPointForVehicleOneForUser);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: dataPointForVehicleOneForUser._id.toHexString(),
      action: 'insert',
      type: 'vehicle-data',
    });
  });

  test('INSERT for vehicle', async () => {
    await insertUsers([userOne]);
    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    await Vehicle.create(vehicleOneForUser);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: vehicleOneForUser._id.toHexString(),
      action: 'insert',
      type: 'vehicles',
    });
  });

  test('INSERT for map point', async () => {
    await insertUsers([userOne]);
    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    await MapPoint.create(mapPointForVehicleOneForUser);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: mapPointForVehicleOneForUser._id.toHexString(),
      action: 'insert',
      type: 'map-points',
    });
  });

  test('INSERT for tesla account', async () => {
    await insertUsers([userOne]);
    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    await TeslaAccount.create(teslaAccountOne);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: teslaAccountOne._id.toHexString(),
      action: 'insert',
      type: 'tesla-accounts',
    });
  });

  test('UPDATE for charge session', async () => {
    await insertUsers([userOne]);
    await insertChargeSessions([chargeSessionForVehicleOneForUser]);

    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    const updateObj = { energyAdded: faker.datatype.number({ min: 0, max: 90 }) };

    await ChargeSession.updateOne({ _id: chargeSessionForVehicleOneForUser._id }, updateObj);
    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: chargeSessionForVehicleOneForUser._id.toHexString(),
      action: 'update',
      type: 'charge-sessions',
      ...updateObj,
    });
  });

  test('UPDATE for drive session', async () => {
    await insertUsers([userOne]);
    await insertDriveSessions([driveSessionForVehicleOneForUser]);

    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    const updateObj = { maxSpeed: faker.datatype.number({ min: 0, max: 134 }) };
    await DriveSession.updateOne({ _id: driveSessionForVehicleOneForUser._id }, updateObj);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: driveSessionForVehicleOneForUser._id.toHexString(),
      action: 'update',
      type: 'drive-sessions',
      ...updateObj,
    });
  });

  test('UPDATE for vehicle', async () => {
    await insertUsers([userOne]);
    await insertVehicles([vehicleOneForUser]);

    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    const updateObj = { collectData: faker.datatype.boolean() };
    await Vehicle.updateOne({ _id: vehicleOneForUser._id }, updateObj);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: vehicleOneForUser._id.toHexString(),
      action: 'update',
      type: 'vehicles',
    });
  });

  test('UPDATE for map point', async () => {
    await insertUsers([userOne]);
    await insertMapPoints([mapPointForVehicleOneForUser]);

    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    const updateObj = { visitCount: faker.datatype.number({ min: 0 }) };
    await MapPoint.updateOne({ _id: mapPointForVehicleOneForUser._id }, updateObj);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: mapPointForVehicleOneForUser._id.toHexString(),
      action: 'update',
      type: 'map-points',
    });
  });

  test('UPDATE for tesla account', async () => {
    await insertUsers([userOne]);
    await insertTeslaAccounts([teslaAccountOne]);

    const [client1, messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);

    const updateObj = { linked: faker.datatype.boolean() };
    await TeslaAccount.updateOne({ _id: teslaAccountOne._id }, updateObj);

    await waitForSocketState(client1, client1.CLOSED);

    expect(JSON.parse(messages1)).toMatchObject({
      _id: teslaAccountOne._id.toHexString(),
      action: 'update',
      type: 'tesla-accounts',
    });
  });
});
