import Joi from 'joi';
import { objectId } from './custom.validation';

const getStats = {
  query: Joi.object().keys({
    vehicle: Joi.custom(objectId),
  }),
};

export default {
  getStats,
};
