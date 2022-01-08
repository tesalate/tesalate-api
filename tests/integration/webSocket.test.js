const config = require('../../src/config/config');
const { createSocketClient, setupWebSocket } = require('../utils/setupWebSocket');
const { userOne, insertUsers, admin, userTwo } = require('../fixtures/user.fixture');
const { userOneAccessToken, adminAccessToken } = require('../fixtures/token.fixture');

setupWebSocket();

describe('WebSocket Server', () => {
  test('Server authenticates valid user', async () => {
    await insertUsers([admin, userOne, userTwo]);
    const [client, _messages] = await createSocketClient(config.port, userOneAccessToken, 1, 1);
    expect(client.OPEN).toBe(1);
    client.close();
  });

  test('Server authenticates multiple connections from one user', async () => {
    await insertUsers([admin, userOne, userTwo]);
    const [client1, _messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);
    const [client2, _messages2] = await createSocketClient(config.port, userOneAccessToken, 1, 1);
    expect(client1.OPEN).toBe(1);
    expect(client2.OPEN).toBe(1);
    client1.close();
    client2.close();
  });

  test('Server authenticates multiple users', async () => {
    await insertUsers([admin, userOne, userTwo]);
    const [client1, _messages1] = await createSocketClient(config.port, userOneAccessToken, 1, 1);
    const [client2, _messages2] = await createSocketClient(config.port, adminAccessToken, 1, 1);
    expect(client1.OPEN).toBe(1);
    expect(client2.OPEN).toBe(1);
    client1.close();
    client2.close();
  });

  test('Server rejects connection request without token', async () => {
    const [client1, messages1] = await createSocketClient(config.port, null, 1, 3);
    expect(client1.readyState).toBe(3);
    client1.close();
  });

  test('Server rejects connection request with an expired token', async () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MWQzOWQ3MjRkZGIxNzEzYTg5OWI0YzUiLCJpYXQiOjE2NDE0MDk1OTMsImV4cCI6MTY0MTQwOTY1MywidHlwZSI6ImFjY2VzcyJ9.JVa_PI8EArQudBNpkjXDvujGqQzj41vjggRvkXZ_tb8';
    const [client1, messages1] = await createSocketClient(config.port, expiredToken, 0, 3);
    expect(client1.readyState).toBe(3);
    client1.close();
  });
});
