const mongoose = require('mongoose');
const config = require('./config/config');
const logger = require('./config/logger');
const handleChange = require('./controllers/dbWatch.controller');

module.exports = async function (db, sockets) {
  db.on('connected', async function () {
    logger.info(`Connected to DB`);
  });

  db.once('open', () => {
    let changeStream = db.watch({ fullDocument: 'updateLookup' });
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
    // process.exit(1);
  });

  db.on('disconnected', function () {
    logger.info('Mongoose default connection is disconnected');
    // process.exit(1);
  });

  process.on('SIGINT', function () {
    db.close(function () {
      logger.error('Mongoose default connection is disconnected due to application termination');
      // process.exit(0);
    });
  });
};
