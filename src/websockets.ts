import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import logger from './config/logger';
import config from './config/config';
import { User } from './models';

declare class MyWebSocketConnection extends WebSocket {
  id: string;
}

const activeSockets = {};

const createWebSocketServer = (expressServer) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: '/socket',
    verifyClient: async (info, done): Promise<void> => {
      const updatedInfo = info;
      try {
        const cookies = cookie.parse(info.req.headers.cookie as string);

        const decoded = jwt.verify(cookies.token, config.jwt.secret);

        const user = await User.findById(decoded.sub);
        // kill connection if no user
        if (!user) return done(false, 403, 'Invalid token');
        /* @ts-ignore */
        updatedInfo.req.user = user.toJSON();

        done(!!updatedInfo.req);
      } catch (error) {
        // kill connection if no token
        return done(false, 401, 'No token provided');
      }
    },
  });

  logger.info('Connected to Websocket');

  expressServer.on('upgrade', (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request);
    });
  });

  websocketServer.on('connection', function connection(websocketConnection: MyWebSocketConnection, connectionRequest) {
    // https://cheatcode.co/tutorials/how-to-set-up-a-websocket-server-with-node-js-and-express

    /* @ts-ignore */
    const { _id } = connectionRequest.user;
    const uuid = uuidv4();
    // eslint-disable-next-line no-param-reassign
    websocketConnection.id = uuid;
    if (activeSockets[_id]?.length > 0) {
      activeSockets[_id].push(websocketConnection);
    } else {
      activeSockets[_id] = [websocketConnection];
    }
  });

  // websocketServer.on('close', function connection(websocketConnection, connectionRequest) {
  //   const { _id } = connectionRequest.user._id;
  //   activeSockets[_id] = activeSockets[_id].filter((socket) => socket.id !== websocketConnection.id);
  // });

  return websocketServer;
};

export { createWebSocketServer, activeSockets };
