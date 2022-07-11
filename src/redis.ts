import { createClient } from 'redis';
import config from './config/config';
import logger from './config/logger';

const client = createClient({
  password: config.redis.pass,
});

client.on('connect', () => {
  logger.info(`Client connected to redis on port ${config.redis.port}`);
});

export default client;
