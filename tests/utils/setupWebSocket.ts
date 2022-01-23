import mongoose from 'mongoose';
import WebSocket from 'ws';
import http from 'http';
import db from '../../src/db';
import { createWebSocketServer, activeSockets } from '../../src/websockets';
import config from '../../src/config/config';
import app from '../../src/app';
import dbHandler from './dbHandler';

async function setupWebSocket() {
  let server;
  beforeAll(async () => {
    server = http.createServer(app);
    createWebSocketServer(server);
    db(mongoose.connection, activeSockets);
    await dbHandler.connect();
    server.listen(config.port);
  });
  beforeEach(async () => {
    await dbHandler.clearDatabase();
  });
  afterEach(async () => {
    await dbHandler.clearDatabase();
  });
  afterAll(async () => {
    await server.close();
    await dbHandler.closeDatabase();
  });
}

function waitForSocketState(socket, state) {
  return new Promise<void>(function (resolve) {
    setTimeout(function () {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    }, 5);
  });
}

async function createSocketClient(
  port: any,
  token: string,
  closeAfter: number,
  clientState: number
): Promise<[WebSocket, string | any[]]> {
  const client = new WebSocket(`ws://localhost:${port}/socket`, {
    headers: {
      Cookie: `token=${token}`,
    },
  });

  client.onclose = function (event) {
    return [client, event];
  };

  client.onerror = function (event) {
    return [client, event.message];
  };

  await waitForSocketState(client, clientState);

  const messages: any[] = [];
  client.on('message', (data) => {
    messages.push(data);
    if (messages.length === closeAfter) {
      client.close();
    }
  });
  return [client, messages];
}

export { setupWebSocket, waitForSocketState, createSocketClient };
