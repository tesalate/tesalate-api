import { Health } from '../models';

/**
 * @returns {Promise<IHealth>}
 */
const getHealth = async () => {
  const healthDoc = await Health.findOne({ _id: 0 });
  return healthDoc;
};

export default {
  getHealth,
};
