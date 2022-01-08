const mongoose = require('mongoose');
const WebSocket = require('ws');
const http = require('http');
const db = require('../../src/db');
const { createWebSocketServer, activeSockets } = require('../../src/websockets');
const config = require('../../src/config/config');
const app = require('../../src/app');
const dbHandler = require('./dbHandler');

async function setupWebSocket() {
  let server;
  beforeAll(async () => {
    server = http.createServer(app);
    createWebSocketServer(server);
    db(mongoose.connection, activeSockets);
    await dbHandler.connect();
    server.listen(config.port);
  });
  afterEach(async () => await dbHandler.clearDatabase());
  afterAll(async () => {
    await server.close();
    await dbHandler.closeDatabase();
  });
}

function waitForSocketState(socket, state) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    }, 5);
  });
}

async function createSocketClient(port, token, closeAfter, clientState) {
  const client = new WebSocket(`ws://localhost:${port}/socket`, {
    headers: {
      ['Cookie']: `token=${token}`,
    },
  });

  client.onclose = function (event) {
    // console.log(`CLOSE:`, event.message);
    return [client, event.message];
  };

  client.onerror = function (event) {
    // console.log(`ERROR:`, event.message);
    return [client, event.message];
  };

  await waitForSocketState(client, clientState);

  const messages = [];
  client.on('message', (data) => {
    messages.push(data);
    if (messages.length === closeAfter) {
      client.close();
    }
  });
  return [client, messages];
}

module.exports = {
  setupWebSocket,
  waitForSocketState,
  createSocketClient,
};
