import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import logger from './config/logger';
import config from './config/config';
import { User } from './models';
import { Types } from 'mongoose';
import { IncomingMessage } from 'http';
import { IUser } from './models/user.model';

declare class ExtWebSocket extends WebSocket {
  id: string;
  user: string | Types.ObjectId;
  isAlive: boolean;
}

declare class ExtIncomingMessage extends IncomingMessage {
  user: IUser;
  isAlive: boolean;
}

function heartbeat(this: any) {
  this.isAlive = true;
}

const createWebSocketServer = (expressServer) => {
  const wss = new WebSocket.Server({
    noServer: true,
    path: '/socket',
    verifyClient: async (info, done): Promise<void> => {
      const infoReq = info.req as ExtIncomingMessage;
      try {
        const cookies = cookie.parse(infoReq.headers.cookie as string);

        const decoded = jwt.verify(cookies.token, config.jwt.secret);

        const user = await User.findById(decoded.sub);
        // kill connection if no user
        if (!user) return done(false, 403, 'Invalid token');

        infoReq.user = user.toJSON();

        done(!!infoReq);
      } catch (error) {
        // kill connection if no token
        return done(false, 401, 'No token provided');
      }
    },
  });

  logger.info('Connected to Websocket');

  expressServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (websocket) => {
      wss.emit('connection', websocket, request);
    });
  });

  wss.on('connection', function connection(ws: ExtWebSocket, connectionRequest: ExtIncomingMessage) {
    const { _id } = connectionRequest.user;
    const uuid = uuidv4();

    ws.id = uuid;
    ws.user = _id.toString();
    ws.isAlive = true;
    ws.on('pong', function () {
      ws.isAlive = true;
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {
      const extWs = ws as ExtWebSocket;

      if (!extWs.isAlive) return ws.terminate();

      extWs.isAlive = false;
      ws.ping(null, undefined);
    });
  }, 10000);

  wss.on('close', function close() {
    clearInterval(interval);
  });

  return wss;
};

export { createWebSocketServer };
