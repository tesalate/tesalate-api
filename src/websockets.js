const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const queryString = require('query-string');
const logger = require('./config/logger');
const config = require('./config/config');
const { User } = require('./models');

const websockets = (expressServer) => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: '/socket',
    verifyClient: async (info, done) => {
      const updatedInfo = info;
      try {
        const cookies = cookie.parse(info.req.headers.cookie);

        const decoded = jwt.verify(cookies.token, config.jwt.secret);
        const user = await User.findById(decoded.sub);

        // kill connection if no user
        if (!user) return done(false, 403, 'Invalid token');

        updatedInfo.req.user = user.toJSON();

        done(updatedInfo.req);
      } catch (error) {
        // kill connection if no token
        return done(false, 401, 'No token provided');
      }
    },
  });

  logger.info('Websocket connected and available via "/socket"');

  expressServer.on('upgrade', (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, (websocket) => {
      websocketServer.emit('connection', websocket, request);
    });
  });

  websocketServer.on('connection', function connection(websocketConnection, connectionRequest) {
    const [_path, params] = connectionRequest?.url?.split('?');
    const connectionParams = queryString.parse(params);

    // NOTE: connectParams are not used here but good to understand how to get
    // to them if you need to pass data with the connection to identify it (e.g., a userId).
    logger.info('connectParams', { connectionParams });

    websocketConnection.on('message', (message) => {
      logger.info('message', { message });
      websocketConnection.send(JSON.stringify({ message: 'There be gold in them thar hills.' }));
    });
  });

  return websocketServer;
};

module.exports = websockets;
