import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import db from './db';
import { createWebSocketServer, activeSockets } from './websockets';

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
  // CREATE WEBSOCKETS
  createWebSocketServer(server);
});

// START DB LISTENERS
db(mongoose.connection, activeSockets);

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
