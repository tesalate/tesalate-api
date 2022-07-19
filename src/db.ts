import mongoose from 'mongoose';
import config from './config/config';
import logger from './config/logger';
import handleChange from './controllers/dbWatch.controller';

export default async function (db, sockets) {
  db.on('connected', async function () {
    logger.info(`Connected to DB`);
  });

  db.once('open', () => {
    const changeStream = db.watch({ fullDocument: 'updateLookup' });
    changeStream.on('error', (err) => {
      logger.warn(err.message, err);
      return;
    });
    changeStream.on('change', async (change) => {
      const user = change.fullDocument?.user;

      switch (change.operationType) {
        case 'insert': {
          const message = await handleChange(change, change.operationType);
          sockets[user]?.forEach((socket) => {
            socket.send(JSON.stringify(message));
          });
          break;
        }

        case 'update': {
          const message = await handleChange(change, change.operationType);
          sockets[user]?.forEach((socket) => {
            socket.send(JSON.stringify(message));
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

  db.on('error', function (err) {
    logger.error('Mongoose default connection has encountered an error', err);
    process.exit(0);
  });

  db.on('disconnected', function () {
    logger.error('Mongoose default connection is disconnected');
    if (config.env !== 'test') process.exit(0);
  });

  process.on('SIGINT', function () {
    db.close(function () {
      logger.error('Mongoose default connection is disconnected due to application termination');
      process.exit(0);
    });
  });
}
