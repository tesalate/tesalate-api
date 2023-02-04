import mongoose, { MongooseOptions } from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './config/logger';
import dbWatcher from './dbWatcher';
import { createWebSocketServer } from './websockets';
// import client from './redis';
import mongoService from './services/mongo.service';

let server;

mongoService(() => {
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  // CREATE WEBSOCKETS
  const wss = createWebSocketServer(server);
  // START DB LISTENERS
  dbWatcher(wss.clients);
});

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
