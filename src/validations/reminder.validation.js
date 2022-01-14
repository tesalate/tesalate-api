const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createReminder = {
  body: Joi.object().keys({
    type: Joi.string().required(),
    message: Joi.string(),
    when: Joi.alternatives().try(Joi.number(), Joi.date()).required(),
    remindWithin: Joi.number().required(),
    vehicle: Joi.custom(objectId),
  }),
};

const getReminders = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    type: Joi.string(),
    message: Joi.string(),
    when: Joi.alternatives().try(Joi.number(), Joi.date()),
    remindWithin: Joi.number(),
    completed: Joi.boolean(),
    vehicle: Joi.custom(objectId),
  }),
};

const getReminder = {
  params: Joi.object().keys({
    reminderId: Joi.string().custom(objectId),
  }),
};

const updateReminder = {
  params: Joi.object().keys({
    reminderId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      type: Joi.string(),
      message: Joi.string(),
      when: Joi.alternatives().try(Joi.number(), Joi.date()),
      remindWithin: Joi.number(),
      completed: Joi.boolean(),
      vehicle: Joi.custom(objectId),
    })
    .min(1),
};

const deleteReminder = {
  params: Joi.object().keys({
    reminderId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
};
