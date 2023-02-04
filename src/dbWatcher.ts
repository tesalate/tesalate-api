import mongoose from 'mongoose';
import config from './config/config';
import logger from './config/logger';
import handleChange from './controllers/dbWatch.controller';
import { isEmpty } from 'lodash';

export default async function (sockets) {
  const db = mongoose.connection;

  db.once('open', () => {
    const changeStream = db.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('error', (err) => {
      logger.warn(err.message, err);
      return;
    });

    changeStream.on('change', async (change) => {
      switch (change.operationType) {
        case 'insert': {
          const user = change.fullDocument?.user.toString();

          const message = await handleChange(change, change.operationType);

          sockets.forEach((socket) => {
            if (socket.user === user && !isEmpty(message)) socket.send(JSON.stringify(message));
          });
          break;
        }

        case 'update': {
          const user = change.fullDocument?.user.toString();
          const message = await handleChange(change, change.operationType);

          sockets.forEach((socket) => {
            if (socket.user === user && !isEmpty(message)) socket.send(JSON.stringify(message));
          });
          break;
        }

        case 'delete': {
          break;
        }

        default: {
          break;
        }
      }
    });
  });
}
