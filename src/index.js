const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const db = require('./db');
const { createWebSocketServer, activeSockets } = require('./websockets');

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
