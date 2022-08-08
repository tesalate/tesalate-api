import Joi from 'joi';
import { SessionType } from '../models/session.model';
import { objectId } from './custom.validation';

const getSessions = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    select: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    populate: Joi.string(),
    vehicle: Joi.string(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
    startLocation: Joi.string(),
    endLocation: Joi.string(),
    flags: Joi.string(),
    type: Joi.valid(...Object.values(SessionType)).required(),
  }),
};

const getSessionLogs = {
  query: Joi.object().keys({
    vehicle: Joi.string(),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

const getSession = {
  params: Joi.object().keys({
    sessionId: Joi.string().custom(objectId).required(),
  }),
  query: Joi.object().keys({
    type: Joi.valid(...Object.values(SessionType)).required(),
  }),
};

const deleteSession = {
  params: Joi.object().keys({
    sessionId: Joi.string().custom(objectId).required(),
  }),
};

const getSessionAggregation = {
  body: Joi.object().keys({ pipeline: Joi.array() }),
  // .keys({
  //   $match: Joi.object().keys({
  //     vehicle: Joi.custom(objectId),
  //   }),
  //   $project: Joi.object(),
  //   $group: Joi.object(),
  //   $sort: Joi.object(),
  // }),
};

export default {
  getSessions,
  getSessionLogs,
  getSession,
  deleteSession,
  getSessionAggregation,
};
